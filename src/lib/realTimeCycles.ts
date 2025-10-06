// Real-time cycle system for AstroFarm - 1 day = 40 minutes

import { 
  GameCycle, 
  CycleData, 
  WeatherData, 
  NasaDataPoint, 
  GameEvent, 
  EventEffect,
  Resources
} from '@/types/game';
import { getNasaClient } from './nasaClient';

export class RealTimeCycleManager {
  private static readonly TIME_MULTIPLIER = 40; // 1 day = 40 minutes
  private static readonly UPDATE_INTERVAL = 1000; // 1 second
  private static activeCycles: Map<string, GameCycle> = new Map();
  private static updateTimer: NodeJS.Timeout | null = null;

  static startCycle(
    playerId: string,
    locationId: string,
    totalDays: number = 30
  ): GameCycle {
    const cycle: GameCycle = {
      id: `cycle-${playerId}-${Date.now()}`,
      playerId,
      locationId,
      currentDay: 0,
      totalDays,
      isActive: true,
      startTime: new Date(),
      lastUpdate: new Date(),
      timeMultiplier: this.TIME_MULTIPLIER
    };

    this.activeCycles.set(cycle.id, cycle);
    this.startUpdateTimer();
    
    return cycle;
  }

  static pauseCycle(cycleId: string): boolean {
    const cycle = this.activeCycles.get(cycleId);
    if (!cycle) return false;

    cycle.isActive = false;
    this.activeCycles.set(cycleId, cycle);
    
    // Stop timer if no active cycles
    if (this.getActiveCyclesCount() === 0) {
      this.stopUpdateTimer();
    }
    
    return true;
  }

  static resumeCycle(cycleId: string): boolean {
    const cycle = this.activeCycles.get(cycleId);
    if (!cycle) return false;

    cycle.isActive = true;
    cycle.lastUpdate = new Date();
    this.activeCycles.set(cycleId, cycle);
    
    this.startUpdateTimer();
    return true;
  }

  static stopCycle(cycleId: string): boolean {
    const cycle = this.activeCycles.get(cycleId);
    if (!cycle) return false;

    cycle.isActive = false;
    this.activeCycles.delete(cycleId);
    
    // Stop timer if no active cycles
    if (this.getActiveCyclesCount() === 0) {
      this.stopUpdateTimer();
    }
    
    return true;
  }

  static getCycleData(cycleId: string): CycleData | null {
    const cycle = this.activeCycles.get(cycleId);
    if (!cycle) return null;

    const weather = this.generateWeatherData(cycle);
    const nasaData = this.generateNasaData(cycle);
    const events = this.generateGameEvents(cycle);
    const recommendations = this.generateRecommendations(cycle, weather, events);

    return {
      day: cycle.currentDay,
      weather,
      nasaData,
      events,
      recommendations
    };
  }

  static getActiveCyclesCount(): number {
    return Array.from(this.activeCycles.values()).filter(cycle => cycle.isActive).length;
  }

  static getPlayerActiveCycle(playerId: string): GameCycle | null {
    for (const cycle of Array.from(this.activeCycles.values())) {
      if (cycle.playerId === playerId && cycle.isActive) {
        return cycle;
      }
    }
    return null;
  }

  private static startUpdateTimer(): void {
    if (this.updateTimer) return; // Already running

    this.updateTimer = setInterval(() => {
      this.updateAllActiveCycles();
    }, this.UPDATE_INTERVAL);
  }

  private static stopUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private static updateAllActiveCycles(): void {
    const now = new Date();
    
    for (const [cycleId, cycle] of Array.from(this.activeCycles.entries())) {
      if (!cycle.isActive) continue;

      const timeElapsed = now.getTime() - cycle.lastUpdate.getTime();
      const realTimeMinutes = timeElapsed / (1000 * 60);
      const gameTimeMinutes = realTimeMinutes * this.TIME_MULTIPLIER;
      const gameDays = gameTimeMinutes / (24 * 60); // Convert to game days

      if (gameDays >= 1) {
        cycle.currentDay += Math.floor(gameDays);
        cycle.lastUpdate = now;
        
        // Check if cycle is complete
        if (cycle.currentDay >= cycle.totalDays) {
          cycle.isActive = false;
          this.activeCycles.delete(cycleId);
        }
      }
    }

    // Stop timer if no active cycles
    if (this.getActiveCyclesCount() === 0) {
      this.stopUpdateTimer();
    }
  }

  private static generateWeatherData(cycle: GameCycle): WeatherData {
    const locationId = cycle.locationId;
    const day = cycle.currentDay;
    
    // Base weather data for each location
    const baseWeather = this.getLocationBaseWeather(locationId);
    
    // Add daily variation
    const variation = this.calculateDailyVariation(day, locationId);
    
    return {
      temperature: baseWeather.temperature + variation.temperature,
      humidity: Math.max(0, Math.min(100, baseWeather.humidity + variation.humidity)),
      precipitation: Math.max(0, baseWeather.precipitation + variation.precipitation),
      windSpeed: Math.max(0, baseWeather.windSpeed + variation.windSpeed),
      cloudCover: Math.max(0, Math.min(100, baseWeather.cloudCover + variation.cloudCover)),
      solarRadiation: Math.max(0, baseWeather.solarRadiation + variation.solarRadiation)
    };
  }

