// Mock data for development and testing

import { Seed } from '@/types/game';

export const mockSeeds: Seed[] = [
  {
    id: 'demo-seed-1',
    code: 'WEEK-2025-01-15',
    region: 'Central Valley, California',
    dateStart: '2025-01-15',
    dateEnd: '2025-02-15',
    cropType: 'carrot',
    targets: {
      minHumidity: 0.6,
      minNDVI: 0.4,
      maxTemperature: 35,
      minYield: 80,
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
    notes: 'Demo seed for development and testing',
  },
  {
    id: 'demo-seed-2',
    code: 'WEEK-2025-01-22',
    region: 'Central Valley, California',
    dateStart: '2025-01-22',
    dateEnd: '2025-02-22',
    cropType: 'tomato',
    targets: {
      minHumidity: 0.7,
      minNDVI: 0.5,
      maxTemperature: 30,
      minYield: 90,
    },
    weights: {
      yield: 0.5,
      water: 0.25,
      environment: 0.25,
    },
    datasets: {
      ndvi: '/data/tiles/ndvi',
      soilMoisture: '/data/tiles/soil',
      temperature: '/data/tiles/temp',
      precipitation: '/data/tiles/precip',
      cloudMask: '/data/tiles/clouds',
    },
    notes: 'Tomato farming challenge with higher yield targets',
  },
];

export const mockGameData = {
  initialResources: {
    water: 100,
    fertilizer: 50,
    money: 200,
    seeds: 20,
    solarEnergy: 0,
  },
  actionCosts: {
    WATER: { water: 0, fertilizer: 0, money: 5, seeds: 0, solarEnergy: 0 },
    FERTILIZE: { water: 0, fertilizer: 5, money: 10, seeds: 0, solarEnergy: 0 },
    PLANT: { water: 0, fertilizer: 0, money: 15, seeds: 1, solarEnergy: 0 },
    HARVEST: { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 },
    WAIT: { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 },
  },
  gameParameters: {
    totalDays: 30,
    levels: 5,
    achievementThresholds: {
      BRONZE: 60,
      SILVER: 75,
      GOLD: 85,
      PLATINUM: 92,
    },
  },
};

export const mockLeaderboardData = [
  {
    rank: 1,
    playerAlias: 'FarmerPro',
    scoreTotal: 95,
    tier: 'PLATINUM',
    durationS: 1200,
  },
  {
    rank: 2,
    playerAlias: 'GreenThumb',
    scoreTotal: 88,
    tier: 'GOLD',
    durationS: 1350,
  },
  {
    rank: 3,
    playerAlias: 'EcoWarrior',
    scoreTotal: 82,
    tier: 'GOLD',
    durationS: 1100,
  },
  {
    rank: 4,
    playerAlias: 'WaterSaver',
    scoreTotal: 78,
    tier: 'SILVER',
    durationS: 1400,
  },
  {
    rank: 5,
    playerAlias: 'CropMaster',
    scoreTotal: 72,
    tier: 'SILVER',
    durationS: 1250,
  },
];

export const mockAchievements = [
  {
    id: 'achievement-1',
    type: 'SUPER_CARROT',
    tier: 'GOLD',
    title: '🥇 Gold Super Carrot',
    description: 'Outstanding! Score of 88 with efficient water usage (85).',
    earnedAt: new Date(),
    metadata: {
      scores: { total: 88, yield: 90, water: 85, environment: 89 },
      tier: 'GOLD',
    },
  },
  {
    id: 'achievement-2',
    type: 'WATER_SAVER',
    tier: 'GOLD',
    title: '💧 Water Saver',
    description: 'Amazing water efficiency! You achieved a water score of 92 by using water wisely.',
    earnedAt: new Date(),
    metadata: {
      waterScore: 92,
      waterActions: 8,
    },
  },
];

export const mockTips = [
  {
    id: 'water_efficiency',
    message: '💧 Low water! Consider waiting for rain or using drip irrigation for better efficiency.',
    severity: 'warning',
    tags: ['water', 'efficiency'],
  },
  {
    id: 'fertilizer_timing',
    message: '🌱 Consider fertilizing! Crops need nutrients to grow, but timing is important.',
    severity: 'info',
    tags: ['fertilizer', 'timing'],
  },
  {
    id: 'data_limitations',
    message: '📊 Remember: Satellite data has limitations. Resolution is ~250m, so pixel values represent large areas.',
    severity: 'edu',
    tags: ['data', 'limitations', 'resolution'],
  },
];

