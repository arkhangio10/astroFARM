// Enhanced adaptive tips system for AstroFarm

import { GameState, TipRule, TipContext, Location, WeatherData, GameEvent } from '@/types/game';
import { getLocationById } from './locations';

export class AdaptiveTipsEngine {
  private static readonly TIP_COOLDOWN = 3; // turns
  private static readonly LOCATION_SPECIFIC_WEIGHT = 0.3;
  private static readonly PERFORMANCE_WEIGHT = 0.4;
  private static readonly WEATHER_WEIGHT = 0.3;

  static generateAdaptiveTips(
    gameState: GameState,
    location: Location,
    weatherData?: WeatherData,
    events?: GameEvent[]
  ): TipRule[] {
    const tips: TipRule[] = [];
    
    // Base educational tips
    tips.push(...this.getBaseEducationalTips());
    
    // Location-specific tips
    tips.push(...this.getLocationSpecificTips(location));
    
    // Performance-based tips
    tips.push(...this.getPerformanceBasedTips(gameState));
    
    // Weather-based tips
    if (weatherData) {
      tips.push(...this.getWeatherBasedTips(weatherData, location));
    }
    
    // Event-based tips
    if (events && events.length > 0) {
      tips.push(...this.getEventBasedTips(events, location));
    }
    
    // Resource management tips
    tips.push(...this.getResourceManagementTips(gameState, location));
    
    // NASA data interpretation tips
    tips.push(...this.getNasaDataTips(location));
    
    return tips;
  }

  private static getBaseEducationalTips(): TipRule[] {
    return [
      {
        id: 'nasa-data-importance',
        when: (state: GameState) => state.currentDay > 0,
        message: (context: TipContext) => 
          'NASA data helps you make informed decisions about irrigation, fertilization and crop protection.',
        severity: 'edu',
        cooldownTurns: 5,
        tags: ['nasa', 'education']
      },
      {
        id: 'sustainable-farming',
        when: (state: GameState) => state.scores.environment < 70,
        message: (context: TipContext) => 
          'Sustainable agriculture seeks to balance productivity with environmental care.',
        severity: 'edu',
        cooldownTurns: 4,
        tags: ['sustainability', 'environment']
      },
      {
        id: 'resource-efficiency',
        when: (state: GameState) => state.resources.water < 30 || state.resources.fertilizer < 20,
        message: (context: TipContext) => 
          'Resource efficiency is key for sustainable and profitable agriculture.',
        severity: 'warning',
        cooldownTurns: 3,
        tags: ['resources', 'efficiency']
      }
    ];
  }

  private static getLocationSpecificTips(location: Location): TipRule[] {
    const tips: TipRule[] = [];
    
    switch (location.type) {
      case 'arid':
        tips.push(
          {
            id: 'arid-water-conservation',
            when: (state: GameState) => state.resources.water < 50,
            message: (context: TipContext) => 
              'In arid regions, every drop of water is precious. Use drip irrigation and constantly monitor soil moisture.',
            severity: 'warning',
            cooldownTurns: 2,
            tags: ['arid', 'water', 'conservation']
          },
          {
            id: 'arid-solar-energy',
            when: (state: GameState) => state.resources.solarEnergy > 80,
            message: (context: TipContext) => 
              'Abundant solar energy in arid regions can be used for efficient irrigation systems and heat protection.',
            severity: 'info',
            cooldownTurns: 4,
            tags: ['arid', 'solar', 'energy']
          }
        );
        break;
        
      case 'temperate':
        tips.push(
          {
            id: 'temperate-seasonal-planning',
            when: (state: GameState) => state.currentDay > 7,
            message: (context: TipContext) => 
              'En climas templados, planifica según las estaciones. Usa datos históricos de la NASA para predecir condiciones futuras.',
            severity: 'edu',
            cooldownTurns: 5,
            tags: ['temperate', 'planning', 'seasons']
          },
          {
            id: 'temperate-frost-protection',
            when: (state: GameState) => state.currentDay > 14,
            message: (context: TipContext) => 
              'Monitor nighttime temperatures. Frost can damage crops, especially in spring and fall.',
            severity: 'warning',
            cooldownTurns: 3,
            tags: ['temperate', 'frost', 'protection']
          }
        );
        break;
        
      case 'tropical':
        tips.push(
          {
            id: 'tropical-humidity-management',
            when: (state: GameState) => state.resources.water > 80,
            message: (context: TipContext) => 
              'En climas tropicales, la alta humedad puede causar enfermedades fúngicas. Asegúrate de una buena circulación de aire.',
            severity: 'warning',
            cooldownTurns: 3,
            tags: ['tropical', 'humidity', 'disease']
          },
          {
            id: 'tropical-rain-utilization',
            when: (state: GameState) => state.resources.water < 30,
            message: (context: TipContext) => 
              'Aprovecha las lluvias tropicales para recargar tus reservas de agua. Usa sistemas de captación de agua de lluvia.',
            severity: 'info',
            cooldownTurns: 4,
            tags: ['tropical', 'rain', 'water']
          }
        );
        break;
    }
    
    return tips;
  }

