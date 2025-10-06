// Core game engine - pure functions for deterministic simulation

import { GameState, Action, Scores, Seed, Resources } from '@/types/game';
import { simulateWater } from './water';
import { simulateFertilization } from './fertilization';
import { simulateFrost } from './frost';
import { calculateScores } from './scoring';
import { seededRNG } from '../rng';

export interface SimulationResult {
  finalState: GameState;
  scores: Scores;
  actions: Action[];
}

export function simulate(
  actions: Action[],
  seed: Seed,
  initialResources: Resources,
  totalDays: number = 30,
  environmentData?: GameState['environmentData']
): SimulationResult {
  // Initialize game state
  let state: GameState = {
    currentLevel: 1,
    currentDay: 0,
    totalDays,
    resources: { 
      ...initialResources,
      solarEnergy: initialResources.solarEnergy || 0
    },
    actions: [],
    scores: {
      total: 0,
      yield: 0,
      water: 0,
      environment: 0,
      efficiency: 0,
    },
    achievements: [],
    isGameComplete: false,
  };

  // Process actions day by day
  for (let day = 0; day < totalDays; day++) {
    state.currentDay = day;
    
    // Get actions for this day
    const dayActions = actions.filter(action => action.day === day);
    
    // Process each action
    for (const action of dayActions) {
      state = processAction(state, action, seed);
    }
    
    // Apply daily effects with NASA data
    state = applyDailyEffects(state, seed, environmentData);
  }
  
  // Calculate final scores
  const scores = calculateScores(state, seed);
  state.scores = scores;
  state.isGameComplete = true;
  
  return {
    finalState: state,
    scores,
    actions: state.actions,
  };
}

function processAction(state: GameState, action: Action, seed: Seed): GameState {
  // Check if player has enough resources
  if (!hasEnoughResources(state.resources, action.cost)) {
    return state; // Action fails silently
  }
  
  // Deduct cost
  const newResources = deductResources(state.resources, action.cost);
  
  // Apply action effects
  let newState = { ...state, resources: newResources };
  
  switch (action.type) {
    case 'WATER':
      newState = simulateWater(newState, action, seed);
      break;
    case 'FERTILIZE':
      newState = simulateFertilization(newState, action, seed);
      break;
    case 'PLANT':
      newState = simulatePlanting(newState, action, seed);
      break;
    case 'HARVEST':
      newState = simulateHarvest(newState, action, seed);
      break;
    case 'SOLAR_CHARGE':
      newState = simulateSolarCharge(newState, action, seed);
      break;
    case 'IRRIGATE':
      newState = simulateIrrigation(newState, action, seed);
      break;
    case 'WAIT':
      // No additional effects
      break;
  }
  
  // Add action to history
  newState.actions.push(action);
  
  return newState;
}

function applyDailyEffects(state: GameState, seed: Seed, environmentData?: GameState['environmentData']): GameState {
  // Apply weather effects with NASA data
  const weatherEffects = getWeatherEffects(state.currentDay, seed, environmentData);
  
  // Apply frost risk
  const frostEffects = simulateFrost(state, seed);
  
  // Apply natural growth
  const growthEffects = getGrowthEffects(state, seed);
  
  // Apply solar energy generation based on weather
  const solarGeneration = Math.min(15, weatherEffects.solarRadiation * 2);
  
  // Combine all effects
  return {
    ...state,
    resources: {
      ...state.resources,
      water: Math.max(0, state.resources.water + weatherEffects.water),
      solarEnergy: Math.min(100, state.resources.solarEnergy + solarGeneration),
    },
  };
}

function hasEnoughResources(resources: Resources, cost: Resources): boolean {
  return (
    resources.water >= cost.water &&
    resources.fertilizer >= cost.fertilizer &&
    resources.money >= cost.money &&
    resources.seeds >= cost.seeds &&
    resources.solarEnergy >= (cost.solarEnergy || 0)
  );
}

function deductResources(resources: Resources, cost: Resources): Resources {
  return {
    water: Math.max(0, resources.water - cost.water),
    fertilizer: Math.max(0, resources.fertilizer - cost.fertilizer),
    money: Math.max(0, resources.money - cost.money),
    seeds: Math.max(0, resources.seeds - cost.seeds),
    solarEnergy: Math.max(0, resources.solarEnergy - (cost.solarEnergy || 0)),
  };
}

function simulatePlanting(state: GameState, action: Action, seed: Seed): GameState {
  // Planting logic - seeds are planted and will grow over time
  return state;
}

function simulateHarvest(state: GameState, action: Action, seed: Seed): GameState {
  // Harvest logic - convert planted crops to yield and money
  const yieldAmount = calculateYield(state, seed);
  const moneyEarned = yieldAmount * getCropPrice(seed.cropType);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      money: state.resources.money + moneyEarned,
    },
  };
}

function getWeatherEffects(day: number, seed: Seed, environmentData?: GameState['environmentData']): { water: number; solarRadiation: number } {
  // Use real NASA data if available
  if (environmentData) {
    // Real precipitation data from NASA GPM
    const precipitation = environmentData.precipitation || 0;
    
    // Calculate solar radiation based on temperature and season
    // Higher temperatures generally correlate with more solar radiation
    const baseRadiation = 5; // Base kWh/m²/day
    const tempFactor = Math.max(0, (environmentData.temperature - 15) / 20);
    const solarRadiation = baseRadiation + tempFactor * 3;
    
    return {
      water: precipitation,
      solarRadiation: Math.min(8, solarRadiation), // Cap at 8 kWh/m²/day
    };
  }
  
  // Fallback to simulated weather if no NASA data
  const rng = seededRNG(seed.id + day);
  const precipitation = rng() * 10; // 0-10mm
  const solarRadiation = 3 + rng() * 4; // 3-7 kWh/m²/day
  
  return {
    water: precipitation,
    solarRadiation,
  };
}

function getGrowthEffects(state: GameState, seed: Seed): any {
  // Natural crop growth over time
  return {};
}

function calculateYield(state: GameState, seed: Seed): number {
  // Calculate yield based on farming decisions and environmental factors
  const baseYield = 100;
  const waterBonus = Math.min(state.resources.water * 0.1, 50);
  const fertilizerBonus = Math.min(state.resources.fertilizer * 0.2, 30);
  
  return baseYield + waterBonus + fertilizerBonus;
}

function getCropPrice(cropType: string): number {
  const prices: Record<string, number> = {
    'carrot': 2.5,
    'tomato': 3.0,
    'lettuce': 1.5,
    'corn': 2.0,
  };
  
  return prices[cropType] || 2.0;
}

function simulateSolarCharge(state: GameState, action: Action, seed: Seed): GameState {
  // Solar charging increases solar energy based on weather conditions
  const weatherEffects = getWeatherEffects(state.currentDay, seed);
  const solarGain = Math.min(20, weatherEffects.solarRadiation * 2);
  
  return {
    ...state,
    resources: {
      ...state.resources,
      solarEnergy: Math.min(100, state.resources.solarEnergy + solarGain),
    },
  };
}

function simulateIrrigation(state: GameState, action: Action, seed: Seed): GameState {
  // Irrigation uses solar energy to water crops more efficiently
  const solarCost = Math.min(10, state.resources.solarEnergy);
  const waterGain = solarCost * 2; // More efficient than regular watering
  
  return {
    ...state,
    resources: {
      ...state.resources,
      solarEnergy: Math.max(0, state.resources.solarEnergy - solarCost),
      water: Math.min(100, state.resources.water + waterGain),
    },
  };
}

