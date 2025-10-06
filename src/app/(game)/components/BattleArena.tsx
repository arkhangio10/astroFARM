'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Battle, BattleRound, BattleAction, SuperVegetable } from '@/types/game';
import { createBattle, startBattle, executeBattleRound, simulateBattle } from '@/lib/battleSystem';

interface BattleArenaProps {
  participants: SuperVegetable[];
  onBattleComplete?: (battle: Battle) => void;
  autoPlay?: boolean;
}

export default function BattleArena({ 
  participants, 
  onBattleComplete, 
  autoPlay = false 
}: BattleArenaProps) {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  useEffect(() => {
    if (participants.length === 2) {
      const newBattle = createBattle(participants);
      setBattle(newBattle);
      setBattleLog([]);
    }
  }, [participants]);

  const simulateBattleAutomatically = useCallback(() => {
    if (!battle) return;
    
    const simulatedBattle = simulateBattle(participants);
    setBattle(simulatedBattle);
    
    // Generate battle log from simulation
    const log: string[] = ['The battle has begun!'];
    simulatedBattle.rounds.forEach((round, index) => {
      log.push(`--- Round ${round.roundNumber} ---`);
      round.results.forEach(result => {
        log.push(`${result.attacker} attacks ${result.defender} for ${result.damage} damage`);
        if (result.effect) {
          log.push(`Effect: ${result.effect}`);
        }
      });
    });
    
    if (simulatedBattle.winner) {
      const winner = participants.find(p => p.playerId === simulatedBattle.winner);
      log.push(`${winner?.name || 'Vegetable'} has won the battle!`);
    }
    
    setBattleLog(log);
    onBattleComplete?.(simulatedBattle);
  }, [battle, participants, onBattleComplete]);

  const startBattleAutomatically = useCallback(() => {
    if (!battle) return;
    
    const startedBattle = startBattle(battle);
    setBattle(startedBattle);
    addToLog('The battle has begun!');
    
    if (autoPlay) {
      simulateBattleAutomatically();
    }
  }, [battle, autoPlay, simulateBattleAutomatically]);

  useEffect(() => {
    if (autoPlay && battle && battle.status === 'waiting') {
      startBattleAutomatically();
    }
  }, [autoPlay, battle, startBattleAutomatically]);

  const executePlayerAction = (action: BattleAction) => {
    if (!battle || battle.status !== 'active') return;
    
    setIsAnimating(true);
    
    // Generate AI action for opponent
    const opponent = battle.participants.find(p => p.playerId !== action.playerId);
    const aiAction: BattleAction = {
      playerId: opponent!.playerId,
      actionType: 'attack',
      target: action.playerId,
      power: opponent!.stats.strength
    };
    
    const round = executeBattleRound(battle, [action, aiAction]);
    setBattle({ ...battle, rounds: [...battle.rounds, round] });
    setCurrentRound(round.roundNumber);
    
    // Add to battle log
    addToLog(`Round ${round.roundNumber}:`);
    round.results.forEach(result => {
      addToLog(`${result.attacker} attacks ${result.defender} for ${result.damage} damage`);
    });
    
    // Check if battle is complete
    if (battle && (battle.status as string) === 'completed') {
      const winner = participants.find(p => p.playerId === battle.winner);
      addToLog(`${winner?.name || 'Vegetable'} has won the battle!`);
      onBattleComplete?.(battle);
    }
    
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const addToLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const getParticipantHealth = (participantId: string): number => {
    if (!battle) return 100;
    
    const participant = battle.participants.find(p => p.playerId === participantId);
    if (!participant) return 100;
    
    const totalDamage = battle.rounds.reduce((total, round) => {
      return total + round.results
        .filter(r => r.defender === participantId)
        .reduce((damage, result) => damage + result.damage, 0);
    }, 0);
    
    return Math.max(0, participant.stats.health - totalDamage);
  };

  const getHealthPercentage = (participantId: string): number => {
    const currentHealth = getParticipantHealth(participantId);
    const maxHealth = battle?.participants.find(p => p.playerId === participantId)?.stats.health || 100;
    return (currentHealth / maxHealth) * 100;
  };

  if (!battle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Preparing battle...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Battle Header */}
      <div className="bg-gray-800 p-4 text-center">
        <h2 className="text-2xl font-bold">Battle Arena</h2>
        <p className="text-gray-300">
          {battle.status === 'waiting' && 'Waiting for battle to begin...'}
          {battle.status === 'active' && `Round ${currentRound + 1}`}
          {battle.status === 'completed' && 'Battle completed!'}
        </p>
      </div>

      {/* Battle Arena */}
      <div className="relative h-64 bg-gradient-to-b from-blue-900 to-green-900">
        {/* Participants */}
        <div className="absolute inset-0 flex items-center justify-between p-8">
          {battle.participants.map((participant, index) => {
            const participantData = participants.find(p => p.playerId === participant.playerId);
            const healthPercentage = getHealthPercentage(participant.playerId);
            const isAlive = healthPercentage > 0;
            
            return (
              <div key={participant.playerId} className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 transition-all duration-500 ${
                  isAlive ? 'animate-pulse' : 'opacity-50 grayscale'
                }`}>
                  {participantData?.characteristics.size === 'giant' ? '🌳' : 
                   participantData?.characteristics.size === 'large' ? '🌿' : '🌱'}
                </div>
                
                <div className="text-sm font-semibold mb-2">
                  {participantData?.name || 'Vegetal'}
                </div>
                
                <div className="w-32 bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      healthPercentage > 50 ? 'bg-green-500' : 
                      healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${healthPercentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-300">
                  {Math.round(healthPercentage)}% Health
                </div>
              </div>
            );
          })}
        </div>

        {/* Battle Effects */}
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">⚔️</div>
          </div>
        )}

        {/* VS Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="text-4xl font-bold text-yellow-400 animate-pulse">VS</div>
        </div>
      </div>

      {/* Action Buttons */}
      {battle.status === 'active' && !autoPlay && (
        <div className="p-4 bg-gray-800">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => executePlayerAction({
                playerId: battle.participants[0].playerId,
                actionType: 'attack',
                target: battle.participants[1].playerId,
                power: battle.participants[0].stats.strength
              })}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              ⚔️ Attack
            </button>
            
            <button
              onClick={() => executePlayerAction({
                playerId: battle.participants[0].playerId,
                actionType: 'defend',
                target: battle.participants[1].playerId,
                power: battle.participants[0].stats.resistance
              })}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              🛡️ Defend
            </button>
            
            {battle.participants[0].abilities.length > 0 && (
              <button
                onClick={() => executePlayerAction({
                  playerId: battle.participants[0].playerId,
                  actionType: 'ability',
                  target: battle.participants[1].playerId,
                  abilityId: battle.participants[0].abilities[0].id,
                  power: battle.participants[0].stats.strength * 1.5
                })}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                ⚡ Ability
              </button>
            )}
          </div>
        </div>
      )}

      {/* Battle Log */}
      <div className="bg-gray-800 p-4 max-h-48 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Battle Log</h3>
        <div className="space-y-1 text-sm">
          {battleLog.map((log, index) => (
            <div key={index} className="text-gray-300">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Battle Stats */}
      <div className="bg-gray-700 p-4">
        <div className="grid grid-cols-2 gap-4">
          {battle.participants.map((participant, index) => {
            const participantData = participants.find(p => p.playerId === participant.playerId);
            return (
              <div key={participant.playerId} className="text-center">
                <h4 className="font-semibold mb-2">{participantData?.name || 'Vegetable'}</h4>
                <div className="space-y-1 text-sm">
                  <div>💪 Strength: {participant.stats.strength}</div>
                  <div>🏃 Speed: {participant.stats.speed}</div>
                  <div>🛡️ Resistance: {participant.stats.resistance}</div>
                  <div>⚡ Abilities: {participant.abilities.length}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
