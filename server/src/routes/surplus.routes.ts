import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { assessSurplus } from '../ai/surplus.js';
import { matchNgosForSurplus } from '../ai/matching.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// GET /api/surplus (returns surplus predictions and active surplus listings)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [listings, predictions, items] = await Promise.all([
      prisma.surplusListing.findMany({
        orderBy: { createdAt: 'desc' },
        include: { foodItem: true, kitchen: true, donations: { include: { ngo: true } } }
      }),
      prisma.surplusPrediction.findMany({
        orderBy: { createdAt: 'desc' },
        include: { foodItem: true, kitchen: true },
        take: 15
      }),
      prisma.foodItem.findMany()
    ]);

    // Enhance predictions with live priority assessment
    const enhancedPredictions = predictions.map(p => {
      const assessment = assessSurplus({
        foodItemId: p.foodItemId,
        producedQuantity: p.producedQuantity,
        consumedQuantity: p.consumedQuantity,
        remainingShelfHours: p.remainingShelfHours,
        qualityRisk: p.qualityRisk as any
      });

      return {
        ...p,
        predictedSurplus: assessment.predictedSurplus,
        priority: assessment.priority,
        priorityScore: assessment.priorityScore,
        recommendedAction: assessment.recommendedAction
      };
    });

    res.json({
      success: true,
      listings,
      predictions: enhancedPredictions,
      foodItems: items
    });
  } catch (error: any) {
    console.error('Surplus fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch surplus data' });
  }
});

// POST /api/surplus (Create Redistribution Request / Surplus Listing)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      foodItemId,
      quantity,
      shelfLifeHours = 5,
      storageCondition = 'Hot Packaged',
      dietaryCategory = 'VEG',
      kitchenId
    } = req.body;

    if (!foodItemId || !quantity) {
      res.status(400).json({ success: false, error: 'foodItemId and quantity are required' });
      return;
    }

    const foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
    if (!foodItem) {
      res.status(404).json({ success: false, error: 'Food item not found' });
      return;
    }

    let targetKitchenId = kitchenId;
    if (!targetKitchenId) {
      const k = await prisma.kitchen.findFirst();
      targetKitchenId = k?.id;
    }

    const pickupDeadline = new Date();
    pickupDeadline.setHours(pickupDeadline.getHours() + Number(shelfLifeHours));

    const qty = Number(quantity);
    const listing = await prisma.surplusListing.create({
      data: {
        kitchenId: targetKitchenId,
        foodItemId,
        quantity: qty,
        availableQuantity: qty,
        unit: foodItem.standardUnit,
        shelfLifeHours: Number(shelfLifeHours),
        pickupDeadline,
        qualityStatus: 'VERIFIED_GOOD',
        storageCondition,
        dietaryCategory,
        status: 'AVAILABLE',
        priority: qty > 30 || Number(shelfLifeHours) <= 3 ? 'HIGH' : 'MEDIUM'
      },
      include: { foodItem: true, kitchen: true }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'CREATED_SURPLUS_LISTING',
        entity: 'SurplusListing',
        entityId: listing.id,
        newValue: { food: foodItem.name, quantity: qty },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('SURPLUS_CREATED', { listing });

    res.status(201).json({ success: true, listing });
  } catch (error: any) {
    console.error('Create surplus error:', error);
    res.status(500).json({ success: false, error: 'Failed to create surplus listing' });
  }
});

// POST /api/surplus/:id/match (Run NGO matching algorithm for this surplus listing)
router.post('/:id/match', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const listing = await prisma.surplusListing.findUnique({
      where: { id },
      include: { foodItem: true, kitchen: { include: { organization: true } } }
    });

    if (!listing) {
      res.status(404).json({ success: false, error: 'Surplus listing not found' });
      return;
    }

    const ngos = await prisma.nGO.findMany({
      where: { activeStatus: true },
      include: { requirements: true }
    });

    const kitchenLoc = {
      latitude: listing.kitchen?.organization?.latitude || 12.8399,
      longitude: listing.kitchen?.organization?.longitude || 77.6770
    };

    const matches = matchNgosForSurplus(
      kitchenLoc,
      {
        id: listing.id,
        foodName: listing.foodItem.name,
        category: listing.foodItem.category,
        quantityKg: listing.availableQuantity,
        dietaryCategory: listing.dietaryCategory,
        shelfLifeHours: listing.shelfLifeHours,
        pickupDeadline: listing.pickupDeadline
      },
      ngos
    );

    res.json({
      success: true,
      listing,
      matches
    });
  } catch (error: any) {
    console.error('Matching error:', error);
    res.status(500).json({ success: false, error: 'Failed to match NGOs' });
  }
});

export default router;
