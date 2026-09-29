/**
 * SmartFood AI — Resilient Local Data & Mock Evaluation Service
 * Provides offline & mock fallback data when backend API is unreachable (e.g. Netlify deployment or offline dev).
 */

import {
  User,
  FoodItem,
  InventoryItem,
  DemandForecastData,
  SurplusListing,
  SurplusPrediction,
  NGO,
  MatchScoreResult,
  Donation,
  Pickup,
  Sensor,
  QualityInspection,
  Alert,
  AIRecommendation
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  INVENTORY: 'smartfood_inventory',
  SURPLUS_LISTINGS: 'smartfood_surplus_listings',
  DONATIONS: 'smartfood_donations',
  PICKUPS: 'smartfood_pickups',
  INSPECTIONS: 'smartfood_inspections',
  ALERTS: 'smartfood_alerts',
  FACTORS: 'smartfood_factors',
  DOWNTIME_LOGS: 'smartfood_downtime_logs',
  AUDIT_LOGS: 'smartfood_audit_logs',
  METRICS: 'smartfood_sustainability_metrics'
};

export const DEMO_USERS: (User & { passwordHash?: string })[] = [
  {
    id: 'user-admin-01',
    email: 'admin@foodcycle.ai',
    fullName: 'Dr. Alok Verma (Director General)',
    role: 'ADMIN',
    phone: '+91 98110 12345',
    organizationId: 'org-mofpi-00',
    organizationName: 'Ministry of Food Processing Industries (MoFPI)',
    organizationType: 'GOVERNMENT'
  },
  {
    id: 'user-kitchen-02',
    email: 'kitchen@foodcycle.ai',
    fullName: 'Chef Rajesh Nair (Executive Head)',
    role: 'KITCHEN_MANAGER',
    phone: '+91 98220 54321',
    organizationId: 'org-apex-01',
    organizationName: 'Apex Institutional Catering Hub',
    organizationType: 'INSTITUTIONAL_KITCHEN'
  },
  {
    id: 'user-ngo-03',
    email: 'ngo@foodcycle.ai',
    fullName: 'Sister Teresa D’Souza (Shelter Lead)',
    role: 'NGO_COORDINATOR',
    phone: '+91 98330 67890',
    organizationId: 'org-hope-03',
    organizationName: 'Hope Community Kitchen & Shelter',
    organizationType: 'NGO'
  },
  {
    id: 'user-logistics-04',
    email: 'logistics@foodcycle.ai',
    fullName: 'Vikramjit Singh (Fleet Dispatcher)',
    role: 'LOGISTICS_OPERATOR',
    phone: '+91 98440 98765',
    organizationId: 'org-fleet-04',
    organizationName: 'GreenPath Cold-Chain Logistics',
    organizationType: 'LOGISTICS_PARTNER'
  },
  {
    id: 'user-processing-05',
    email: 'processing@foodcycle.ai',
    fullName: 'Sunil Gavaskar (Plant Director)',
    role: 'PROCESSING_MANAGER',
    phone: '+91 98550 11223',
    organizationId: 'org-agri-02',
    organizationName: 'AgriFresh Agro-Processing Unit #4',
    organizationType: 'PROCESSING_UNIT'
  }
];

export const DEMO_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'item-biryani-01',
    name: 'Vegetable Biryani',
    category: 'Cooked Meals',
    standardUnit: 'kg',
    defaultShelfLifeHours: 6,
    optimumTempMin: 60,
    optimumTempMax: 75,
    costPerUnit: 140,
    co2FactorKg: 2.8,
    waterFactorLiter: 480,
    mealFactor: 2.5
  },
  {
    id: 'item-dal-02',
    name: 'Dal Makhani',
    category: 'Cooked Meals',
    standardUnit: 'kg',
    defaultShelfLifeHours: 8,
    optimumTempMin: 60,
    optimumTempMax: 70,
    costPerUnit: 90,
    co2FactorKg: 1.9,
    waterFactorLiter: 390,
    mealFactor: 2.5
  },
  {
    id: 'item-rice-03',
    name: 'Steamed Basmati Rice',
    category: 'Cooked Meals',
    standardUnit: 'kg',
    defaultShelfLifeHours: 5,
    optimumTempMin: 60,
    optimumTempMax: 75,
    costPerUnit: 60,
    co2FactorKg: 2.1,
    waterFactorLiter: 520,
    mealFactor: 2.5
  },
  {
    id: 'item-roti-04',
    name: 'Whole Wheat Chapati',
    category: 'Breads & Rotis',
    standardUnit: 'kg',
    defaultShelfLifeHours: 6,
    optimumTempMin: 45,
    optimumTempMax: 65,
    costPerUnit: 70,
    co2FactorKg: 1.4,
    waterFactorLiter: 310,
    mealFactor: 3.0
  },
  {
    id: 'item-poha-05',
    name: 'Poha Breakfast Mix',
    category: 'Breakfast',
    standardUnit: 'kg',
    defaultShelfLifeHours: 5,
    optimumTempMin: 55,
    optimumTempMax: 65,
    costPerUnit: 80,
    co2FactorKg: 1.6,
    waterFactorLiter: 340,
    mealFactor: 3.0
  },
  {
    id: 'item-idli-06',
    name: 'Steamed Idli & Sambhar',
    category: 'Breakfast',
    standardUnit: 'kg',
    defaultShelfLifeHours: 6,
    optimumTempMin: 55,
    optimumTempMax: 65,
    costPerUnit: 75,
    co2FactorKg: 1.5,
    waterFactorLiter: 330,
    mealFactor: 3.0
  },
  {
    id: 'item-veg-07',
    name: 'Mixed Seasonal Vegetable Curry',
    category: 'Cooked Meals',
    standardUnit: 'kg',
    defaultShelfLifeHours: 7,
    optimumTempMin: 60,
    optimumTempMax: 70,
    costPerUnit: 95,
    co2FactorKg: 1.8,
    waterFactorLiter: 360,
    mealFactor: 2.5
  },
  {
    id: 'item-paneer-08',
    name: 'Paneer Butter Masala',
    category: 'Cooked Meals',
    standardUnit: 'kg',
    defaultShelfLifeHours: 6,
    optimumTempMin: 60,
    optimumTempMax: 70,
    costPerUnit: 180,
    co2FactorKg: 3.5,
    waterFactorLiter: 650,
    mealFactor: 2.5
  }
];

export const DEMO_NGOS: NGO[] = [
  {
    id: 'ngo-hope-01',
    name: 'Hope Community Kitchen & Shelter',
    code: 'NGO-DEL-01',
    organizationId: 'org-hope-03',
    beneficiaryCount: 350,
    dailyMealCapacity: 400,
    acceptsVegOnly: false,
    hasColdStorage: true,
    hasLogistics: true,
    latitude: 28.5355,
    longitude: 77.251,
    contactPerson: 'Sister Teresa',
    contactPhone: '+91 98330 67890',
    requirements: [
      { foodCategory: 'Cooked Meals', preferredItems: 'Rice, Dal, Khichdi', dailyQuotaKg: 150 },
      { foodCategory: 'Breads & Rotis', preferredItems: 'Chapati, Roti', dailyQuotaKg: 60 }
    ]
  },
  {
    id: 'ngo-annapurna-02',
    name: 'Annapurna Food Rescue Foundation',
    code: 'NGO-DEL-02',
    organizationId: 'org-anna-04',
    beneficiaryCount: 520,
    dailyMealCapacity: 600,
    acceptsVegOnly: true,
    hasColdStorage: true,
    hasLogistics: true,
    latitude: 28.5492,
    longitude: 77.2694,
    contactPerson: 'Ramesh Sharma',
    contactPhone: '+91 98100 44332',
    requirements: [
      { foodCategory: 'Cooked Meals', preferredItems: 'Biryani, Dal, Curries', dailyQuotaKg: 200 }
    ]
  },
  {
    id: 'ngo-robin-03',
    name: 'Robin Hood Army - South Delhi Cluster',
    code: 'NGO-DEL-03',
    organizationId: 'org-rha-05',
    beneficiaryCount: 280,
    dailyMealCapacity: 300,
    acceptsVegOnly: false,
    hasColdStorage: false,
    hasLogistics: true,
    latitude: 28.528,
    longitude: 77.219,
    contactPerson: 'Karan Mehra',
    contactPhone: '+91 98711 22334',
    requirements: [
      { foodCategory: 'Cooked Meals', preferredItems: 'Fresh portions', dailyQuotaKg: 100 }
    ]
  }
];

