// Game configuration constants

export const GAME_CONFIG = {
  // Resource limits
  MAX_WATER: 200,
  MAX_FERTILIZER: 100,
  MAX_MONEY: 1000,
  MAX_SEEDS: 50,
  
  // Action costs
  ACTION_COSTS: {
    WATER: { water: 0, fertilizer: 0, money: 5, seeds: 0 },
    FERTILIZE: { water: 0, fertilizer: 5, money: 10, seeds: 0 },
    PLANT: { water: 0, fertilizer: 0, money: 15, seeds: 1 },
    HARVEST: { water: 0, fertilizer: 0, money: 0, seeds: 0 },
    WAIT: { water: 0, fertilizer: 0, money: 0, seeds: 0 },
  },
  
  // Game parameters
  TOTAL_DAYS: 30,
  LEVELS: 5,
  
  // Achievement thresholds
  ACHIEVEMENT_THRESHOLDS: {
    BRONZE: 60,
    SILVER: 75,
    GOLD: 85,
    PLATINUM: 92,
  },
  
  // Tip cooldowns (in days)
  TIP_COOLDOWNS: {
    water_efficiency: 3,
    over_watering: 2,
    fertilizer_timing: 5,
    organic_fertilizer: 4,
    frost_warning: 7,
    data_limitations: 10,
    cloud_cover: 6,
    drought_conditions: 8,
    yield_optimization: 3,
    sustainable_practices: 5,
    cost_management: 4,
    seasonal_planning: 15,
  },
  
  // Data limitations
  DATA_LIMITATIONS: [
    'Resolution: ~250m (pixels represent large areas)',
    'Latency: 1-2 days for data processing',
    'Cloud cover affects data quality',
    'Temporal resolution: 8-16 day composites',
    'Regional coverage: Central Valley, California',
  ],
  
  // NASA data sources
  NASA_SOURCES: {
    NDVI: {
      name: 'MODIS NDVI (MCD13Q1)',
      resolution: '250m',
      temporal: '16-day composite',
      source: 'NASA LP DAAC',
      product: 'MCD13Q1',
      version: 'v061',
      baseUrl: 'https://e4ftl01.cr.usgs.gov/MOLT/MOD13Q1.061/',
    },
    SOIL_MOISTURE: {
      name: 'SMAP Soil Moisture',
      resolution: '~1km',
      temporal: 'Daily',
      source: 'NASA SMAP Mission',
      product: 'SMAP_L3_SM_P_E',
      version: 'v7',
      baseUrl: 'https://e4ftl01.cr.usgs.gov/SMAP_L3_SM_P_E/',
    },
    TEMPERATURE: {
      name: 'MODIS Temperature (MOD11A2)',
      resolution: '1km',
      temporal: '8-day composite',
      source: 'NASA LP DAAC',
      product: 'MOD11A2',
      version: 'v061',
      baseUrl: 'https://e4ftl01.cr.usgs.gov/MOLT/MOD11A2.061/',
    },
    PRECIPITATION: {
      name: 'GPM Precipitation (IMERG)',
      resolution: '0.1°',
      temporal: '30-minute',
      source: 'NASA GPM Mission',
      product: 'GPM_3IMERGDF',
      version: 'v06',
      baseUrl: 'https://e4ftl01.cr.usgs.gov/GPM_L3/GPM_3IMERGDF.06/',
    },
  },
  
  // Central Valley AOI
  AOI: {
    name: 'Central Valley, California',
    bounds: {
      north: 37.0,
      south: 35.0,
      east: -118.4,
      west: -120.9,
    },
    center: [36.0, -119.5],
    zoom: 8,
  },
  
  // Crop types
  CROP_TYPES: {
    carrot: {
      name: 'Carrot',
      price: 2.5,
      waterNeed: 0.7,
      fertilizerNeed: 0.5,
      growthDays: 25,
    },
    tomato: {
      name: 'Tomato',
      price: 3.0,
      waterNeed: 0.8,
      fertilizerNeed: 0.6,
      growthDays: 30,
    },
    lettuce: {
      name: 'Lettuce',
      price: 1.5,
      waterNeed: 0.6,
      fertilizerNeed: 0.4,
      growthDays: 20,
    },
    corn: {
      name: 'Corn',
      price: 2.0,
      waterNeed: 0.9,
      fertilizerNeed: 0.7,
      growthDays: 35,
    },
  },
};

// NASA Earthdata configuration
export const NASA_CONFIG = {
  EARTHDATA_BASE_URL: 'https://e4ftl01.cr.usgs.gov',
  CENTRAL_VALLEY_TILES: ['h08v05', 'h08v06', 'h09v05', 'h09v06'],
  DATASETS: {
    NDVI: {
      product: 'MCD13Q1',
      version: 'v061',
      resolution: 250,
      frequency: 16,
      scaleFactor: 0.0001,
      validRange: [-2000, 10000]
    },
    SOIL_MOISTURE: {
      product: 'SMAP_L3_SM_P_E',
      version: 'v7',
      resolution: 1000,
      frequency: 1,
      scaleFactor: 0.0001,
      validRange: [0, 10000]
    },
    TEMPERATURE: {
      product: 'MOD11A2',
      version: 'v061',
      resolution: 1000,
      frequency: 8,
      scaleFactor: 0.02,
      offset: -273.15,
      validRange: [7500, 65535]
    },
    PRECIPITATION: {
      product: 'GPM_3IMERGDF',
      version: 'v06',
      resolution: 0.1,
      frequency: 0.5,
      scaleFactor: 1.0,
      validRange: [0, 1000]
    }
  },
  AUTHORIZED_APPLICATIONS: [
    'NASA GESDISC DATA ARCHIVE',
    'LP DAAC Data Pool',
    'NSIDC DAAC Earthdata Drive',
    'LAADS DAAC Cumulus (PROD)'
  ],
  API_LIMITS: {
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 5,
    timeoutMs: 30000
  }
};

export default GAME_CONFIG;