  private static generateNasaData(cycle: GameCycle): NasaDataPoint[] {
    const nasaData: NasaDataPoint[] = [];
    const day = cycle.currentDay;
    
    // Simulate NASA data availability (not all days have data)
    if (day % 8 === 0) { // MODIS LST data every 8 days
      nasaData.push({
        timestamp: new Date(),
        product: 'MODIS LST',
        value: this.generateLSTValue(cycle.locationId, day),
        quality: 'good',
        source: 'NASA MODIS'
      });
    }
    
    if (day % 16 === 0) { // MODIS NDVI data every 16 days
      nasaData.push({
        timestamp: new Date(),
        product: 'MODIS NDVI',
        value: this.generateNDVIValue(cycle.locationId, day),
        quality: 'good',
        source: 'NASA MODIS'
      });
    }
    
    if (day % 3 === 0) { // SMAP soil moisture every 3 days
      nasaData.push({
        timestamp: new Date(),
        product: 'SMAP Soil Moisture',
        value: this.generateSoilMoistureValue(cycle.locationId, day),
        quality: 'good',
        source: 'NASA SMAP'
      });
    }
    
    return nasaData;
  }

  private static generateGameEvents(cycle: GameCycle): GameEvent[] {
    const events: GameEvent[] = [];
    const day = cycle.currentDay;
    const locationId = cycle.locationId;
    
    // Random events based on location and day
    const eventChance = this.calculateEventChance(locationId, day);
    
    if (Math.random() < eventChance.weather) {
      events.push(this.generateWeatherEvent(locationId, day));
    }
    
    if (Math.random() < eventChance.disease) {
      events.push(this.generateDiseaseEvent(locationId, day));
    }
    
    if (Math.random() < eventChance.opportunity) {
      events.push(this.generateOpportunityEvent(locationId, day));
    }
    
    return events;
  }

  private static generateRecommendations(
    cycle: GameCycle,
    weather: WeatherData,
    events: GameEvent[]
  ): string[] {
    const recommendations: string[] = [];
    const locationId = cycle.locationId;
    
    // Weather-based recommendations
    if (weather.temperature > 35) {
      recommendations.push('High temperature - consider additional irrigation');
    }
    
    if (weather.humidity < 30) {
      recommendations.push('Low humidity - monitor soil moisture');
    }
    
    if (weather.precipitation > 20) {
      recommendations.push('Heavy rain - reduce manual irrigation');
    }
    
    if (weather.solarRadiation > 6) {
      recommendations.push('High solar radiation - take advantage of solar energy');
    }
    
    // Event-based recommendations
    for (const event of events) {
      if (event.type === 'weather' && event.severity === 'high') {
        recommendations.push('Extreme weather conditions - take precautions');
      }
      
      if (event.type === 'disease') {
        recommendations.push('Riesgo de enfermedad - aplica medidas preventivas');
      }
      
      if (event.type === 'opportunity') {
        recommendations.push('Oportunidad detectada - aprovecha las condiciones favorables');
      }
    }
    
    // Location-specific recommendations
    const locationRecommendations = this.getLocationRecommendations(locationId, weather);
    recommendations.push(...locationRecommendations);
    
    return recommendations;
  }

  private static getLocationBaseWeather(locationId: string): WeatherData {
    switch (locationId) {
      case 'central-valley':
        return {
          temperature: 20,
          humidity: 60,
          precipitation: 2,
          windSpeed: 5,
          cloudCover: 30,
          solarRadiation: 5.5
        };
      case 'sahara-oasis':
        return {
          temperature: 30,
          humidity: 20,
          precipitation: 0.1,
          windSpeed: 8,
          cloudCover: 10,
          solarRadiation: 7.0
        };
      case 'amazon-rainforest':
        return {
          temperature: 26,
          humidity: 85,
          precipitation: 8,
          windSpeed: 3,
          cloudCover: 70,
          solarRadiation: 4.0
        };
      default:
        return {
          temperature: 20,
          humidity: 60,
          precipitation: 2,
          windSpeed: 5,
          cloudCover: 30,
          solarRadiation: 5.5
        };
    }
  }

  private static calculateDailyVariation(day: number, locationId: string): {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    cloudCover: number;
    solarRadiation: number;
  } {
    // Use seeded random for consistent variation
    const seed = day * 1000 + locationId.charCodeAt(0);
    const rng = this.seededRandom(seed);
    
    return {
      temperature: (rng() - 0.5) * 10,
      humidity: (rng() - 0.5) * 20,
      precipitation: (rng() - 0.5) * 5,
      windSpeed: (rng() - 0.5) * 3,
      cloudCover: (rng() - 0.5) * 20,
      solarRadiation: (rng() - 0.5) * 1
    };
  }

  private static generateLSTValue(locationId: string, day: number): number {
    const baseTemp = this.getLocationBaseWeather(locationId).temperature;
    const variation = this.calculateDailyVariation(day, locationId).temperature;
    return baseTemp + variation + 273.15; // Convert to Kelvin
  }

