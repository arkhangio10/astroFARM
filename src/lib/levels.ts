// Game levels configuration and management

import { Seed } from '@/types/game';

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // days
  initialResources: {
    water: number;
    fertilizer: number;
    money: number;
    seeds: number;
  };
  targets: {
    minScore: number;
    minYield: number;
    maxWaterUsage: number;
    minEnvironmentScore: number;
  };
  tips: string[];
  challenges: string[];
  rewards: {
    achievements: string[];
    unlocks: string[];
  };
}

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Humidity Management',
    description: 'Learn to manage water efficiently with weather forecasts',
    objective: 'Maintain optimal soil moisture while conserving water',
    difficulty: 'beginner',
    duration: 7,
    initialResources: {
      water: 100,
      fertilizer: 30,
      money: 150,
      seeds: 15,
    },
    targets: {
      minScore: 60,
      minYield: 70,
      maxWaterUsage: 80,
      minEnvironmentScore: 65,
    },
    tips: [
      'Check weather forecasts before watering',
      'Use drip irrigation for better efficiency',
      'Monitor soil moisture levels regularly',
      'Water early in the morning to reduce evaporation',
    ],
    challenges: [
      'Drought conditions expected',
      'High evaporation rates',
      'Limited water resources',
    ],
    rewards: {
      achievements: ['WATER_SAVER'],
      unlocks: ['Advanced irrigation systems'],
    },
  },
  {
    id: 2,
    name: 'NDVI Interpretation',
    description: 'Distinguish between cloud cover and crop stress using satellite data',
    objective: 'Interpret vegetation health from satellite imagery',
    difficulty: 'beginner',
    duration: 10,
    initialResources: {
      water: 120,
      fertilizer: 40,
      money: 180,
      seeds: 18,
    },
    targets: {
      minScore: 70,
      minYield: 80,
      maxWaterUsage: 90,
      minEnvironmentScore: 70,
    },
    tips: [
      'NDVI values above 0.6 indicate healthy vegetation',
      'Cloud cover can affect NDVI readings',
      'Compare multiple dates for accurate assessment',
      'Low NDVI may indicate stress or disease',
    ],
    challenges: [
      'Frequent cloud cover',
      'Variable weather conditions',
      'Need to distinguish stress from clouds',
    ],
    rewards: {
      achievements: ['DATA_ANALYST'],
      unlocks: ['Cloud mask analysis'],
    },
  },
  {
    id: 3,
    name: 'Frost Protection',
    description: 'Time planting to avoid frost damage using temperature data',
    objective: 'Protect crops from frost damage using weather predictions',
    difficulty: 'intermediate',
    duration: 14,
    initialResources: {
      water: 140,
      fertilizer: 50,
      money: 200,
      seeds: 20,
    },
    targets: {
      minScore: 75,
      minYield: 85,
      maxWaterUsage: 100,
      minEnvironmentScore: 75,
    },
    tips: [
      'Monitor temperature forecasts closely',
      'Plant after last frost date',
      'Use row covers for protection',
      'Consider crop varieties with frost tolerance',
    ],
    challenges: [
      'Unpredictable frost events',
      'Early spring planting pressure',
      'Temperature fluctuations',
    ],
    rewards: {
      achievements: ['FROST_MASTER'],
      unlocks: ['Frost protection systems'],
    },
  },
  {
    id: 4,
    name: 'Drought Response',
    description: 'Manage water during extended dry periods',
    objective: 'Maintain crop health during drought conditions',
    difficulty: 'advanced',
    duration: 21,
    initialResources: {
      water: 80,
      fertilizer: 60,
      money: 250,
      seeds: 25,
    },
    targets: {
      minScore: 80,
      minYield: 90,
      maxWaterUsage: 60,
      minEnvironmentScore: 85,
    },
    tips: [
      'Implement water-saving techniques',
      'Choose drought-resistant crops',
      'Use mulching to retain moisture',
      'Monitor soil moisture continuously',
    ],
    challenges: [
      'Extended dry period',
      'Water restrictions',
      'High evaporation rates',
      'Crop stress management',
    ],
    rewards: {
      achievements: ['DROUGHT_WARRIOR'],
      unlocks: ['Drought-resistant varieties'],
    },
  },
  {
    id: 5,
    name: 'Final Challenge',
    description: 'Optimize all farming practices for maximum yield and sustainability',
    objective: 'Achieve perfect balance of yield, efficiency, and environmental impact',
    difficulty: 'expert',
    duration: 30,
    initialResources: {
      water: 150,
      fertilizer: 80,
      money: 300,
      seeds: 30,
    },
    targets: {
      minScore: 90,
      minYield: 95,
      maxWaterUsage: 120,
      minEnvironmentScore: 90,
    },
    tips: [
      'Balance all farming practices',
      'Use precision agriculture techniques',
      'Monitor all environmental factors',
      'Optimize resource allocation',
    ],
    challenges: [
      'Multiple weather events',
      'Resource constraints',
      'High performance expectations',
      'Complex decision making',
    ],
    rewards: {
      achievements: ['SUPER_CARROT_PLATINUM', 'MASTER_FARMER'],
      unlocks: ['All advanced systems', 'Expert mode'],
    },
  },
];

export function getLevelConfig(levelId: number): LevelConfig | null {
  return GAME_LEVELS.find(level => level.id === levelId) || null;
}

export function getNextLevel(currentLevel: number): LevelConfig | null {
  return getLevelConfig(currentLevel + 1);
}

export function isLevelUnlocked(levelId: number, completedLevels: number[]): boolean {
  if (levelId === 1) return true; // First level is always unlocked
  return completedLevels.includes(levelId - 1);
}

export function getLevelProgress(levelId: number, scores: any): {
  completed: boolean;
  progress: number;
  achievements: string[];
} {
  const level = getLevelConfig(levelId);
  if (!level) return { completed: false, progress: 0, achievements: [] };

  const progress = Math.min(100, (scores.total / level.targets.minScore) * 100);
  const completed = scores.total >= level.targets.minScore;
  
  const achievements: string[] = [];
  if (completed) {
    achievements.push(...level.rewards.achievements);
  }

  return { completed, progress, achievements };
}

export function createSeedForLevel(levelId: number): Seed {
  const level = getLevelConfig(levelId);
  if (!level) {
    throw new Error(`Level ${levelId} not found`);
  }

  return {
    id: `level-${levelId}-seed`,
    code: `LEVEL-${levelId}-${Date.now()}`,
    region: 'Central Valley, California',
    dateStart: new Date().toISOString().split('T')[0],
    dateEnd: new Date(Date.now() + level.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cropType: 'carrot',
    targets: {
      minHumidity: 0.6,
      minNDVI: 0.4,
      maxTemperature: 35,
      minYield: level.targets.minYield,
    },
    weights: {
      yield: 0.4,
      water: 0.3,
      environment: 0.3,
    },
    datasets: {
      ndvi: '/data/tiles/ndvi',
      soilMoisture: '/data/tiles/soil',
      temperature: '/data/tiles/temp',
      precipitation: '/data/tiles/precip',
      cloudMask: '/data/tiles/clouds',
    },
    notes: `Level ${levelId}: ${level.name}`,
  };
}
