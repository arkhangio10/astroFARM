'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { Droplets, Zap, DollarSign, Sprout, Settings, HelpCircle, Save, Cog, RotateCcw, Sun } from 'lucide-react';

interface HUDProps {
  onLevelSelect?: () => void;
  onShowTutorial?: () => void;
  onShowSaveManager?: () => void;
  onShowGameSettings?: () => void;
  onResetGame?: () => void;
}

export default function HUD({ onLevelSelect, onShowTutorial, onShowSaveManager, onShowGameSettings, onResetGame }: HUDProps) {
  const { 
    resources, 
    currentLevel, 
    currentDay, 
    totalDays, 
    scores,
    performAction,
    nextDay 
  } = useGameStore();

  const handleAction = (actionType: string, payload: any) => {
    const action = {
      id: `${actionType}_${Date.now()}`,
      type: actionType as any,
      payload,
      day: currentDay,
      cost: getActionCost(actionType),
    };
    
    performAction(action);
  };

  const getActionCost = (actionType: string) => {
    const costs = {
      'WATER': { water: 0, fertilizer: 0, money: 5, seeds: 0, solarEnergy: 0 },
      'FERTILIZE': { water: 0, fertilizer: 5, money: 10, seeds: 0, solarEnergy: 0 },
      'PLANT': { water: 0, fertilizer: 0, money: 15, seeds: 1, solarEnergy: 0 },
      'HARVEST': { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 },
      'SOLAR_CHARGE': { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 },
      'IRRIGATE': { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 10 },
      'WAIT': { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 },
    };
    return costs[actionType as keyof typeof costs] || { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 };
  };

  return (
    <div className="game-hud rounded-xl p-4 shadow-lg">
      {/* Header with Level and Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Level {currentLevel}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-sm text-gray-600">Day {currentDay + 1}/{totalDays}</span>
        </div>
        <div className="flex items-center gap-2">
          {onShowTutorial && (
            <button
              onClick={onShowTutorial}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Show Tutorial"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
          {onShowSaveManager && (
            <button
              onClick={onShowSaveManager}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Save Manager"
            >
              <Save className="w-4 h-4" />
            </button>
          )}
          {onShowGameSettings && (
            <button
              onClick={onShowGameSettings}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Game Settings"
            >
              <Cog className="w-4 h-4" />
            </button>
          )}
          {onLevelSelect && (
            <button
              onClick={onLevelSelect}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Select Level"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          {onResetGame && (
            <button
              onClick={onResetGame}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Resources Display */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <div className="flex items-center gap-2 bg-blue-100 rounded-lg p-2">
          <Droplets className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-blue-800">Water</div>
            <div className="text-lg font-bold text-blue-900">{resources.water}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-green-100 rounded-lg p-2">
          <Zap className="w-5 h-5 text-green-600" />
          <div>
            <div className="text-sm font-medium text-green-800">Fertilizer</div>
            <div className="text-lg font-bold text-green-900">{resources.fertilizer}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-yellow-100 rounded-lg p-2">
          <DollarSign className="w-5 h-5 text-yellow-600" />
          <div>
            <div className="text-sm font-medium text-yellow-800">Money</div>
            <div className="text-lg font-bold text-yellow-900">${resources.money}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-purple-100 rounded-lg p-2">
          <Sprout className="w-5 h-5 text-purple-600" />
          <div>
            <div className="text-sm font-medium text-purple-800">Seeds</div>
            <div className="text-lg font-bold text-purple-900">{resources.seeds}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-orange-100 rounded-lg p-2">
          <Sun className="w-5 h-5 text-orange-600" />
          <div>
            <div className="text-sm font-medium text-orange-800">Solar</div>
            <div className="text-lg font-bold text-orange-900">{resources.solarEnergy || 0}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        <button
          onClick={() => handleAction('WATER', { amount: 10 })}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          disabled={resources.money < 5}
        >
          💧 Water
        </button>
        
        <button
          onClick={() => handleAction('FERTILIZE', { amount: 5, type: 'organic' })}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          disabled={resources.fertilizer < 5 || resources.money < 10}
        >
          🌱 Fertilize
        </button>
        
        <button
          onClick={() => handleAction('PLANT', { crop: 'carrot' })}
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          disabled={resources.seeds < 1 || resources.money < 15}
        >
          🌾 Plant
        </button>
        
        <button
          onClick={() => handleAction('HARVEST', {})}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          🥕 Harvest
        </button>
        
        <button
          onClick={() => handleAction('SOLAR_CHARGE', {})}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          ☀️ Charge
        </button>
        
        <button
          onClick={() => handleAction('WAIT', {})}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          ⏭️ Wait
        </button>
      </div>

      {/* Scores Display */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-600">Yield</div>
          <div className="text-sm font-bold text-green-600">{scores.yield}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Water</div>
          <div className="text-sm font-bold text-blue-600">{scores.water}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Environment</div>
          <div className="text-sm font-bold text-green-600">{scores.environment}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600">Total</div>
          <div className="text-sm font-bold text-farm-gold">{scores.total}</div>
        </div>
      </div>

      {/* Next Day Button */}
      <div className="flex justify-center">
        <button
          onClick={nextDay}
          className="bg-farm-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Next Day
        </button>
      </div>
    </div>
  );
}
