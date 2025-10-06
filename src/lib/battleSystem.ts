// Battle system for Super Vegetables in AstroFarm

import { 
  Battle, 
  BattleParticipant, 
  BattleRound, 
  BattleAction, 
  BattleResult,
  SuperVegetable,
  VegetableStats,
  VegetableAbility
} from '@/types/game';

export class BattleEngine {
  private static readonly BATTLE_ROUNDS = 5;
  private static readonly BASE_DAMAGE = 10;
  private static readonly CRITICAL_HIT_CHANCE = 0.15;
  private static readonly ABILITY_COOLDOWN = 2;

  static createBattle(participants: SuperVegetable[]): Battle {
    if (participants.length !== 2) {
      throw new Error('Battle must have exactly 2 participants');
    }

    const battleParticipants: BattleParticipant[] = participants.map(vegetable => ({
      playerId: vegetable.playerId,
      vegetableId: vegetable.id,
      stats: vegetable.stats,
      abilities: vegetable.abilities
    }));

    return {
      id: `battle-${Date.now()}`,
      participants: battleParticipants,
      status: 'waiting',
      rounds: [],
      createdAt: new Date()
    };
  }

  static startBattle(battle: Battle): Battle {
    battle.status = 'active';
    return battle;
  }

  static executeBattleRound(
    battle: Battle,
    actions: BattleAction[]
  ): BattleRound {
    if (battle.status !== 'active') {
      throw new Error('Battle is not active');
    }

    if (actions.length !== 2) {
      throw new Error('Battle round must have exactly 2 actions');
    }

    const roundNumber = battle.rounds.length + 1;
    const results: BattleResult[] = [];
    
    // Process actions in order of speed
    const sortedActions = this.sortActionsBySpeed(actions, battle.participants);
    
    for (const action of sortedActions) {
      const result = this.processAction(action, battle.participants, results);
      results.push(result);
    }

    const round: BattleRound = {
      roundNumber,
      actions,
      results
    };

    battle.rounds.push(round);

    // Check for battle end
    const winner = this.checkBattleEnd(battle);
    if (winner) {
      battle.status = 'completed';
      battle.winner = winner;
      battle.completedAt = new Date();
    }

    return round;
  }

  static simulateBattle(participants: SuperVegetable[]): Battle {
    const battle = this.createBattle(participants);
    this.startBattle(battle);

    // Simulate battle with AI decisions
    for (let round = 1; round <= this.BATTLE_ROUNDS; round++) {
      if (battle.status === 'completed') break;

      const actions = this.generateAIActions(battle);
      this.executeBattleRound(battle, actions);
    }

    return battle;
  }

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

  private static sortActionsBySpeed(
    actions: BattleAction[],
    participants: BattleParticipant[]
  ): BattleAction[] {
    return actions.sort((a, b) => {
      const aParticipant = participants.find(p => p.playerId === a.playerId);
      const bParticipant = participants.find(p => p.playerId === b.playerId);
      
      if (!aParticipant || !bParticipant) return 0;
      
      return bParticipant.stats.speed - aParticipant.stats.speed;
    });
  }

  private static processAction(
    action: BattleAction,
    participants: BattleParticipant[],
    previousResults: BattleResult[]
  ): BattleResult {
    const attacker = participants.find(p => p.playerId === action.playerId);
    const defender = participants.find(p => p.playerId === action.target);
    
    if (!attacker || !defender) {
      throw new Error('Invalid action participants');
    }

    const damage = this.calculateDamage(action, attacker, defender, previousResults);
    const effect = this.determineEffect(action, attacker, defender);
    
    return {
      attacker: action.playerId,
      defender: action.target!,
      damage,
      effect
    };
  }

  private static calculateDamage(
    action: BattleAction,
    attacker: BattleParticipant,
    defender: BattleParticipant,
    previousResults: BattleResult[]
  ): number {
    let baseDamage = this.BASE_DAMAGE;
    
    // Apply action type modifiers
    switch (action.actionType) {
      case 'attack':
        baseDamage *= 1.0;
        break;
      case 'defend':
        baseDamage *= 0.5;
        break;
      case 'ability':
        baseDamage *= 1.5;
        break;
      case 'special':
        baseDamage *= 2.0;
        break;
    }
    
    // Apply stat modifiers
    const strengthModifier = attacker.stats.strength / 100;
    const resistanceModifier = defender.stats.resistance / 100;
    
    baseDamage *= strengthModifier;
    baseDamage *= (1 - resistanceModifier * 0.5);
    
    // Apply ability effects
    const abilityEffects = this.getAbilityEffects(action, attacker, defender);
    baseDamage *= abilityEffects.damageMultiplier;
    
    // Apply critical hit chance
    const isCritical = Math.random() < this.CRITICAL_HIT_CHANCE;
    if (isCritical) {
      baseDamage *= 2.0;
    }
    
    // Apply previous round effects
    const previousEffects = this.getPreviousRoundEffects(previousResults, action.playerId);
    baseDamage *= previousEffects.damageMultiplier;
    
    return Math.max(1, Math.floor(baseDamage));
  }

  private static determineEffect(
    action: BattleAction,
    attacker: BattleParticipant,
    defender: BattleParticipant
  ): string {
    const effects: string[] = [];
    
    // Base effects
    switch (action.actionType) {
      case 'attack':
        effects.push('Direct attack');
        break;
      case 'defend':
        effects.push('Active defense');
        break;
      case 'ability':
        effects.push('Special ability');
        break;
      case 'special':
        effects.push('Special attack');
        break;
    }
    
    // Stat-based effects
    if (attacker.stats.speed >= 80) {
      effects.push('Quick attack');
    }
    
    if (attacker.stats.strength >= 80) {
      effects.push('Powerful strike');
    }
    
    if (defender.stats.resistance >= 80) {
      effects.push('Active resistance');
    }
    
    // Ability effects
    const abilityEffects = this.getAbilityEffects(action, attacker, defender);
    if (abilityEffects.specialEffect) {
      effects.push(abilityEffects.specialEffect);
    }
    
    return effects.join(', ');
  }

