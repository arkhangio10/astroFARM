// NASA Data Integration Module for AstroFARM
// This module handles the integration with various NASA APIs and data sources

interface NASADataPoint {
  timestamp: Date;
  value: number;
  unit: string;
  source: string;
}

interface SoilMoistureData {
  surface: number; // 0-5cm depth
  rootZone: number; // 0-100cm depth
  timestamp: Date;
  confidence: number;
}

interface NDVIData {
  value: number; // -1 to 1
  timestamp: Date;
  cloudCoverage: number; // percentage
  quality: 'good' | 'moderate' | 'poor';
}

interface WeatherData {
  temperature: {
    current: number;
    min: number;
    max: number;
  };
  precipitation: number; // mm
  humidity: number; // percentage
  windSpeed: number; // m/s
  solarRadiation: number; // W/m²
  timestamp: Date;
}

interface DroughtIndicator {
  level: 'none' | 'D0' | 'D1' | 'D2' | 'D3' | 'D4'; // US Drought Monitor scale
  percentArea: number;
  timestamp: Date;
}

export class NASADataService {
  private baseUrls = {
    cropCASMA: 'https://api.nasa.gov/crop-casma',
    giovanni: 'https://giovanni.gsfc.nasa.gov/api',
    modis: 'https://modis.ornl.gov/api',
    smap: 'https://n5eil01u.ecs.nsidc.org/api',
    gpm: 'https://gpm.nasa.gov/api',
  };

  private cachedData: Map<string, any> = new Map();
  private mockMode: boolean = true; // Start with mock data

  constructor(private apiKey?: string) {
    // Initialize with mock mode for development
    if (process.env.NODE_ENV === 'development') {
      this.mockMode = true;
    }
  }

  // Get soil moisture data from SMAP/Crop-CASMA
  async getSoilMoisture(lat: number, lon: number, date: Date): Promise<SoilMoistureData> {
    if (this.mockMode) {
      return this.generateMockSoilMoisture(date);
    }

    const cacheKey = `soil-${lat}-${lon}-${date.toISOString()}`;
    if (this.cachedData.has(cacheKey)) {
      return this.cachedData.get(cacheKey);
    }

    try {
      // Real API call would go here
      // For now, return mock data
      const data = this.generateMockSoilMoisture(date);
      this.cachedData.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching soil moisture:', error);
      return this.generateMockSoilMoisture(date);
    }
  }

  // Get NDVI (vegetation health) data from MODIS
  async getNDVI(lat: number, lon: number, date: Date): Promise<NDVIData> {
    if (this.mockMode) {
      return this.generateMockNDVI(date);
    }

    const cacheKey = `ndvi-${lat}-${lon}-${date.toISOString()}`;
    if (this.cachedData.has(cacheKey)) {
      return this.cachedData.get(cacheKey);
    }

    try {
      // Real API call would go here
      const data = this.generateMockNDVI(date);
      this.cachedData.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching NDVI:', error);
      return this.generateMockNDVI(date);
    }
  }

  // Get weather data from GPM and other sources
  async getWeatherData(lat: number, lon: number, date: Date): Promise<WeatherData> {
    if (this.mockMode) {
      return this.generateMockWeather(date);
    }

    const cacheKey = `weather-${lat}-${lon}-${date.toISOString()}`;
    if (this.cachedData.has(cacheKey)) {
      return this.cachedData.get(cacheKey);
    }

    try {
      // Real API call would go here
      const data = this.generateMockWeather(date);
      this.cachedData.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.generateMockWeather(date);
    }
  }

  // Get drought indicators
  async getDroughtStatus(lat: number, lon: number, date: Date): Promise<DroughtIndicator> {
    if (this.mockMode) {
      return this.generateMockDrought(date);
    }

    try {
      // Real API call would go here
      return this.generateMockDrought(date);
    } catch (error) {
      console.error('Error fetching drought status:', error);
      return this.generateMockDrought(date);
    }
  }

  // Get forecast data
  async getForecast(lat: number, lon: number, days: number = 7): Promise<WeatherData[]> {
    const forecast: WeatherData[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const weather = await this.getWeatherData(lat, lon, date);
      forecast.push(weather);
    }

    return forecast;
  }

  // Educational data about limitations
  getDataLimitations(): string[] {
    return [
      'Soil moisture data has a resolution of ~1km',
      'NDVI updates every 16 days due to satellite cycle',
      'Precipitation data is aggregated every 30 minutes',
      'Cloud cover can affect data quality',
      'Historical data may have up to 2 days delay',
    ];
  }

  // Mock data generators for development
  private generateMockSoilMoisture(date: Date): SoilMoistureData {
    // Simulate seasonal variations
    const dayOfYear = this.getDayOfYear(date);
    const seasonalFactor = Math.sin((dayOfYear / 365) * Math.PI * 2) * 0.3 + 0.5;
    
    return {
      surface: Math.random() * 30 + 20 + seasonalFactor * 20,
      rootZone: Math.random() * 20 + 40 + seasonalFactor * 15,
      timestamp: date,
      confidence: Math.random() * 0.2 + 0.8,
    };
  }

  private generateMockNDVI(date: Date): NDVIData {
    const dayOfYear = this.getDayOfYear(date);
    const growthCycle = Math.sin((dayOfYear / 365) * Math.PI * 2) * 0.4 + 0.6;
    
    return {
      value: growthCycle + (Math.random() - 0.5) * 0.1,
      timestamp: date,
      cloudCoverage: Math.random() * 30,
      quality: Math.random() > 0.7 ? 'good' : Math.random() > 0.4 ? 'moderate' : 'poor',
    };
  }

  private generateMockWeather(date: Date): WeatherData {
    const dayOfYear = this.getDayOfYear(date);
    const seasonalTemp = Math.sin((dayOfYear / 365) * Math.PI * 2) * 15 + 20;
    
    return {
      temperature: {
        current: seasonalTemp + (Math.random() - 0.5) * 10,
        min: seasonalTemp - 5 + Math.random() * 2,
        max: seasonalTemp + 5 + Math.random() * 2,
      },
      precipitation: Math.random() > 0.7 ? Math.random() * 20 : 0,
      humidity: Math.random() * 40 + 40,
      windSpeed: Math.random() * 15 + 5,
      solarRadiation: Math.random() * 200 + 600,
      timestamp: date,
    };
  }

  private generateMockDrought(date: Date): DroughtIndicator {
    const levels: DroughtIndicator['level'][] = ['none', 'D0', 'D1', 'D2', 'D3', 'D4'];
    const randomLevel = Math.floor(Math.random() * 3); // Favor less severe drought
    
    return {
      level: levels[randomLevel],
      percentArea: randomLevel > 0 ? Math.random() * 50 + 20 : 0,
      timestamp: date,
    };
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // Convert NASA data to game-friendly format
  convertToGameData(soilMoisture: SoilMoistureData, ndvi: NDVIData, weather: WeatherData) {
    return {
      moisture: Math.round(soilMoisture.rootZone),
      health: Math.round((ndvi.value + 1) * 50), // Convert -1 to 1 range to 0-100
      temperature: Math.round(weather.temperature.current),
      precipitation: Math.round(weather.precipitation),
      humidity: Math.round(weather.humidity),
      dataQuality: ndvi.quality,
      lastUpdate: new Date().toISOString(),
    };
  }
}

// Singleton instance
export const nasaDataService = new NASADataService(process.env.NEXT_PUBLIC_NASA_API_KEY);
