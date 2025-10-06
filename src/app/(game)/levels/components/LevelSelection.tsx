'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LevelCard from '../../components/LevelCard';
import { ArrowLeft, Trophy, Users } from 'lucide-react';

const levels = [
  {
    id: 1,
    title: 'Humidity Management',
    description: 'Learn to water efficiently using weather forecasts and soil moisture data.',
    objectives: [
      'Maintain soil moisture above 60%',
      'Avoid over-watering during rain',
      'Use water efficiently',
    ],
    estimatedTime: '5-10 minutes',
    difficulty: 'Easy' as const,
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 2,
    title: 'NDVI Interpretation',
    description: 'Distinguish between cloud cover and actual crop stress using vegetation indices.',
    objectives: [
      'Identify cloud-affected NDVI values',
      'Make decisions based on clear data',
      'Understand vegetation health indicators',
    ],
    estimatedTime: '8-12 minutes',
    difficulty: 'Medium' as const,
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 3,
    title: 'Frost Protection',
    description: 'Time your planting to avoid frost damage using temperature data.',
    objectives: [
      'Monitor temperature trends',
      'Plant at optimal times',
      'Protect crops from frost',
    ],
    estimatedTime: '10-15 minutes',
    difficulty: 'Medium' as const,
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 4,
    title: 'Drought Response',
    description: 'Manage water resources during dry periods in the Central Valley.',
    objectives: [
      'Conserve water during drought',
      'Maintain crop health',
      'Balance yield and water use',
    ],
    estimatedTime: '12-18 minutes',
    difficulty: 'Hard' as const,
    isUnlocked: true,
    isCompleted: false,
  },
  {
    id: 5,
    title: 'Final Challenge',
    description: 'Optimize all farming practices for maximum yield and sustainability.',
    objectives: [
      'Achieve high yield score',
      'Maintain water efficiency',
      'Minimize environmental impact',
      'Balance all factors',
    ],
    estimatedTime: '15-20 minutes',
    difficulty: 'Hard' as const,
    isUnlocked: true,
    isCompleted: false,
  },
];

export default function LevelSelection() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleStartLevel = (levelId: number) => {
    setSelectedLevel(levelId);
    // Navigate to game with level parameter
    router.push(`/game?level=${levelId}`);
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green to-farm-blue py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-white hover:text-green-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Level</h1>
          <p className="text-xl text-white/90">
            Learn sustainable farming practices through interactive challenges
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Trophy className="w-8 h-8 text-farm-gold mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-white/80">Achievements</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-farm-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">1,247</div>
            <div className="text-white/80">Players Online</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white">5</div>
            <div className="text-white/80">Levels Available</div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <LevelCard
              key={level.id}
              level={level.id}
              title={level.title}
              description={level.description}
              objectives={level.objectives}
              estimatedTime={level.estimatedTime}
              difficulty={level.difficulty}
              isUnlocked={level.isUnlocked}
              isCompleted={level.isCompleted}
              onStart={() => handleStartLevel(level.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-white/80">
            Each level teaches different aspects of sustainable farming using real NASA data
          </p>
        </div>
      </div>
    </div>
  );
}

