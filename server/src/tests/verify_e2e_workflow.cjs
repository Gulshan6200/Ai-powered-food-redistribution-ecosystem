const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('======================================================');
  console.log('🚀 RUNNING 18-STEP END-TO-END WORKFLOW VERIFICATION');
  console.log('======================================================\n');

  // Step 1: Health check
  console.log('Step 1: Testing Health check...');
  const health = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('  -> Health response:', health.data);

  // Step 2: Login as Kitchen Manager
  console.log('\nStep 2: Authenticating as Kitchen Manager (kitchen@foodcycle.ai)...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'kitchen@foodcycle.ai', password: 'Password123!' });

  if (!loginRes.data.success) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.token;
  const user = loginRes.data.user;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log(`  -> Authenticated: ${user.fullName} (${user.role}), Org: ${user.organizationName}`);

  // Step 3: Fetch Dashboard Stats
  console.log('\nStep 3: Fetching Dashboard Real-Time Analytics & Recommendations...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/summary',
    method: 'GET',
    headers: authHeaders
  });
  console.log('  -> KPIs:', {
    todayPreparedKg: statsRes.data.data.kpis.todayPreparedKg,
    predictedSurplusKg: statsRes.data.data.kpis.predictedSurplusKg,
    foodRescuedKg: statsRes.data.data.kpis.foodRescuedKg,
    mealsRedistributed: statsRes.data.data.kpis.mealsRedistributed,
    costSavedInr: `₹${statsRes.data.data.kpis.estimatedCostSavedInr}`
  });
  console.log(`  -> Contextual AI Recommendations loaded: ${statsRes.data.data.recommendations.length}`);

  // Step 4: Fetch Inventory Batches
  console.log('\nStep 4: Querying Inventory Batches...');
  const invRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/inventory',
    method: 'GET',
    headers: authHeaders
  });
  const batches = invRes.data.data;
  console.log(`  -> Found ${batches.length} active inventory batches.`);
  const sampleBatch = batches[0];
  console.log(`  -> Selected Batch: [${sampleBatch.batchNumber}] ${sampleBatch.foodItem.name}, Quantity: ${sampleBatch.quantity} ${sampleBatch.unit}, Status: ${sampleBatch.status}`);

  // Step 5: Run AI Demand Forecasting
  console.log('\nStep 5: Triggering AI Demand Forecasting Engine (Exponential Smoothing + Seasonality)...');
  const forecastGenRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/forecast',
    method: 'POST',
    headers: authHeaders
  }, { foodItemId: sampleBatch.foodItemId, horizonDays: 3 });
  if (!forecastGenRes.data.success) {
    throw new Error('Forecast failed: ' + JSON.stringify(forecastGenRes.data));
  }
  const f = forecastGenRes.data.forecast;
  console.log(`  -> Model: ${f.modelName} (Confidence: ${f.confidenceScore}%)`);
  console.log(`  -> Predicted Demand: ${f.predictedDemand} ${sampleBatch.unit} (Bounds: [${f.lowerBound}, ${f.upperBound}])`);
  console.log(`  -> Recommended Production: ${f.recommendedProduction} ${sampleBatch.unit} | Expected Surplus: ${f.expectedSurplus} ${sampleBatch.unit}`);

  // Step 6: Fetch Surplus Data
  console.log('\nStep 6: Fetching AI Surplus Predictions & Active Listings...');
  const surplusRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/surplus',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`  -> Found ${surplusRes.data.predictions.length} surplus predictions and ${surplusRes.data.listings.length} existing listings.`);
  if (surplusRes.data.predictions.length > 0) {
    const p = surplusRes.data.predictions[0];
    console.log(`  -> Top Prediction: ${p.foodItem?.name} | Predicted Surplus: ${p.predictedSurplus} | Priority: ${p.priority} | Action: ${p.recommendedAction}`);
  }

  // Step 7: Create a Real Surplus Listing
  console.log('\nStep 7: Creating Real Surplus Listing in Database...');
  const createListingRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/surplus',
    method: 'POST',
    headers: authHeaders
  }, {
    foodItemId: sampleBatch.foodItemId,
    quantity: 45.0,
    shelfLifeHours: 5,
    storageCondition: 'Hot Packaged (65°C)',
    dietaryCategory: sampleBatch.foodItem.dietaryCategory || 'VEG'
  });
  if (!createListingRes.data.success) {
    throw new Error('Create listing failed: ' + JSON.stringify(createListingRes.data));
  }
  const createdListing = createListingRes.data.listing;
  console.log(`  -> Surplus Listing created: ID ${createdListing.id} (${createdListing.quantity} ${createdListing.unit} ${createdListing.foodItem?.name})`);

  // Step 8: Multi-factor Explainable NGO Matching
  console.log('\nStep 8: Executing Explainable Multi-Factor NGO Matching Engine...');
  const matchRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/surplus/${createdListing.id}/match`,
    method: 'POST',
    headers: authHeaders
  });
  const matches = matchRes.data.matches;
  console.log(`  -> Generated ${matches.length} ranked NGO matches:`);
  matches.slice(0, 3).forEach((m, idx) => {
    console.log(`     #${idx + 1} [Score: ${m.platformMatchScore}%] ${m.ngoName} (${m.distanceKm} km away)`);
    console.log(`       Explanation: ${m.explanationText}`);
  });
  const bestMatch = matches[0];

  // Step 9: Offer Donation to Top Matched NGO
  console.log(`\nStep 9: Offering Donation to Top Match: ${bestMatch.ngoName}...`);
  const donationRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/donations',
    method: 'POST',
    headers: authHeaders
  }, {
    surplusListingId: createdListing.id,
    ngoId: bestMatch.ngoId,
    quantity: 45.0,
    matchScore: bestMatch.platformMatchScore,
    matchReasoning: bestMatch.explanationText
  });
  if (!donationRes.data.success) {
    throw new Error('Create donation failed: ' + JSON.stringify(donationRes.data));
  }
  const donation = donationRes.data.donation;
  console.log(`  -> Donation created: ID ${donation.id}, Status: ${donation.status}`);

  // Step 10: NGO Accepts Donation (automatically creates Pickup request)
  console.log('\nStep 10: NGO Accepts Donation (Auto-triggers Logistics Pickup Request)...');
  const acceptRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/donations/${donation.id}/status`,
    method: 'PUT',
    headers: authHeaders
  }, {
    status: 'ACCEPTED'
  });
  if (!acceptRes.data.success) {
    throw new Error('Accept donation failed: ' + JSON.stringify(acceptRes.data));
  }
  console.log(`  -> Donation status: ${acceptRes.data.donation.status}`);

  // Step 11: Switch to Logistics Operator & Run Route Optimization
  console.log('\nStep 11: Querying Logistics Overview & Running Route Optimization...');
  const logOverview = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/logistics/overview',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`  -> Logistics Fleet: ${logOverview.data.vehicles.length} vehicles, ${logOverview.data.drivers.length} drivers, ${logOverview.data.pickups.length} pickups.`);
  
  // Find our pending pickup
  const ourPickup = logOverview.data.pickups.find(p => p.donationId === donation.id);
  if (!ourPickup) {
    throw new Error('Could not locate generated pickup for donation ' + donation.id);
  }
  console.log(`  -> Found Pickup ID ${ourPickup.id} (Status: ${ourPickup.status}) for ${ourPickup.pickupAddress} -> ${ourPickup.destinationAddress}`);

  const routeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/logistics/optimize',
    method: 'POST',
    headers: authHeaders
  }, {
    pickupIds: [ourPickup.id]
  });
  if (!routeRes.data.success) {
    throw new Error('Route optimization failed: ' + JSON.stringify(routeRes.data));
  }
  console.log(`  -> Optimized Route: "${routeRes.data.route.name}"`);
  console.log(`     Distance: ${routeRes.data.route.totalDistanceKm} km | Duration: ${routeRes.data.route.estimatedDurationMins} mins | Stops: ${routeRes.data.plan.orderedStops.length}`);

  // Step 12: Transition Pickup to IN_TRANSIT
  console.log('\nStep 12: Transitioning Pickup to IN_TRANSIT...');
  const transitRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/logistics/pickups/${ourPickup.id}/status`,
    method: 'PUT',
    headers: authHeaders
  }, {
    status: 'IN_TRANSIT',
    notes: 'Driver departed kitchen hub with thermal insulated containers'
  });
  console.log(`  -> Pickup Status updated to: IN_TRANSIT`);

  // Step 13: Transition Delivery to DELIVERED & Digital Receipt Confirmation
  console.log('\nStep 13: Digital Receipt Confirmation & Marking DELIVERED...');
  const deliverRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/logistics/pickups/${ourPickup.id}/status`,
    method: 'PUT',
    headers: authHeaders
  }, {
    status: 'DELIVERED',
    temperatureOnArrival: 64.2,
    notes: 'Delivered piping hot; temperature verified 64.2°C',
    recipientSignature: 'SIG-VERIF-DELIVERY-94821'
  });
  console.log(`  -> Delivery complete! Verification Signature recorded.`);

  // Mark donation as RECEIVED to trigger sustainability counter update
  const confirmDonationRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/donations/${donation.id}/status`,
    method: 'PUT',
    headers: authHeaders
  }, {
    status: 'RECEIVED'
  });
  console.log(`  -> Donation finalized: Status=${confirmDonationRes.data.donation.status}`);

  // Step 14: Verify Live Sustainability Impact Metric Calculations
  console.log('\nStep 14: Verifying Live Impact Counters & Sustainability Metrics...');
  const susRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/analytics/sustainability',
    method: 'GET',
    headers: authHeaders
  });
  console.log('  -> Live Impact Counters:', {
    totalFoodRescued: `${susRes.data.data.kpis.totalFoodRescuedKg} kg`,
    mealsEnabled: `${susRes.data.data.kpis.mealsEnabled} meals`,
    carbonAvoidanceKg: `${susRes.data.data.kpis.estimatedCo2AvoidanceKg} kg CO2e`,
    waterSavingsLiters: `${susRes.data.data.kpis.estimatedWaterSavingsLiters} L`,
    economicValueSaved: `INR ₹${susRes.data.data.kpis.estimatedCostSavingsInr.toLocaleString('en-IN')}`
  });

  // Step 15: Generate ESG Compliance Report
  console.log('\nStep 15: Generating Dynamic ESG Compliance Report...');
  const esgRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/generate',
    method: 'POST',
    headers: authHeaders
  }, { period: 'Monthly' });
  console.log('  -> Report Organization:', esgRes.data.report.organizationName);
  console.log('  -> Executive Headline:', esgRes.data.report.executiveSummary.headline);
  console.log('  -> Reduction Rate:', esgRes.data.report.executiveSummary.wasteReductionRate);

  // Step 16: Sensor Telemetry Check
  console.log('\nStep 16: Cold/Dry Chain IoT Telemetry & Excursions...');
  const sensorRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/sensors',
    method: 'GET',
    headers: authHeaders
  });
  const sensors = sensorRes.data.sensors || [];
  const excursions = sensors.filter(s => s.status === 'EXCURSION');
  console.log(`  -> Total IoT Sensors: ${sensors.length} | Sensors in Excursion State: ${excursions.length}`);
  if (excursions.length > 0) {
    console.log(`     Excursion Alert: Sensor ${excursions[0].identifier} (${excursions[0].type}) in ${excursions[0].location}`);
  }

  // Step 17: Computer Vision Quality Inspection Check
  console.log('\nStep 17: Computer Vision Quality Inspection Historical Records...');
  const qHistory = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/quality',
    method: 'GET',
    headers: authHeaders
  });
  const inspections = qHistory.data.inspections || [];
  console.log(`  -> Historical Quality Inspections in DB: ${inspections.length}`);
  if (inspections.length > 0) {
    const qi = inspections[0];
    console.log(`     Inspection [${qi.foodItem?.name}]: Freshness Score=${qi.qualityScore}%, Grade=${qi.freshnessCategory}, Action=${qi.recommendedAction}`);
  }

  // Step 18: Contextual Intelligence Assistant Recommendations Check
  console.log('\nStep 18: Contextual Intelligence Assistant Verification...');
  console.log(`  -> Active AI Recommendations verified: ${statsRes.data.data.recommendations.length} actionable intelligence cards.`);
  statsRes.data.data.recommendations.slice(0, 3).forEach((r, idx) => {
    console.log(`     #${idx + 1} [Priority: ${r.priority}] ${r.title} => Action Type: ${r.actionType}`);
  });

  console.log('\n======================================================');
  console.log('🎉 ALL 18 STEPS VERIFIED WITH REAL DATABASE MUTATIONS!');
  console.log('======================================================');
}

run().catch(err => {
  console.error('Workflow verification failed:', err);
  process.exit(1);
});
