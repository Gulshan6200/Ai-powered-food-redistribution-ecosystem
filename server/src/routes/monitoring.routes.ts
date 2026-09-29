import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// GET /api/sensors (list all sensors with latest readings)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sensors = await prisma.sensor.findMany({
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 24
        },
        alerts: {
          where: { isResolved: false }
        }
      }
    });

    res.json({ success: true, sensors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch sensors' });
  }
});

// GET /api/sensors/:id/readings
router.get('/:id/readings', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const readings = await prisma.sensorReading.findMany({
      where: { sensorId: id },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json({ success: true, readings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch sensor telemetry' });
  }
});

// POST /api/sensors/simulate (Simulate realistic sensor readings with optional anomaly trigger)
router.post('/simulate', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sensorId, forceAnomaly = false } = req.body;

    const sensors = sensorId
      ? await prisma.sensor.findMany({ where: { id: sensorId } })
      : await prisma.sensor.findMany();

    const createdReadings: any[] = [];
    const createdAlerts: any[] = [];
    const now = new Date();

    for (const sensor of sensors) {
      let temp: number;
      let humidity: number = +(50 + Math.random() * 20).toFixed(1);
      let isAnomaly = false;

      if (forceAnomaly) {
        // Force excursion: 4 degrees above maximum threshold
        temp = +(sensor.maxThreshold + 2.8 + Math.random() * 2).toFixed(1);
        isAnomaly = true;
      } else {
        // Realistic operating range with 15% natural chance of excursion for demo interactivity
        const naturalExcursion = Math.random() < 0.15;
        if (naturalExcursion) {
          temp = +(sensor.maxThreshold + 1.2 + Math.random() * 1.5).toFixed(1);
          isAnomaly = true;
        } else {
          temp = +(sensor.minThreshold + (sensor.maxThreshold - sensor.minThreshold) * (0.3 + Math.random() * 0.4)).toFixed(1);
        }
      }

      const reading = await prisma.sensorReading.create({
        data: {
          sensorId: sensor.id,
          temperature: temp,
          humidity,
          gasQuality: +(0.10 + (isAnomaly ? 0.35 : 0.05)).toFixed(2),
          isAnomaly,
          timestamp: now
        }
      });

      // Update sensor's lastReadingAt
      await prisma.sensor.update({
        where: { id: sensor.id },
        data: { lastReadingAt: now }
      });

      createdReadings.push({ ...reading, sensorName: sensor.name, sensorCode: sensor.sensorCode });

      // If temperature exceeded max threshold: generate Alert
      if (temp > sensor.maxThreshold) {
        const alert = await prisma.alert.create({
          data: {
            type: 'TEMPERATURE',
            severity: 'HIGH',
            title: `Temperature Excursion: ${sensor.name}`,
            message: `${sensor.name} reading is ${temp}°C, exceeding recommended threshold limit of ${sensor.maxThreshold}°C. Storage condition compromised.`,
            entityType: 'Sensor',
            entityId: sensor.id,
            targetRoute: '/monitoring',
            sensorId: sensor.id,
            isResolved: false
          }
        });
        createdAlerts.push(alert);
      }
    }

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'SIMULATED_SENSOR_TELEMETRY',
        entity: 'Sensor',
        entityId: sensorId || 'ALL_SENSORS',
        newValue: { readingsCount: createdReadings.length, alertsCount: createdAlerts.length },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('SENSOR_TELEMETRY_UPDATED', {
      readings: createdReadings,
      alerts: createdAlerts
    });

    res.json({
      success: true,
      readings: createdReadings,
      alerts: createdAlerts,
      message: `Simulated telemetry updated for ${sensors.length} sensors.`
    });
  } catch (error: any) {
    console.error('Simulation error:', error);
    res.status(500).json({ success: false, error: 'Failed to simulate sensor readings' });
  }
});

export default router;
