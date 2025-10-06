'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { getLevelConfig } from '@/lib/levels';
import { TrendingUp, TrendingDown, Minus, Target, Award, Clock } from 'lucide-react';

export default function GameStats() {
  const { currentLevel, scores, actions, currentDay, totalDays } = useGameStore();
  const levelConfig = getLevelConfig(currentLevel);

  // Provide default values if store values are not available
  const safeScores = scores || { total: 0, yield: 0, water: 0, environment: 0 };
  const safeActions = actions || [];
  const safeCurrentDay = currentDay || 0;
  const safeTotalDays = totalDays || 30;

  const getTrendIcon = (current: number, target: number) => {
    if (current >= target) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current >= target * 0.8) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getActionStats = () => {
    const actionCounts = safeActions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return actionCounts;
  };

  const actionStats = getActionStats();

  if (!levelConfig) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-farm-blue" />
        Level {currentLevel} Progress
      </h3>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-farm-green">
            {Math.round((safeCurrentDay / safeTotalDays) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Complete</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-farm-blue">
            {safeTotalDays - safeCurrentDay}
          </div>
          <div className="text-sm text-gray-600">Days Left</div>
        </div>
      </div>

      {/* Score Progress */}
      <div className="space-y-4 mb-6">
        <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Total Score</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(safeScores.total, levelConfig.targets.minScore)}
                <span className="text-sm font-bold">{safeScores.total}/{levelConfig.targets.minScore}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-farm-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(safeScores.total, levelConfig.targets.minScore)}%` }}
              />
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Yield</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(safeScores.yield, levelConfig.targets.minYield)}
                <span className="text-sm font-bold">{safeScores.yield}/{levelConfig.targets.minYield}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(safeScores.yield, levelConfig.targets.minYield)}%` }}
              />
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Water Efficiency</span>
              <div className="flex items-center gap-2">
                {safeScores.water >= 80 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm font-bold">{safeScores.water}/100</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${safeScores.water}%` }}
              />
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Environment</span>
              <div className="flex items-center gap-2">
                {getTrendIcon(safeScores.environment, levelConfig.targets.minEnvironmentScore)}
                <span className="text-sm font-bold">{safeScores.environment}/{levelConfig.targets.minEnvironmentScore}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(safeScores.environment, levelConfig.targets.minEnvironmentScore)}%` }}
              />
            </div>
        </div>
      </div>

      {/* Action Statistics */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-farm-gold" />
          Actions Taken
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(actionStats).map(([action, count]) => (
            <div key={action} className="flex justify-between">
              <span className="text-gray-600 capitalize">{action.toLowerCase()}:</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level Objective */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Objective</h4>
        <p className="text-xs text-gray-600">{levelConfig.objective}</p>
      </div>
    </div>
  );
}
