import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// GET /api/donations
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, ngoId } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (ngoId) where.ngoId = ngoId as string;

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        surplusListing: { include: { foodItem: true, kitchen: { include: { organization: true } } } },
        ngo: { include: { organization: true } },
        pickup: { include: { driver: true, delivery: true } }
      }
    });

    res.json({ success: true, donations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch donations' });
  }
});

// POST /api/donations (Kitchen creates a donation offer to an NGO)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { surplusListingId, ngoId, quantity, matchScore, matchReasoning } = req.body;

    if (!surplusListingId || !ngoId || !quantity) {
      res.status(400).json({ success: false, error: 'surplusListingId, ngoId, and quantity are required' });
      return;
    }

    const listing = await prisma.surplusListing.findUnique({
      where: { id: surplusListingId },
      include: { foodItem: true }
    });

    if (!listing) {
      res.status(404).json({ success: false, error: 'Surplus listing not found' });
      return;
    }

    const qty = Number(quantity);
    if (qty > listing.availableQuantity) {
      res.status(400).json({ success: false, error: 'Requested quantity exceeds available surplus' });
      return;
    }

    const donation = await prisma.donation.create({
      data: {
        surplusListingId,
        ngoId,
        quantity: qty,
        unit: listing.unit,
        matchScore: Number(matchScore) || 90.0,
        matchReasoning: matchReasoning || 'Direct platform match based on proximity and food category.',
        status: 'OFFERED'
      },
      include: {
        surplusListing: { include: { foodItem: true } },
        ngo: true
      }
    });

    // Update available surplus quantity
    const newAvail = Math.max(0, listing.availableQuantity - qty);
    await prisma.surplusListing.update({
      where: { id: surplusListingId },
      data: {
        availableQuantity: newAvail,
        status: newAvail === 0 ? 'COMMITTED' : 'MATCHED'
      }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'CREATED_DONATION_OFFER',
        entity: 'Donation',
        entityId: donation.id,
        newValue: { quantity: qty, ngoId },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('DONATION_OFFERED', { donation });

    res.status(201).json({ success: true, donation });
  } catch (error: any) {
    console.error('Create donation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create donation' });
  }
});

// PUT /api/donations/:id/status (Accept / Reject / Confirm)
router.put('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, requestedChanges, recipientNotes } = req.body;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        surplusListing: { include: { foodItem: true, kitchen: { include: { organization: true } } } },
        ngo: true,
        pickup: true
      }
    });

    if (!donation) {
      res.status(404).json({ success: false, error: 'Donation not found' });
      return;
    }

    const validStatuses = ['OFFERED', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'PICKED_UP', 'DELIVERED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: {
        status,
        requestedChanges: requestedChanges || donation.requestedChanges
      },
      include: {
        surplusListing: { include: { foodItem: true, kitchen: true } },
        ngo: true,
        pickup: true
      }
    });

    // If NGO accepts donation: Automatically create Pickup request in Logistics!
    if (status === 'ACCEPTED' && !donation.pickup) {
      const kitchenOrg = donation.surplusListing.kitchen?.organization;
      const pickupAddress = kitchenOrg ? `${kitchenOrg.name}, ${kitchenOrg.address}` : 'Apex Central Kitchen';
      const destAddress = `${donation.ngo.name}, Bengaluru`;

      const pickup = await prisma.pickup.create({
        data: {
          donationId: donation.id,
          pickupAddress,
          pickupLat: kitchenOrg?.latitude || 12.8399,
          pickupLng: kitchenOrg?.longitude || 77.6770,
          destinationAddress: destAddress,
          destLat: donation.ngo.latitude,
          destLng: donation.ngo.longitude,
          estimatedDistance: 3.5,
          estimatedMinutes: 20,
          deadline: donation.surplusListing.pickupDeadline,
          status: 'PENDING'
        }
      });

      sseManager.broadcast('PICKUP_CREATED', { pickup });
    }

    // If Status is RECEIVED / CONFIRMED: Update impact metrics and sustainability records
    if (status === 'RECEIVED' || status === 'DELIVERED') {
      const rescuedKg = donation.quantity;
      const meals = Math.round(rescuedKg * 2.5);
      const costSaved = Math.round(rescuedKg * 120);
      const co2Avoided = +(rescuedKg * 2.5).toFixed(1);
      const waterSaved = +(rescuedKg * 450).toFixed(0);

      // Create snapshot record
      await prisma.sustainabilityMetric.create({
        data: {
          organizationId: donation.surplusListing.kitchen.organizationId,
          foodPreparedKg: 0,
          foodWastedKg: 0,
          foodRescuedKg: rescuedKg,
          wastePreventedKg: rescuedKg,
          mealsRedistributed: meals,
          estimatedCostSavedInr: costSaved,
          estimatedCo2AvoidedKg: co2Avoided,
          estimatedWaterSavedLiters: waterSaved,
          snapshotPeriod: 'EVENT'
        }
      });
    }

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: `DONATION_STATUS_${status}`,
        entity: 'Donation',
        entityId: donation.id,
        oldValue: { status: donation.status },
        newValue: { status },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('DONATION_UPDATED', { donation: updated });

    res.json({ success: true, donation: updated });
  } catch (error: any) {
    console.error('Update donation status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update donation status' });
  }
});

export default router;
