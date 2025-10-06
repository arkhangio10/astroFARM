// Game state management with Zustand

import { create } from 'zustand';
import { GameState, Action, Resources, Scores, Achievement, Seed } from '@/types/game';
import { simulate } from '@/lib/engine';
import { calculateAchievements } from '@/lib/achievements';

interface GameStore extends GameState {
  // Actions
  initializeGame: (seed: Seed, initialResources: Resources) => void;
  performAction: (action: Action) => void;
  nextDay: () => void;
  completeLevel: () => void;
  resetGame: () => void;
  updateEnvironmentData: (data: GameState['environmentData']) => void;
  
  // Getters
  getCurrentResources: () => Resources;
  getCurrentScores: () => Scores;
  getRecentActions: (days: number) => Action[];
  getAchievements: () => Achievement[];
  
  // State
  seed: Seed | null;
  isInitialized: boolean;
}

const initialResources: Resources = {
  water: 100,
  fertilizer: 50,
  money: 200,
  seeds: 20,
  solarEnergy: 100,
};

const initialState: GameState = {
  currentLevel: 1,
  currentDay: 0,
  totalDays: 30,
  resources: initialResources,
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

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  seed: null,
  isInitialized: false,

  initializeGame: (seed: Seed, resources: Resources = initialResources) => {
    set({
      ...initialState,
      resources,
      seed,
      isInitialized: true,
    });
  },

  performAction: (action: Action) => {
    const state = get();
    if (!state.seed || state.isGameComplete) return;

    // Check if player has enough resources
    const hasResources = 
      state.resources.water >= action.cost.water &&
      state.resources.fertilizer >= action.cost.fertilizer &&
      state.resources.money >= action.cost.money &&
      state.resources.seeds >= action.cost.seeds &&
      state.resources.solarEnergy >= action.cost.solarEnergy;

    if (!hasResources) {
      // Action fails - could show error message
      return;
    }

    // Deduct resources
    const newResources = {
      water: Math.max(0, state.resources.water - action.cost.water),
      fertilizer: Math.max(0, state.resources.fertilizer - action.cost.fertilizer),
      money: Math.max(0, state.resources.money - action.cost.money),
      seeds: Math.max(0, state.resources.seeds - action.cost.seeds),
      solarEnergy: Math.max(0, state.resources.solarEnergy - action.cost.solarEnergy),
    };

    // Add action to history
    const newActions = [...state.actions, { ...action, day: state.currentDay }];

    set({
      resources: newResources,
      actions: newActions,
    });
  },

  nextDay: () => {
    const state = get();
    if (!state.seed || state.isGameComplete) return;

    const newDay = state.currentDay + 1;
    
    if (newDay >= state.totalDays) {
      // Game complete - calculate final scores
      const result = simulate(state.actions, state.seed, state.resources, state.totalDays);
      const newAchievements = calculateAchievements(
        { ...state, currentDay: newDay },
        result.scores,
        state.achievements
      );

      set({
        currentDay: newDay,
        scores: result.scores,
        achievements: [...state.achievements, ...newAchievements],
        isGameComplete: true,
      });
    } else {
      set({ currentDay: newDay });
    }
  },

  completeLevel: () => {
    const state = get();
    if (!state.seed || state.isGameComplete) return;

    // Calculate scores for current level
    const result = simulate(state.actions, state.seed, state.resources, state.currentDay + 1);
    const newAchievements = calculateAchievements(
      state,
      result.scores,
      state.achievements
    );

    set({
      scores: result.scores,
      achievements: [...state.achievements, ...newAchievements],
      currentLevel: state.currentLevel + 1,
    });
  },

  updateEnvironmentData: (data: GameState['environmentData']) => {
    set({ environmentData: data });
  },

  resetGame: () => {
    set({
      ...initialState,
      seed: null,
      isInitialized: false,
    });
  },

  getCurrentResources: () => {
    return get().resources;
  },

  getCurrentScores: () => {
    return get().scores;
  },

  getRecentActions: (days: number) => {
    const state = get();
    const cutoffDay = state.currentDay - days;
    return state.actions.filter(action => action.day >= cutoffDay);
  },

  getAchievements: () => {
    return get().achievements;
  },
}));

