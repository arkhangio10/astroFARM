// Enhanced Super Vegetable system for AstroFarm

import { 
  SuperVegetable, 
  VegetableCharacteristics, 
  VegetableStats, 
  VegetableAbility, 
  VegetableAppearance,
  GameState,
  Scores
} from '@/types/game';

export class SuperVegetableEngine {
  private static readonly BASE_STATS = {
    health: 100,
    strength: 50,
    speed: 50,
    resistance: 50,
    growthRate: 50,
    waterEfficiency: 50,
    solarEfficiency: 50
  };

  private static readonly ABILITY_TYPES = {
    WATER_SAVER: 'water-saver',
    SOLAR_CHARGER: 'solar-charger',
    DISEASE_RESISTANT: 'disease-resistant',
    RAPID_GROWTH: 'rapid-growth',
    DROUGHT_TOLERANT: 'drought-tolerant',
    HIGH_YIELD: 'high-yield'
  };

  static createSuperVegetable(
    playerId: string,
    baseType: 'carrot' | 'tomato' | 'lettuce' | 'corn',
    performance: Scores,
    locationType: 'arid' | 'temperate' | 'tropical'
  ): SuperVegetable {
    const characteristics = this.generateCharacteristics(performance, locationType);
    const stats = this.generateStats(performance, locationType);
    const abilities = this.generateAbilities(performance, locationType);
    const appearance = this.generateAppearance(characteristics, stats);

    return {
      id: `super-${baseType}-${Date.now()}`,
      playerId,
      name: this.generateName(baseType, characteristics),
      baseType,
      characteristics,
      stats,
      abilities,
      appearance,
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  private static generateCharacteristics(
    performance: Scores,
    locationType: string
  ): VegetableCharacteristics {
    const totalScore = performance.total;
    const size = this.determineSize(totalScore);
    const color = this.determineColor(performance, locationType);
    const shape = this.determineShape(performance);
    const texture = this.determineTexture(performance);
    const specialFeatures = this.determineSpecialFeatures(performance, locationType);

    return {
      size,
      color,
      shape,
      texture,
      specialFeatures
    };
  }

  private static generateStats(
    performance: Scores,
    locationType: string
  ): VegetableStats {
    const baseStats = { ...this.BASE_STATS };
    
    // Adjust stats based on performance
    const yieldBonus = Math.min(performance.yield / 10, 20);
    const waterBonus = Math.min(performance.water / 10, 20);
    const envBonus = Math.min(performance.environment / 10, 20);
    const efficiencyBonus = Math.min(performance.efficiency / 10, 20);

    // Location-specific adjustments
    const locationMultipliers = this.getLocationMultipliers(locationType);

    return {
      health: Math.min(100, baseStats.health + yieldBonus),
      strength: Math.min(100, baseStats.strength + yieldBonus),
      speed: Math.min(100, baseStats.speed + efficiencyBonus),
      resistance: Math.min(100, baseStats.resistance + envBonus),
      growthRate: Math.min(100, baseStats.growthRate + yieldBonus * locationMultipliers.growth),
      waterEfficiency: Math.min(100, baseStats.waterEfficiency + waterBonus * locationMultipliers.water),
      solarEfficiency: Math.min(100, baseStats.solarEfficiency + efficiencyBonus * locationMultipliers.solar)
    };
  }

  private static generateAbilities(
    performance: Scores,
    locationType: string
  ): VegetableAbility[] {
    const abilities: VegetableAbility[] = [];
    
    // Water-related abilities
    if (performance.water > 80) {
      abilities.push({
        id: 'water-master',
        name: 'Water Master',
        description: 'Uses 30% less water in all actions',
        type: 'passive',
        effect: 'water_efficiency_boost'
      });
    }

    // Solar-related abilities
    if (performance.efficiency > 80) {
      abilities.push({
        id: 'solar-charger',
        name: 'Solar Charger',
        description: 'Generates additional solar energy every day',
        type: 'passive',
        effect: 'solar_generation_boost'
      });
    }

    // Yield-related abilities
    if (performance.yield > 90) {
      abilities.push({
        id: 'high-yield',
        name: 'High Yield',
        description: 'Increases yield by 25%',
        type: 'passive',
        effect: 'yield_boost'
      });
    }

    // Environment-related abilities
    if (performance.environment > 85) {
      abilities.push({
        id: 'eco-friendly',
        name: 'Eco-Friendly',
        description: 'Reduces environmental impact of all actions',
        type: 'passive',
        effect: 'environmental_boost'
      });
    }

    // Location-specific abilities
    const locationAbilities = this.getLocationAbilities(locationType);
    abilities.push(...locationAbilities);

    return abilities;
  }

  private static generateAppearance(
    characteristics: VegetableCharacteristics,
    stats: VegetableStats
  ): VegetableAppearance {
    const sizeMultiplier = this.getSizeMultiplier(characteristics.size);
    const colorIntensity = this.getColorIntensity(stats);
    
    return {
      model: `${characteristics.shape}-model`,
      texture: `${characteristics.color}-${characteristics.texture}`,
      animations: this.generateAnimations(characteristics, stats),
      effects: this.generateEffects(characteristics, stats),
      size: sizeMultiplier
    };
  }

  private static determineSize(totalScore: number): 'small' | 'medium' | 'large' | 'giant' {
    if (totalScore >= 95) return 'giant';
    if (totalScore >= 85) return 'large';
    if (totalScore >= 70) return 'medium';
    return 'small';
  }

  private static determineColor(
    performance: Scores,
    locationType: string
  ): string {
    const colors = {
      'arid': ['golden', 'amber', 'bronze'],
      'temperate': ['green', 'emerald', 'forest'],
      'tropical': ['vibrant', 'rainbow', 'tropical']
    };

    const locationColors = colors[locationType as keyof typeof colors] || colors.temperate;
    
    if (performance.total >= 90) return locationColors[2];
    if (performance.total >= 75) return locationColors[1];
    return locationColors[0];
  }

  private static determineShape(performance: Scores): string {
    if (performance.yield >= 90) return 'perfect-sphere';
    if (performance.efficiency >= 85) return 'streamlined';
    if (performance.water >= 80) return 'water-drop';
    return 'standard';
  }

  private static determineTexture(performance: Scores): string {
    if (performance.environment >= 90) return 'smooth-organic';
    if (performance.total >= 80) return 'glossy';
    return 'standard';
  }

  private static determineSpecialFeatures(
    performance: Scores,
    locationType: string
  ): string[] {
    const features: string[] = [];
    
    if (performance.water >= 90) features.push('water-crystals');
    if (performance.efficiency >= 90) features.push('solar-panels');
    if (performance.yield >= 95) features.push('growth-rings');
    if (performance.environment >= 95) features.push('eco-aura');
    
    // Location-specific features
    switch (locationType) {
      case 'arid':
        features.push('desert-adaptation');
        break;
      case 'tropical':
        features.push('tropical-resilience');
        break;
      case 'temperate':
        features.push('seasonal-adaptation');
        break;
    }
    
    return features;
  }

  private static getLocationMultipliers(locationType: string): {
    growth: number;
    water: number;
    solar: number;
  } {
    switch (locationType) {
      case 'arid':
        return { growth: 0.8, water: 1.5, solar: 1.3 };
      case 'tropical':
        return { growth: 1.3, water: 0.7, solar: 0.8 };
      case 'temperate':
        return { growth: 1.0, water: 1.0, solar: 1.0 };
      default:
        return { growth: 1.0, water: 1.0, solar: 1.0 };
    }
  }

  private static getLocationAbilities(locationType: string): VegetableAbility[] {
    switch (locationType) {
      case 'arid':
        return [{
          id: 'desert-survivor',
          name: 'Superviviente del Desierto',
          description: 'Resistencia extra al calor y la sequía',
          type: 'passive',
          effect: 'heat_resistance'
        }];
      case 'tropical':
        return [{
          id: 'rain-absorber',
          name: 'Absorbedor de Lluvia',
          description: 'Convierte la lluvia excesiva en beneficios',
          type: 'passive',
          effect: 'rain_conversion'
        }];
      case 'temperate':
        return [{
          id: 'seasonal-adaptation',
          name: 'Adaptación Estacional',
          description: 'Se adapta a los cambios de temporada',
          type: 'passive',
          effect: 'seasonal_adaptation'
        }];
      default:
        return [];
    }
  }

  private static generateName(
    baseType: string,
    characteristics: VegetableCharacteristics
  ): string {
    const prefixes = {
      'giant': 'Gigante',
      'large': 'Gran',
      'medium': 'Medio',
      'small': 'Pequeño'
    };

    const colors = {
      'golden': 'Dorado',
      'amber': 'Ámbar',
      'bronze': 'Bronce',
      'green': 'Verde',
      'emerald': 'Esmeralda',
      'forest': 'Bosque',
      'vibrant': 'Vibrante',
      'rainbow': 'Arcoíris',
      'tropical': 'Tropical'
    };

    const prefix = prefixes[characteristics.size];
    const color = colors[characteristics.color as keyof typeof colors] || 'Especial';
    
    return `${prefix} ${color} ${baseType.charAt(0).toUpperCase() + baseType.slice(1)}`;
  }

  private static getSizeMultiplier(size: string): number {
    switch (size) {
      case 'giant': return 2.0;
      case 'large': return 1.5;
      case 'medium': return 1.0;
      case 'small': return 0.7;
      default: return 1.0;
    }
  }

  private static getColorIntensity(stats: VegetableStats): number {
    return (stats.health + stats.strength + stats.resistance) / 300;
  }

  private static generateAnimations(
    characteristics: VegetableCharacteristics,
    stats: VegetableStats
  ): string[] {
    const animations: string[] = ['idle', 'grow'];
    
    if (stats.speed >= 70) animations.push('quick-move');
    if (stats.health >= 80) animations.push('healthy-glow');
    if (characteristics.specialFeatures.includes('water-crystals')) animations.push('water-shimmer');
    if (characteristics.specialFeatures.includes('solar-panels')) animations.push('solar-charge');
    
    return animations;
  }

  private static generateEffects(
    characteristics: VegetableCharacteristics,
    stats: VegetableStats
  ): string[] {
    const effects: string[] = [];
    
    if (stats.waterEfficiency >= 80) effects.push('water-trail');
    if (stats.solarEfficiency >= 80) effects.push('solar-aura');
    if (stats.resistance >= 85) effects.push('protective-shield');
    if (characteristics.specialFeatures.includes('eco-aura')) effects.push('eco-glow');
    
    return effects;
  }

  // Battle system methods
  static calculateBattlePower(vegetable: SuperVegetable): number {
    const { stats } = vegetable;
    return (
      stats.health * 0.3 +
      stats.strength * 0.25 +
      stats.speed * 0.2 +
      stats.resistance * 0.15 +
      stats.growthRate * 0.1
    );
  }

  static getBattleAdvantages(vegetable: SuperVegetable): string[] {
    const advantages: string[] = [];
    
    if (vegetable.stats.waterEfficiency >= 80) advantages.push('water-advantage');
    if (vegetable.stats.solarEfficiency >= 80) advantages.push('solar-advantage');
    if (vegetable.stats.resistance >= 85) advantages.push('defense-advantage');
    if (vegetable.stats.speed >= 80) advantages.push('speed-advantage');
    
    return advantages;
  }

  static evolveVegetable(
    vegetable: SuperVegetable,
    newPerformance: Scores,
    locationType: 'arid' | 'temperate' | 'tropical'
  ): SuperVegetable {
    // Create a new evolved version based on improved performance
    const evolved = this.createSuperVegetable(
      vegetable.playerId,
      vegetable.baseType,
      newPerformance,
      locationType
    );
    
    // Preserve some characteristics from the original
    evolved.characteristics.specialFeatures = [
      ...vegetable.characteristics.specialFeatures,
      ...evolved.characteristics.specialFeatures
    ];
    
    return evolved;
  }
}

export function createSuperVegetableFromGameState(
  gameState: GameState,
  locationType: 'arid' | 'temperate' | 'tropical'
): SuperVegetable {
  return SuperVegetableEngine.createSuperVegetable(
    'player-id', // This would come from the actual player
    'carrot', // Default base type
    gameState.scores,
    locationType
  );
}
