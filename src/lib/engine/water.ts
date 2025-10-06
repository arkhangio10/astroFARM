// Water management simulation

import { GameState, Action, Seed } from '@/types/game';

export function simulateWater(
  state: GameState,
  action: Action,
  seed: Seed
): GameState {
  const waterAmount = action.payload.amount || 10;
  const efficiency = calculateWaterEfficiency(state, seed);
  
  // Water efficiency affects how much water is actually used
  const actualWaterUsed = waterAmount * efficiency;
  
  // Update soil moisture (simplified)
  const soilMoistureIncrease = actualWaterUsed * 0.8;
  
  return {
    ...state,
    resources: {
      ...state.resources,
      water: Math.max(0, state.resources.water - actualWaterUsed),
    },
  };
}

function calculateWaterEfficiency(state: GameState, seed: Seed): number {
  // Water efficiency based on current conditions
  let efficiency = 0.8; // Base efficiency
  
  // Use real NASA data if available
  if (state.environmentData) {
    // Adjust efficiency based on real soil moisture
    const currentMoisture = state.environmentData.soilMoisture;
    
    // If soil is already moist, water is less efficient
    if (currentMoisture > 60) {
      efficiency *= 0.5; // Very wet soil, water runs off
    } else if (currentMoisture > 40) {
      efficiency *= 0.8; // Moderately moist
    } else if (currentMoisture < 20) {
      efficiency *= 1.2; // Dry soil absorbs water better
    }
    
    // Check if it's raining based on real precipitation data
    if (state.environmentData.precipitation > 0) {
      efficiency *= 0.3; // Much less efficient when raining
    }
    
    // Temperature affects evaporation
    if (state.environmentData.temperature > 30) {
      efficiency *= 0.85; // High temperature increases evaporation
    } else if (state.environmentData.temperature < 10) {
      efficiency *= 1.1; // Low temperature reduces evaporation
    }
  } else {
    // Fallback to random simulation
    const isRaining = Math.random() < 0.3;
    if (isRaining) {
      efficiency *= 0.5;
    }
  }
  
  return Math.max(0.3, Math.min(efficiency, 1.5));
}