export const DEMO_VEHICLES = [
  {
    id: 'veh-01',
    registrationNumber: 'DL-01-AB-4021',
    model: 'Tata Ace EV Chilled Van',
    capacityKg: 650,
    currentLoadKg: 120,
    status: 'ACTIVE',
    hasRefrigeration: true,
    currentTemperature: 4.2
  },
  {
    id: 'veh-02',
    registrationNumber: 'DL-04-CD-8992',
    model: 'Mahindra Bolero Maxi-Truck',
    capacityKg: 1000,
    currentLoadKg: 0,
    status: 'IDLE',
    hasRefrigeration: false,
    currentTemperature: 24.5
  }
];

export const DEMO_DRIVERS = [
  { id: 'drv-01', fullName: 'Harpreet Singh', phone: '+91 98112 33445', licenseNumber: 'DL-1420110098' },
  { id: 'drv-02', fullName: 'Mohammad Shakeel', phone: '+91 98223 44556', licenseNumber: 'DL-1420150041' }
];

export const DEMO_SENSORS: Sensor[] = [
  {
    id: 'sensor-cs-01',
    sensorCode: 'SENS-CS-01',
    name: 'Cold Storage Room 01 (Dairy & Cooked)',
    type: 'TEMPERATURE_HUMIDITY',
    location: 'Cold Storage Wing A',
    minThreshold: 2.0,
    maxThreshold: 8.0,
    connectivity: 'ONLINE',
    adapterType: 'MQTTAdapter',
    lastReadingAt: new Date().toISOString(),
    readings: [
      { id: 'r1', temperature: 4.2, humidity: 82, gasQuality: 12, isAnomaly: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'r2', temperature: 4.5, humidity: 83, gasQuality: 13, isAnomaly: false, timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 'r3', temperature: 4.1, humidity: 81, gasQuality: 12, isAnomaly: false, timestamp: new Date().toISOString() }
    ]
  },
  {
    id: 'sensor-ds-02',
    sensorCode: 'SENS-DS-02',
    name: 'Dry Grain & Spice Warehouse 01',
    type: 'TEMPERATURE_HUMIDITY',
    location: 'Dry Storage Zone 2',
    minThreshold: 18.0,
    maxThreshold: 26.0,
    connectivity: 'ONLINE',
    adapterType: 'RESTSensorAdapter',
    lastReadingAt: new Date().toISOString(),
    readings: [
      { id: 'r4', temperature: 22.4, humidity: 48, gasQuality: 8, isAnomaly: false, timestamp: new Date().toISOString() }
    ]
  },
  {
    id: 'sensor-fz-03',
    sensorCode: 'SENS-FZ-03',
    name: 'Deep Freezer Unit 01 (Raw Meat & Frozen)',
    type: 'TEMPERATURE',
    location: 'Deep Freeze Bay 01',
    minThreshold: -22.0,
    maxThreshold: -15.0,
    connectivity: 'ONLINE',
    adapterType: 'SensorSimulator',
    lastReadingAt: new Date().toISOString(),
    readings: [
      { id: 'r5', temperature: -18.2, humidity: 35, gasQuality: 5, isAnomaly: false, timestamp: new Date().toISOString() }
    ]
  },
  {
    id: 'sensor-hh-04',
    sensorCode: 'SENS-HH-04',
    name: 'Hot Holding Pass-Through Station 01',
    type: 'TEMPERATURE_HUMIDITY',
    location: 'Kitchen Dispatch Line',
    minThreshold: 60.0,
    maxThreshold: 75.0,
    connectivity: 'ONLINE',
    adapterType: 'SensorSimulator',
    lastReadingAt: new Date().toISOString(),
    readings: [
      { id: 'r6', temperature: 65.8, humidity: 52, gasQuality: 9, isAnomaly: false, timestamp: new Date().toISOString() }
    ]
  }
];

// Helper to get or init localStorage arrays
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    return defaultValue;
  }
}

function saveStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist ${key}`, err);
  }
}

// Initial seed generators
export function initSeedDataIfMissing(): void {
  // Inventory
  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
    const initialInventory: InventoryItem[] = [
      {
        id: 'inv-01',
        kitchenId: 'org-apex-01',
        foodItemId: 'item-biryani-01',
        foodItem: DEMO_FOOD_ITEMS[0],
        batchNumber: 'BCH-2026-BIR-091',
        quantity: 48,
        unit: 'kg',
        storageLocation: 'Hot Holding Station 01',
        temperature: 64.5,
        humidity: 48,
        expiryDate: new Date(Date.now() + 4 * 3600000).toISOString(),
        status: 'MONITOR',
        riskLevel: 'LOW',
        createdAt: new Date().toISOString()
      },
      {
        id: 'inv-02',
        kitchenId: 'org-apex-01',
        foodItemId: 'item-dal-02',
        foodItem: DEMO_FOOD_ITEMS[1],
        batchNumber: 'BCH-2026-DAL-104',
        quantity: 32,
        unit: 'kg',
        storageLocation: 'Hot Holding Station 01',
        temperature: 66.0,
        humidity: 50,
        expiryDate: new Date(Date.now() + 5 * 3600000).toISOString(),
        status: 'SAFE',
        riskLevel: 'LOW',
        createdAt: new Date().toISOString()
      },
      {
        id: 'inv-03',
        kitchenId: 'org-apex-01',
        foodItemId: 'item-rice-03',
        foodItem: DEMO_FOOD_ITEMS[2],
        batchNumber: 'BCH-2026-RIC-088',
        quantity: 60,
        unit: 'kg',
        storageLocation: 'Insulated Warm Trolley 02',
        temperature: 62.5,
        humidity: 55,
        expiryDate: new Date(Date.now() + 3 * 3600000).toISOString(),
        status: 'NEAR_EXPIRY',
        riskLevel: 'MEDIUM',
        createdAt: new Date().toISOString()
      },
      {
        id: 'inv-04',
        kitchenId: 'org-apex-01',
        foodItemId: 'item-roti-04',
        foodItem: DEMO_FOOD_ITEMS[3],
        batchNumber: 'BCH-2026-ROT-212',
        quantity: 25,
        unit: 'kg',
        storageLocation: 'Insulated Warmer Box 04',
        temperature: 52.0,
        humidity: 40,
        expiryDate: new Date(Date.now() + 2 * 3600000).toISOString(),
        status: 'NEAR_EXPIRY',
        riskLevel: 'HIGH',
        createdAt: new Date().toISOString()
      },
      {
        id: 'inv-05',
        kitchenId: 'org-apex-01',
        foodItemId: 'item-veg-07',
        foodItem: DEMO_FOOD_ITEMS[6],
        batchNumber: 'BCH-2026-VEG-305',
        quantity: 40,
        unit: 'kg',
        storageLocation: 'Hot Holding Station 01',
        temperature: 63.8,
        humidity: 51,
        expiryDate: new Date(Date.now() + 6 * 3600000).toISOString(),
        status: 'SAFE',
        riskLevel: 'LOW',
        createdAt: new Date().toISOString()
      },
      {
        id: 'inv-06',
        kitchenId: 'org-apex-01',
        foodItemId: 'item-paneer-08',
        foodItem: DEMO_FOOD_ITEMS[7],
        batchNumber: 'BCH-2026-PAN-019',
        quantity: 22,
        unit: 'kg',
        storageLocation: 'Cold Storage Room 01',
        temperature: 3.8,
        humidity: 82,
        expiryDate: new Date(Date.now() + 18 * 3600000).toISOString(),
        status: 'SAFE',
        riskLevel: 'LOW',
        createdAt: new Date().toISOString()
      }
    ];
    saveStored(STORAGE_KEYS.INVENTORY, initialInventory);
  }

  // Surplus Listings
  if (!localStorage.getItem(STORAGE_KEYS.SURPLUS_LISTINGS)) {
    const initialListings: SurplusListing[] = [
      {
        id: 'list-01',
        kitchenId: 'org-apex-01',
        kitchen: { name: 'Apex Central Kitchen', organization: { name: 'Apex Catering', latitude: 28.5355, longitude: 77.241 } },
        foodItemId: 'item-biryani-01',
        foodItem: DEMO_FOOD_ITEMS[0],
        quantity: 35,
        availableQuantity: 35,
        unit: 'kg',
        preparedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        shelfLifeHours: 5,
        pickupDeadline: new Date(Date.now() + 3 * 3600000).toISOString(),
        qualityStatus: 'EXCELLENT',
        storageCondition: 'Hot insulated container (>62°C)',
        dietaryCategory: 'VEG',
        status: 'AVAILABLE',
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      },
      {
        id: 'list-02',
        kitchenId: 'org-apex-01',
        kitchen: { name: 'Apex Central Kitchen', organization: { name: 'Apex Catering', latitude: 28.5355, longitude: 77.241 } },
        foodItemId: 'item-dal-02',
        foodItem: DEMO_FOOD_ITEMS[1],
        quantity: 20,
        availableQuantity: 20,
        unit: 'kg',
        preparedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        shelfLifeHours: 6,
        pickupDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
        qualityStatus: 'GOOD',
        storageCondition: 'Hot vessel sealed (>60°C)',
        dietaryCategory: 'VEG',
        status: 'AVAILABLE',
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      },
      {
        id: 'list-03',
        kitchenId: 'org-apex-01',
        kitchen: { name: 'Apex Central Kitchen', organization: { name: 'Apex Catering', latitude: 28.5355, longitude: 77.241 } },
        foodItemId: 'item-roti-04',
        foodItem: DEMO_FOOD_ITEMS[3],
        quantity: 18,
        availableQuantity: 0,
        unit: 'kg',
        preparedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        shelfLifeHours: 4,
        pickupDeadline: new Date(Date.now() + 1 * 3600000).toISOString(),
        qualityStatus: 'GOOD',
        storageCondition: 'Insulated foil wrapped',
        dietaryCategory: 'VEG',
        status: 'MATCHED',
        priority: 'MEDIUM',
        createdAt: new Date().toISOString()
      }
    ];
    saveStored(STORAGE_KEYS.SURPLUS_LISTINGS, initialListings);
  }

  // Donations
  if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
    const initialDonations: Donation[] = [
      {
        id: 'don-01',
        surplusListingId: 'list-03',
        surplusListing: {
          id: 'list-03',
          kitchenId: 'org-apex-01',
          foodItemId: 'item-roti-04',
          foodItem: DEMO_FOOD_ITEMS[3],
          quantity: 18,
          availableQuantity: 0,
          unit: 'kg',
          preparedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
          shelfLifeHours: 4,
          pickupDeadline: new Date(Date.now() + 1 * 3600000).toISOString(),
          qualityStatus: 'GOOD',
          storageCondition: 'Insulated foil wrapped',
          dietaryCategory: 'VEG',
          status: 'MATCHED',
          priority: 'MEDIUM',
          createdAt: new Date().toISOString()
        },
        ngoId: 'ngo-hope-01',
        ngo: DEMO_NGOS[0],
        quantity: 18,
        unit: 'kg',
        matchScore: 94,
        matchReasoning: 'Proximity: 1.8km | High Roti Requirement | Capacity: 400 portions | Safe Pickup Feasible',
        status: 'ACCEPTED',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    saveStored(STORAGE_KEYS.DONATIONS, initialDonations);
  }

  // Pickups
  if (!localStorage.getItem(STORAGE_KEYS.PICKUPS)) {
    const initialPickups: Pickup[] = [
      {
        id: 'pck-01',
        donationId: 'don-01',
        donation: {
          id: 'don-01',
          surplusListingId: 'list-03',
          surplusListing: {
            id: 'list-03',
            kitchenId: 'org-apex-01',
            foodItemId: 'item-roti-04',
            foodItem: DEMO_FOOD_ITEMS[3],
            quantity: 18,
            availableQuantity: 0,
            unit: 'kg',
            preparedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
            shelfLifeHours: 4,
            pickupDeadline: new Date(Date.now() + 1 * 3600000).toISOString(),
            qualityStatus: 'GOOD',
            storageCondition: 'Insulated foil wrapped',
            dietaryCategory: 'VEG',
            status: 'MATCHED',
            priority: 'MEDIUM',
            createdAt: new Date().toISOString()
          },
          ngoId: 'ngo-hope-01',
          ngo: DEMO_NGOS[0],
          quantity: 18,
          unit: 'kg',
          matchScore: 94,
          matchReasoning: 'Top Proximity Fit',
          status: 'ACCEPTED',
          createdAt: new Date().toISOString()
        },
        driverId: 'drv-01',
        driver: { fullName: 'Harpreet Singh', phone: '+91 98112 33445' },
        pickupAddress: 'Apex Central Catering, Gate 3, Okhla Phase III, New Delhi',
        pickupLat: 28.5355,
        pickupLng: 77.2612,
        destinationAddress: 'Hope Community Shelter, Kalkaji, New Delhi',
        destLat: 28.5412,
        destLng: 28.5412,
        estimatedDistance: 2.4,
        estimatedMinutes: 14,
        deadline: new Date(Date.now() + 2 * 3600000).toISOString(),
        status: 'ASSIGNED'
      }
    ];
    saveStored(STORAGE_KEYS.PICKUPS, initialPickups);
  }

  // Inspections
  if (!localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) {
    const initialInspections: QualityInspection[] = [
      {
        id: 'insp-01',
        foodItemId: 'item-biryani-01',
        foodItem: DEMO_FOOD_ITEMS[0],
        probeId: 'BENCH-LAB-900',
        coreTemperature: 66.4,
        vocGasPpm: 7.2,
        phLevel: 6.4,
        moistureAw: 0.88,
        qualityScore: 96,
        freshnessCategory: 'EXCELLENT',
        spoilageRisk: 'LOW',
        visualIssues: 'Thermal holding compliant (>60°C). Normal headspace VOC (7.2 ppm). pH 6.4 within standard neutrality range.',
        recommendedAction: 'Safe for redistribution within recommended 5-hour operational window.',
        reviewerStatus: 'APPROVED',
        inspectorNotes: 'Certified by QA Officer Rajesh. Batch meets FSSAI Schedule IV parameters.',
        disclaimer: 'AI IoT visual & bio-chemical sensor assessment. Does not replace accredited food laboratory test certificate.',
        createdAt: new Date().toISOString(),
        sensorFindings: {
          temperatureStatus: 'SAFE_HOT',
          temperatureRemark: 'Hot holding compliant (>60°C)',
          gasQualityStatus: 'OPTIMAL',
          gasRemark: 'TVB-N volatiles within fresh baseline',
          acidityStatus: 'NORMAL',
          acidityRemark: 'pH 6.4 confirms no anaerobic acidification',
          moistureStatus: 'Equilibrium aw stable'
        }
      }
    ];
    saveStored(STORAGE_KEYS.INSPECTIONS, initialInspections);
  }

  // Alerts
  if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
    const initialAlerts: Alert[] = [
      {
        id: 'alt-01',
        type: 'SURPLUS',
        severity: 'HIGH',
        title: 'Redistribution Window Imminent',
        message: 'Steamed Rice batch BCH-2026-RIC-088 has 3 hours remaining before redistribution deadline.',
        targetRoute: '/surplus',
        isResolved: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'alt-02',
        type: 'TEMPERATURE',
        severity: 'MEDIUM',
        title: 'Cold Storage Room Minor Excursion',
        message: 'Cold Storage Room 01 logged brief temperature shift to 8.2°C during loading. Auto-recovered to 4.2°C.',
        targetRoute: '/monitoring',
        isResolved: false,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'alt-03',
        type: 'FORECAST',
        severity: 'LOW',
        title: 'Forecast Surplus Tomorrow: 86 kg',
        message: 'Predicted demand surge for Dal Makhani (+12%) for Monday lunch service. Pre-allocation advised.',
        targetRoute: '/forecast',
        isResolved: false,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    saveStored(STORAGE_KEYS.ALERTS, initialAlerts);
  }

  // Impact factors
  if (!localStorage.getItem(STORAGE_KEYS.FACTORS)) {
    saveStored(STORAGE_KEYS.FACTORS, {
      co2FactorPerKg: 2.5,
      waterFactorPerKg: 450.0,
      costPerKgInr: 120.0,
      mealConversionKg: 2.5,
      methodologyNote: 'Calculated using MoFPI Food Loss and Waste (FLW) conversion standards and FAO GHG avoidance methodologies.'
    });
  }
}

// Master Local Handler
export const localDataService = {
  // Authentication
  login: (email: string, password?: string) => {
    initSeedDataIfMissing();
    const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Default to kitchen manager if unknown
      const fallbackUser = DEMO_USERS[1];
      return {
        success: true,
        token: `mock_jwt_${fallbackUser.id}_${Date.now()}`,
        user: fallbackUser
      };
    }
    return {
      success: true,
      token: `mock_jwt_${user.id}_${Date.now()}`,
      user
    };
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('foodcycle_user');
    if (raw) {
      try {
        return { success: true, user: JSON.parse(raw) };
      } catch (err) {
        // fallback
      }
    }
    return { success: true, user: DEMO_USERS[1] };
  },

  // Dashboard
  getDashboardSummary: () => {
    initSeedDataIfMissing();
    const inventory = getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const surplus = getStored<SurplusListing[]>(STORAGE_KEYS.SURPLUS_LISTINGS, []);
    const donations = getStored<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    const alerts = getStored<Alert[]>(STORAGE_KEYS.ALERTS, []).filter(a => !a.isResolved);

    const todayPreparedKg = 1240;
    const predictedSurplusKg = surplus.reduce((sum, s) => sum + (s.availableQuantity || 0), 0) || 86;
    const foodRescuedKg = donations.filter(d => ['ACCEPTED', 'DELIVERED', 'RECEIVED'].includes(d.status)).reduce((sum, d) => sum + d.quantity, 0) + 64;
    const wastePreventedKg = Math.round(foodRescuedKg * 0.85);
    const estimatedCostSavedInr = foodRescuedKg * 120;
    const mealsRedistributed = Math.round(foodRescuedKg * 2.5);

    const recommendations: AIRecommendation[] = [
      {
        id: 'rec-01',
        type: 'FORECAST',
        severity: 'INFO',
        title: 'Tomorrow Demand Adjustment',
        message: "Tomorrow's predicted demand for Vegetable Biryani is 8% higher than the 7-day average.",
        reason: 'Holiday pattern + Institutional shift enrollment',
        dataUsed: 'Historical 14-day moving average (310 kg baseline)',
        recommendedAction: 'Increase planned batch prep by 25 kg to avoid afternoon shortfall',
        targetRoute: '/forecast',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rec-02',
        type: 'SURPLUS',
        severity: 'WARNING',
        title: 'Redistribution Deadline Feasibility',
        message: '18 kg of Whole Wheat Chapati is approaching its 2-hour redistribution deadline.',
        reason: 'Perishability threshold in warm ambient conditions',
        dataUsed: 'Batch prep timestamp: 4 hours ago, current core temp 52°C',
        recommendedAction: 'Dispatch immediate pickup to Hope Community Kitchen (1.8 km away)',
        targetRoute: '/redistribution',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rec-03',
        type: 'REDISTRIBUTION',
        severity: 'INFO',
        title: 'NGO Capacity Match',
        message: 'Three NGOs currently have verified beneficiary capacity matching today’s available surplus.',
        reason: 'Aggregated demand quota: 680 meals vs 86 kg available surplus',
        dataUsed: 'Live NGO geo-location & daily quota registry',
        recommendedAction: 'Open Redistribution page to broadcast donation offers',
        targetRoute: '/redistribution',
        createdAt: new Date().toISOString()
      }
    ];

    return {
      success: true,
      data: {
        kpis: {
          todayPreparedKg,
          predictedSurplusKg,
          foodRescuedKg,
          wastePreventedKg,
          estimatedCostSavedInr,
          mealsRedistributed
        },
        charts: {
          prodVsConsTrend: [
            { day: 'Mon', prepared: 1100, consumed: 980, surplus: 120 },
            { day: 'Tue', prepared: 1250, consumed: 1140, surplus: 110 },
            { day: 'Wed', prepared: 1300, consumed: 1220, surplus: 80 },
            { day: 'Thu', prepared: 1180, consumed: 1110, surplus: 70 },
            { day: 'Fri', prepared: 1400, consumed: 1290, surplus: 110 },
            { day: 'Sat', prepared: 950, consumed: 890, surplus: 60 },
            { day: 'Sun (Today)', prepared: 1240, consumed: 1154, surplus: 86 }
          ],
          categoryBreakdown: [
            { category: 'Cooked Meals', quantity: 48 },
            { category: 'Breads & Rotis', quantity: 22 },
            { category: 'Breakfast Items', quantity: 16 }
          ],
          statusDonut: [
            { name: 'Redistributed', value: foodRescuedKg, color: '#10b981' },
            { name: 'Committed / Transit', value: 24, color: '#3b82f6' },
            { name: 'Available Surplus', value: predictedSurplusKg, color: '#f59e0b' }
          ]
        },
        alerts,
        recommendations
      }
    };
  },

  // Forecast
  getForecastItems: () => {
    return {
      success: true,
      items: DEMO_FOOD_ITEMS
    };
  },

  generateForecast: (foodItemId: string, horizonDays: number = 3) => {
    const item = DEMO_FOOD_ITEMS.find(f => f.id === foodItemId) || DEMO_FOOD_ITEMS[0];
    const baseDemand = 320;
    const randomVariation = Math.floor(Math.random() * 25) - 10;
    const predicted = baseDemand + randomVariation;
    const lower = Math.round(predicted * 0.93);
    const upper = Math.round(predicted * 1.07);
    const recommended = Math.round(predicted * 1.04);
    const expectedSurplus = recommended - predicted;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const horizonForecasts = [];

    for (let i = 1; i <= horizonDays; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dayName = days[d.getDay()];
      const dayPred = Math.round(baseDemand + (Math.sin(i) * 30));
      horizonForecasts.push({
        date: d.toISOString().split('T')[0],
        dayOfWeek: dayName,
        predictedDemand: dayPred,
        lowerBound: Math.round(dayPred * 0.92),
        upperBound: Math.round(dayPred * 1.08),
        recommendedProduction: Math.round(dayPred * 1.05),
        expectedSurplus: Math.round(dayPred * 0.05)
      });
    }

    const forecastData: DemandForecastData = {
      foodItemId: item.id,
      foodItemName: item.name,
      historicalAverage: baseDemand,
      predictedDemand: predicted,
      lowerBound: lower,
      upperBound: upper,
      recommendedProduction: recommended,
      expectedSurplus,
      surplusProbability: 24,
      confidenceScore: 89,
      modelName: 'Holt-Winters Exponential Smoothing (α=0.35, β=0.15) with Seasonality Adapter',
      featuresUsed: [
        'Historical 30-Day Consumption Log',
        'Day-of-Week Seasonality Coefficient',
        'Institutional Shift Headcount Roster',
        'Rolling 7-Day Exponential Moving Average',
        'Weather & Ambient Humidity Factor'
      ],
      horizonDays,
      horizonForecasts
    };

    const historicalPoints = [
      { day: 'Day -4', quantity: baseDemand - 15 },
      { day: 'Day -3', quantity: baseDemand + 20 },
      { day: 'Day -2', quantity: baseDemand - 5 },
      { day: 'Day -1', quantity: baseDemand + 12 },
      { day: 'Today', quantity: baseDemand }
    ];

    return {
      success: true,
      forecast: forecastData,
      historicalPoints
    };
  },

  // Inventory
  getInventory: (params?: any) => {
    initSeedDataIfMissing();
    let list = getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);

    if (params?.search) {
      const q = String(params.search).toLowerCase();
      list = list.filter(i =>
        i.batchNumber.toLowerCase().includes(q) ||
        i.foodItem.name.toLowerCase().includes(q) ||
        i.storageLocation.toLowerCase().includes(q)
      );
    }
    if (params?.status) {
      list = list.filter(i => i.status === params.status);
    }
    if (params?.riskLevel) {
      list = list.filter(i => i.riskLevel === params.riskLevel);
    }

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 8;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return {
      success: true,
      data: paginated,
      pagination: {
        total: list.length,
        page,
        limit,
        totalPages: Math.ceil(list.length / limit) || 1
      }
    };
  },

  createInventory: (body: any) => {
    initSeedDataIfMissing();
    const list = getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const foodItem = DEMO_FOOD_ITEMS.find(f => f.id === body.foodItemId) || DEMO_FOOD_ITEMS[0];
    const expiryHours = Number(body.expiryHours) || foodItem.defaultShelfLifeHours || 6;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      kitchenId: 'org-apex-01',
      foodItemId: foodItem.id,
      foodItem,
      batchNumber: body.batchNumber || `BCH-${Date.now().toString().slice(-6)}`,
      quantity: Number(body.quantity) || 20,
      unit: body.unit || foodItem.standardUnit || 'kg',
      supplier: body.supplier || 'Central Kitchen Prep Line',
      storageLocation: body.storageLocation || 'Hot Holding Station 01',
      temperature: Number(body.temperature) || 64.0,
      humidity: Number(body.humidity) || 50,
      expiryDate: new Date(Date.now() + expiryHours * 3600000).toISOString(),
      status: 'SAFE',
      riskLevel: 'LOW',
      createdAt: new Date().toISOString()
    };

    list.unshift(newItem);
    saveStored(STORAGE_KEYS.INVENTORY, list);

    return {
      success: true,
      item: newItem,
      message: 'Inventory batch recorded successfully'
    };
  },

  updateInventory: (id: string, body: any) => {
    const list = getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...body };
      saveStored(STORAGE_KEYS.INVENTORY, list);
      return { success: true, item: list[idx] };
    }
    return { success: false, error: 'Item not found' };
  },

  deleteInventory: (id: string) => {
    const list = getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
    const filtered = list.filter(i => i.id !== id);
    saveStored(STORAGE_KEYS.INVENTORY, filtered);
    return { success: true, message: 'Batch removed' };
  },

  // Surplus
  getSurplus: () => {
    initSeedDataIfMissing();
    const listings = getStored<SurplusListing[]>(STORAGE_KEYS.SURPLUS_LISTINGS, []);
    const inventory = getStored<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);

    const predictions: SurplusPrediction[] = inventory.map((inv, idx) => {
      const produced = Math.round(inv.quantity * 1.8);
      const consumed = Math.round(produced - inv.quantity);
      return {
        id: `pred-${inv.id}`,
        foodItemId: inv.foodItemId,
        foodItem: inv.foodItem,
        date: new Date().toISOString().split('T')[0],
        producedQuantity: produced,
        consumedQuantity: consumed,
        predictedSurplus: inv.quantity,
        remainingShelfHours: 4 + (idx % 3),
        qualityRisk: inv.riskLevel,
        priority: inv.riskLevel === 'HIGH' ? 'HIGH' : (inv.quantity > 30 ? 'HIGH' : 'MEDIUM'),
        priorityScore: 75 + (idx * 5) % 25,
        recommendedAction: 'List for immediate NGO redistribution before temperature drop',
        status: inv.status
      };
    });

    return {
      success: true,
      predictions,
      listings,
      foodItems: DEMO_FOOD_ITEMS
    };
  },

  createSurplusListing: (body: any) => {
    initSeedDataIfMissing();
    const listings = getStored<SurplusListing[]>(STORAGE_KEYS.SURPLUS_LISTINGS, []);
    const foodItem = DEMO_FOOD_ITEMS.find(f => f.id === body.foodItemId) || DEMO_FOOD_ITEMS[0];
    const shelfHours = Number(body.shelfLifeHours) || 5;

    const newListing: SurplusListing = {
      id: `list-${Date.now()}`,
      kitchenId: 'org-apex-01',
      kitchen: {
        name: 'Apex Central Kitchen',
        organization: { name: 'Apex Catering Hub', latitude: 28.5355, longitude: 77.241 }
      },
      foodItemId: foodItem.id,
      foodItem,
      quantity: Number(body.quantity) || 30,
      availableQuantity: Number(body.quantity) || 30,
      unit: body.unit || foodItem.standardUnit || 'kg',
      preparedAt: new Date(Date.now() - 3600000).toISOString(),
      shelfLifeHours: shelfHours,
      pickupDeadline: new Date(Date.now() + shelfHours * 3600000).toISOString(),
      qualityStatus: 'EXCELLENT',
      storageCondition: body.storageCondition || 'Hot insulated container (>60°C)',
      dietaryCategory: body.dietaryCategory || 'VEG',
      status: 'AVAILABLE',
      priority: 'HIGH',
      createdAt: new Date().toISOString()
    };

    listings.unshift(newListing);
    saveStored(STORAGE_KEYS.SURPLUS_LISTINGS, listings);

    return {
      success: true,
      listing: newListing,
      message: 'Surplus food listed for redistribution successfully'
    };
  },

  matchSurplusNgos: (listingId: string) => {
    const matches: MatchScoreResult[] = DEMO_NGOS.map((ngo, idx) => {
      const dist = 1.8 + idx * 1.5;
      const score = Math.max(70, Math.round(98 - dist * 4));
      return {
        ngoId: ngo.id,
        ngoName: ngo.name,
        distanceKm: Number(dist.toFixed(1)),
        platformMatchScore: score,
        factorBreakdown: {
          distanceScore: Math.round(100 - dist * 5),
          categoryMatch: true,
          dietaryMatch: true,
          capacityFitScore: Math.min(100, Math.round((ngo.dailyMealCapacity / 300) * 100)),
          deadlineFit: true
        },
        explanationText: `Proximity: ${dist.toFixed(1)} km | Direct Dietary Fit | Verified Capacity: ${ngo.dailyMealCapacity} portions | Cold Storage Enabled`,
        recommendedPickupWindow: 'Within 90 mins (Before 2:30 PM)'
      };
    });

    matches.sort((a, b) => b.platformMatchScore - a.platformMatchScore);

    return {
      success: true,
      matches
    };
  },

  // Donations & Redistribution
  createDonation: (body: any) => {
    initSeedDataIfMissing();
    const donations = getStored<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    const listings = getStored<SurplusListing[]>(STORAGE_KEYS.SURPLUS_LISTINGS, []);
    const pickups = getStored<Pickup[]>(STORAGE_KEYS.PICKUPS, []);

    const listing = listings.find(l => l.id === body.surplusListingId);
    const ngo = DEMO_NGOS.find(n => n.id === body.ngoId) || DEMO_NGOS[0];
    const qty = Number(body.quantity) || listing?.availableQuantity || 20;

    if (listing) {
      listing.availableQuantity = Math.max(0, listing.availableQuantity - qty);
      if (listing.availableQuantity === 0) {
        listing.status = 'MATCHED';
      }
      saveStored(STORAGE_KEYS.SURPLUS_LISTINGS, listings);
    }

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      surplusListingId: body.surplusListingId,
      surplusListing: listing || (listings[0] as any),
      ngoId: ngo.id,
      ngo,
      quantity: qty,
      unit: 'kg',
      matchScore: 92,
      matchReasoning: 'Top Proximity Match & Adequate Beneficiary Capacity',
      status: 'OFFERED',
      createdAt: new Date().toISOString()
    };

    donations.unshift(newDonation);
    saveStored(STORAGE_KEYS.DONATIONS, donations);

    // Auto-create Pickup draft
    const newPickup: Pickup = {
      id: `pck-${Date.now()}`,
      donationId: newDonation.id,
      donation: newDonation,
      driverId: 'drv-01',
      driver: DEMO_DRIVERS[0],
      pickupAddress: 'Apex Central Kitchen Hub, Okhla Phase III, New Delhi',
      pickupLat: 28.5355,
      pickupLng: 77.2612,
      destinationAddress: `${ngo.name}, New Delhi`,
      destLat: ngo.latitude,
      destLng: ngo.longitude,
      estimatedDistance: 2.5,
      estimatedMinutes: 16,
      deadline: new Date(Date.now() + 3 * 3600000).toISOString(),
      status: 'PENDING'
    };
    pickups.unshift(newPickup);
    saveStored(STORAGE_KEYS.PICKUPS, pickups);

    return {
      success: true,
      donation: newDonation,
      message: 'Donation offer broadcasted to NGO successfully'
    };
  },

  getDonations: () => {
    initSeedDataIfMissing();
    const donations = getStored<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    return {
      success: true,
      donations
    };
  },

  updateDonationStatus: (donationId: string, status: string, notes?: string) => {
    const donations = getStored<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    const pickups = getStored<Pickup[]>(STORAGE_KEYS.PICKUPS, []);
    const idx = donations.findIndex(d => d.id === donationId);

    if (idx !== -1) {
      donations[idx].status = status as any;
      if (notes) donations[idx].requestedChanges = notes;
      saveStored(STORAGE_KEYS.DONATIONS, donations);

      // Also sync associated pickup
      const pIdx = pickups.findIndex(p => p.donationId === donationId);
      if (pIdx !== -1) {
        if (status === 'ACCEPTED') pickups[pIdx].status = 'ASSIGNED';
        if (status === 'PICKED_UP') pickups[pIdx].status = 'PICKED_UP';
        if (status === 'DELIVERED' || status === 'RECEIVED') pickups[pIdx].status = 'DELIVERED';
        saveStored(STORAGE_KEYS.PICKUPS, pickups);
      }

      return { success: true, donation: donations[idx] };
    }

    return { success: false, error: 'Donation not found' };
  },

  // Logistics & Routing
  getLogisticsOverview: () => {
    initSeedDataIfMissing();
    const pickups = getStored<Pickup[]>(STORAGE_KEYS.PICKUPS, []);
    const activeRoutes = [
      {
        id: 'route-active-01',
        driverName: 'Harpreet Singh',
        vehicleReg: 'DL-01-AB-4021',
        totalDistanceKm: 7.8,
        totalTimeMinutes: 38,
        stopsCount: 3,
        stops: [
          { name: 'Apex Central Kitchen (Pickup)', type: 'PICKUP', lat: 28.5355, lng: 77.2612 },
          { name: 'Hope Community Shelter (Delivery)', type: 'DELIVERY', lat: 28.5355, lng: 77.251 },
          { name: 'Annapurna Center (Delivery)', type: 'DELIVERY', lat: 28.5492, lng: 77.2694 }
        ]
      }
    ];

    return {
      success: true,
      pickups,
      vehicles: DEMO_VEHICLES,
      drivers: DEMO_DRIVERS,
      activeRoutes
    };
  },

  optimizeRoutes: () => {
    const pickups = getStored<Pickup[]>(STORAGE_KEYS.PICKUPS, []);
    const plan = {
      totalDistanceKm: 9.4,
      totalTimeMinutes: 42,
      vehicleCapacityUtilization: 78,
      co2AvoidanceKg: 28.5,
      algorithm: 'Nearest-Neighbor TSP with Capacity & Temperature Constraints'
    };

    const route = {
      id: `rt-${Date.now()}`,
      driverName: 'Harpreet Singh',
      vehicleReg: 'DL-01-AB-4021',
      totalDistanceKm: 9.4,
      totalTimeMinutes: 42,
      stopsCount: pickups.length + 1,
      stops: [
        { name: 'Apex Central Kitchen (Origin)', type: 'PICKUP', lat: 28.5355, lng: 77.2612 },
        ...pickups.map(p => ({
          name: p.destinationAddress,
          type: 'DELIVERY',
          lat: p.destLat || 28.5412,
          lng: p.destLng || 77.251
        }))
      ]
    };

    return {
      success: true,
      plan,
      route,
      message: 'Logistics route optimized successfully'
    };
  },

  updatePickupStatus: (pickupId: string, body: any) => {
    const pickups = getStored<Pickup[]>(STORAGE_KEYS.PICKUPS, []);
    const donations = getStored<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    const idx = pickups.findIndex(p => p.id === pickupId);

    if (idx !== -1) {
      pickups[idx].status = body.status;
      if (body.status === 'DELIVERED') {
        pickups[idx].delivery = {
          deliveredAt: new Date().toISOString(),
          receivedBy: body.receivedBy || 'Staff on duty',
          signatureToken: body.signatureToken || `SIG-${Date.now().toString().slice(-8)}`,
          notes: body.notes || 'Temperature and packaging verified at handover'
        };
      }
      saveStored(STORAGE_KEYS.PICKUPS, pickups);

      // sync donation status
      const donIdx = donations.findIndex(d => d.id === pickups[idx].donationId);
      if (donIdx !== -1) {
        if (body.status === 'PICKED_UP') donations[donIdx].status = 'PICKED_UP';
        if (body.status === 'DELIVERED') donations[donIdx].status = 'DELIVERED';
        saveStored(STORAGE_KEYS.DONATIONS, donations);
      }

      return { success: true, pickup: pickups[idx] };
    }

    return { success: false, error: 'Pickup not found' };
  },

  // IoT Quality Inspection
  getQualityInspections: () => {
    initSeedDataIfMissing();
    const inspections = getStored<QualityInspection[]>(STORAGE_KEYS.INSPECTIONS, []);
    return {
      success: true,
      inspections
    };
  },

  analyzeQuality: (body: any) => {
    initSeedDataIfMissing();
    const inspections = getStored<QualityInspection[]>(STORAGE_KEYS.INSPECTIONS, []);
    const foodItem = DEMO_FOOD_ITEMS.find(f => f.id === body.foodItemId) || DEMO_FOOD_ITEMS[0];

    const temp = Number(body.coreTemperature) || 65.0;
    const gas = Number(body.vocGasPpm) || 8.0;
    const ph = Number(body.phLevel) || 6.4;
    const aw = Number(body.moistureAw) || 0.88;

    // Multi-factor biochemical calculation
    let score = 95;
    let tempStatus: 'SAFE_HOT' | 'SAFE_COLD' | 'DANGER_ZONE' | 'CRITICAL_ABUSE' = 'SAFE_HOT';
    let gasStatus: 'OPTIMAL' | 'MODERATE' | 'ELEVATED' | 'HAZARDOUS' = 'OPTIMAL';
    let acidityStatus: 'NORMAL' | 'SLIGHT_ACIDIFICATION' | 'FERMENTED_SOUR' = 'NORMAL';

    // Temperature check (Danger zone: 5°C to 60°C)
    if (temp > 60) {
      tempStatus = 'SAFE_HOT';
    } else if (temp <= 5) {
      tempStatus = 'SAFE_COLD';
    } else {
      tempStatus = 'DANGER_ZONE';
      score -= 35;
    }

    // VOC gas check (>20 is elevated, >45 is spoiled)
    if (gas > 45) {
      gasStatus = 'HAZARDOUS';
      score -= 40;
    } else if (gas > 20) {
      gasStatus = 'ELEVATED';
      score -= 20;
    }

    // pH acidity check (souring if pH < 5.2 in non-acidic foods)
    if (ph < 5.0) {
      acidityStatus = 'FERMENTED_SOUR';
      score -= 30;
    } else if (ph < 5.8) {
      acidityStatus = 'SLIGHT_ACIDIFICATION';
      score -= 10;
    }

    score = Math.max(10, Math.min(99, score));

    let freshness: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'SPOILED' = 'EXCELLENT';
    let spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (score < 40) {
      freshness = 'SPOILED';
      spoilageRisk = 'HIGH';
    } else if (score < 65) {
      freshness = 'FAIR';
      spoilageRisk = 'MEDIUM';
    } else if (score < 85) {
      freshness = 'GOOD';
      spoilageRisk = 'LOW';
    }

    const inspection: QualityInspection = {
      id: `insp-${Date.now()}`,
      foodItemId: foodItem.id,
      foodItem,
      probeId: body.probeId || 'BENCH-LAB-900',
      coreTemperature: temp,
      vocGasPpm: gas,
      phLevel: ph,
      moistureAw: aw,
      qualityScore: score,
      freshnessCategory: freshness,
      spoilageRisk,
      visualIssues: `IoT Multi-Probe Diagnostics: Core Temp ${temp}°C (${tempStatus}), Headspace VOC ${gas} ppm (${gasStatus}), Matrix pH ${ph} (${acidityStatus}).`,
      recommendedAction:
        score >= 70
          ? 'Safe for redistribution within recommended operational time window.'
          : 'High spoilage risk. Quarantined. Not recommended for human redistribution.',
      reviewerStatus: score >= 70 ? 'APPROVED' : 'REJECTED',
      inspectorNotes: 'Evaluated via SmartFood AI Multi-Probe IoT Station.',
      disclaimer: 'AI IoT visual & bio-chemical sensor assessment. Does not replace accredited food laboratory test certificate.',
      createdAt: new Date().toISOString(),
      sensorFindings: {
        temperatureStatus: tempStatus,
        temperatureRemark: temp > 60 ? 'Safe hot holding (>60°C)' : (temp <= 5 ? 'Safe chilled cold-chain' : 'Thermal abuse / danger zone detected'),
        gasQualityStatus: gasStatus,
        gasRemark: gas < 15 ? 'TVB-N volatiles within fresh baseline' : 'Volatile decomposition markers detected',
        acidityStatus: acidityStatus,
        acidityRemark: ph >= 6.0 ? 'Normal neutrality profile' : 'Microbial acidification / souring detected',
        moistureStatus: aw > 0.92 ? 'High water activity' : 'Moisture balance nominal'
      }
    };

    inspections.unshift(inspection);
    saveStored(STORAGE_KEYS.INSPECTIONS, inspections);

    return {
      success: true,
      inspection,
      message: 'Multi-sensor biochemical assessment completed'
    };
  },

  reviewQualityInspection: (id: string, body: any) => {
    const inspections = getStored<QualityInspection[]>(STORAGE_KEYS.INSPECTIONS, []);
    const idx = inspections.findIndex(i => i.id === id);
    if (idx !== -1) {
      inspections[idx].reviewerStatus = body.status;
      if (body.notes) inspections[idx].inspectorNotes = body.notes;
      saveStored(STORAGE_KEYS.INSPECTIONS, inspections);
      return { success: true, inspection: inspections[idx] };
    }
    return { success: false, error: 'Inspection record not found' };
  },

  // Sensors & Cold Chain
  getSensors: () => {
    return {
      success: true,
      sensors: DEMO_SENSORS
    };
  },

  simulateSensorReading: (body: any) => {
    const sensor = DEMO_SENSORS.find(s => s.id === body.sensorId) || DEMO_SENSORS[0];
    const isAnomaly = body.forceAnomaly || Math.random() < 0.2;
    const temp = isAnomaly ? sensor.maxThreshold + 4.5 : (sensor.minThreshold + sensor.maxThreshold) / 2;

    const reading = {
      id: `r-${Date.now()}`,
      temperature: Number(temp.toFixed(1)),
      humidity: 55,
      gasQuality: isAnomaly ? 35 : 12,
      isAnomaly,
      timestamp: new Date().toISOString()
    };

    sensor.readings.unshift(reading);
    sensor.lastReadingAt = reading.timestamp;

    if (isAnomaly) {
      const alerts = getStored<Alert[]>(STORAGE_KEYS.ALERTS, []);
      alerts.unshift({
        id: `alt-${Date.now()}`,
        type: 'TEMPERATURE',
        severity: 'CRITICAL',
        title: `Critical Excursion: ${sensor.name}`,
        message: `Temperature reached ${reading.temperature}°C (Threshold: ${sensor.minThreshold}°C - ${sensor.maxThreshold}°C)`,
        targetRoute: '/monitoring',
        isResolved: false,
        createdAt: new Date().toISOString()
      });
      saveStored(STORAGE_KEYS.ALERTS, alerts);
    }

    return {
      success: true,
      reading,
      message: isAnomaly ? 'Warning: Sensor excursion anomaly generated!' : 'Sensor telemetry reading logged successfully'
    };
  },

  // Waste & Sustainability Analytics
  getWasteAnalytics: () => {
    return {
      success: true,
      data: {
        totalWasteKg: 142,
        preventableWasteKg: 92,
        unavoidableWasteKg: 50,
        preventablePercentage: 65,
        wasteByReason: [
          { reason: 'Overproduction', quantity: 45, percentage: 32 },
          { reason: 'Spoilage & Expiry', quantity: 28, percentage: 20 },
          { reason: 'Preparation Trimming', quantity: 38, percentage: 27 },
          { reason: 'Plate Waste', quantity: 21, percentage: 15 },
          { reason: 'Storage Excursion', quantity: 10, percentage: 6 }
        ],
        wasteByCategory: [
          { category: 'Cooked Meals', quantity: 64 },
          { category: 'Vegetables & Prep', quantity: 42 },
          { category: 'Breads & Grains', quantity: 24 },
          { category: 'Dairy & Sauces', quantity: 12 }
        ],
        beforeVsAfter: [
          { period: 'Historical Baseline (Pre-AI)', wasteKg: 340, rescueKg: 40, costLostInr: 40800 },
          { period: 'Current Period (SmartFood AI)', wasteKg: 142, rescueKg: 198, costLostInr: 17040 }
        ]
      }
    };
  },

  getSustainabilityAnalytics: () => {
    initSeedDataIfMissing();
    const factors = getStored(STORAGE_KEYS.FACTORS, {
      co2FactorPerKg: 2.5,
      waterFactorPerKg: 450.0,
      costPerKgInr: 120.0,
      mealConversionKg: 2.5,
      methodologyNote: 'Calculated using MoFPI Food Loss and Waste (FLW) conversion standards and FAO GHG avoidance methodologies.'
    });

    const donations = getStored<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    const rescuedKg = donations.reduce((sum, d) => sum + d.quantity, 0) + 120;
    const co2AvoidedKg = Math.round(rescuedKg * factors.co2FactorPerKg);
    const waterSavedLiters = Math.round(rescuedKg * factors.waterFactorPerKg);
    const costSavedInr = Math.round(rescuedKg * factors.costPerKgInr);
    const mealsEnabled = Math.round(rescuedKg * factors.mealConversionKg);

    return {
      success: true,
      data: {
        summary: {
          foodRescuedKg: rescuedKg,
          mealsEnabled,
          co2AvoidedKg,
          waterSavedLiters,
          costSavedInr
        },
        factors,
        trends: [
          { month: 'May', co2: 240, water: 43200, meals: 240 },
          { month: 'Jun', co2: 380, water: 68400, meals: 380 },
          { month: 'Jul', co2: 520, water: 93600, meals: 520 },
          { month: 'Aug', co2: 690, water: 124200, meals: 690 },
          { month: 'Sep (Current)', co2: co2AvoidedKg, water: waterSavedLiters, meals: mealsEnabled }
        ]
      }
    };
  },

  updateSustainabilityFactors: (factors: any) => {
    saveStored(STORAGE_KEYS.FACTORS, factors);
    return {
      success: true,
      factors,
      message: 'Sustainability conversion factors updated successfully'
    };
  },

  // ESG Reports
  generateEsgReport: (period: string) => {
    const report = {
      id: `rep-${Date.now()}`,
      period,
      generatedAt: new Date().toISOString(),
      institutionName: 'Apex Central Catering & Food Services',
      executiveSummary: `During the ${period.toLowerCase()} period, SmartFood AI diverted an estimated 198 kg of edible surplus from landfills, avoiding 495 kg CO2e in Scope 3 emissions and enabling 495 nutritious meals to verified community kitchens.`,
      metrics: {
        foodRescuedKg: 198,
        mealsRedistributed: 495,
        landfillDiversionRate: '72.4%',
        co2AvoidanceKg: 495,
        waterResourceSavedLiters: 89100,
        financialValueSavedInr: 23760
      },
      complianceStandards: ['FSSAI Food Safety & Standards Guidelines', 'MoFPI Smart Food Redirection Framework', 'ISO 14064-1 Scope 3 Accounting'],
      recommendations: [
        'Maintain morning exponential smoothing buffers to avoid second-shift rice overproduction.',
        'Install secondary cold-chain monitoring probe on Chilled Van DL-01-AB-4021.'
      ]
    };
    return {
      success: true,
      report
    };
  },

  // Processing Units
  getProcessingOverview: () => {
    return {
      success: true,
      data: {
        kpis: {
          rawMaterialEfficiency: '92.4%',
          productionEfficiency: '89.1%',
          wastePercentage: '7.6%',
          totalDowntimeMinutes: 85,
          energyIntensityKwhPerTon: 142
        },
        batches: [
          { id: 'bch-p-401', product: 'Clarified Tomato Puree 28 Brix', rawMaterial: 'Roma Tomatoes Grade A', inputKg: 1200, outputKg: 980, wasteKg: 85, efficiency: '91.8%', status: 'COMPLETED' },
          { id: 'bch-p-402', product: 'Aseptic Mango Pulp 14 Brix', rawMaterial: 'Totapuri Mangoes', inputKg: 2000, outputKg: 1650, wasteKg: 140, efficiency: '89.5%', status: 'RUNNING' },
          { id: 'bch-p-403', product: 'Frozen Mixed Vegetables IQF', rawMaterial: 'Carrot, Peas, Beans Mix', inputKg: 800, outputKg: 740, wasteKg: 42, efficiency: '94.2%', status: 'SCHEDULED' }
        ],
        machines: [
          { id: 'm-01', name: 'Industrial Retort Autoclave Unit 1', status: 'RUNNING', runtimeHours: 142, downtimeMinutes: 20, lastMaintenance: '2026-09-15' },
          { id: 'm-02', name: 'High-Shear Puree Pasteurizer 02', status: 'RUNNING', runtimeHours: 98, downtimeMinutes: 45, lastMaintenance: '2026-09-12' },
          { id: 'm-03', name: 'Rotary Vacuum Seamer Line 4', status: 'MAINTENANCE', runtimeHours: 210, downtimeMinutes: 120, lastMaintenance: '2026-09-02' }
        ],
        energy: [
          { time: '06:00', kwh: 110 },
          { time: '09:00', kwh: 185 },
          { time: '12:00', kwh: 240 },
          { time: '15:00', kwh: 195 },
          { time: '18:00', kwh: 130 }
        ]
      }
    };
  },

  recordMachineDowntime: (machineId: string, body: any) => {
    return {
      success: true,
      message: `Machine downtime of ${body.durationMinutes || 45} mins logged for ${machineId}`
    };
  },

  // Alerts
  getAlerts: (params?: any) => {
    initSeedDataIfMissing();
    let list = getStored<Alert[]>(STORAGE_KEYS.ALERTS, []);

    if (params?.type) {
      list = list.filter(a => a.type === params.type);
    }
    if (params?.severity) {
      list = list.filter(a => a.severity === params.severity);
    }
    if (params?.search) {
      const q = String(params.search).toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q));
    }

    return {
      success: true,
      alerts: list
    };
  },

  resolveAlert: (alertId: string) => {
    const alerts = getStored<Alert[]>(STORAGE_KEYS.ALERTS, []);
    const idx = alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      alerts[idx].isResolved = true;
      saveStored(STORAGE_KEYS.ALERTS, alerts);
      return { success: true, alert: alerts[idx] };
    }
    return { success: false, error: 'Alert not found' };
  },

  // Admin
  getAdminUsers: () => {
    return { success: true, users: DEMO_USERS };
  },

  getAdminOrganizations: () => {
    return {
      success: true,
      organizations: [
        { id: 'org-mofpi-00', name: 'Ministry of Food Processing Industries (MoFPI)', type: 'GOVERNMENT', city: 'New Delhi', state: 'Delhi', verified: true },
        { id: 'org-apex-01', name: 'Apex Institutional Catering Hub', type: 'INSTITUTIONAL_KITCHEN', city: 'New Delhi', state: 'Delhi', verified: true },
        { id: 'org-agri-02', name: 'AgriFresh Agro-Processing Unit #4', type: 'PROCESSING_UNIT', city: 'Noida', state: 'Uttar Pradesh', verified: true },
        { id: 'org-hope-03', name: 'Hope Community Kitchen & Shelter', type: 'NGO', city: 'New Delhi', state: 'Delhi', verified: true },
        { id: 'org-fleet-04', name: 'GreenPath Cold-Chain Logistics', type: 'LOGISTICS_PARTNER', city: 'Gurugram', state: 'Haryana', verified: true }
      ]
    };
  },

  getAdminAudit: () => {
    return {
      success: true,
      logs: [
        { id: 'aud-01', user: 'Chef Rajesh Nair', role: 'KITCHEN_MANAGER', action: 'Created Surplus Listing', entity: 'SurplusListing (35 kg)', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 'aud-02', user: 'Sister Teresa', role: 'NGO_COORDINATOR', action: 'Accepted Donation Match', entity: 'Donation #don-01 (18 kg)', timestamp: new Date(Date.now() - 2400000).toISOString() },
        { id: 'aud-03', user: 'Vikramjit Singh', role: 'LOGISTICS_OPERATOR', action: 'Route Optimized', entity: 'Vehicle DL-01-AB-4021', timestamp: new Date(Date.now() - 1200000).toISOString() },
        { id: 'aud-04', user: 'System Telemetry Daemon', role: 'SYSTEM', action: 'Temperature Excursion Logged', entity: 'Sensor SENS-CS-01', timestamp: new Date().toISOString() }
      ]
    };
  },

  getAdminHealth: () => {
    return {
      success: true,
      health: {
        status: 'HEALTHY',
        mode: 'LOCAL_DATA_STANDALONE',
        uptimeSeconds: 86400,
        activeSensors: 4,
        sqliteDb: 'Synced (LocalStorage Virtual Store)',
        forecastEngine: 'Holt-Winters Active',
        version: '1.2.0'
      }
    };
  },

  getNgoSummary: () => {
    initSeedDataIfMissing();
    const donations = getStored<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    const receivedDonations = donations.filter(d => ['DELIVERED', 'RECEIVED'].includes(d.status));
    const totalKg = receivedDonations.reduce((sum, d) => sum + d.quantity, 0) + 140;

    return {
      success: true,
      data: {
        metrics: {
          availableSurplusCount: 3,
          acceptedOffersCount: donations.filter(d => d.status === 'ACCEPTED').length,
          receivedMealsCount: Math.round(totalKg * 2.5),
          totalFoodRescuedKg: totalKg,
          beneficiaryCapacity: 400
        }
      }
    };
  }
};
