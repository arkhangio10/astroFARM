'use client';

import { useGameStore } from '@/lib/store/gameStore';
import { getAchievementIcon, getAchievementColor } from '@/lib/achievements';
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';

interface LevelCompleteModalProps {
  onClose: () => void;
  onNextLevel: () => void;
}

export default function LevelCompleteModal({ onClose, onNextLevel }: LevelCompleteModalProps) {
  const { scores, achievements, currentLevel } = useGameStore();
  
  const recentAchievements = achievements.slice(-3); // Show last 3 achievements

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-farm-green to-farm-blue text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Level {currentLevel} Complete!</h2>
              <p className="text-green-100">Great farming work!</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Scores */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{scores.yield}</div>
                <div className="text-sm text-green-700">Yield</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{scores.water}</div>
                <div className="text-sm text-blue-700">Water</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{scores.environment}</div>
                <div className="text-sm text-purple-700">Environment</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{scores.total}</div>
                <div className="text-sm text-yellow-700">Total</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {recentAchievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">New Achievements</h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-3xl">
                      {getAchievementIcon(achievement.type, achievement.tier)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getAchievementColor(achievement.tier) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Points */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What You Learned</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Water management is crucial for sustainable farming</li>
                <li>• Organic fertilizers are better for the environment</li>
                <li>• Timing your actions based on weather data improves results</li>
                <li>• NASA satellite data helps make informed farming decisions</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onNextLevel}
              className="flex-1 bg-farm-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Next Level
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

