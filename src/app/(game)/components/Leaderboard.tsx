'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Users, Clock, Star } from 'lucide-react';
import { LeaderboardResponse } from '@/types/api';
import { mockLeaderboardData } from '@/lib/mockData';

interface LeaderboardProps {
  seedCode: string;
  roomCode?: string;
  limit?: number;
}

export default function Leaderboard({ seedCode, roomCode, limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        seed: seedCode,
        limit: limit.toString(),
      });
      
      if (roomCode) {
        params.append('room', roomCode);
      }
      
      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      // Use mock data when API fails
      console.log('Using mock leaderboard data');
      const mockData: LeaderboardResponse = {
        runs: mockLeaderboardData.slice(0, limit),
        seed: seedCode,
        totalPlayers: mockLeaderboardData.length,
      };
      setLeaderboard(mockData);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [seedCode, roomCode, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return '💎';
      case 'GOLD':
        return '🥇';
      case 'SILVER':
        return '🥈';
      case 'BRONZE':
        return '🥉';
      default:
        return '⭐';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return 'text-purple-600';
      case 'GOLD':
        return 'text-yellow-600';
      case 'SILVER':
        return 'text-gray-600';
      case 'BRONZE':
        return 'text-orange-600';
      default:
        return 'text-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green"></div>
          <span className="ml-2 text-gray-600">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <div className="text-center text-red-600">
          <p>Error loading leaderboard: {error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-2 text-farm-blue hover:text-blue-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!leaderboard) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-farm-gold" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {roomCode ? `Room ${roomCode}` : 'Global'} Leaderboard
          </h3>
          <p className="text-sm text-gray-600">
            Seed: {leaderboard.seed} • {leaderboard.totalPlayers} players
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {leaderboard.runs.map((run, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              index === 0 ? 'bg-yellow-50 border border-yellow-200' :
              index === 1 ? 'bg-gray-50 border border-gray-200' :
              index === 2 ? 'bg-orange-50 border border-orange-200' :
              'bg-gray-50'
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 text-center">
              {index === 0 && <Trophy className="w-5 h-5 text-yellow-600 mx-auto" />}
              {index === 1 && <Trophy className="w-5 h-5 text-gray-600 mx-auto" />}
              {index === 2 && <Trophy className="w-5 h-5 text-orange-600 mx-auto" />}
              {index > 2 && (
                <span className="text-sm font-medium text-gray-600">
                  #{index + 1}
                </span>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{run.playerAlias}</span>
                <span className={`text-lg ${getTierColor(run.tier)}`}>
                  {getTierIcon(run.tier)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {run.scoreTotal}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(run.durationS)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Rankings update in real-time • {leaderboard.totalPlayers} total players
        </p>
      </div>
    </div>
  );
}

