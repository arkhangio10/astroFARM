// Location system for AstroFarm - 3 predefined regions

import { Location, ClimateData, VisualTheme, NasaDataSource } from '@/types/game';

export const GAME_LOCATIONS: Location[] = [
  {
    id: 'central-valley',
    name: 'California Central Valley',
    type: 'temperate',
    description: 'One of the most productive agricultural regions in the world, known for its Mediterranean climate and fertile soils.',
    climate: {
      averageTemperature: 18.5, // °C
      averageHumidity: 65, // %
      averagePrecipitation: 400, // mm/year
      solarRadiation: 5.8, // kWh/m²/day
      soilType: 'Alluvial and clay',
      growingSeason: 'March - November'
    },
    visualTheme: {
      skyColor: '#87CEEB',
      groundTexture: 'rich-brown-soil',
      vegetationColor: '#228B22',
      weatherEffects: ['gentle-breeze', 'occasional-rain'],
      particleEffects: ['dust-particles', 'sun-rays']
    },
    nasaDataSources: [
      {
        product: 'MODIS NDVI',
        resolution: '250m',
        frequency: '16 days',
        coverage: 'Global',
        limitations: ['Frequent cloudiness', 'Limited resolution']
      },
      {
        product: 'SMAP Soil Moisture',
        resolution: '1km',
        frequency: '3 days',
        coverage: 'Global',
        limitations: ['Limited soil penetration', 'Vegetation interference']
      },
      {
        product: 'MODIS LST',
        resolution: '1km',
        frequency: '8 days',
        coverage: 'Global',
        limitations: ['Cloudiness', 'Temporal variability']
      }
    ],
    challenges: [
      'Seasonal droughts',
      'Limited water management',
      'Extreme summer temperatures',
      'Pest pressure'
    ],
    advantages: [
      'Very fertile soils',
      'Stable Mediterranean climate',
      'Developed agricultural infrastructure',
      'Access to detailed satellite data'
    ]
  },
  {
    id: 'sahara-oasis',
    name: 'Sahara Oasis',
    type: 'arid',
    description: 'An oasis in the Sahara Desert where water is the most precious resource and every drop counts.',
    climate: {
      averageTemperature: 28.5, // °C
      averageHumidity: 25, // %
      averagePrecipitation: 50, // mm/year
      solarRadiation: 7.2, // kWh/m²/day
      soilType: 'Sand and clay',
      growingSeason: 'Year-round (with irrigation)'
    },
    visualTheme: {
      skyColor: '#FFD700',
      groundTexture: 'sandy-desert',
      vegetationColor: '#32CD32',
      weatherEffects: ['heat-haze', 'sand-storms'],
      particleEffects: ['sand-particles', 'heat-waves']
    },
    nasaDataSources: [
      {
        product: 'MODIS LST',
        resolution: '1km',
        frequency: '8 days',
        coverage: 'Global',
        limitations: ['Minimal cloudiness', 'Very accurate data']
      },
      {
        product: 'GPM Precipitation',
        resolution: '0.1°',
        frequency: '30 minutes',
        coverage: 'Global',
        limitations: ['Very scarce precipitation', 'Limited data']
      },
      {
        product: 'MODIS NDVI',
        resolution: '250m',
        frequency: '16 days',
        coverage: 'Global',
        limitations: ['Scarce vegetation', 'Limited data']
      }
    ],
    challenges: [
      'Extremely limited water resources',
      'Very high temperatures',
      'Intense evaporation',
      'Nutrient-poor soils'
    ],
    advantages: [
      'Abundant solar energy',
      'No frost',
      'Year-round growing',
      'Efficient irrigation technology'
    ]
  },
  {
    id: 'amazon-rainforest',
    name: 'Amazon Edge',
    type: 'tropical',
    description: 'At the edge of the Amazon rainforest, where biodiversity and humidity create a unique ecosystem.',
    climate: {
      averageTemperature: 26.0, // °C
      averageHumidity: 85, // %
      averagePrecipitation: 2000, // mm/year
      solarRadiation: 4.5, // kWh/m²/day
      soilType: 'Tropical and clay',
      growingSeason: 'Year-round'
    },
    visualTheme: {
      skyColor: '#87CEEB',
      groundTexture: 'rich-tropical-soil',
      vegetationColor: '#006400',
      weatherEffects: ['tropical-rain', 'humidity-mist'],
      particleEffects: ['rain-drops', 'humidity-particles']
    },
    nasaDataSources: [
      {
        product: 'MODIS NDVI',
        resolution: '250m',
        frequency: '16 days',
        coverage: 'Global',
        limitations: ['Constant cloudiness', 'Limited data']
      },
      {
        product: 'GPM Precipitation',
        resolution: '0.1°',
        frequency: '30 minutes',
        coverage: 'Global',
        limitations: ['Very high precipitation', 'Reliable data']
      },
      {
        product: 'MODIS LST',
        resolution: '1km',
        frequency: '8 days',
        coverage: 'Global',
        limitations: ['Cloudiness', 'Limited data']
      }
    ],
    challenges: [
      'Excess humidity',
      'Fungal diseases',
      'Torrential rains',
      'Competition with native vegetation'
    ],
    advantages: [
      'Abundant water',
      'High biodiversity',
      'Nutrient-rich soils',
      'Rapid crop growth'
    ]
  }
];

