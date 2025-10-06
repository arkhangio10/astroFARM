'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { MapPin, Calendar, Trophy, BarChart3, Play, Plus, Eye } from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  location: string;
  level: number;
  status: 'active' | 'completed' | 'paused';
  score: number;
  lastPlayed: string;
  achievements: string[];
  progress: number;
}

export default function MyFarms() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de granjas del usuario
    // En producción, esto vendría de la API
    const loadFarms = async () => {
      setIsLoading(true);
      
      // Datos mock para demostración
      const mockFarms: Farm[] = [
        {
          id: 'farm-1',
          name: 'Granja Central Valley',
          location: 'Fresno, California',
          level: 3,
          status: 'active',
          score: 85,
          lastPlayed: '2025-01-15',
          achievements: ['WATER_SAVER', 'DATA_ANALYST'],
          progress: 75,
        },
        {
          id: 'farm-2',
          name: 'Campo Experimental',
          location: 'Tulare, California',
          level: 2,
          status: 'completed',
          score: 92,
          lastPlayed: '2025-01-14',
          achievements: ['FROST_MASTER', 'SUPER_CARROT_GOLD'],
          progress: 100,
        },
        {
          id: 'farm-3',
          name: 'Huerto Sostenible',
          location: 'Kern, California',
          level: 1,
          status: 'paused',
          score: 68,
          lastPlayed: '2025-01-12',
          achievements: ['WATER_SAVER'],
          progress: 45,
        },
      ];

      // Simular delay de carga
      setTimeout(() => {
        setFarms(mockFarms);
        setIsLoading(false);
      }, 1000);
    };

    loadFarms();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      default: return 'Unknown';
    }
  };

  const getTierFromScore = (score: number) => {
    if (score >= 92) return { tier: 'PLATINUM', color: 'text-purple-600' };
    if (score >= 85) return { tier: 'GOLD', color: 'text-yellow-600' };
    if (score >= 75) return { tier: 'SILVER', color: 'text-gray-600' };
    if (score >= 60) return { tier: 'BRONZE', color: 'text-orange-600' };
    return { tier: 'NONE', color: 'text-gray-400' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your farms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          My Farms
        </h1>
        <p className="text-gray-600">
          Manage and play on your agricultural fields
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Farms</p>
              <p className="text-2xl font-bold text-gray-800">{farms.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {farms.filter(f => f.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {Math.round(farms.reduce((acc, farm) => acc + farm.score, 0) / farms.length)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Activity</p>
              <p className="text-sm font-semibold text-gray-800">
                {farms.length > 0 ? new Date(farms[0].lastPlayed).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Farm Button */}
      <div className="mb-6">
        <button className="inline-flex items-center gap-2 bg-farm-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Create New Farm
        </button>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => {
          const tier = getTierFromScore(farm.score);
          
          return (
            <div key={farm.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              {/* Farm Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {farm.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {farm.location}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(farm.status)}`}>
                    {getStatusText(farm.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{farm.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-farm-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${farm.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Farm Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="text-lg font-semibold text-gray-800">{farm.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className={`text-lg font-semibold ${tier.color}`}>
                      {farm.score} ({tier.tier})
                    </p>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Achievements</p>
                  <div className="flex flex-wrap gap-1">
                    {farm.achievements.map((achievement, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                      >
                        {achievement.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last Played */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Last played: {new Date(farm.lastPlayed).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-farm-green hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {farms.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            You don't have any farms yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first farm to start your farming adventure
          </p>
          <button className="bg-farm-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Create First Farm
          </button>
        </div>
      )}
    </div>
  );
}
