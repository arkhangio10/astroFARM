'use client';

import { useState } from 'react';
import { Play, Target, Clock, Star } from 'lucide-react';

interface LevelCardProps {
  level: number;
  title: string;
  description: string;
  objectives: string[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isUnlocked: boolean;
  isCompleted: boolean;
  onStart: () => void;
}

export default function LevelCard({
  level,
  title,
  description,
  objectives,
  estimatedTime,
  difficulty,
  isUnlocked,
  isCompleted,
  onStart,
}: LevelCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
        isUnlocked
          ? 'border-gray-200 hover:border-farm-green hover:shadow-xl'
          : 'border-gray-100 opacity-60'
      } ${isCompleted ? 'border-farm-gold' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Level Number */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-farm-green text-white rounded-full flex items-center justify-center font-bold text-sm">
        {level}
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-farm-gold text-white rounded-full flex items-center justify-center">
          <Star className="w-4 h-4" />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>

        {/* Objectives */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Objectives
          </h4>
          <ul className="space-y-1">
            {objectives.map((objective, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-farm-green mt-1">•</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{estimatedTime}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          disabled={!isUnlocked}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isUnlocked
              ? 'bg-farm-green hover:bg-green-600 text-white transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4" />
          {isCompleted ? 'Play Again' : 'Start Level'}
        </button>
      </div>

      {/* Hover Effect */}
      {isHovered && isUnlocked && (
        <div className="absolute inset-0 bg-farm-green bg-opacity-5 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}

