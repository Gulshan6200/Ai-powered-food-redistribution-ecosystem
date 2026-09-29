import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// GET /api/alerts
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, severity, isResolved, search } = req.query;
    const where: any = {};

    if (type) where.type = type as string;
    if (severity) where.severity = severity as string;
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { message: { contains: search as string } }
      ];
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: [{ isResolved: 'asc' }, { createdAt: 'desc' }],
      include: { resolvedBy: true, sensor: true }
    });

    res.json({ success: true, alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// PUT /api/alerts/:id/resolve
router.put('/:id/resolve', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedById: req.user?.id
      }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'RESOLVED_ALERT',
        entity: 'Alert',
        entityId: id,
        oldValue: { isResolved: false },
        newValue: { isResolved: true },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('ALERT_RESOLVED', { alert: updated });

    res.json({ success: true, alert: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to resolve alert' });
  }
});

export default router;
