'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { GAME_LEVELS, getLevelConfig, isLevelUnlocked, getLevelProgress } from '@/lib/levels';
import { createSeedForLevel } from '@/lib/levels';
import { Lock, Play, Star, Trophy, Clock, Target } from 'lucide-react';

interface LevelSelectionProps {
  onLevelSelect: (levelId: number) => void;
  onClose: () => void;
}

export default function LevelSelection({ onLevelSelect, onClose }: LevelSelectionProps) {
  const { scores, achievements } = useGameStore();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Provide default values if scores/achievements are not available
  const safeScores = scores || { total: 0, yield: 0, water: 0, environment: 0 };
  const safeAchievements = achievements || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '🌿';
      case 'advanced':
        return '🌳';
      case 'expert':
        return '🏆';
      default:
        return '❓';
    }
  };

  const handleLevelSelect = (levelId: number) => {
    const level = getLevelConfig(levelId);
    if (!level) return;

    const unlocked = isLevelUnlocked(levelId, [1, 2, 3, 4]); // Mock completed levels
    if (!unlocked) return;

    setSelectedLevel(levelId);
  };

  const handleStartLevel = () => {
    if (selectedLevel) {
      onLevelSelect(selectedLevel);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-farm-green to-farm-blue text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Select Level</h2>
              <p className="text-green-100">Choose your farming challenge</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_LEVELS.map((level) => {
              const unlocked = isLevelUnlocked(level.id, [1, 2, 3, 4]); // Mock completed levels
              const progress = getLevelProgress(level.id, safeScores);
              const isSelected = selectedLevel === level.id;

              return (
                <div
                  key={level.id}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                    unlocked
                      ? isSelected
                        ? 'border-farm-green bg-green-50'
                        : 'border-gray-200 hover:border-farm-green hover:bg-green-50'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => handleLevelSelect(level.id)}
                >
                  {/* Level Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {level.id}
                  </div>

                  {/* Lock Icon for locked levels */}
                  {!unlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Level Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {level.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {level.description}
                    </p>
                    
                    {/* Difficulty Badge */}
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(level.difficulty)}`}>
                      <span>{getDifficultyIcon(level.difficulty)}</span>
                      {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
                    </div>
                  </div>

                  {/* Level Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{level.duration} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>Min Score: {level.targets.minScore}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4" />
                      <span>Min Yield: {level.targets.minYield}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {unlocked && progress.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-farm-green h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Achievements */}
                  {progress.achievements.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Trophy className="w-3 h-3" />
                        <span>{progress.achievements.length} achievement(s)</span>
                      </div>
                    </div>
                  )}

                  {/* Start Button */}
                  {unlocked && (
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-farm-green text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartLevel();
                      }}
                    >
                      {isSelected ? 'Selected' : 'Select Level'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Start Game Button */}
          {selectedLevel && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleStartLevel}
                className="bg-farm-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Level {selectedLevel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
