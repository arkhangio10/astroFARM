// Fertilization simulation

import { GameState, Action, Seed } from '@/types/game';

export function simulateFertilization(
  state: GameState,
  action: Action,
  seed: Seed
): GameState {
  const fertilizerAmount = action.payload.amount || 5;
  const fertilizerType = action.payload.type || 'organic';
  
  // Calculate fertilization effectiveness
  const effectiveness = calculateFertilizationEffectiveness(state, seed, fertilizerType);
  
  // Apply fertilizer effects
  const yieldBonus = fertilizerAmount * effectiveness;
  const environmentalImpact = calculateEnvironmentalImpact(fertilizerAmount, fertilizerType);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      fertilizer: Math.max(0, state.resources.fertilizer - fertilizerAmount),
    },
  };
}

function calculateFertilizationEffectiveness(
  state: GameState,
  seed: Seed,
  fertilizerType: string
): number {
  let effectiveness = 1.0;
  
  // Different fertilizer types have different effectiveness
  const typeMultipliers: Record<string, number> = {
    'organic': 0.8,
    'synthetic': 1.2,
    'compost': 0.6,
  };
  
  effectiveness *= typeMultipliers[fertilizerType] || 1.0;
  
  // Soil conditions affect effectiveness
  const soilMoisture = 0.7; // Could be from state
  if (soilMoisture < 0.3) {
    effectiveness *= 0.5; // Less effective in dry soil
  }
  
  return effectiveness;
}

function calculateEnvironmentalImpact(amount: number, type: string): number {
  // Calculate environmental impact of fertilization
  const impactMultipliers: Record<string, number> = {
    'organic': 0.3,
    'synthetic': 1.0,
    'compost': 0.1,
  };
  
  return amount * (impactMultipliers[type] || 1.0);
}

