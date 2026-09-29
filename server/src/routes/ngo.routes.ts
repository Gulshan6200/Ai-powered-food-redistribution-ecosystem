import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/ngos
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ngos = await prisma.nGO.findMany({
      orderBy: { name: 'asc' },
      include: { requirements: true, organization: true }
    });
    res.json({ success: true, ngos });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch NGOs' });
  }
});

// GET /api/ngos/dashboard-summary
router.get('/dashboard-summary', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [availableSurplus, activeDonations, completedDonations, ngos] = await Promise.all([
      prisma.surplusListing.findMany({
        where: { status: 'AVAILABLE', availableQuantity: { gt: 0 } },
        include: { foodItem: true, kitchen: true }
      }),
      prisma.donation.findMany({
        where: { status: { in: ['OFFERED', 'ACCEPTED', 'SCHEDULED', 'PICKED_UP', 'IN_TRANSIT'] } },
        include: {
          surplusListing: { include: { foodItem: true, kitchen: true } },
          ngo: true,
          pickup: true
        }
      }),
      prisma.donation.findMany({
        where: { status: { in: ['DELIVERED', 'RECEIVED'] } },
        include: {
          surplusListing: { include: { foodItem: true } },
          ngo: true
        },
        take: 20
      }),
      prisma.nGO.findMany({ include: { requirements: true } })
    ]);

    const totalMealsReceived = completedDonations.reduce((acc, d) => acc + Math.round(d.quantity * 2.5), 0);
    const totalFoodRescuedKg = completedDonations.reduce((acc, d) => acc + d.quantity, 0);

    res.json({
      success: true,
      data: {
        availableSurplus,
        activeDonations,
        completedDonations,
        ngos,
        metrics: {
          totalMealsReceived,
          totalFoodRescuedKg,
          activePendingOffers: activeDonations.filter(d => d.status === 'OFFERED').length,
          scheduledPickups: activeDonations.filter(d => ['ACCEPTED', 'SCHEDULED'].includes(d.status)).length
        }
      }
    });
  } catch (error: any) {
    console.error('NGO dashboard summary error:', error);
    res.status(500).json({ success: false, error: 'Failed to load NGO summary' });
  }
});

// PUT /api/ngos/:id (update capacity & requirements)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { dailyMealCapacity, beneficiaryCount, acceptsVegOnly, hasColdStorage } = req.body;

    const updated = await prisma.nGO.update({
      where: { id },
      data: {
        dailyMealCapacity: dailyMealCapacity !== undefined ? Number(dailyMealCapacity) : undefined,
        beneficiaryCount: beneficiaryCount !== undefined ? Number(beneficiaryCount) : undefined,
        acceptsVegOnly: acceptsVegOnly !== undefined ? Boolean(acceptsVegOnly) : undefined,
        hasColdStorage: hasColdStorage !== undefined ? Boolean(hasColdStorage) : undefined
      }
    });

    res.json({ success: true, ngo: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update NGO capacity' });
  }
});

export default router;