  private static getPerformanceBasedTips(gameState: GameState): TipRule[] {
    const tips: TipRule[] = [];
    
    // Yield-based tips
    if (gameState.scores.yield < 60) {
      tips.push({
        id: 'low-yield-improvement',
        when: (state: GameState) => state.scores.yield < 60,
        message: (context: TipContext) => 
          'To improve yield, ensure your crops have enough water, nutrients and sunlight.',
        severity: 'warning',
        cooldownTurns: 3,
        tags: ['yield', 'improvement']
      });
    }
    
    // Water efficiency tips
    if (gameState.scores.water < 50) {
      tips.push({
        id: 'water-efficiency-tip',
        when: (state: GameState) => state.scores.water < 50,
        message: (context: TipContext) => 
          'Improve water efficiency using drip irrigation, mulching and monitoring soil moisture with NASA data.',
        severity: 'warning',
        cooldownTurns: 3,
        tags: ['water', 'efficiency']
      });
    }
    
    // Environmental score tips
    if (gameState.scores.environment < 60) {
      tips.push({
        id: 'environmental-improvement',
        when: (state: GameState) => state.scores.environment < 60,
        message: (context: TipContext) => 
          'Reduce environmental impact using organic fertilizers, crop rotation and soil conservation practices.',
        severity: 'warning',
        cooldownTurns: 4,
        tags: ['environment', 'sustainability']
      });
    }
    
    return tips;
  }

  private static getWeatherBasedTips(weather: WeatherData, location: Location): TipRule[] {
    const tips: TipRule[] = [];
    
    // Temperature tips
    if (weather.temperature > 35) {
      tips.push({
        id: 'high-temperature-warning',
        when: (state: GameState) => true,
        message: (context: TipContext) => 
          'High temperatures can cause crop stress. Increase irrigation and consider shading.',
        severity: 'warning',
        cooldownTurns: 2,
        tags: ['temperature', 'heat', 'stress']
      });
    }
    
    if (weather.temperature < 5) {
      tips.push({
        id: 'low-temperature-warning',
        when: (state: GameState) => true,
        message: (context: TipContext) => 
          'Low temperatures can cause frost damage. Protect your crops with covers or greenhouses.',
        severity: 'warning',
        cooldownTurns: 2,
        tags: ['temperature', 'frost', 'protection']
      });
    }
    
    // Humidity tips
    if (weather.humidity > 85) {
      tips.push({
        id: 'high-humidity-warning',
        when: (state: GameState) => true,
        message: (context: TipContext) => 
          'High humidity can favor fungal diseases. Improve air circulation and avoid excessive irrigation.',
        severity: 'warning',
        cooldownTurns: 3,
        tags: ['humidity', 'disease', 'fungal']
      });
    }
    
    if (weather.humidity < 30) {
      tips.push({
        id: 'low-humidity-warning',
        when: (state: GameState) => true,
        message: (context: TipContext) => 
          'Low humidity increases evaporation. Increase irrigation frequency and consider mulching to retain moisture.',
        severity: 'warning',
        cooldownTurns: 3,
        tags: ['humidity', 'evaporation', 'mulching']
      });
    }
    
    // Precipitation tips
    if (weather.precipitation > 20) {
      tips.push({
        id: 'high-precipitation-info',
        when: (state: GameState) => true,
        message: (context: TipContext) => 
          'Heavy rain can cause waterlogging. Ensure drainage is adequate.',
        severity: 'info',
        cooldownTurns: 4,
        tags: ['precipitation', 'drainage', 'waterlogging']
      });
    }
    
    if (weather.precipitation < 1 && weather.temperature > 25) {
      tips.push({
        id: 'drought-conditions',
        when: (state: GameState) => true,
        message: (context: TipContext) => 
          'Drought conditions detected. Reduce manual irrigation and use water conservation techniques.',
        severity: 'warning',
        cooldownTurns: 2,
        tags: ['drought', 'conservation', 'water']
      });
    }
    
    // Solar radiation tips
    if (weather.solarRadiation > 6) {
      tips.push({
        id: 'high-solar-radiation',
        when: (state: GameState) => true,
        message: (context: TipContext) => 
          'High solar radiation can cause crop stress. Consider shading and additional irrigation.',
        severity: 'info',
        cooldownTurns: 4,
        tags: ['solar', 'radiation', 'shading']
      });
    }
    
    return tips;
  }

