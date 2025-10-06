// Frost risk simulation

import { GameState, Seed } from '@/types/game';

export function simulateFrost(
  state: GameState,
  seed: Seed
): GameState {
  const frostRisk = calculateFrostRisk(state, seed);
  
  if (frostRisk > 0.7) {
    // High frost risk - apply damage
    return applyFrostDamage(state, frostRisk);
  }
  
  return state;
}

function calculateFrostRisk(state: GameState, seed: Seed): number {
  // Frost risk based on temperature and season
  const day = state.currentDay;
  const season = getSeason(day);
  
  let risk = 0;
  
  // Higher risk in winter/spring
  if (season === 'winter') {
    risk = 0.8;
  } else if (season === 'spring') {
    risk = 0.4;
  } else if (season === 'fall') {
    risk = 0.2;
  }
  
  // Temperature affects risk
  const temperature = getTemperature(day, seed);
  if (temperature < 0) {
    risk = 1.0; // Certain frost below 0°C
  } else if (temperature < 5) {
    risk = Math.max(risk, 0.6); // High risk below 5°C
  }
  
  return Math.min(risk, 1.0);
}

function applyFrostDamage(state: GameState, frostRisk: number): GameState {
  // Frost damage reduces yield and resources
  const damage = frostRisk * 0.3; // Up to 30% damage
  
  return {
    ...state,
    resources: {
      ...state.resources,
      // Reduce yield potential
      money: Math.max(0, state.resources.money * (1 - damage)),
    },
  };
}

function getSeason(day: number): string {
  // Simplified season calculation
  const seasonDay = day % 365;
  
  if (seasonDay < 90) return 'spring';
  if (seasonDay < 180) return 'summer';
  if (seasonDay < 270) return 'fall';
  return 'winter';
}

function getTemperature(day: number, seed: Seed): number {
  // Simplified temperature calculation
  // In real implementation, this would use actual temperature data
  const baseTemp = 15; // Base temperature
  const seasonalVariation = Math.sin((day / 365) * 2 * Math.PI) * 10;
  const dailyVariation = (Math.random() - 0.5) * 5;
  
  return baseTemp + seasonalVariation + dailyVariation;
}

