import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';

const router = Router();

// Require ADMIN role for all routes in this file
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

// GET /api/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        isActive: true,
        organizationId: true,
        organization: true,
        createdAt: true
      }
    });
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users
router.post('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, fullName, password, role, organizationId, phone } = req.body;

    if (!email || !fullName || !password || !role) {
      res.status(400).json({ success: false, error: 'Missing required user fields' });
      return;
    }

    let orgId = organizationId;
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      orgId = defaultOrg?.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        fullName,
        passwordHash,
        role,
        organizationId: orgId,
        phone
      },
      include: { organization: true }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'ADMIN_CREATED_USER',
        entity: 'User',
        entityId: user.id,
        newValue: { email, role },
        organizationId: req.user.organizationId
      });
    }

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// GET /api/admin/organizations
router.get('/organizations', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true, kitchens: true, processingUnits: true, ngos: true, vehicles: true }
        }
      }
    });
    res.json({ success: true, organizations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch organizations' });
  }
});

// GET /api/admin/audit
router.get('/audit', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { action, entity, limit = '50' } = req.query;
    const where: any = {};
    if (action) where.action = action as string;
    if (entity) where.entity = entity as string;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(100, parseInt(limit as string) || 50),
      include: { user: true }
    });

    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit trail' });
  }
});

// GET /api/admin/system-health
router.get('/system-health', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [userCount, kitchenCount, sensorCount, alertCount, unreadAlerts] = await Promise.all([
      prisma.user.count(),
      prisma.kitchen.count(),
      prisma.sensor.count(),
      prisma.alert.count(),
      prisma.alert.count({ where: { isResolved: false } })
    ]);

    res.json({
      success: true,
      health: {
        status: 'OPERATIONAL',
        database: 'CONNECTED (SQLite/Prisma)',
        aiForecastingEngine: 'ONLINE (Hierarchical Engine)',
        computerVisionService: 'ACTIVE (Heuristic Vision Adapter)',
        realtimeEventBus: 'RUNNING (SSE)',
        uptimeSeconds: process.uptime(),
        timestamp: new Date().toISOString(),
        stats: {
          users: userCount,
          kitchens: kitchenCount,
          sensors: sensorCount,
          activeAlerts: unreadAlerts,
          totalAlerts: alertCount
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch system health' });
  }
});

export default router;
