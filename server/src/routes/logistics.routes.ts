import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { optimizeRedistributionRoute } from '../ai/routing.js';
import { recordAuditLog } from '../middleware/audit.middleware.js';
import { sseManager } from '../services/sse.service.js';

const router = Router();

// GET /api/logistics/overview
router.get('/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [pickups, vehicles, drivers, activeRoutes] = await Promise.all([
      prisma.pickup.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          donation: {
            include: {
              surplusListing: { include: { foodItem: true, kitchen: true } },
              ngo: true
            }
          },
          driver: { include: { vehicle: true } },
          route: true,
          delivery: true
        }
      }),
      prisma.vehicle.findMany({ include: { drivers: true } }),
      prisma.driver.findMany({ include: { vehicle: true } }),
      prisma.route.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { vehicle: true, pickups: true }
      })
    ]);

    res.json({
      success: true,
      pickups,
      vehicles,
      drivers,
      activeRoutes
    });
  } catch (error: any) {
    console.error('Logistics overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch logistics overview' });
  }
});

// POST /api/routes/optimize (Optimize multi-stop route)
router.post('/optimize', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { vehicleId, startLat, startLng, pickupIds } = req.body;

    // Get vehicle details
    let vehicle = vehicleId
      ? await prisma.vehicle.findUnique({ where: { id: vehicleId } })
      : await prisma.vehicle.findFirst({ where: { status: 'AVAILABLE' } });

    if (!vehicle) {
      vehicle = await prisma.vehicle.findFirst();
    }

    if (!vehicle) {
      res.status(400).json({ success: false, error: 'No vehicle available for route dispatch' });
      return;
    }

    // Get pending pickups
    const where: any = { status: { in: ['PENDING', 'ASSIGNED'] } };
    if (pickupIds && pickupIds.length > 0) {
      where.id = { in: pickupIds };
    }

    const eligiblePickups = await prisma.pickup.findMany({
      where,
      include: {
        donation: {
          include: {
            surplusListing: { include: { foodItem: true } },
            ngo: true
          }
        }
      }
    });

    if (eligiblePickups.length === 0) {
      res.status(400).json({ success: false, error: 'No eligible pending pickups to optimize' });
      return;
    }

    // Convert pickups into pickup & dropoff stops
    const stopsForOptimizer: any[] = [];
    for (const p of eligiblePickups) {
      // 1. Pickup stop at Kitchen
      stopsForOptimizer.push({
        id: `p-${p.id}`,
        donationId: p.donationId,
        name: `Pickup: ${p.donation.surplusListing.foodItem.name}`,
        address: p.pickupAddress,
        lat: p.pickupLat,
        lng: p.pickupLng,
        quantityKg: p.donation.quantity,
        deadline: p.deadline,
        type: 'PICKUP',
        contactPerson: 'Kitchen Dispatch',
        contactPhone: '+91 98450 12345'
      });

      // 2. Dropoff stop at NGO
      stopsForOptimizer.push({
        id: `d-${p.id}`,
        donationId: p.donationId,
        name: `Dropoff: ${p.donation.ngo.name}`,
        address: p.destinationAddress,
        lat: p.destLat,
        lng: p.destLng,
        quantityKg: p.donation.quantity,
        deadline: p.deadline,
        type: 'DROPOFF',
        contactPerson: p.donation.ngo.contactPerson,
        contactPhone: p.donation.ngo.contactPhone
      });
    }

    const originLat = startLat || vehicle.currentLat;
    const originLng = startLng || vehicle.currentLng;

    const plan = optimizeRedistributionRoute(
      originLat,
      originLng,
      vehicle.capacityKg,
      stopsForOptimizer
    );

    // Persist optimized Route
    const routeCode = `RTE-${Date.now().toString().slice(-6)}`;
    const savedRoute = await prisma.route.create({
      data: {
        routeCode,
        vehicleId: vehicle.id,
        totalDistanceKm: plan.totalDistanceKm,
        totalTimeMinutes: plan.totalTimeMinutes,
        capacityUsagePct: plan.capacityUsagePct,
        stopsSummary: JSON.stringify(plan.orderedStops),
        optimizedWaypoints: JSON.stringify(plan.polylineWaypoints),
        status: 'ACTIVE'
      }
    });

    // Link pickups to this route and assign driver
    const driver = await prisma.driver.findFirst({ where: { vehicleId: vehicle.id } });
    for (const p of eligiblePickups) {
      await prisma.pickup.update({
        where: { id: p.id },
        data: {
          routeId: savedRoute.id,
          driverId: driver?.id,
          status: 'ASSIGNED'
        }
      });
    }

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'OPTIMIZED_DISPATCH_ROUTE',
        entity: 'Route',
        entityId: savedRoute.id,
        newValue: { routeCode, stops: plan.stopsCount, distanceKm: plan.totalDistanceKm },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('ROUTE_OPTIMIZED', { route: savedRoute, plan });

    res.json({
      success: true,
      route: savedRoute,
      plan
    });
  } catch (error: any) {
    console.error('Route optimization error:', error);
    res.status(500).json({ success: false, error: 'Failed to optimize route' });
  }
});