  private static generateNDVIValue(locationId: string, day: number): number {
    const baseNDVI = {
      'central-valley': 0.6,
      'sahara-oasis': 0.2,
      'amazon-rainforest': 0.8
    }[locationId] || 0.6;
    
    const rng = this.seededRandom(day * 1000);
    const variation = (rng() - 0.5) * 0.2;
    return Math.max(0, Math.min(1, baseNDVI + variation));
  }

  private static generateSoilMoistureValue(locationId: string, day: number): number {
    const baseMoisture = {
      'central-valley': 0.4,
      'sahara-oasis': 0.1,
      'amazon-rainforest': 0.7
    }[locationId] || 0.4;
    
    const rng = this.seededRandom(day * 1000);
    const variation = (rng() - 0.5) * 0.1;
    return Math.max(0, Math.min(1, baseMoisture + variation));
  }

  private static calculateEventChance(locationId: string, day: number): {
    weather: number;
    disease: number;
    opportunity: number;
  } {
    const baseChance = 0.1;
    const dayMultiplier = Math.min(day / 30, 1);
    
    return {
      weather: baseChance * dayMultiplier,
      disease: baseChance * 0.5 * dayMultiplier,
      opportunity: baseChance * 0.3 * dayMultiplier
    };
  }

  private static generateWeatherEvent(locationId: string, day: number): GameEvent {
    const eventTypes = ['heat-wave', 'cold-snap', 'drought', 'flood', 'storm'];
    const rng = this.seededRandom(day * 1000);
    const eventType = eventTypes[Math.floor(rng() * eventTypes.length)];
    
    return {
      id: `weather-${day}-${Date.now()}`,
      type: 'weather',
      severity: 'medium',
      description: `Evento climático: ${eventType}`,
      effects: this.getWeatherEventEffects(eventType),
      duration: 3
    };
  }

  private static generateDiseaseEvent(locationId: string, day: number): GameEvent {
    return {
      id: `disease-${day}-${Date.now()}`,
      type: 'disease',
      severity: 'low',
      description: 'Riesgo de enfermedad detectado',
      effects: [
        { resource: 'seeds', change: -2, duration: 5 },
        { resource: 'money', change: -10, duration: 3 }
      ],
      duration: 5
    };
  }

  private static generateOpportunityEvent(locationId: string, day: number): GameEvent {
    return {
      id: `opportunity-${day}-${Date.now()}`,
      type: 'opportunity',
      severity: 'low',
      description: 'Condiciones favorables detectadas',
      effects: [
        { resource: 'solarEnergy', change: 5, duration: 2 },
        { resource: 'money', change: 15, duration: 1 }
      ],
      duration: 2
    };
  }

  private static getWeatherEventEffects(eventType: string): EventEffect[] {
    switch (eventType) {
      case 'heat-wave':
        return [
          { resource: 'water', change: -5, duration: 3 },
          { resource: 'solarEnergy', change: 3, duration: 3 }
        ];
      case 'cold-snap':
        return [
          { resource: 'seeds', change: -3, duration: 2 },
          { resource: 'money', change: -5, duration: 2 }
        ];
      case 'drought':
        return [
          { resource: 'water', change: -10, duration: 5 },
          { resource: 'money', change: -20, duration: 5 }
        ];
      case 'flood':
        return [
          { resource: 'water', change: 10, duration: 2 },
          { resource: 'seeds', change: -2, duration: 3 }
        ];
      case 'storm':
        return [
          { resource: 'water', change: 5, duration: 1 },
          { resource: 'money', change: -10, duration: 1 }
        ];
      default:
        return [];
    }
  }

  private static getLocationRecommendations(locationId: string, weather: WeatherData): string[] {
    switch (locationId) {
      case 'central-valley':
        return [
          'Monitor soil moisture with SMAP data',
          'Take advantage of stable Mediterranean climate',
          'Prepare for seasonal droughts'
        ];
      case 'sahara-oasis':
        return [
          'Every drop of water is precious - use drip irrigation',
          'Take advantage of abundant solar energy',
          'Monitor evaporation constantly'
        ];
      case 'amazon-rainforest':
        return [
          'High humidity can cause diseases',
          'Use abundant rainfall to your advantage',
          'Biodiversity helps with pest control'
        ];
      default:
        return [];
    }
  }

  private static seededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }
}

export function createRealTimeCycle(
  playerId: string,
  locationId: string,
  totalDays: number = 30
): GameCycle {
  return RealTimeCycleManager.startCycle(playerId, locationId, totalDays);
}

export function getCycleData(cycleId: string): CycleData | null {
  return RealTimeCycleManager.getCycleData(cycleId);
}

export function pauseCycle(cycleId: string): boolean {
  return RealTimeCycleManager.pauseCycle(cycleId);
}

export function resumeCycle(cycleId: string): boolean {
  return RealTimeCycleManager.resumeCycle(cycleId);
}

export function stopCycle(cycleId: string): boolean {
  return RealTimeCycleManager.stopCycle(cycleId);
}