  private static getAbilityEffects(
    action: BattleAction,
    attacker: BattleParticipant,
    defender: BattleParticipant
  ): {
    damageMultiplier: number;
    specialEffect?: string;
  } {
    if (action.actionType !== 'ability' || !action.abilityId) {
      return { damageMultiplier: 1.0 };
    }
    
    const ability = attacker.abilities.find(a => a.id === action.abilityId);
    if (!ability) {
      return { damageMultiplier: 1.0 };
    }
    
    // Apply ability effects
    switch (ability.effect) {
      case 'water_efficiency_boost':
        return { 
          damageMultiplier: 1.2, 
          specialEffect: 'Water attack' 
        };
      case 'solar_generation_boost':
        return { 
          damageMultiplier: 1.3, 
          specialEffect: 'Solar attack' 
        };
      case 'yield_boost':
        return { 
          damageMultiplier: 1.4, 
          specialEffect: 'High-yield attack' 
        };
      case 'environmental_boost':
        return { 
          damageMultiplier: 1.1, 
          specialEffect: 'Ecological attack' 
        };
      default:
        return { damageMultiplier: 1.0 };
    }
  }

  private static getPreviousRoundEffects(
    previousResults: BattleResult[],
    playerId: string
  ): {
    damageMultiplier: number;
  } {
    // Check for status effects from previous rounds
    const playerResults = previousResults.filter(r => r.attacker === playerId);
    let damageMultiplier = 1.0;
    
    // Apply cumulative effects
    for (const result of playerResults) {
      if (result.effect.includes('crítico')) {
        damageMultiplier *= 1.1;
      }
      if (result.effect.includes('especial')) {
        damageMultiplier *= 1.05;
      }
    }
    
    return { damageMultiplier };
  }

  private static checkBattleEnd(battle: Battle): string | null {
    // Check if any participant is defeated
    for (const participant of battle.participants) {
      const totalDamage = this.calculateTotalDamage(battle, participant.playerId);
      if (totalDamage >= participant.stats.health) {
        // Find the opponent
        const opponent = battle.participants.find(p => p.playerId !== participant.playerId);
        return opponent?.playerId || null;
      }
    }
    
    // Check if maximum rounds reached
    if (battle.rounds.length >= this.BATTLE_ROUNDS) {
      // Determine winner by remaining health
      const participant1 = battle.participants[0];
      const participant2 = battle.participants[1];
      
      const damage1 = this.calculateTotalDamage(battle, participant1.playerId);
      const damage2 = this.calculateTotalDamage(battle, participant2.playerId);
      
      const health1 = participant1.stats.health - damage1;
      const health2 = participant2.stats.health - damage2;
      
      return health1 > health2 ? participant1.playerId : participant2.playerId;
    }
    
    return null;
  }

  private static calculateTotalDamage(battle: Battle, playerId: string): number {
    let totalDamage = 0;
    
    for (const round of battle.rounds) {
      for (const result of round.results) {
        if (result.defender === playerId) {
          totalDamage += result.damage;
        }
      }
    }
    
    return totalDamage;
  }

  private static generateAIActions(battle: Battle): BattleAction[] {
    const actions: BattleAction[] = [];
    
    for (const participant of battle.participants) {
      const action = this.generateAIAction(participant, battle);
      actions.push(action);
    }
    
    return actions;
  }

  private static generateAIAction(
    participant: BattleParticipant,
    battle: Battle
  ): BattleAction {
    const opponent = battle.participants.find(p => p.playerId !== participant.playerId);
    if (!opponent) {
      throw new Error('No opponent found');
    }
    
    // Simple AI strategy
    const random = Math.random();
    
    if (random < 0.4) {
      // 40% chance to attack
      return {
        playerId: participant.playerId,
        actionType: 'attack',
        target: opponent.playerId,
        power: participant.stats.strength
      };
    } else if (random < 0.7) {
      // 30% chance to defend
      return {
        playerId: participant.playerId,
        actionType: 'defend',
        target: opponent.playerId,
        power: participant.stats.resistance
      };
    } else if (random < 0.9 && participant.abilities.length > 0) {
      // 20% chance to use ability
      const ability = participant.abilities[Math.floor(Math.random() * participant.abilities.length)];
      return {
        playerId: participant.playerId,
        actionType: 'ability',
        target: opponent.playerId,
        abilityId: ability.id,
        power: participant.stats.strength * 1.5
      };
    } else {
      // 10% chance for special attack
      return {
        playerId: participant.playerId,
        actionType: 'special',
        target: opponent.playerId,
        power: participant.stats.strength * 2.0
      };
    }
  }
}

export function createBattle(participants: SuperVegetable[]): Battle {
  return BattleEngine.createBattle(participants);
}

export function startBattle(battle: Battle): Battle {
  return BattleEngine.startBattle(battle);
}

export function executeBattleRound(
  battle: Battle,
  actions: BattleAction[]
): BattleRound {
  return BattleEngine.executeBattleRound(battle, actions);
}

export function simulateBattle(participants: SuperVegetable[]): Battle {
  return BattleEngine.simulateBattle(participants);
}

export function calculateBattlePower(vegetable: SuperVegetable): number {
  return BattleEngine.calculateBattlePower(vegetable);
}

export function getBattleAdvantages(vegetable: SuperVegetable): string[] {
  return BattleEngine.getBattleAdvantages(vegetable);
}
