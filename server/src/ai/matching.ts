/**
 * FoodCycle AI — Multi-Factor NGO Matching Engine
 * Matches surplus listings with nearby NGOs, shelters, and food banks.
 * Produces transparent, explainable "Platform Match Score" based on:
 * 1. Geographical Distance (Haversine Formula)
 * 2. Food Category & Dietary Requirement Fit (Veg/Non-Veg)
 * 3. Beneficiary & Meal Capacity Fit
 * 4. Redistribution Window Compatibility
 */

export interface KitchenLocation {
  latitude: number;
  longitude: number;
}

export interface NgoCandidate {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  dailyMealCapacity: number;
  beneficiaryCount: number;
  acceptsVegOnly: boolean;
  hasColdStorage: boolean;
  hasLogistics: boolean;
  requirements?: Array<{
    foodCategory: string;
    preferredItems: string;
    dailyQuotaKg: number;
  }>;
}

export interface SurplusContext {
  id: string;
  foodName: string;
  category: string;
  quantityKg: number;
  dietaryCategory: string; // "VEG", "NON_VEG"
  shelfLifeHours: number;
  pickupDeadline: Date | string;
}

export interface MatchResult {
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

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function matchNgosForSurplus(
  kitchenLoc: KitchenLocation,
  surplus: SurplusContext,
  ngos: NgoCandidate[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const ngo of ngos) {
    const distanceKm = haversineDistance(kitchenLoc.latitude, kitchenLoc.longitude, ngo.latitude, ngo.longitude);

    // 1. Distance score (Max 40 points): full points under 3 km, decreases with distance
    let distanceScore = Math.max(0, 40 - (distanceKm * 3.5));

    // 2. Dietary Match (Max 20 points)
    let dietaryMatch = true;
    if (ngo.acceptsVegOnly && surplus.dietaryCategory !== 'VEG') {
      dietaryMatch = false;
    }
    const dietScore = dietaryMatch ? 20 : 0;

    // 3. Food Category Match (Max 15 points)
    let categoryMatch = true;
    if (ngo.requirements && ngo.requirements.length > 0) {
      categoryMatch = ngo.requirements.some(r => r.foodCategory === surplus.category || r.foodCategory === 'COOKED_MEAL');
    }
    const catScore = categoryMatch ? 15 : 5;

    // 4. Capacity Fit (Max 25 points)
    // 1 kg surplus = approx 2.5 meals
    const mealsInSurplus = surplus.quantityKg * 2.5;
    const capacityRatio = mealsInSurplus / Math.max(1, ngo.dailyMealCapacity);
    let capacityScore = 25;
    if (capacityRatio > 1.2) {
      // NGO cannot consume entire batch in one cycle
      capacityScore = 12;
    } else if (capacityRatio < 0.1) {
      // Very small batch relative to capacity
      capacityScore = 18;
    }

    // Deadline feasibility: Transit speed ~ 20km/h in urban traffic + 30 min buffer
    const travelHours = (distanceKm / 20) + 0.5;
    const deadlineFit = surplus.shelfLifeHours >= travelHours;

    let finalScore = distanceScore + dietScore + catScore + capacityScore;
    if (!deadlineFit) {
      finalScore = Math.max(10, finalScore - 30);
    }
    if (!dietaryMatch) {
      finalScore = Math.max(0, finalScore - 40);
    }

    const platformMatchScore = Math.min(99, Math.max(15, Math.round(finalScore)));

    const explanationParts: string[] = [
      `Distance: ${distanceKm} km`,
      `Dietary match: ${dietaryMatch ? 'Yes (Veg)' : 'Mismatch'}`,
      `Capacity: ${Math.round(mealsInSurplus)} meals / ${ngo.dailyMealCapacity} daily capacity`,
      `Transit feasibility: ${deadlineFit ? 'Safe window' : 'Tight deadline'}`
    ];

    results.push({
      ngoId: ngo.id,
      ngoName: ngo.name,
      distanceKm,
      platformMatchScore,
      factorBreakdown: {
        distanceScore: Math.round(distanceScore),
        categoryMatch,
        dietaryMatch,
        capacityFitScore: Math.round(capacityScore),
        deadlineFit
      },
      explanationText: explanationParts.join(' | '),
      recommendedPickupWindow: 'Within next 2.5 hours'
    });
  }

  // Rank by platform match score descending
  return results.sort((a, b) => b.platformMatchScore - a.platformMatchScore);
}