export function getLocationById(id: string): Location | null {
  return GAME_LOCATIONS.find(location => location.id === id) || null;
}

export function getLocationsByType(type: 'arid' | 'temperate' | 'tropical'): Location[] {
  return GAME_LOCATIONS.filter(location => location.type === type);
}

export function getLocationRecommendations(playerLevel: number, completedLevels: number[]): Location[] {
  // Recommend locations based on player progress
  if (completedLevels.length === 0) {
    // New players start with Central Valley
    return [GAME_LOCATIONS[0]];
  }
  
  if (completedLevels.length < 3) {
    // Intermediate players can choose between Central Valley and Sahara
    return [GAME_LOCATIONS[0], GAME_LOCATIONS[1]];
  }
  
  // Advanced players can access all locations
  return GAME_LOCATIONS;
}

export function getLocationDifficulty(locationId: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (locationId) {
    case 'central-valley':
      return 'beginner';
    case 'sahara-oasis':
      return 'intermediate';
    case 'amazon-rainforest':
      return 'advanced';
    default:
      return 'beginner';
  }
}

export function getLocationResourceMultipliers(locationId: string): {
  water: number;
  solarEnergy: number;
  fertilizer: number;
  money: number;
} {
  switch (locationId) {
    case 'central-valley':
      return { water: 1.0, solarEnergy: 1.0, fertilizer: 1.0, money: 1.0 };
    case 'sahara-oasis':
      return { water: 0.3, solarEnergy: 2.0, fertilizer: 0.8, money: 1.2 };
    case 'amazon-rainforest':
      return { water: 2.0, solarEnergy: 0.7, fertilizer: 1.5, money: 0.9 };
    default:
      return { water: 1.0, solarEnergy: 1.0, fertilizer: 1.0, money: 1.0 };
  }
}

export function getLocationEducationalContent(locationId: string): {
  tips: string[];
  challenges: string[];
  learningObjectives: string[];
} {
  const location = getLocationById(locationId);
  if (!location) {
    return { tips: [], challenges: [], learningObjectives: [] };
  }

  const baseTips = [
    'Monitor NASA data regularly',
    'Adapt your strategies to local climate',
    'Use resources efficiently',
    'Learn from historical climate patterns'
  ];

  const locationSpecificTips = {
    'central-valley': [
      'The Central Valley has a stable Mediterranean climate',
      'Water management is crucial during summer',
      'Use SMAP data to monitor soil moisture',
      'Temperatures can be extreme in summer'
    ],
    'sahara-oasis': [
      'Every drop of water is precious in the desert',
      'Solar energy is abundant - use it efficiently',
      'Drip irrigation is essential for water conservation',
      'Monitor evaporation constantly'
    ],
    'amazon-rainforest': [
      'High humidity can cause fungal diseases',
      'Use abundant rainfall to your advantage',
      'Biodiversity can help with pest control',
      'Excess water can be as problematic as scarcity'
    ]
  };

  return {
    tips: [...baseTips, ...(locationSpecificTips[locationId as keyof typeof locationSpecificTips] || [])],
    challenges: location.challenges,
    learningObjectives: [
      'Understand the impact of climate on agriculture',
      'Learn to use satellite data for decision-making',
      'Develop resource management strategies',
      'Understand agricultural sustainability'
    ]
  };
}
