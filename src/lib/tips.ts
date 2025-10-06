// Tips engine for contextual educational content

import { GameState, TipRule, TipContext } from '@/types/game';

// Interface extendida para tips con datos NASA
export interface NASAEnhancedTipRule extends TipRule {
  dataSource?: string;
  resolution?: string;
  nasaDataRequired?: boolean;
}

// Tips originales del juego
export const TIP_RULES: TipRule[] = [
  {
    id: 'water_efficiency',
    when: (state) => state.resources.water < 20,
    message: (context) => '💧 Low water! Consider waiting for rain or using drip irrigation for better efficiency.',
    severity: 'warning',
    cooldownTurns: 3,
    tags: ['water', 'efficiency'],
  },
  {
    id: 'over_watering',
    when: (state) => {
      const waterActions = state.actions.filter(a => a.type === 'WATER');
      return waterActions.length > 5;
    },
    message: (context) => '⚠️ Over-watering detected! Too much water can harm crops and waste resources.',
    severity: 'warning',
    cooldownTurns: 2,
    tags: ['water', 'environment'],
  },
  {
    id: 'fertilizer_timing',
    when: (state) => {
      const fertilizerActions = state.actions.filter(a => a.type === 'FERTILIZE');
      return fertilizerActions.length === 0 && state.currentDay > 10;
    },
    message: (context) => '🌱 Consider fertilizing! Crops need nutrients to grow, but timing is important.',
    severity: 'info',
    cooldownTurns: 5,
    tags: ['fertilizer', 'timing'],
  },
  {
    id: 'organic_fertilizer',
    when: (state) => {
      const fertilizerActions = state.actions.filter(a => 
        a.type === 'FERTILIZE' && a.payload.type === 'synthetic'
      );
      return fertilizerActions.length > 2;
    },
    message: (context) => '🌿 Try organic fertilizer! It\'s better for the environment and soil health.',
    severity: 'edu',
    cooldownTurns: 4,
    tags: ['fertilizer', 'environment', 'organic'],
  },
  {
    id: 'frost_warning',
    when: (state) => {
      // Simplified frost detection
      const season = Math.floor(state.currentDay / 90);
      return season === 0 || season === 3; // Spring or winter
    },
    message: (context) => '❄️ Frost risk! Check temperature data and consider protecting your crops.',
    severity: 'warning',
    cooldownTurns: 7,
    tags: ['frost', 'weather', 'protection'],
  },
  {
    id: 'data_limitations',
    when: (state) => state.currentDay === 0,
    message: (context) => '📊 Remember: Satellite data has limitations. Resolution is ~250m, so pixel values represent large areas.',
    severity: 'edu',
    cooldownTurns: 10,
    tags: ['data', 'limitations', 'resolution'],
  },
  {
    id: 'cloud_cover',
    when: (state) => {
      // Simulate cloud cover detection
      return Math.random() < 0.3;
    },
    message: (context) => '☁️ Cloud cover detected! NDVI values may be affected. Check multiple dates for accuracy.',
    severity: 'info',
    cooldownTurns: 6,
    tags: ['clouds', 'ndvi', 'accuracy'],
  },
  {
    id: 'drought_conditions',
    when: (state) => {
      const waterActions = state.actions.filter(a => a.type === 'WATER');
      return waterActions.length === 0 && state.currentDay > 15;
    },
    message: (context) => '🌵 Drought conditions! This region experiences frequent droughts. Water management is crucial.',
    severity: 'warning',
    cooldownTurns: 8,
    tags: ['drought', 'water', 'region'],
  },
  {
    id: 'yield_optimization',
    when: (state) => {
      const harvestActions = state.actions.filter(a => a.type === 'HARVEST');
      return harvestActions.length === 0 && state.currentDay > 25;
    },
    message: (context) => '🌾 Time to harvest! Optimal harvest timing maximizes yield and quality.',
    severity: 'info',
    cooldownTurns: 3,
    tags: ['harvest', 'yield', 'timing'],
  },
  {
    id: 'sustainable_practices',
    when: (state) => {
      const organicActions = state.actions.filter(a => 
        a.type === 'FERTILIZE' && a.payload.type === 'organic'
      );
      return organicActions.length >= 2;
    },
    message: (context) => '🌍 Great sustainable practices! Organic farming helps preserve soil health and biodiversity.',
    severity: 'edu',
    cooldownTurns: 5,
    tags: ['sustainability', 'organic', 'environment'],
  },
  {
    id: 'cost_management',
    when: (state) => state.resources.money < 50,
    message: (context) => '💰 Low budget! Plan your expenses carefully. Some actions are more cost-effective than others.',
    severity: 'warning',
    cooldownTurns: 4,
    tags: ['money', 'cost', 'planning'],
  },
  {
    id: 'seasonal_planning',
    when: (state) => state.currentDay === 5,
    message: (context) => '📅 Plan for the season! Different crops have different growing seasons and requirements.',
    severity: 'edu',
    cooldownTurns: 15,
    tags: ['planning', 'seasons', 'crops'],
  },
];

