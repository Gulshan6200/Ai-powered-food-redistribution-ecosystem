import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for FoodCycle AI...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.sustainabilityMetric.deleteMany();
  await prisma.impactFactor.deleteMany();
  await prisma.energyRecord.deleteMany();
  await prisma.machineDowntime.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.processingBatch.deleteMany();
  await prisma.wasteRecord.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.pickup.deleteMany();
  await prisma.route.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.nGORequirement.deleteMany();
  await prisma.nGO.deleteMany();
  await prisma.surplusListing.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.surplusPrediction.deleteMany();
  await prisma.demandForecast.deleteMany();
  await prisma.consumptionRecord.deleteMany();
  await prisma.productionRecord.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.foodBatch.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.processingUnit.deleteMany();
  await prisma.kitchen.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Impact Factors
  await prisma.impactFactor.create({
    data: {
      name: 'DEFAULT_FACTORS',
      co2FactorPerKg: 2.5,     // kg CO2 eq / kg food rescued
      waterFactorPerKg: 450.0, // liters water saved / kg food
      costPerKgInr: 120.0,     // INR saved per kg
      mealConversionKg: 2.5,   // 2.5 meals per kg (400g standard portion)
      methodologyNote: 'Calculated using MoFPI & FAO institutional food loss benchmarks. Parameters customizable by authorized administrators.'
    }
  });

  // 2. Organizations
  const orgKitchen = await prisma.organization.create({
    data: {
      name: 'Apex Institutional Dining & Catering Ltd.',
      type: 'INSTITUTIONAL_KITCHEN',
      code: 'ORG-APEX-01',
      address: 'Plot 42, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      latitude: 12.8399,
      longitude: 77.6770,
      contactEmail: 'central.kitchen@apexgroup.in',
      contactPhone: '+91 98450 12345',
      verified: true
    }
  });

  const orgCampus = await prisma.organization.create({
    data: {
      name: 'National Tech Campus Dining Services',
      type: 'INSTITUTIONAL_KITCHEN',
      code: 'ORG-NTC-02',
      address: 'Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      latitude: 12.9298,
      longitude: 77.6848,
      contactEmail: 'dining@ntc-edu.in',
      contactPhone: '+91 98450 23456',
      verified: true
    }
  });

  const orgProcessing = await prisma.organization.create({
    data: {
      name: 'Deccan Food Processing & Canning Cluster',
      type: 'FOOD_PROCESSING_UNIT',
      code: 'ORG-DFP-01',
      address: 'KIADB Industrial Area, Bommasandra',
      city: 'Bengaluru',
      state: 'Karnataka',
      latitude: 12.8123,
      longitude: 77.6912,
      contactEmail: 'operations@deccanfoods.com',
      contactPhone: '+91 98450 34567',
      verified: true
    }
  });

  const orgNgoFederation = await prisma.organization.create({
    data: {
      name: 'Annapurna Hunger Relief Network',
      type: 'NGO',
      code: 'ORG-NGO-01',
      address: 'Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      latitude: 12.9352,
      longitude: 77.6245,
      contactEmail: 'relief@annapurna.org',
      contactPhone: '+91 98450 45678',
      verified: true
    }
  });

  const orgLogistics = await prisma.organization.create({
    data: {
      name: 'GreenMile Cold-Chain & Redistribution Fleet',
      type: 'LOGISTICS_PARTNER',
      code: 'ORG-LOG-01',
      address: 'HSR Layout Sector 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      latitude: 12.9116,
      longitude: 77.6474,
      contactEmail: 'dispatch@greenmilelogistics.in',
      contactPhone: '+91 98450 56789',
      verified: true
    }
  });

  // 3. Role-Aware Users
  const userAdmin = await prisma.user.create({
    data: {
      email: 'admin@foodcycle.ai',
      fullName: 'Vikramaditya Sharma',
      passwordHash,
      role: 'ADMIN',
      phone: '+91 98800 11223',
      organizationId: orgKitchen.id
    }
  });

  const userKitchen = await prisma.user.create({
    data: {
      email: 'kitchen@foodcycle.ai',
      fullName: 'Chef Rajesh Nair',
      passwordHash,
      role: 'KITCHEN_MANAGER',
      phone: '+91 98800 22334',
      organizationId: orgKitchen.id
    }
  });

  const userProcessing = await prisma.user.create({
    data: {
      email: 'processing@foodcycle.ai',
      fullName: 'Pooja Deshmukh',
      passwordHash,
      role: 'PROCESSING_MANAGER',
      phone: '+91 98800 33445',
      organizationId: orgProcessing.id
    }
  });

  const userNgo = await prisma.user.create({
    data: {
      email: 'ngo@foodcycle.ai',
      fullName: 'Sister Anita D’Souza',
      passwordHash,
      role: 'NGO_COORDINATOR',
      phone: '+91 98800 44556',
      organizationId: orgNgoFederation.id
    }
  });

  const userLogistics = await prisma.user.create({
    data: {
      email: 'logistics@foodcycle.ai',
      fullName: 'Manoj Kumar Gowda',
      passwordHash,
      role: 'LOGISTICS_OPERATOR',
      phone: '+91 98800 55667',
      organizationId: orgLogistics.id
    }
  });

  // 4. Kitchens & Processing Units
  const kitchenMain = await prisma.kitchen.create({
    data: {
      name: 'Apex Mega-Kitchen 01',
      code: 'KITCHEN-APEX-01',
      dailyCapacity: 3500, // 3500 portions/day
      organizationId: orgKitchen.id
    }
  });

  const kitchenCampus = await prisma.kitchen.create({
    data: {
      name: 'NTC Campus Central Canteen',
      code: 'KITCHEN-NTC-01',
      dailyCapacity: 2200,
      organizationId: orgCampus.id
    }
  });

  const kitchenHospital = await prisma.kitchen.create({
    data: {
      name: 'CareLife Healthcare Dietary Wing',
      code: 'KITCHEN-CARE-01',
      dailyCapacity: 1500,
      organizationId: orgKitchen.id
    }
  });

  const procUnit1 = await prisma.processingUnit.create({
    data: {
      name: 'Deccan Puree & Retort Packaging Unit',
      code: 'PROC-DECCAN-01',
      capacityPerDay: 8500, // 8.5 tons
      organizationId: orgProcessing.id
    }
  });

  const procUnit2 = await prisma.processingUnit.create({
    data: {
      name: 'Deccan Bakery & Grain Mill',
      code: 'PROC-DECCAN-02',
      capacityPerDay: 6200,
      organizationId: orgProcessing.id
    }
  });

  // 5. Food Items (Realistic Indian Context)
  const itemsData = [
    { name: 'Vegetable Biryani', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 8, optimumTempMin: 62, optimumTempMax: 75, costPerUnit: 140, co2FactorKg: 2.8, waterFactorLiter: 520, mealFactor: 2.5 },
    { name: 'Dal Makhani', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 6, optimumTempMin: 62, optimumTempMax: 72, costPerUnit: 110, co2FactorKg: 1.9, waterFactorLiter: 380, mealFactor: 3.0 },
    { name: 'Chapati / Roti', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 6, optimumTempMin: 22, optimumTempMax: 35, costPerUnit: 80, co2FactorKg: 1.5, waterFactorLiter: 290, mealFactor: 4.0 },
    { name: 'Steamed Basmati Rice', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 8, optimumTempMin: 60, optimumTempMax: 75, costPerUnit: 70, co2FactorKg: 2.2, waterFactorLiter: 640, mealFactor: 3.0 },
    { name: 'Poha Breakfast Mix', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 5, optimumTempMin: 55, optimumTempMax: 70, costPerUnit: 65, co2FactorKg: 1.3, waterFactorLiter: 210, mealFactor: 3.5 },
    { name: 'Idli & Sambar Combo', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 6, optimumTempMin: 55, optimumTempMax: 70, costPerUnit: 85, co2FactorKg: 1.6, waterFactorLiter: 310, mealFactor: 3.0 },
    { name: 'Mixed Vegetable Curry', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 6, optimumTempMin: 60, optimumTempMax: 72, costPerUnit: 95, co2FactorKg: 1.7, waterFactorLiter: 340, mealFactor: 2.8 },
    { name: 'Paneer Butter Masala', category: 'COOKED_MEAL', standardUnit: 'kg', defaultShelfLifeHours: 5, optimumTempMin: 62, optimumTempMax: 74, costPerUnit: 180, co2FactorKg: 3.8, waterFactorLiter: 780, mealFactor: 2.5 },
  ];

  const createdFoodItems: Record<string, any> = {};
  for (const item of itemsData) {
    createdFoodItems[item.name] = await prisma.foodItem.create({ data: item });
  }

  // 6. Food Batches & Inventory (20+ batches)
  const now = new Date();
  const inventoryItems = [
    { item: 'Vegetable Biryani', batch: 'VB-2026-101', qty: 45, shelfHours: 6, loc: 'Hot Holding 01', temp: 64.2, hum: 45, status: 'SAFE', risk: 'LOW', hoursAgo: 2 },
    { item: 'Vegetable Biryani', batch: 'VB-2026-102', qty: 28, shelfHours: 3, loc: 'Hot Holding 02', temp: 61.5, hum: 48, status: 'MONITOR', risk: 'MEDIUM', hoursAgo: 5 },
    { item: 'Dal Makhani', batch: 'DM-2026-088', qty: 32, shelfHours: 4, loc: 'Steam Table B', temp: 65.0, hum: 50, status: 'SAFE', risk: 'LOW', hoursAgo: 2 },
    { item: 'Dal Makhani', batch: 'DM-2026-089', qty: 18, shelfHours: 1.5, loc: 'Holding Tray C', temp: 58.4, hum: 52, status: 'NEAR_EXPIRY', risk: 'HIGH', hoursAgo: 4.5 },
    { item: 'Chapati / Roti', batch: 'CP-2026-301', qty: 55, shelfHours: 4, loc: 'Insulated Warm Box 1', temp: 34.0, hum: 30, status: 'SAFE', risk: 'LOW', hoursAgo: 2 },
    { item: 'Chapati / Roti', batch: 'CP-2026-302', qty: 25, shelfHours: 1.2, loc: 'Insulated Warm Box 2', temp: 28.0, hum: 32, status: 'CRITICAL', risk: 'HIGH', hoursAgo: 4.8 },
    { item: 'Steamed Basmati Rice', batch: 'BR-2026-204', qty: 60, shelfHours: 6.5, loc: 'Bulk Hot Cooker 01', temp: 68.1, hum: 55, status: 'SAFE', risk: 'LOW', hoursAgo: 1.5 },
    { item: 'Steamed Basmati Rice', batch: 'BR-2026-205', qty: 35, shelfHours: 2.5, loc: 'Service Counter A', temp: 62.0, hum: 50, status: 'MONITOR', risk: 'MEDIUM', hoursAgo: 5.5 },
    { item: 'Poha Breakfast Mix', batch: 'PH-2026-050', qty: 15, shelfHours: 0.5, loc: 'Breakfast Station', temp: 48.0, hum: 40, status: 'CRITICAL', risk: 'HIGH', hoursAgo: 4.5 },
    { item: 'Idli & Sambar Combo', batch: 'IS-2026-112', qty: 40, shelfHours: 3.5, loc: 'Steam Cabinet 03', temp: 63.8, hum: 60, status: 'SAFE', risk: 'LOW', hoursAgo: 2.5 },
    { item: 'Mixed Vegetable Curry', batch: 'VC-2026-077', qty: 38, shelfHours: 5, loc: 'Hot Holding 04', temp: 64.5, hum: 49, status: 'SAFE', risk: 'LOW', hoursAgo: 1 },
    { item: 'Paneer Butter Masala', batch: 'PM-2026-042', qty: 22, shelfHours: 2.8, loc: 'Chilled Prep Chute', temp: 61.2, hum: 44, status: 'MONITOR', risk: 'MEDIUM', hoursAgo: 2.2 },
    // Raw & Cold Storage Ingredients
    { item: 'Vegetable Biryani', batch: 'VB-RAW-09', qty: 120, shelfHours: 72, loc: 'Cold Storage 01', temp: 4.2, hum: 78, status: 'SAFE', risk: 'LOW', hoursAgo: 12 },
    { item: 'Mixed Vegetable Curry', batch: 'VC-COLD-14', qty: 85, shelfHours: 48, loc: 'Cold Storage 01', temp: 4.5, hum: 80, status: 'SAFE', risk: 'LOW', hoursAgo: 24 },
    { item: 'Paneer Butter Masala', batch: 'PM-COLD-05', qty: 40, shelfHours: 36, loc: 'Cold Storage 02', temp: 5.1, hum: 75, status: 'SAFE', risk: 'LOW', hoursAgo: 18 },
    { item: 'Dal Makhani', batch: 'DM-RAW-22', qty: 150, shelfHours: 96, loc: 'Dry Storage 01', temp: 24.1, hum: 55, status: 'SAFE', risk: 'LOW', hoursAgo: 48 },
    { item: 'Steamed Basmati Rice', batch: 'BR-GRAIN-11', qty: 400, shelfHours: 180, loc: 'Dry Storage 01', temp: 23.8, hum: 52, status: 'SAFE', risk: 'LOW', hoursAgo: 72 },
    { item: 'Chapati / Roti', batch: 'CP-FLOUR-88', qty: 250, shelfHours: 120, loc: 'Dry Storage 02', temp: 24.5, hum: 50, status: 'SAFE', risk: 'LOW', hoursAgo: 60 },
    { item: 'Idli & Sambar Combo', batch: 'IS-BATTER-03', qty: 65, shelfHours: 18, loc: 'Cold Storage 01', temp: 4.8, hum: 82, status: 'MONITOR', risk: 'MEDIUM', hoursAgo: 12 },
    { item: 'Mixed Vegetable Curry', batch: 'VC-CUT-02', qty: 50, shelfHours: 12, loc: 'Prep Chiller 01', temp: 6.0, hum: 76, status: 'NEAR_EXPIRY', risk: 'HIGH', hoursAgo: 10 },
  ];

  for (const inv of inventoryItems) {
    const foodItem = createdFoodItems[inv.item];
    const preparedTime = new Date(now.getTime() - inv.hoursAgo * 3600 * 1000);
    const expiryTime = new Date(preparedTime.getTime() + (inv.shelfHours + inv.hoursAgo) * 3600 * 1000);

    const batch = await prisma.foodBatch.create({
      data: {
        batchNumber: inv.batch,
        foodItemId: foodItem.id,
        preparedAt: preparedTime,
        expiryDate: expiryTime,
        initialQuantity: inv.qty * 1.3,
        unit: 'kg',
        storageLocation: inv.loc,
        status: inv.status
      }
    });

    await prisma.inventory.create({
      data: {
        kitchenId: kitchenMain.id,
        foodItemId: foodItem.id,
        batchId: batch.id,
        batchNumber: inv.batch,
        quantity: inv.qty,
        unit: 'kg',
        storageLocation: inv.loc,
        temperature: inv.temp,
        humidity: inv.hum,
        expiryDate: expiryTime,
        status: inv.status,
        riskLevel: inv.risk,
        supplier: 'Karnataka State Agro Cooperative'
      }
    });
  }

  // 7. Historical Production & Consumption Records (30+ records over past 7 days)
  const shifts = ['BREAKFAST', 'LUNCH', 'DINNER'];
  for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
    const recordDate = new Date(now.getTime() - dayOffset * 24 * 3600 * 1000);

    for (const foodName of ['Vegetable Biryani', 'Dal Makhani', 'Chapati / Roti', 'Steamed Basmati Rice']) {
      const foodItem = createdFoodItems[foodName];
      const baseDemand = foodName === 'Vegetable Biryani' ? 140 : foodName === 'Steamed Basmati Rice' ? 180 : 100;
      const dayFactor = [0, 6].includes(recordDate.getDay()) ? 0.85 : 1.05; // Weekend dip
      const actualConsumed = Math.round(baseDemand * dayFactor + (Math.random() * 16 - 8));
      const plannedProd = Math.round(actualConsumed * 1.10); // overproduced by ~10%
      const actualProd = plannedProd + (Math.random() > 0.7 ? 5 : 0);

      await prisma.productionRecord.create({
        data: {
          kitchenId: kitchenMain.id,
          foodItemId: foodItem.id,
          quantity: actualProd,
          unit: 'kg',
          date: recordDate,
          shift: 'LUNCH',
          plannedQuantity: plannedProd,
          actualQuantity: actualProd,
          notes: `Batch produced for campus midday shift (Day -${dayOffset})`
        }
      });

      await prisma.consumptionRecord.create({
        data: {
          kitchenId: kitchenMain.id,
          foodItemId: foodItem.id,
          quantity: actualConsumed,
          unit: 'kg',
          date: recordDate,
          shift: 'LUNCH',
          headcount: Math.round(actualConsumed * 2.8),
          specialEvent: recordDate.getDay() === 3 // Wednesday tech symposium
        }
      });
    }
  }

  // 8. NGOs (10+ NGOs across Bengaluru with coordinates and capacities)
  const ngosData = [
    { name: 'Hope Community Kitchen', code: 'NGO-HOPE-01', cap: 350, count: 180, vegOnly: false, cold: true, lat: 12.8450, lng: 77.6620, contact: 'Sister Maria', phone: '+91 94480 11221' },
    { name: 'Annapurna Hunger Free Initiative', code: 'NGO-ANNA-02', cap: 500, count: 280, vegOnly: true, cold: true, lat: 12.8710, lng: 77.6530, contact: 'Ramanathan Iyer', phone: '+91 94480 22332' },
    { name: 'Sneha Nilaya Children Shelter', code: 'NGO-SNEH-03', cap: 150, count: 95, vegOnly: false, cold: false, lat: 12.8250, lng: 77.6820, contact: 'Sujata Rao', phone: '+91 94480 33443' },
    { name: 'Robin Hood Food Army Bengaluru Hub', code: 'NGO-RHFA-04', cap: 600, count: 420, vegOnly: false, cold: true, lat: 12.9150, lng: 77.6320, contact: 'Arjun Mehra', phone: '+91 94480 44554' },
    { name: 'Karuna Shanti Elders Home', code: 'NGO-KSHN-05', cap: 120, count: 75, vegOnly: true, cold: true, lat: 12.8600, lng: 77.6750, contact: 'Dr. Padmavati', phone: '+91 94480 55665' },
    { name: 'Janaseva Community Dining Shelter', code: 'NGO-JANA-06', cap: 400, count: 240, vegOnly: true, cold: false, lat: 12.8980, lng: 77.6400, contact: 'Basavaraj K.', phone: '+91 94480 66776' },
    { name: 'Mission Smile Feeding Mission', code: 'NGO-SMILE-07', cap: 300, count: 160, vegOnly: false, cold: true, lat: 12.9230, lng: 77.6180, contact: 'David Fernandez', phone: '+91 94480 77887' },
    { name: 'Roti Bank Karnataka Chapter', code: 'NGO-ROTI-08', cap: 450, count: 310, vegOnly: true, cold: true, lat: 12.9320, lng: 77.6080, contact: 'Harpreet Singh', phone: '+91 94480 88998' },
    { name: 'Aashraya Foundation Outreach', code: 'NGO-AASH-09', cap: 220, count: 130, vegOnly: false, cold: false, lat: 12.8310, lng: 77.6650, contact: 'Lakshmi Narayan', phone: '+91 94480 99009' },
    { name: 'Vidyaranya Social Welfare Centre', code: 'NGO-VIDY-10', cap: 280, count: 175, vegOnly: true, cold: true, lat: 12.8550, lng: 77.6950, contact: 'Chandrashekar H.', phone: '+91 94480 00110' },
  ];

  const createdNgos: any[] = [];
  for (const n of ngosData) {
    const ngo = await prisma.nGO.create({
      data: {
        name: n.name,
        code: n.code,
        organizationId: orgNgoFederation.id,
        dailyMealCapacity: n.cap,
        beneficiaryCount: n.count,
        acceptsVegOnly: n.vegOnly,
        hasColdStorage: n.cold,
        hasLogistics: true,
        latitude: n.lat,
        longitude: n.lng,
        contactPerson: n.contact,
        contactPhone: n.phone,
        requirements: {
          create: [
            { foodCategory: 'COOKED_MEAL', preferredItems: 'Rice, Dal, Biryani, Roti', dailyQuotaKg: n.cap / 2.5, preferredTime: '13:30 - 15:30' }
          ]
        }
      }
    });
    createdNgos.push(ngo);
  }

  // 9. Vehicles and Drivers for Logistics
  const veh1 = await prisma.vehicle.create({
    data: {
      plateNumber: 'KA-01-MJ-4521',
      model: 'Tata Ace EV (Electric Refrigerated)',
      capacityKg: 850,
      hasRefrigeration: true,
      currentLat: 12.8410,
      currentLng: 77.6740,
      status: 'AVAILABLE',
      organizationId: orgLogistics.id
    }
  });

  const veh2 = await prisma.vehicle.create({
    data: {
      plateNumber: 'KA-51-AB-7890',
      model: 'Mahindra Bolero Maxi Truck Plus',
      capacityKg: 1200,
      hasRefrigeration: false,
      currentLat: 12.8900,
      currentLng: 77.6500,
      status: 'AVAILABLE',
      organizationId: orgLogistics.id
    }
  });

  const driver1 = await prisma.driver.create({
    data: {
      fullName: 'Gopal Krishna',
      phone: '+91 97410 88221',
      licenseNumber: 'KA-01-2018-0091823',
      vehicleId: veh1.id,
      status: 'ASSIGNED'
    }
  });

  const driver2 = await prisma.driver.create({
    data: {
      fullName: 'Shankar Murthy',
      phone: '+91 97410 33445',
      licenseNumber: 'KA-51-2019-0044129',
      vehicleId: veh2.id,
      status: 'IDLE'
    }
  });

  // 10. Surplus Listings & Predictions (15+ items)
  const biryaniItem = createdFoodItems['Vegetable Biryani'];
  const dalItem = createdFoodItems['Dal Makhani'];
  const chapatiItem = createdFoodItems['Chapati / Roti'];
  const riceItem = createdFoodItems['Steamed Basmati Rice'];

  // Create active surplus listings ready for redistribution
  const listing1 = await prisma.surplusListing.create({
    data: {
      kitchenId: kitchenMain.id,
      foodItemId: biryaniItem.id,
      quantity: 48,
      availableQuantity: 48,
      unit: 'kg',
      preparedAt: new Date(now.getTime() - 2 * 3600 * 1000),
      shelfLifeHours: 5.5,
      pickupDeadline: new Date(now.getTime() + 4 * 3600 * 1000),
      qualityStatus: 'VERIFIED_GOOD',
      storageCondition: 'Hot Packaged insulated containers',
      dietaryCategory: 'VEG',
      status: 'AVAILABLE',
      priority: 'HIGH'
    }
  });

  const listing2 = await prisma.surplusListing.create({
    data: {
      kitchenId: kitchenMain.id,
      foodItemId: dalItem.id,
      quantity: 26,
      availableQuantity: 26,
      unit: 'kg',
      preparedAt: new Date(now.getTime() - 2.5 * 3600 * 1000),
      shelfLifeHours: 4.0,
      pickupDeadline: new Date(now.getTime() + 3 * 3600 * 1000),
      qualityStatus: 'SAFE',
      storageCondition: 'Steam Table Sealed',
      dietaryCategory: 'VEG',
      status: 'AVAILABLE',
      priority: 'HIGH'
    }
  });

  const listing3 = await prisma.surplusListing.create({
    data: {
      kitchenId: kitchenMain.id,
      foodItemId: chapatiItem.id,
      quantity: 35,
      availableQuantity: 35,
      unit: 'kg',
      preparedAt: new Date(now.getTime() - 1.5 * 3600 * 1000),
      shelfLifeHours: 4.5,
      pickupDeadline: new Date(now.getTime() + 3.5 * 3600 * 1000),
      qualityStatus: 'VERIFIED_GOOD',
      storageCondition: 'Insulated Hot Box',
      dietaryCategory: 'VEG',
      status: 'AVAILABLE',
      priority: 'HIGH'
    }
  });

  // Additional listings with various statuses for realistic history
  const listingDone = await prisma.surplusListing.create({
    data: {
      kitchenId: kitchenMain.id,
      foodItemId: riceItem.id,
      quantity: 64,
      availableQuantity: 0,
      unit: 'kg',
      preparedAt: new Date(now.getTime() - 26 * 3600 * 1000),
      shelfLifeHours: 6.0,
      pickupDeadline: new Date(now.getTime() - 20 * 3600 * 1000),
      qualityStatus: 'VERIFIED_GOOD',
      storageCondition: 'Cold Chilled',
      dietaryCategory: 'VEG',
      status: 'COMMITTED',
      priority: 'HIGH'
    }
  });

  // 11. Donations & Pickups
  const donationDelivered = await prisma.donation.create({
    data: {
      surplusListingId: listingDone.id,
      ngoId: createdNgos[0].id, // Hope Community Kitchen
      quantity: 64,
      unit: 'kg',
      matchScore: 94.5,
      matchReasoning: 'Match factors: Distance: 2.1 km | Required category: COOKED_MEAL | Capacity fit: 160 meals (available 350) | Timely pickup feasible: YES',
      status: 'DELIVERED',
      createdAt: new Date(now.getTime() - 24 * 3600 * 1000)
    }
  });

  const pickupDelivered = await prisma.pickup.create({
    data: {
      donationId: donationDelivered.id,
      driverId: driver1.id,
      pickupAddress: 'Apex Institutional Dining, Electronic City Phase 1',
      pickupLat: 12.8399,
      pickupLng: 77.6770,
      destinationAddress: 'Hope Community Kitchen, Neeladri Road',
      destLat: 12.8450,
      destLng: 77.6620,
      estimatedDistance: 2.8,
      estimatedMinutes: 18,
      deadline: new Date(now.getTime() - 20 * 3600 * 1000),
      scheduledAt: new Date(now.getTime() - 23 * 3600 * 1000),
      pickedUpAt: new Date(now.getTime() - 22.5 * 3600 * 1000),
      status: 'DELIVERED'
    }
  });

  await prisma.delivery.create({
    data: {
      pickupId: pickupDelivered.id,
      deliveredAt: new Date(now.getTime() - 21.8 * 3600 * 1000),
      receivedBy: 'Sister Maria',
      recipientRole: 'Head Coordinator',
      signatureToken: 'SIG-VERIFIED-48912',
      verifiedQuantity: 64,
      temperatureOnArrival: 61.2,
      notes: 'Delivered in excellent warm condition, distributed immediately to 160 evening beneficiaries.',
      status: 'CONFIRMED'
    }
  });

  // 12. Sensors and Telemetry
  const sensorCold1 = await prisma.sensor.create({
    data: {
      sensorCode: 'SEN-COLD-01',
      name: 'Cold Storage Walk-in 01',
      type: 'TEMPERATURE_HUMIDITY',
      location: 'Central Kitchen Bulk Refrigerator',
      kitchenId: kitchenMain.id,
      minThreshold: 2.0,
      maxThreshold: 8.0,
      connectivity: 'ONLINE',
      adapterType: 'SensorSimulator',
      lastReadingAt: now
    }
  });

  const sensorCold2 = await prisma.sensor.create({
    data: {
      sensorCode: 'SEN-COLD-02',
      name: 'Dairy & Paneer Chiller',
      type: 'TEMPERATURE_HUMIDITY',
      location: 'Pastry & Dairy Locker',
      kitchenId: kitchenMain.id,
      minThreshold: 1.0,
      maxThreshold: 5.0,
      connectivity: 'ONLINE',
      adapterType: 'SensorSimulator',
      lastReadingAt: now
    }
  });

  const sensorHot1 = await prisma.sensor.create({
    data: {
      sensorCode: 'SEN-HOT-01',
      name: 'Hot Holding Steam Unit 01',
      type: 'TEMPERATURE_HUMIDITY',
      location: 'Main Service Chute',
      kitchenId: kitchenMain.id,
      minThreshold: 60.0,
      maxThreshold: 80.0,
      connectivity: 'ONLINE',
      adapterType: 'SensorSimulator',
      lastReadingAt: now
    }
  });

  const sensorDry1 = await prisma.sensor.create({
    data: {
      sensorCode: 'SEN-DRY-01',
      name: 'Dry Grain Silo 01',
      type: 'TEMPERATURE_HUMIDITY',
      location: 'Basement Storage Area',
      kitchenId: kitchenMain.id,
      minThreshold: 18.0,
      maxThreshold: 28.0,
      connectivity: 'ONLINE',
      adapterType: 'SensorSimulator',
      lastReadingAt: now
    }
  });

  // Create sensor readings over past 24 hours
  for (let h = 24; h >= 0; h--) {
    const readingTime = new Date(now.getTime() - h * 3600 * 1000);
    // Cold 01 normal is ~3.8 to 4.5, with an excursion at h=3 of 9.2 C
    const isExcursion = h === 3;
    const tempCold = isExcursion ? 9.8 : +(3.8 + Math.sin(h) * 0.9).toFixed(1);

    await prisma.sensorReading.create({
      data: {
        sensorId: sensorCold1.id,
        temperature: tempCold,
        humidity: +(78 + Math.cos(h) * 4).toFixed(1),
        gasQuality: +(0.15 + (isExcursion ? 0.35 : 0.05)).toFixed(2),
        isAnomaly: isExcursion,
        timestamp: readingTime
      }
    });

    await prisma.sensorReading.create({
      data: {
        sensorId: sensorHot1.id,
        temperature: +(65.2 + Math.sin(h * 0.5) * 2.1).toFixed(1),
        humidity: +(45 + Math.cos(h) * 3).toFixed(1),
        isAnomaly: false,
        timestamp: readingTime
      }
    });
  }

  // 13. Quality Inspections
  await prisma.qualityInspection.create({
    data: {
      foodItemId: biryaniItem.id,
      imageUrl: '/uploads/sample-biryani.jpg',
      qualityScore: 88.5,
      freshnessCategory: 'GOOD',
      spoilageRisk: 'LOW',
      visualIssues: 'Even coloration, intact grain structure, no discoloration or moisture exudation.',
      recommendedAction: 'Safe for redistribution within recommended 6-hour temperature window.',
      reviewerStatus: 'APPROVED',
      inspectedById: userKitchen.id,
      inspectorNotes: 'Steam aroma and visual grain texture verified compliant with FSSAI institutional guidelines.'
    }
  });

  await prisma.qualityInspection.create({
    data: {
      foodItemId: dalItem.id,
      imageUrl: '/uploads/sample-dal.jpg',
      qualityScore: 78.0,
      freshnessCategory: 'FAIR',
      spoilageRisk: 'MEDIUM',
      visualIssues: 'Slight surface layer drying from heat lamp exposure; viscosity remains normal.',
      recommendedAction: 'Safe if redistributed within 3 hours. Stir and maintain above 63°C.',
      reviewerStatus: 'APPROVED',
      inspectedById: userKitchen.id,
      inspectorNotes: 'Quality approved for rapid same-sector shelter redistribution.'
    }
  });

  // 14. Food Processing Batches & Machines
  const machine1 = await prisma.machine.create({
    data: {
      machineCode: 'MCH-STEAM-01',
      name: 'Industrial Steam Kettle Retort 500L',
      processingId: procUnit1.id,
      status: 'RUNNING',
      totalRuntimeHours: 1420.5,
      totalDowntimeHours: 32.0,
      lastMaintenance: new Date(now.getTime() - 14 * 24 * 3600 * 1000)
    }
  });

  const machine2 = await prisma.machine.create({
    data: {
      machineCode: 'MCH-PACK-02',
      name: 'Automated Tray Sealing & Vacuum Line',
      processingId: procUnit1.id,
      status: 'IDLE',
      totalRuntimeHours: 980.2,
      totalDowntimeHours: 18.5,
      lastMaintenance: new Date(now.getTime() - 7 * 24 * 3600 * 1000)
    }
  });

  await prisma.machineDowntime.create({
    data: {
      machineId: machine1.id,
      reason: 'Seal gasket preventive replacement and pressure recalibration',
      durationMinutes: 90,
      startedAt: new Date(now.getTime() - 36 * 3600 * 1000),
      endedAt: new Date(now.getTime() - 34.5 * 3600 * 1000),
      loggedBy: 'Maintenance Lead R. Kulkarni',
      notes: 'Completed ahead of schedule. Hydrostatic test passed.'
    }
  });

  await prisma.processingBatch.create({
    data: {
      batchNumber: 'PB-TOMATO-801',
      processingId: procUnit1.id,
      productName: 'Pasteurized Retort Tomato Puree (200g Pouches)',
      rawMaterialName: 'Grade-A Fresh Karnataka Tomatoes',
      rawInputKg: 3500,
      outputKg: 3180,
      wasteKg: 320, // skins and seeds
      efficiencyPct: 90.8,
      status: 'COMPLETED',
      startedAt: new Date(now.getTime() - 12 * 3600 * 1000),
      completedAt: new Date(now.getTime() - 4 * 3600 * 1000)
    }
  });

  await prisma.energyRecord.create({
    data: {
      processingId: procUnit1.id,
      date: now,
      electricityKwh: 480.5,
      gasKg: 65.0,
      waterLiters: 1800,
      energyIntensity: 0.15 // kWh per kg output
    }
  });

  // 15. Waste Records
  const wasteReasons = [
    { reason: 'Overproduction', type: 'PREVENTABLE', qty: 22, item: biryaniItem },
    { reason: 'Plate waste', type: 'UNAVOIDABLE', qty: 18, item: riceItem },
    { reason: 'Preparation loss', type: 'UNAVOIDABLE', qty: 12, item: createdFoodItems['Mixed Vegetable Curry'] },
    { reason: 'Storage failure', type: 'PREVENTABLE', qty: 9, item: createdFoodItems['Paneer Butter Masala'] },
  ];

  for (const w of wasteReasons) {
    await prisma.wasteRecord.create({
      data: {
        kitchenId: kitchenMain.id,
        foodItemId: w.item.id,
        quantityKg: w.qty,
        wasteType: w.type,
        reason: w.reason,
        costImpactInr: w.qty * w.item.costPerUnit,
        recordedDate: new Date(now.getTime() - Math.random() * 48 * 3600 * 1000),
        notes: `Recorded during end-of-shift waste reconciliation`
      }
    });
  }

  // 16. Sustainability Snapshot Data (Past 14 days)
  for (let d = 14; d >= 0; d--) {
    const sDate = new Date(now.getTime() - d * 24 * 3600 * 1000);
    const prepared = Math.round(1150 + Math.sin(d) * 120);
    const rescued = Math.round(55 + Math.cos(d) * 20);
    const prevented = Math.round(38 + Math.sin(d * 0.7) * 12);
    const wasted = Math.round(45 - (14 - d) * 1.5 + Math.random() * 8); // Showing gradual reduction trend

    await prisma.sustainabilityMetric.create({
      data: {
        organizationId: orgKitchen.id,
        date: sDate,
        foodPreparedKg: prepared,
        foodWastedKg: Math.max(15, wasted),
        foodRescuedKg: rescued,
        wastePreventedKg: prevented,
        mealsRedistributed: Math.round(rescued * 2.5),
        estimatedCostSavedInr: Math.round((rescued + prevented) * 120),
        estimatedCo2AvoidedKg: +((rescued + prevented) * 2.5).toFixed(1),
        estimatedWaterSavedLiters: +((rescued + prevented) * 450).toFixed(0),
        snapshotPeriod: 'DAILY'
      }
    });
  }

  // 17. Live Actionable Alerts
  await prisma.alert.create({
    data: {
      type: 'TEMPERATURE',
      severity: 'HIGH',
      title: 'Cold Storage Temperature Excursion',
      message: 'Cold Storage Walk-in 01 registered 9.8°C (threshold: 8.0°C). Inspect door seals and chiller cycle.',
      entityType: 'Sensor',
      entityId: sensorCold1.id,
      targetRoute: '/monitoring',
      sensorId: sensorCold1.id,
      organizationId: orgKitchen.id,
      isResolved: false
    }
  });

  await prisma.alert.create({
    data: {
      type: 'SURPLUS',
      severity: 'MEDIUM',
      title: 'Redistribution Window Closing Soon',
      message: 'Vegetable Biryani batch (48 kg) has 3.5 hours remaining before recommended redistribution deadline.',
      entityType: 'SurplusListing',
      entityId: listing1.id,
      targetRoute: '/redistribution',
      organizationId: orgKitchen.id,
      isResolved: false
    }
  });

  await prisma.alert.create({
    data: {
      type: 'EXPIRY',
      severity: 'HIGH',
      title: 'Near-Expiry Inventory Batch Detected',
      message: 'Dal Makhani batch DM-2026-089 (18 kg) in Holding Tray C reaches critical holding threshold in 90 mins.',
      entityType: 'Inventory',
      targetRoute: '/inventory',
      organizationId: orgKitchen.id,
      isResolved: false
    }
  });

  await prisma.alert.create({
    data: {
      type: 'FORECAST',
      severity: 'LOW',
      title: 'Surplus Opportunity Forecasted',
      message: 'AI Model forecasts 86 kg combined surplus tomorrow based on historical post-event consumption trends.',
      targetRoute: '/forecast',
      organizationId: orgKitchen.id,
      isResolved: false
    }
  });

  // 18. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: userKitchen.id,
      userName: userKitchen.fullName,
      userRole: userKitchen.role,
      action: 'CREATED_SURPLUS',
      entity: 'SurplusListing',
      entityId: listing1.id,
      newValue: JSON.stringify({ item: 'Vegetable Biryani', quantityKg: 48, status: 'AVAILABLE' }),
      organizationId: orgKitchen.id
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: userLogistics.id,
      userName: userLogistics.fullName,
      userRole: userLogistics.role,
      action: 'DELIVERY_CONFIRMED',
      entity: 'Delivery',
      entityId: pickupDelivered.id,
      newValue: JSON.stringify({ status: 'DELIVERED', mealsCount: 160 }),
      organizationId: orgLogistics.id
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('Demo accounts created:');
  console.log(' - Admin: admin@foodcycle.ai / Password123!');
  console.log(' - Kitchen Manager: kitchen@foodcycle.ai / Password123!');
  console.log(' - Processing Manager: processing@foodcycle.ai / Password123!');
  console.log(' - NGO Coordinator: ngo@foodcycle.ai / Password123!');
  console.log(' - Logistics Operator: logistics@foodcycle.ai / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
