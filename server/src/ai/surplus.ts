/**
 * FoodCycle AI — Surplus Risk & Priority Scoring Engine
 * Implements multi-criteria priority calculation:
 * Priority Score = w1 * Surplus Quantity + w2 * (1 / Remaining Shelf Life) + w3 * Quality Risk + w4 * Redistribution Demand
 */

export interface SurplusInput {
  foodItemId: string;
  producedQuantity: number;
  consumedQuantity: number;
  remainingShelfHours: number;
  qualityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  currentNgoDemandScore?: number; // 0 to 10
}

export interface SurplusAssessment {
  predictedSurplus: number;
  remainingShelfHours: number;
  qualityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore: number;
  recommendedAction: string;
}

export function assessSurplus(input: SurplusInput): SurplusAssessment {
  const predictedSurplus = Math.max(0, Math.round((input.producedQuantity - input.consumedQuantity) * 10) / 10);

  // Risk numeric weights
  const riskWeight = input.qualityRisk === 'HIGH' ? 30 : input.qualityRisk === 'MEDIUM' ? 18 : 5;

  // Time urgency (shorter shelf life = higher priority)
  const urgencyWeight = input.remainingShelfHours <= 2 ? 40 : input.remainingShelfHours <= 4 ? 25 : 10;

  // Quantity weight (larger volume = higher priority to rescue)
  const qtyWeight = Math.min(30, (predictedSurplus / 100) * 30);

  const demandFactor = (input.currentNgoDemandScore || 7);

  const totalScore = Math.round(urgencyWeight + riskWeight + qtyWeight + demandFactor);

  let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (totalScore >= 65 || input.remainingShelfHours <= 3) {
    priority = 'HIGH';
  } else if (totalScore >= 40) {
    priority = 'MEDIUM';
  }

  let recommendedAction = 'Monitor inventory';
  if (priority === 'HIGH') {
    recommendedAction = 'Immediate redistribution required: Broadcast offer to local food banks';
  } else if (priority === 'MEDIUM') {
    recommendedAction = 'Stage for planned evening redistribution window';
  }

  return {
    predictedSurplus,
    remainingShelfHours: input.remainingShelfHours,
    qualityRisk: input.qualityRisk,
    priority,
    priorityScore: totalScore,
    recommendedAction
  };
}