export function evaluateTips(state: GameState, context: TipContext): TipRule[] {
  const activeTips: TipRule[] = [];
  const cooldownMap = new Map<string, number>();
  
  // Check each rule
  for (const rule of TIP_RULES) {
    // Check cooldown
    if (rule.cooldownTurns && cooldownMap.has(rule.id)) {
      const lastShown = cooldownMap.get(rule.id)!;
      if (state.currentDay - lastShown < rule.cooldownTurns) {
        continue;
      }
    }
    
    // Check if rule condition is met
    if (rule.when(state)) {
      activeTips.push(rule);
      cooldownMap.set(rule.id, state.currentDay);
    }
  }
  
  return activeTips;
}

export function getTipMessage(rule: TipRule, context: TipContext): string {
  return rule.message(context);
}

export function getTipSeverity(rule: TipRule): 'info' | 'warning' | 'edu' {
  return rule.severity;
}

export function getTipTags(rule: TipRule): string[] {
  return rule.tags || [];
}

// Tips mejorados con datos NASA
export const NASA_ENHANCED_TIPS: NASAEnhancedTipRule[] = [
  {
    id: 'nasa_ndvi_critical',
    when: (state, context) => (context as any).nasaData?.ndvi < 0.3,
    message: (context) => `🛰️ NASA ALERT: Critical NDVI (${((context as any).nasaData?.ndvi || 0).toFixed(2)}). Your crop shows severe stress. Check water and nutrients immediately.`,
    severity: 'warning',
    cooldownTurns: 5,
    tags: ['nasa', 'ndvi', 'critical'],
    dataSource: 'NASA MODIS',
    resolution: '250m',
    nasaDataRequired: true
  },
  {
    id: 'nasa_ndvi_low',
    when: (state, context) => (context as any).nasaData?.ndvi >= 0.3 && (context as any).nasaData?.ndvi < 0.5,
    message: (context) => `📡 MODIS Data: Low NDVI (${((context as any).nasaData?.ndvi || 0).toFixed(2)}). Vegetation is stressed. Consider increasing irrigation.`,
    severity: 'info',
    cooldownTurns: 4,
    tags: ['nasa', 'ndvi', 'stress'],
    dataSource: 'NASA MODIS',
    resolution: '250m',
    nasaDataRequired: true
  },
  {
    id: 'nasa_soil_moisture_critical',
    when: (state, context) => (context as any).nasaData?.soilMoisture < 0.2,
    message: (context) => `🏜️ SMAP ALERT: Critical soil moisture (<20%). Risk of total crop loss. Water NOW!`,
    severity: 'warning',
    cooldownTurns: 3,
    tags: ['nasa', 'soil', 'critical'],
    dataSource: 'NASA SMAP',
    resolution: '9km',
    nasaDataRequired: true
  },
  {
    id: 'nasa_temperature_frost',
    when: (state, context) => (context as any).nasaData?.temperature < 2,
    message: (context) => `❄️ MODIS detects temperature near freezing (${((context as any).nasaData?.temperature || 0).toFixed(1)}°C). Protect sensitive crops NOW.`,
    severity: 'warning',
    cooldownTurns: 6,
    tags: ['nasa', 'temperature', 'frost'],
    dataSource: 'NASA MODIS LST',
    resolution: '1km',
    nasaDataRequired: true
  },
  {
    id: 'nasa_heat_stress',
    when: (state, context) => (context as any).nasaData?.temperature > 35,
    message: (context) => `🔥 Satellite detects heat stress (${((context as any).nasaData?.temperature || 0).toFixed(1)}°C). Increase irrigation and consider shade.`,
    severity: 'warning',
    cooldownTurns: 4,
    tags: ['nasa', 'temperature', 'heat'],
    dataSource: 'NASA MODIS LST',
    resolution: '1km',
    nasaDataRequired: true
  },
  {
    id: 'nasa_precipitation_incoming',
    when: (state, context) => (context as any).nasaData?.precipitationForecast > 20,
    message: (context) => `🌧️ GPM predicts heavy rain (${((context as any).nasaData?.precipitationForecast || 0).toFixed(0)}mm). Reduce irrigation preventively.`,
    severity: 'info',
    cooldownTurns: 8,
    tags: ['nasa', 'rain', 'forecast'],
    dataSource: 'NASA GPM',
    resolution: '10km',
    nasaDataRequired: true
  },
  {
    id: 'nasa_optimal_conditions',
    when: (state, context) => {
      const nasa = (context as any).nasaData;
      return nasa?.ndvi > 0.6 && nasa?.soilMoisture > 0.4 && nasa?.temperature > 15 && nasa?.temperature < 30;
    },
    message: (context) => '🌟 Datos NASA muestran condiciones ÓPTIMAS. ¡Momento perfecto para maximizar crecimiento!',
    severity: 'edu',
    cooldownTurns: 10,
    tags: ['nasa', 'optimal', 'growth'],
    dataSource: 'NASA Multi-sensor',
    nasaDataRequired: true
  },
  {
    id: 'nasa_cloud_interference',
    when: (state, context) => (context as any).nasaData?.cloudCover > 0.7,
    message: (context) => '☁️ Alta cobertura de nubes afecta precisión NDVI. Usa datos históricos o espera cielo despejado.',
    severity: 'info',
    cooldownTurns: 5,
    tags: ['nasa', 'clouds', 'data-quality'],
    dataSource: 'NASA MODIS',
    nasaDataRequired: true
  },
  {
    id: 'nasa_data_age_warning',
    when: (state, context) => {
      const dataAge = (context as any).nasaData?.dataAge;
      return dataAge && dataAge > 7; // días
    },
    message: (context) => `⏰ Datos satelitales tienen ${(context as any).nasaData?.dataAge} días. Pueden no reflejar condiciones actuales.`,
    severity: 'info',
    cooldownTurns: 12,
    tags: ['nasa', 'data-age', 'latency'],
    nasaDataRequired: true
  },
  {
    id: 'nasa_resolution_reminder',
    when: (state) => state.currentDay === 1 || state.currentDay % 10 === 0,
    message: (context) => '📏 Recuerda: Los datos SMAP cubren 9km². Tu parcela puede tener variaciones locales no detectadas.',
    severity: 'edu',
    cooldownTurns: 20,
    tags: ['nasa', 'resolution', 'education'],
    dataSource: 'NASA SMAP',
    resolution: '9km'
  }
];

// Función para evaluar tips NASA mejorados
export function evaluateNASATips(
  state: GameState, 
  context: TipContext & { nasaData?: any }
): NASAEnhancedTipRule[] {
  const activeTips: NASAEnhancedTipRule[] = [];
  
  // Evaluar tips NASA solo si hay datos disponibles
  if (context.nasaData) {
    for (const rule of NASA_ENHANCED_TIPS) {
      if (!rule.nasaDataRequired || context.nasaData) {
        if (rule.when(state, context)) {
          activeTips.push(rule);
        }
      }
    }
  }
  
  return activeTips;
}

// Función combinada para todos los tips
export function evaluateAllTips(
  state: GameState,
  context: TipContext & { nasaData?: any }
): (TipRule | NASAEnhancedTipRule)[] {
  const regularTips = evaluateTips(state, context);
  const nasaTips = evaluateNASATips(state, context);
  
  // Combinar y priorizar tips NASA cuando están disponibles
  return [...nasaTips, ...regularTips];
}

