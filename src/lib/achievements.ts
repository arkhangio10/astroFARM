// Achievement system for AstroFarm

import { GameState, Achievement, AchievementType, AchievementTier, Scores } from '@/types/game';

export interface AchievementCriteria {
  minScore?: number;
  maxWaterUsage?: number;
  minOrganicActions?: number;
  consecutiveLevels?: number;
  perfectEnvironment?: boolean;
}

export function calculateAchievements(
  state: GameState,
  scores: Scores,
  previousAchievements: Achievement[]
): Achievement[] {
  const newAchievements: Achievement[] = [];
  
  // Check for Super Carrot achievement
  const superCarrot = checkSuperCarrotAchievement(scores, previousAchievements);
  if (superCarrot) {
    newAchievements.push(superCarrot);
  }
  
  // Check for other achievements
  const waterSaver = checkWaterSaverAchievement(state, scores);
  if (waterSaver) {
    newAchievements.push(waterSaver);
  }
  
  const yieldMaster = checkYieldMasterAchievement(scores);
  if (yieldMaster) {
    newAchievements.push(yieldMaster);
  }
  
  const environmentalist = checkEnvironmentalistAchievement(state, scores);
  if (environmentalist) {
    newAchievements.push(environmentalist);
  }
  
  return newAchievements;
}

function checkSuperCarrotAchievement(
  scores: Scores,
  previousAchievements: Achievement[]
): Achievement | null {
  const tier = getSuperCarrotTier(scores);
  if (!tier) return null;
  
  // Check if player already has this tier or higher
  const existingSuperCarrot = previousAchievements.find(a => a.type === 'SUPER_CARROT');
  if (existingSuperCarrot && isTierHigherOrEqual(existingSuperCarrot.tier, tier)) {
    return null;
  }
  
  return {
    id: `super_carrot_${tier.toLowerCase()}_${Date.now()}`,
    type: 'SUPER_CARROT',
    tier,
    title: getSuperCarrotTitle(tier),
    description: getSuperCarrotDescription(tier, scores),
    earnedAt: new Date(),
    metadata: {
      scores,
      tier,
    },
  };
}

function getSuperCarrotTier(scores: Scores): AchievementTier | null {
  if (scores.total >= 92 && scores.environment >= 95) {
    return 'PLATINUM';
  } else if (scores.total >= 85 && scores.water >= 80) {
    return 'GOLD';
  } else if (scores.total >= 75) {
    return 'SILVER';
  } else if (scores.total >= 60) {
    return 'BRONZE';
  }
  return null;
}

function getSuperCarrotTitle(tier: AchievementTier): string {
  const titles = {
    'BRONZE': '🥉 Bronze Super Carrot',
    'SILVER': '🥈 Silver Super Carrot',
    'GOLD': '🥇 Gold Super Carrot',
    'PLATINUM': '💎 Platinum Super Carrot',
  };
  return titles[tier];
}

function getSuperCarrotDescription(tier: AchievementTier, scores: Scores): string {
  const descriptions = {
    'BRONZE': `Good farming! You achieved a total score of ${scores.total} with balanced practices.`,
    'SILVER': `Excellent work! Your score of ${scores.total} shows strong farming skills.`,
    'GOLD': `Outstanding! Score of ${scores.total} with efficient water usage (${scores.water}).`,
    'PLATINUM': `Perfect! Score of ${scores.total} with minimal environmental impact (${scores.environment}).`,
  };
  return descriptions[tier];
}

function checkWaterSaverAchievement(
  state: GameState,
  scores: Scores
): Achievement | null {
  if (scores.water >= 90) {
    return {
      id: `water_saver_${Date.now()}`,
      type: 'WATER_SAVER',
      tier: 'GOLD',
      title: '💧 Water Saver',
      description: `Amazing water efficiency! You achieved a water score of ${scores.water} by using water wisely.`,
      earnedAt: new Date(),
      metadata: {
        waterScore: scores.water,
        waterActions: state.actions.filter(a => a.type === 'WATER').length,
      },
    };
  }
  return null;
}

function checkYieldMasterAchievement(scores: Scores): Achievement | null {
  if (scores.yield >= 90) {
    return {
      id: `yield_master_${Date.now()}`,
      type: 'YIELD_MASTER',
      tier: 'GOLD',
      title: '🌾 Yield Master',
      description: `Incredible yield! You achieved a yield score of ${scores.yield} through optimal farming practices.`,
      earnedAt: new Date(),
      metadata: {
        yieldScore: scores.yield,
      },
    };
  }
  return null;
}

function checkEnvironmentalistAchievement(
  state: GameState,
  scores: Scores
): Achievement | null {
  const organicActions = state.actions.filter(a => 
    a.type === 'FERTILIZE' && a.payload.type === 'organic'
  ).length;
  
  if (scores.environment >= 90 && organicActions >= 3) {
    return {
      id: `environmentalist_${Date.now()}`,
      type: 'ENVIRONMENTALIST',
      tier: 'PLATINUM',
      title: '🌍 Environmental Champion',
      description: `Perfect environmental stewardship! Score of ${scores.environment} with ${organicActions} organic practices.`,
      earnedAt: new Date(),
      metadata: {
        environmentScore: scores.environment,
        organicActions,
      },
    };
  }
  return null;
}

function isTierHigherOrEqual(current: AchievementTier, target: AchievementTier): boolean {
  const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentIndex = tierOrder.indexOf(current);
  const targetIndex = tierOrder.indexOf(target);
  return currentIndex >= targetIndex;
}

export function getAchievementIcon(type: AchievementType, tier: AchievementTier): string {
  const icons = {
    'SUPER_CARROT': {
      'BRONZE': '🥉',
      'SILVER': '🥈',
      'GOLD': '🥇',
      'PLATINUM': '💎',
    },
    'WATER_SAVER': '💧',
    'YIELD_MASTER': '🌾',
    'ENVIRONMENTALIST': '🌍',
  };
  
  if (type === 'SUPER_CARROT') {
    return icons[type][tier];
  }
  
  return icons[type] || '🏆';
}

export function getAchievementColor(tier: AchievementTier): string {
  const colors = {
    'BRONZE': '#cd7f32',
    'SILVER': '#c0c0c0',
    'GOLD': '#ffd700',
    'PLATINUM': '#e5e4e2',
  };
  return colors[tier];
}

