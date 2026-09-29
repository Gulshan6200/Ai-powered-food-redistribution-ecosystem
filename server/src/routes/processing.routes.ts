import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';

const router = Router();

// GET /api/processing/overview
router.get('/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [batches, machines, energyRecords] = await Promise.all([
      prisma.processingBatch.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { processingUnit: true }
      }),
      prisma.machine.findMany({
        include: {
          downtimes: { orderBy: { startedAt: 'desc' }, take: 5 },
          processingUnit: true
        }
      }),
      prisma.energyRecord.findMany({
        orderBy: { date: 'desc' },
        take: 10
      })
    ]);

    // KPI Calculations
    const totalInput = batches.reduce((acc, b) => acc + b.rawInputKg, 0);
    const totalOutput = batches.reduce((acc, b) => acc + b.outputKg, 0);
    const totalWaste = batches.reduce((acc, b) => acc + b.wasteKg, 0);
    const avgEfficiency = batches.length > 0
      ? Math.round((batches.reduce((acc, b) => acc + b.efficiencyPct, 0) / batches.length) * 10) / 10
      : 89.5;
    const wastePct = totalInput > 0 ? Math.round((totalWaste / totalInput) * 100 * 10) / 10 : 8.5;
    const totalDowntimeHours = machines.reduce((acc, m) => acc + m.totalDowntimeHours, 0);

    res.json({
      success: true,
      data: {
        kpis: {
          totalInputKg: totalInput || 3500,
          totalOutputKg: totalOutput || 3180,
          totalWasteKg: totalWaste || 320,
          rawMaterialEfficiencyPct: avgEfficiency,
          wastePercentage: wastePct,
          totalDowntimeHours,
          energyIntensityKwhKg: energyRecords[0]?.energyIntensity || 0.15
        },
        batches,
        machines,
        energyRecords
      }
    });
  } catch (error: any) {
    console.error('Processing overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch processing overview' });
  }
});

// POST /api/processing/batches
router.post('/batches', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productName, rawMaterialName, rawInputKg, outputKg, status = 'IN_PROGRESS', processingId } = req.body;

    let targetProcId = processingId;
    if (!targetProcId) {
      const p = await prisma.processingUnit.findFirst();
      targetProcId = p?.id;
    }

    const input = Number(rawInputKg);
    const output = Number(outputKg);
    const waste = Math.max(0, input - output);
    const efficiency = input > 0 ? Math.round((output / input) * 100 * 10) / 10 : 0;
    const batchNumber = `PB-${Date.now().toString().slice(-6)}`;

    const batch = await prisma.processingBatch.create({
      data: {
        batchNumber,
        processingId: targetProcId,
        productName,
        rawMaterialName,
        rawInputKg: input,
        outputKg: output,
        wasteKg: waste,
        efficiencyPct: efficiency,
        status,
        startedAt: new Date(),
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'CREATED_PROCESSING_BATCH',
        entity: 'ProcessingBatch',
        entityId: batch.id,
        newValue: { batchNumber, productName, efficiency },
        organizationId: req.user.organizationId
      });
    }

    res.status(201).json({ success: true, batch });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to create processing batch' });
  }
});

// POST /api/processing/machines/:id/downtime (Record machine downtime)
router.post('/machines/:id/downtime', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason, durationMinutes, notes } = req.body;

    const machine = await prisma.machine.findUnique({ where: { id } });
    if (!machine) {
      res.status(404).json({ success: false, error: 'Machine not found' });
      return;
    }

    const mins = Number(durationMinutes) || 30;
    const hours = +(mins / 60).toFixed(1);

    const downtime = await prisma.machineDowntime.create({
      data: {
        machineId: id,
        reason,
        durationMinutes: mins,
        startedAt: new Date(Date.now() - mins * 60 * 1000),
        endedAt: new Date(),
        loggedBy: req.user?.fullName || 'Shift Operator',
        notes
      }
    });

    // Update machine total downtime hours
    await prisma.machine.update({
      where: { id },
      data: {
        totalDowntimeHours: machine.totalDowntimeHours + hours,
        status: 'RUNNING'
      }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'LOGGED_MACHINE_DOWNTIME',
        entity: 'MachineDowntime',
        entityId: downtime.id,
        newValue: { machine: machine.name, durationMinutes: mins, reason },
        organizationId: req.user.organizationId
      });
    }

    res.status(201).json({ success: true, downtime });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to record machine downtime' });
  }
});

export default router;
