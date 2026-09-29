/**
 * FoodCycle AI — Route Optimization Engine
 * Implements capacity-aware, deadline-constrained nearest-neighbor sequencing
 * Generates realistic stop ordering, estimated distances, travel times, and vehicle capacity usage.
 */

import { haversineDistance } from './matching.js';

export interface RouteStopInput {
  id: string;
  donationId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  quantityKg: number;
  deadline: Date | string;
  type: 'PICKUP' | 'DROPOFF';
  contactPerson?: string;
  contactPhone?: string;
}

export interface OptimizedStopOutput extends RouteStopInput {
  sequenceIndex: number;
  cumulativeDistanceKm: number;
  estimatedArrivalMinutes: number;
  vehicleLoadKg: number;
}

export interface OptimizedRoutePlan {
  totalDistanceKm: number;
  totalTimeMinutes: number;
  capacityUsagePct: number;
  stopsCount: number;
  orderedStops: OptimizedStopOutput[];
  algorithmUsed: string;
  polylineWaypoints: Array<[number, number]>;
}

export function optimizeRedistributionRoute(
  startLat: number,
  startLng: number,
  vehicleCapacityKg: number,
  stops: RouteStopInput[]
): OptimizedRoutePlan {
  if (stops.length === 0) {
    return {
      totalDistanceKm: 0,
      totalTimeMinutes: 0,
      capacityUsagePct: 0,
      stopsCount: 0,
      orderedStops: [],
      algorithmUsed: 'None (Zero stops)',
      polylineWaypoints: [[startLat, startLng]]
    };
  }

  let currentLat = startLat;
  let currentLng = startLng;
  const remaining = [...stops];
  const orderedStops: OptimizedStopOutput[] = [];
  let totalDist = 0;
  let totalMins = 0;
  let currentLoad = 0;
  let maxObservedLoad = 0;

  const polyline: Array<[number, number]> = [[startLat, startLng]];

  while (remaining.length > 0) {
    let bestIndex = -1;
    let bestScore = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const stop = remaining[i];
      const dist = haversineDistance(currentLat, currentLng, stop.lat, stop.lng);

      // Urgency factor
      const deadlineDate = new Date(stop.deadline);
      const hoursRemaining = Math.max(0.5, (deadlineDate.getTime() - Date.now()) / (3600 * 1000));

      // Capacity constraint check: if pickup exceeds remaining capacity, heavily penalize
      const wouldOverfill = stop.type === 'PICKUP' && (currentLoad + stop.quantityKg > vehicleCapacityKg);
      const capacityPenalty = wouldOverfill ? 500 : 0;

      // Score: distance (km) + urgency + capacity penalty
      const urgencyScore = 15 / hoursRemaining;
      const score = dist + urgencyScore + capacityPenalty;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestIndex === -1) {
      bestIndex = 0;
    }

    const chosen = remaining.splice(bestIndex, 1)[0];
    const segmentDist = haversineDistance(currentLat, currentLng, chosen.lat, chosen.lng);
    totalDist += segmentDist;

    // Traffic assumption: 24 km/h average speed in city + 8 min loading/unloading dwell time
    const transitMins = Math.round((segmentDist / 24) * 60) + 8;
    totalMins += transitMins;

    if (chosen.type === 'PICKUP') {
      currentLoad += chosen.quantityKg;
    } else {
      currentLoad = Math.max(0, currentLoad - chosen.quantityKg);
    }
    if (currentLoad > maxObservedLoad) {
      maxObservedLoad = currentLoad;
    }

    orderedStops.push({
      ...chosen,
      sequenceIndex: orderedStops.length + 1,
      cumulativeDistanceKm: Math.round(totalDist * 10) / 10,
      estimatedArrivalMinutes: totalMins,
      vehicleLoadKg: Math.round(currentLoad * 10) / 10
    });

    polyline.push([chosen.lat, chosen.lng]);
    currentLat = chosen.lat;
    currentLng = chosen.lng;
  }

  const capacityUsagePct = Math.min(100, Math.round((maxObservedLoad / Math.max(1, vehicleCapacityKg)) * 100 * 10) / 10);

  return {
    totalDistanceKm: Math.round(totalDist * 10) / 10,
    totalTimeMinutes: totalMins,
    capacityUsagePct,
    stopsCount: orderedStops.length,
    orderedStops,
    algorithmUsed: 'Deadline-Aware Capacity-Balanced Nearest Neighbor',
    polylineWaypoints: polyline
  };
}
