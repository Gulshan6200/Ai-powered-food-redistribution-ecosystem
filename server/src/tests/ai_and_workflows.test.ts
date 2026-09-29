import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateDemandForecast } from '../ai/forecasting.js';
import { assessSurplus } from '../ai/surplus.js';
import { matchNgosForSurplus, haversineDistance } from '../ai/matching.js';
import { optimizeRedistributionRoute } from '../ai/routing.js';
import { LocalHeuristicVisionAdapter, evaluateIoTSensorQuality } from '../ai/quality.js';

describe('FoodCycle AI — Core Engines & Business Logic Tests', () => {

  test('1. Demand Forecasting Engine calculates predictions and bounds', () => {
    const history = [
      { date: '2026-09-10', quantity: 120 },
      { date: '2026-09-11', quantity: 135 },
      { date: '2026-09-12', quantity: 128 },
      { date: '2026-09-13', quantity: 142 },
      { date: '2026-09-14', quantity: 130 },
      { date: '2026-09-15', quantity: 138 },
      { date: '2026-09-16', quantity: 134 }
    ];

    const forecast = calculateDemandForecast('item-1', 'Vegetable Biryani', history, 3);

    assert.ok(forecast.predictedDemand > 100, 'Predicted demand should be realistic');
    assert.ok(forecast.lowerBound <= forecast.predictedDemand, 'Lower bound must be <= predicted');
    assert.ok(forecast.upperBound >= forecast.predictedDemand, 'Upper bound must be >= predicted');
    assert.ok(forecast.recommendedProduction >= forecast.predictedDemand, 'Recommended production includes safety buffer');
    assert.strictEqual(forecast.horizonForecasts.length, 3, 'Should generate 3 horizon points');
    assert.ok(forecast.confidenceScore > 0.8, 'Confidence score should reflect sound sample size');
  });

  test('2. Surplus Assessment & Priority Scoring Engine', () => {
    // Case A: High urgency near-expiry surplus
    const assessmentHigh = assessSurplus({
      foodItemId: 'item-1',
      producedQuantity: 150,
      consumedQuantity: 110,
      remainingShelfHours: 2.0,
      qualityRisk: 'MEDIUM'
    });

    assert.strictEqual(assessmentHigh.predictedSurplus, 40);
    assert.strictEqual(assessmentHigh.priority, 'HIGH', 'Urgent batch under 3 hours must be HIGH priority');

    // Case B: Low urgency batch with ample shelf life
    const assessmentLow = assessSurplus({
      foodItemId: 'item-2',
      producedQuantity: 60,
      consumedQuantity: 55,
      remainingShelfHours: 12.0,
      qualityRisk: 'LOW'
    });

    assert.strictEqual(assessmentLow.predictedSurplus, 5);
    assert.strictEqual(assessmentLow.priority, 'LOW');
  });

  test('3. Haversine Distance & Multi-Factor NGO Matching Engine', () => {
    // Apex Kitchen in Electronic City (12.8399, 77.6770)
    const kitchenLoc = { latitude: 12.8399, longitude: 77.6770 };

    // Hope Community Kitchen in nearby Neeladri Road (12.8450, 77.6620)
    const dist = haversineDistance(kitchenLoc.latitude, kitchenLoc.longitude, 12.8450, 77.6620);
    assert.ok(dist > 0 && dist < 5.0, `Distance should be ~1.7 km, got ${dist}`);

    const ngos = [
      {
        id: 'ngo-1',
        name: 'Hope Community Kitchen',
        code: 'NGO-01',
        latitude: 12.8450,
        longitude: 77.6620,
        dailyMealCapacity: 350,
        beneficiaryCount: 180,
        acceptsVegOnly: true,
        hasColdStorage: true,
        hasLogistics: true,
        requirements: [{ foodCategory: 'COOKED_MEAL', preferredItems: 'Rice, Dal', dailyQuotaKg: 100 }]
      },
      {
        id: 'ngo-2',
        name: 'Distant Center',
        code: 'NGO-02',
        latitude: 13.0500, // 25+ km away
        longitude: 77.5800,
        dailyMealCapacity: 100,
        beneficiaryCount: 50,
        acceptsVegOnly: true,
        hasColdStorage: false,
        hasLogistics: false
      }
    ];

    const surplusContext = {
      id: 'surplus-1',
      foodName: 'Vegetable Biryani',
      category: 'COOKED_MEAL',
      quantityKg: 40,
      dietaryCategory: 'VEG',
      shelfLifeHours: 5.0,
      pickupDeadline: new Date(Date.now() + 5 * 3600 * 1000)
    };

    const matches = matchNgosForSurplus(kitchenLoc, surplusContext, ngos);

    assert.strictEqual(matches.length, 2);
    assert.strictEqual(matches[0].ngoId, 'ngo-1', 'Closer NGO with higher capacity should rank first');
    assert.ok(matches[0].platformMatchScore > matches[1].platformMatchScore, 'Closer NGO should have higher match score');
    assert.ok(matches[0].factorBreakdown.dietaryMatch, 'Vegetarian food must match vegetarian NGO');
    assert.ok(matches[0].explanationText.includes('Distance:'), 'Should output human-readable explainability');
  });

  test('4. Capacity & Deadline-Aware Logistics Route Optimization', () => {
    const startLat = 12.8399;
    const startLng = 77.6770;
    const vehicleCapacityKg = 800;

    const stops = [
      {
        id: 'stop-1',
        donationId: 'don-1',
        name: 'Pickup Apex',
        address: 'Electronic City',
        lat: 12.8400,
        lng: 77.6760,
        quantityKg: 45,
        deadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
        type: 'PICKUP' as const
      },
      {
        id: 'stop-2',
        donationId: 'don-1',
        name: 'Dropoff Hope Kitchen',
        address: 'Neeladri Road',
        lat: 12.8450,
        lng: 77.6620,
        quantityKg: 45,
        deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        type: 'DROPOFF' as const
      }
    ];

    const plan = optimizeRedistributionRoute(startLat, startLng, vehicleCapacityKg, stops);

    assert.strictEqual(plan.stopsCount, 2);
    assert.ok(plan.totalDistanceKm > 0, 'Total distance should be computed');
    assert.ok(plan.totalTimeMinutes > 0, 'Total time should include transit and dwell');
    assert.ok(plan.capacityUsagePct <= 100, 'Capacity usage should be within 100%');
    assert.ok(plan.polylineWaypoints.length >= 3, 'Waypoints should include origin and stops');
  });

  test('5. Computer Vision Quality Inspection Adapter', async () => {
    const adapter = new LocalHeuristicVisionAdapter();
    const result = await adapter.analyzeFoodImage('https://images.example.com/fresh-biryani.jpg', 'COOKED_MEAL');

    assert.ok(result.qualityScore >= 0 && result.qualityScore <= 100, 'Score must be between 0 and 100');
    assert.ok(['EXCELLENT', 'GOOD', 'FAIR', 'SPOILED'].includes(result.freshnessCategory));
    assert.ok(result.disclaimer.includes('AI visual assessment'), 'Must include required human review disclaimer');
  });

  test('6. IoT Multi-Sensor Food Quality & Biochemical Spoilage Engine', () => {
    // Fresh Hot Meal Test
    const freshEval = evaluateIoTSensorQuality({
      coreTemperature: 64.5,
      vocGasPpm: 8.0,
      phLevel: 6.4,
      moistureAw: 0.88,
      probeId: 'PROBE-QC-01'
    });
    assert.ok(freshEval.qualityScore >= 88, 'Fresh meal should have score >= 88');
    assert.strictEqual(freshEval.freshnessCategory, 'EXCELLENT');
    assert.strictEqual(freshEval.spoilageRisk, 'LOW');
    assert.strictEqual(freshEval.sensorFindings.temperatureStatus, 'SAFE_HOT');

    // Spoiled Fermented Meal Test (Acidic pH + High Volatiles + Danger Zone)
    const spoiledEval = evaluateIoTSensorQuality({
      coreTemperature: 36.0,
      vocGasPpm: 75.0,
      phLevel: 4.8,
      moistureAw: 0.90,
      probeId: 'PROBE-QC-01'
    });
    assert.ok(spoiledEval.qualityScore < 55, 'Spoiled batch should have score < 55');
    assert.strictEqual(spoiledEval.freshnessCategory, 'SPOILED');
    assert.strictEqual(spoiledEval.spoilageRisk, 'HIGH');
    assert.ok(spoiledEval.recommendedAction.includes('UNFIT FOR HUMAN CONSUMPTION'));
  });

});
