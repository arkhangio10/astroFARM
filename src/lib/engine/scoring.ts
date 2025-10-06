// Scoring system for AstroFarm

import { GameState, Scores, Seed } from '@/types/game';

// Calculate bonus for using NASA data effectively
function calculateDataBonus(state: GameState, seed: Seed): number {
  if (!state.environmentData) return 1.0;
  
  // Bonus based on data quality
  let qualityMultiplier = 1.0;
  switch (state.environmentData.dataQuality) {
    case 'good': qualityMultiplier = 1.15; break;
    case 'moderate': qualityMultiplier = 1.10; break;
    case 'poor': qualityMultiplier = 1.05; break;
  }
  
  // Bonus for making decisions aligned with NASA data
  let alignmentBonus = 1.0;
  
  // If soil is dry (low moisture), player should water more
  if (state.environmentData.soilMoisture < 30) {
    const waterActions = state.actions.filter(a => a.type === 'WATER').length;
    if (waterActions > 5) alignmentBonus += 0.1;
  }
  
  // If NDVI is low, player should fertilize more
  if (state.environmentData.ndvi < 0.4) {
    const fertilizeActions = state.actions.filter(a => a.type === 'FERTILIZE').length;
    if (fertilizeActions > 3) alignmentBonus += 0.1;
  }
  
  return qualityMultiplier * alignmentBonus;
}

export function calculateScores(state: GameState, seed: Seed): Scores {
  const yieldScore = calculateYieldScore(state, seed);
  const waterScore = calculateWaterScore(state, seed);
  const environmentScore = calculateEnvironmentScore(state, seed);
  const efficiencyScore = calculateEfficiencyScore(state, seed);
  
  // Bonus for using NASA data effectively
  const dataBonus = state.environmentData ? calculateDataBonus(state, seed) : 1.0;
  
  // Apply weights from seed
  const totalScore = 
    (yieldScore * seed.weights.yield +
    waterScore * seed.weights.water +
    environmentScore * seed.weights.environment) * dataBonus;
  
  return {
    total: Math.round(totalScore),
    yield: Math.round(yieldScore),
    water: Math.round(waterScore),
    environment: Math.round(environmentScore),
    efficiency: Math.round(efficiencyScore),
  };
}

function calculateYieldScore(state: GameState, seed: Seed): number {
  // Calculate yield based on farming decisions
  const baseYield = 50;
  const waterBonus = Math.min(state.resources.water * 0.1, 20);
  const fertilizerBonus = Math.min(state.resources.fertilizer * 0.2, 15);
  const efficiencyBonus = calculateEfficiencyBonus(state);
  
  // Bonus based on real NDVI data (vegetation health)
  let ndviBonus = 0;
  if (state.environmentData) {
    // NDVI ranges from -1 to 1, but typically 0.2-0.8 for vegetation
    // Higher NDVI means healthier vegetation
    ndviBonus = state.environmentData.ndvi * 20; // Up to 16 point bonus for 0.8 NDVI
  }
  
  const totalYield = baseYield + waterBonus + fertilizerBonus + efficiencyBonus + ndviBonus;
  
  // Normalize to 0-100 scale
  return Math.min(totalYield, 100);
}

function calculateWaterScore(state: GameState, seed: Seed): number {
  // Water efficiency score (higher is better)
  const waterUsed = calculateTotalWaterUsed(state);
  const optimalWater = seed.targets.minHumidity * 10; // Simplified
  
  if (waterUsed <= optimalWater) {
    return 100; // Perfect water usage
  } else {
    // Penalty for over-watering
    const overuse = waterUsed - optimalWater;
    return Math.max(0, 100 - overuse * 2);
  }
}

function calculateEnvironmentScore(state: GameState, seed: Seed): number {
  // Environmental impact score (higher is better)
  let score = 100;
  
  // Penalty for excessive fertilizer use
  const fertilizerUsed = calculateTotalFertilizerUsed(state);
  if (fertilizerUsed > 20) {
    score -= (fertilizerUsed - 20) * 2;
  }
  
  // Bonus for organic practices
  const organicActions = state.actions.filter(action => 
    action.type === 'FERTILIZE' && action.payload.type === 'organic'
  ).length;
  score += organicActions * 5;
  
  return Math.max(0, Math.min(score, 100));
}

function calculateEfficiencyScore(state: GameState, seed: Seed): number {
  // Overall efficiency score
  const actionsPerDay = state.actions.length / state.totalDays;
  const resourceUtilization = calculateResourceUtilization(state);
  
  // Optimal efficiency is moderate action frequency with high resource utilization
  const actionEfficiency = Math.max(0, 100 - Math.abs(actionsPerDay - 2) * 10);
  const resourceEfficiency = resourceUtilization * 100;
  
  return (actionEfficiency + resourceEfficiency) / 2;
}

function calculateEfficiencyBonus(state: GameState): number {
  // Bonus for efficient farming practices
  let bonus = 0;
  
  // Bonus for balanced resource usage
  const resources = state.resources;
  const totalResources = resources.water + resources.fertilizer + resources.money;
  if (totalResources > 0) {
    const balance = 1 - Math.max(
      Math.abs(resources.water - resources.fertilizer) / totalResources,
      Math.abs(resources.water - resources.money) / totalResources,
      Math.abs(resources.fertilizer - resources.money) / totalResources
    );
    bonus += balance * 10;
  }
  
  return bonus;
}

function calculateTotalWaterUsed(state: GameState): number {
  return state.actions
    .filter(action => action.type === 'WATER')
    .reduce((total, action) => total + (action.payload.amount || 0), 0);
}

function calculateTotalFertilizerUsed(state: GameState): number {
  return state.actions
    .filter(action => action.type === 'FERTILIZE')
    .reduce((total, action) => total + (action.payload.amount || 0), 0);
}

function calculateResourceUtilization(state: GameState): number {
  // Calculate how efficiently resources were used
  const totalActions = state.actions.length;
  if (totalActions === 0) return 0;
  
  const effectiveActions = state.actions.filter(action => 
    action.type === 'WATER' || action.type === 'FERTILIZE'
  ).length;
  
  return effectiveActions / totalActions;
}

