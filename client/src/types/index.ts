export type UserRole =
  | 'ADMIN'
  | 'KITCHEN_MANAGER'
  | 'PROCESSING_MANAGER'
  | 'NGO_COORDINATOR'
  | 'LOGISTICS_OPERATOR';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  organizationId: string;
  organizationName?: string;
  organizationType?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  code: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  contactEmail: string;
  contactPhone: string;
  verified: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  standardUnit: string;
  defaultShelfLifeHours: number;
  optimumTempMin: number;
  optimumTempMax: number;
  costPerUnit: number;
  co2FactorKg: number;
  waterFactorLiter: number;
  mealFactor: number;
}

export interface InventoryItem {
  id: string;
  kitchenId: string;
  foodItemId: string;
  foodItem: FoodItem;
  batchId?: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  supplier?: string;
  storageLocation: string;
  temperature?: number;
  humidity?: number;
  expiryDate: string;
  status: 'SAFE' | 'MONITOR' | 'NEAR_EXPIRY' | 'CRITICAL' | 'EXPIRED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}

export interface DemandForecastData {
  foodItemId: string;
  foodItemName: string;
  historicalAverage: number;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  recommendedProduction: number;
  expectedSurplus: number;
  surplusProbability: number;
  confidenceScore: number;
  modelName: string;
  featuresUsed: string[];
  horizonDays: number;
  horizonForecasts: Array<{
    date: string;
    dayOfWeek: string;
    predictedDemand: number;
    lowerBound: number;
    upperBound: number;
    recommendedProduction: number;
    expectedSurplus: number;
  }>;
}

export interface SurplusListing {
  id: string;
  kitchenId: string;
  kitchen?: { name: string; organization?: { name: string; latitude: number; longitude: number } };
  foodItemId: string;
  foodItem: FoodItem;
  quantity: number;
  availableQuantity: number;
  unit: string;
  preparedAt: string;
  shelfLifeHours: number;
  pickupDeadline: string;
  qualityStatus: string;
  storageCondition: string;
  dietaryCategory: string;
  status: 'AVAILABLE' | 'MATCHED' | 'COMMITTED' | 'EXPIRED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  donations?: Donation[];
}

export interface SurplusPrediction {
  id: string;
  foodItemId: string;
  foodItem: FoodItem;
  date: string;
  producedQuantity: number;
  consumedQuantity: number;
  predictedSurplus: number;
  remainingShelfHours: number;
  qualityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore: number;
  recommendedAction?: string;
  status: string;
}

export interface NGO {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  beneficiaryCount: number;
  dailyMealCapacity: number;
  acceptsVegOnly: boolean;
  hasColdStorage: boolean;
  hasLogistics: boolean;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactPhone: string;
  requirements?: Array<{
    foodCategory: string;
    preferredItems: string;
    dailyQuotaKg: number;
  }>;
}

export interface MatchScoreResult {
  ngoId: string;
  ngoName: string;
  distanceKm: number;
  platformMatchScore: number;
  factorBreakdown: {
    distanceScore: number;
    categoryMatch: boolean;
    dietaryMatch: boolean;
    capacityFitScore: number;
    deadlineFit: boolean;
  };
  explanationText: string;
  recommendedPickupWindow: string;
}

export interface Donation {
  id: string;
  surplusListingId: string;
  surplusListing: SurplusListing;
  ngoId: string;
  ngo: NGO;
  quantity: number;
  unit: string;
  matchScore: number;
  matchReasoning: string;
  status: 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'SCHEDULED' | 'PICKED_UP' | 'DELIVERED' | 'RECEIVED' | 'CANCELLED';
  requestedChanges?: string;
  createdAt: string;
  pickup?: Pickup;
}

export interface Pickup {
  id: string;
  donationId: string;
  donation: Donation;
  driverId?: string;
  driver?: { fullName: string; phone: string };
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destinationAddress: string;
  destLat: number;
  destLng: number;
  estimatedDistance: number;
  estimatedMinutes: number;
  deadline: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
  delivery?: {
    deliveredAt: string;
    receivedBy: string;
    signatureToken: string;
    notes: string;
  };
}

export interface Sensor {
  id: string;
  sensorCode: string;
  name: string;
  type: string;
  location: string;
  minThreshold: number;
  maxThreshold: number;
  connectivity: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  adapterType: string;
  lastReadingAt?: string;
  readings: Array<{
    id: string;
    temperature: number;
    humidity?: number;
    gasQuality?: number;
    isAnomaly: boolean;
    timestamp: string;
  }>;
}

export interface QualityInspection {
  id: string;
  foodItemId: string;
  foodItem: FoodItem;
  imageUrl?: string;
  probeId?: string;
  coreTemperature?: number;
  vocGasPpm?: number;
  phLevel?: number;
  moistureAw?: number;
  qualityScore: number;
  freshnessCategory: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'SPOILED';
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  visualIssues: string; // Sensor diagnostics & biochemical indicators
  recommendedAction: string;
  reviewerStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW_REQUESTED';
  inspectorNotes?: string;
  disclaimer: string;
  createdAt: string;
  sensorFindings?: {
    temperatureStatus: 'SAFE_HOT' | 'SAFE_COLD' | 'DANGER_ZONE' | 'CRITICAL_ABUSE';
    temperatureRemark: string;
    gasQualityStatus: 'OPTIMAL' | 'MODERATE' | 'ELEVATED' | 'HAZARDOUS';
    gasRemark: string;
    acidityStatus: 'NORMAL' | 'SLIGHT_ACIDIFICATION' | 'FERMENTED_SOUR';
    acidityRemark: string;
    moistureStatus: string;
  };
}

export interface Alert {
  id: string;
  type: 'EXPIRY' | 'TEMPERATURE' | 'QUALITY' | 'SURPLUS' | 'LOGISTICS' | 'MACHINE' | 'FORECAST';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  targetRoute?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  type: 'FORECAST' | 'SURPLUS' | 'MONITORING' | 'REDISTRIBUTION' | 'EFFICIENCY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  reason: string;
  dataUsed: string;
  recommendedAction: string;
  targetRoute: string;
  createdAt: string;
}