// PUT /api/logistics/pickups/:id/status (Driver progress updates)
router.put('/pickups/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, temperatureOnArrival, notes, recipientSignature } = req.body;

    const pickup = await prisma.pickup.findUnique({
      where: { id },
      include: {
        donation: {
          include: {
            surplusListing: { include: { foodItem: true, kitchen: true } },
            ngo: true
          }
        },
        delivery: true
      }
    });

    if (!pickup) {
      res.status(404).json({ success: false, error: 'Pickup not found' });
      return;
    }

    const now = new Date();
    const updateData: any = { status };
    if (status === 'PICKED_UP') {
      updateData.pickedUpAt = now;
    }

    const updatedPickup = await prisma.pickup.update({
      where: { id },
      data: updateData,
      include: { donation: true }
    });

    // Also update parent Donation status accordingly
    let donationStatus = 'SCHEDULED';
    if (status === 'PICKED_UP') donationStatus = 'PICKED_UP';
    if (status === 'IN_TRANSIT') donationStatus = 'IN_TRANSIT';
    if (status === 'DELIVERED') donationStatus = 'DELIVERED';

    await prisma.donation.update({
      where: { id: pickup.donationId },
      data: { status: donationStatus }
    });

    // If marked DELIVERED: create or update Delivery record
    if (status === 'DELIVERED') {
      let delivery = await prisma.delivery.findUnique({ where: { pickupId: pickup.id } });
      if (!delivery) {
        delivery = await prisma.delivery.create({
          data: {
            pickupId: pickup.id,
            deliveredAt: now,
            receivedBy: pickup.donation.ngo.contactPerson,
            recipientRole: 'Authorized Receiver',
            signatureToken: recipientSignature || `SIG-VERIF-${Math.floor(100000 + Math.random() * 900000)}`,
            verifiedQuantity: pickup.donation.quantity,
            temperatureOnArrival: temperatureOnArrival ? Number(temperatureOnArrival) : 62.4,
            notes: notes || 'Delivered on time in insulated containers.',
            status: 'CONFIRMED'
          }
        });
      }

      // Mark donation as RECEIVED
      await prisma.donation.update({
        where: { id: pickup.donationId },
        data: { status: 'RECEIVED' }
      });

      // Update Impact Metrics in real time!
      const rescuedKg = pickup.donation.quantity;
      await prisma.sustainabilityMetric.create({
        data: {
          organizationId: pickup.donation.surplusListing.kitchen.organizationId,
          foodPreparedKg: 0,
          foodWastedKg: 0,
          foodRescuedKg: rescuedKg,
          wastePreventedKg: rescuedKg,
          mealsRedistributed: Math.round(rescuedKg * 2.5),
          estimatedCostSavedInr: Math.round(rescuedKg * 120),
          estimatedCo2AvoidedKg: +(rescuedKg * 2.5).toFixed(1),
          estimatedWaterSavedLiters: +(rescuedKg * 450).toFixed(0),
          snapshotPeriod: 'EVENT'
        }
      });
    }

    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: `PICKUP_STATUS_${status}`,
        entity: 'Pickup',
        entityId: pickup.id,
        oldValue: { status: pickup.status },
        newValue: { status },
        organizationId: req.user.organizationId
      });
    }

    sseManager.broadcast('PICKUP_STATUS_CHANGED', { pickup: updatedPickup, status });

    res.json({ success: true, pickup: updatedPickup });
  } catch (error: any) {
    console.error('Update pickup status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update pickup status' });
  }
});

export default router;
