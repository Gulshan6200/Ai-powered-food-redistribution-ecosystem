import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// Helper to compute inventory status from expiry date
function computeExpiryStatus(expiryDate: Date): { status: string; riskLevel: string } {
  const now = new Date();
  const diffHours = (expiryDate.getTime() - now.getTime()) / (3600 * 1000);

  if (diffHours < 0) {
    return { status: 'EXPIRED', riskLevel: 'HIGH' };
  } else if (diffHours <= 2) {
    return { status: 'CRITICAL', riskLevel: 'HIGH' };
  } else if (diffHours <= 5) {
    return { status: 'NEAR_EXPIRY', riskLevel: 'HIGH' };
  } else if (diffHours <= 12) {
    return { status: 'MONITOR', riskLevel: 'MEDIUM' };
  } else {
    return { status: 'SAFE', riskLevel: 'LOW' };
  }
}

// GET /api/inventory (supports search, filters, sorting, and pagination)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search = '',
      category,
      status,
      riskLevel,
      storageLocation,
      sortBy = 'expiryDate',
      sortOrder = 'asc',
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { batchNumber: { contains: search as string } },
        { foodItem: { name: { contains: search as string } } },
        { storageLocation: { contains: search as string } },
        { supplier: { contains: search as string } }
      ];
    }

    if (category) {
      where.foodItem = { ...where.foodItem, category: category as string };
    }

    if (status) {
      where.status = status as string;
    }

    if (riskLevel) {
      where.riskLevel = riskLevel as string;
    }

    if (storageLocation) {
      where.storageLocation = storageLocation as string;
    }

    const orderBy: any = {};
    if (sortBy === 'foodItem') {
      orderBy.foodItem = { name: sortOrder as 'asc' | 'desc' };
    } else {
      orderBy[sortBy as string] = sortOrder as 'asc' | 'desc';
    }

    const [total, items] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          foodItem: true,
          batch: true,
          kitchen: true
        }
      })
    ]);

    // Recalculate status dynamically for accuracy against current timestamp
    const enhancedItems = items.map(item => {
      const { status: calculatedStatus, riskLevel: calculatedRisk } = computeExpiryStatus(item.expiryDate);
      return {
        ...item,
        status: calculatedStatus,
        riskLevel: calculatedRisk
      };
    });

    res.json({
      success: true,
      data: enhancedItems,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Inventory list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

// POST /api/inventory
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      foodItemId,
      batchNumber,
      quantity,
      unit = 'kg',
      supplier,
      storageLocation,
      temperature,
      humidity,
      expiryDate,
      kitchenId
    } = req.body;

    if (!foodItemId || !batchNumber || !quantity || !expiryDate || !storageLocation) {
      res.status(400).json({ success: false, error: 'Missing required inventory fields' });
      return;
    }

    const expDate = new Date(expiryDate);
    const { status, riskLevel } = computeExpiryStatus(expDate);

    // Ensure Kitchen exists
    let targetKitchenId = kitchenId;
    if (!targetKitchenId) {
      const defaultKitchen = await prisma.kitchen.findFirst();
      targetKitchenId = defaultKitchen?.id;
    }

    // Create or link batch
    let batch = await prisma.foodBatch.findUnique({
      where: { batchNumber }
    });

    if (!batch) {
      batch = await prisma.foodBatch.create({
        data: {
          batchNumber,
          foodItemId,
          preparedAt: new Date(),
          expiryDate: expDate,
          initialQuantity: Number(quantity),
          unit,
          storageLocation,
          status
        }
      });
    }

    const newInventory = await prisma.inventory.create({
      data: {
        kitchenId: targetKitchenId,
        foodItemId,
        batchId: batch.id,
        batchNumber,
        quantity: Number(quantity),
        unit,
        supplier: supplier || 'Internal Kitchen Prep',
        storageLocation,
        temperature: temperature ? Number(temperature) : null,
        humidity: humidity ? Number(humidity) : null,
        expiryDate: expDate,
        status,
        riskLevel
      },
      include: { foodItem: true }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'CREATED_INVENTORY_BATCH',
        entity: 'Inventory',
        entityId: newInventory.id,
        newValue: { batchNumber, quantity, storageLocation },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('INVENTORY_UPDATED', { action: 'CREATED', item: newInventory });

    res.status(201).json({ success: true, item: newInventory });
  } catch (error: any) {
    console.error('Create inventory error:', error);
    res.status(500).json({ success: false, error: 'Failed to create inventory item' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { quantity, storageLocation, temperature, humidity, expiryDate } = req.body;

    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Inventory record not found' });
      return;
    }

    const expDate = expiryDate ? new Date(expiryDate) : existing.expiryDate;
    const { status, riskLevel } = computeExpiryStatus(expDate);

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: quantity !== undefined ? Number(quantity) : existing.quantity,
        storageLocation: storageLocation || existing.storageLocation,
        temperature: temperature !== undefined ? Number(temperature) : existing.temperature,
        humidity: humidity !== undefined ? Number(humidity) : existing.humidity,
        expiryDate: expDate,
        status,
        riskLevel
      },
      include: { foodItem: true }
    });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'UPDATED_INVENTORY',
        entity: 'Inventory',
        entityId: id,
        oldValue: existing,
        newValue: updated,
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('INVENTORY_UPDATED', { action: 'UPDATED', item: updated });

    res.json({ success: true, item: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update inventory' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'Inventory record not found' });
      return;
    }

    await prisma.inventory.delete({ where: { id } });

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'DELETED_INVENTORY',
        entity: 'Inventory',
        entityId: id,
        oldValue: existing,
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('INVENTORY_UPDATED', { action: 'DELETED', id });

    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete inventory' });
  }
});

export default router;
