import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { calculateDemandForecast } from '../ai/forecasting.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// GET /api/forecast/items
router.get('/items', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.foodItem.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch food items' });
  }
});

// POST /api/forecast
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { foodItemId, horizonDays = 3, kitchenId } = req.body;

    if (!foodItemId) {
      res.status(400).json({ success: false, error: 'foodItemId is required' });
      return;
    }

    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    });

    if (!foodItem) {
      res.status(404).json({ success: false, error: 'Food item not found' });
      return;
    }

    // Retrieve historical consumption points for this food item
    const history = await prisma.consumptionRecord.findMany({
      where: { foodItemId },
      orderBy: { date: 'asc' },
      take: 30
    });

    // Calculate forecast using mathematical AI engine
    const forecast = calculateDemandForecast(
      foodItem.id,
      foodItem.name,
      history.map(h => ({
        date: h.date,
        quantity: h.quantity,
        shift: h.shift,
        headcount: h.headcount,
        specialEvent: h.specialEvent
      })),
      Number(horizonDays) || 3
    );

    // Save forecast to database
    const kitchen = kitchenId
      ? await prisma.kitchen.findUnique({ where: { id: kitchenId } })
      : await prisma.kitchen.findFirst();

    if (kitchen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await prisma.demandForecast.create({
        data: {
          kitchenId: kitchen.id,
          foodItemId: foodItem.id,
          forecastDate: tomorrow,
          horizonDays: Number(horizonDays) || 3,
          predictedDemand: forecast.predictedDemand,
          lowerBound: forecast.lowerBound,
          upperBound: forecast.upperBound,
          recommendedProduction: forecast.recommendedProduction,
          expectedSurplus: forecast.expectedSurplus,
          surplusProbability: forecast.surplusProbability,
          modelName: forecast.modelName,
          featuresUsed: JSON.stringify(forecast.featuresUsed),
          confidenceScore: forecast.confidenceScore
        }
      });

      // Also create or update SurplusPrediction record so /surplus page reflects tomorrow's forecast!
      await prisma.surplusPrediction.create({
        data: {
          kitchenId: kitchen.id,
          foodItemId: foodItem.id,
          date: tomorrow,
          producedQuantity: forecast.recommendedProduction,
          consumedQuantity: forecast.predictedDemand,
          predictedSurplus: forecast.expectedSurplus,
          remainingShelfHours: foodItem.defaultShelfLifeHours,
          qualityRisk: 'LOW',
          priority: forecast.expectedSurplus > 20 ? 'HIGH' : 'MEDIUM',
          priorityScore: Math.round(forecast.expectedSurplus * 1.5 + 20),
          status: 'AVAILABLE'
        }
      });
    }

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'GENERATED_DEMAND_FORECAST',
        entity: 'DemandForecast',
        entityId: foodItem.id,
        newValue: {
          foodItem: foodItem.name,
          predictedDemand: forecast.predictedDemand,
          recommendedProduction: forecast.recommendedProduction
        },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('FORECAST_GENERATED', {
      foodItemId: foodItem.id,
      foodItemName: foodItem.name,
      predictedDemand: forecast.predictedDemand
    });

    res.json({
      success: true,
      forecast,
      historicalPoints: history.map(h => ({
        date: h.date.toISOString().split('T')[0],
        day: h.date.toLocaleDateString('en-IN', { weekday: 'short' }),
        quantity: h.quantity,
        shift: h.shift,
        headcount: h.headcount
      }))
    });
  } catch (error: any) {
    console.error('Forecast error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate demand forecast' });
  }
});

// GET /api/forecast/history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const history = await prisma.demandForecast.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { foodItem: true, kitchen: true }
    });
    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch forecast history' });
  }
});

export default router;