  private static getEventBasedTips(events: GameEvent[], location: Location): TipRule[] {
    const tips: TipRule[] = [];
    
    events.forEach(event => {
      switch (event.type) {
        case 'weather':
          tips.push({
            id: `weather-event-${event.id}`,
            when: (state: GameState) => true,
            message: (context: TipContext) => 
              `Weather event: ${event.description}. Take precautions according to conditions.`,
            severity: event.severity === 'critical' ? 'warning' : 'info',
            cooldownTurns: 2,
            tags: ['weather', 'event', event.severity]
          });
          break;
          
        case 'disease':
          tips.push({
            id: `disease-event-${event.id}`,
            when: (state: GameState) => true,
            message: (context: TipContext) => 
              `Disease risk detected. Apply preventive measures and monitor your crops.`,
            severity: 'warning',
            cooldownTurns: 3,
            tags: ['disease', 'prevention', 'monitoring']
          });
          break;
          
        case 'opportunity':
          tips.push({
            id: `opportunity-event-${event.id}`,
            when: (state: GameState) => true,
            message: (context: TipContext) => 
              `Opportunity detected: ${event.description}. Take advantage of favorable conditions.`,
            severity: 'info',
            cooldownTurns: 4,
            tags: ['opportunity', 'favorable', 'conditions']
          });
          break;
      }
    });
    
    return tips;
  }

  private static getResourceManagementTips(gameState: GameState, location: Location): TipRule[] {
    const tips: TipRule[] = [];
    
    // Water management
    if (gameState.resources.water < 20) {
      tips.push({
        id: 'low-water-resources',
        when: (state: GameState) => state.resources.water < 20,
        message: (context: TipContext) => 
          'Recursos hídricos bajos. Prioriza el riego de cultivos críticos y busca fuentes alternativas de agua.',
        severity: 'warning',
        cooldownTurns: 2,
        tags: ['water', 'resources', 'priority']
      });
    }
    
    // Solar energy management
    if (gameState.resources.solarEnergy > 90) {
      tips.push({
        id: 'high-solar-energy',
        when: (state: GameState) => state.resources.solarEnergy > 90,
        message: (context: TipContext) => 
          'Energía solar abundante disponible. Usa sistemas de riego solar y protección contra el calor.',
        severity: 'info',
        cooldownTurns: 4,
        tags: ['solar', 'energy', 'irrigation']
      });
    }
    
    // Fertilizer management
    if (gameState.resources.fertilizer < 15) {
      tips.push({
        id: 'low-fertilizer-resources',
        when: (state: GameState) => state.resources.fertilizer < 15,
        message: (context: TipContext) => 
          'Fertilizantes limitados. Considera compostaje y rotación de cultivos para mantener la fertilidad del suelo.',
        severity: 'warning',
        cooldownTurns: 3,
        tags: ['fertilizer', 'composting', 'rotation']
      });
    }
    
    return tips;
  }

  private static getNasaDataTips(location: Location): TipRule[] {
    const tips: TipRule[] = [];
    
    location.nasaDataSources.forEach(source => {
      tips.push({
        id: `nasa-data-${source.product}`,
        when: (state: GameState) => state.currentDay > 0,
        message: (context: TipContext) => 
          `Datos de ${source.product} (${source.resolution}, ${source.frequency}): ${source.limitations.join(', ')}`,
        severity: 'edu',
        cooldownTurns: 6,
        tags: ['nasa', 'data', source.product.toLowerCase()]
      });
    });
    
    return tips;
  }

  static getTipPriority(tip: TipRule, gameState: GameState, location: Location): number {
    let priority = 0;
    
    // Base priority
    priority += 1;
    
    // Severity bonus
    if (tip.severity === 'warning') priority += 2;
    if (tip.severity === 'info') priority += 1;
    
    // Location relevance
    if (tip.tags?.some(tag => location.challenges.some(challenge => 
      challenge.toLowerCase().includes(tag)))) {
      priority += 1;
    }
    
    // Performance relevance
    if (tip.tags?.includes('yield') && gameState.scores.yield < 70) priority += 2;
    if (tip.tags?.includes('water') && gameState.scores.water < 70) priority += 2;
    if (tip.tags?.includes('environment') && gameState.scores.environment < 70) priority += 2;
    
    return priority;
  }

  static filterRelevantTips(tips: TipRule[], gameState: GameState, location: Location): TipRule[] {
    return tips
      .filter(tip => tip.when(gameState))
      .sort((a, b) => this.getTipPriority(b, gameState, location) - this.getTipPriority(a, gameState, location))
      .slice(0, 5); // Limit to 5 most relevant tips
  }
}

export function generateAdaptiveTips(
  gameState: GameState,
  location: Location,
  weatherData?: WeatherData,
  events?: GameEvent[]
): TipRule[] {
  const allTips = AdaptiveTipsEngine.generateAdaptiveTips(gameState, location, weatherData, events);
  return AdaptiveTipsEngine.filterRelevantTips(allTips, gameState, location);
}
