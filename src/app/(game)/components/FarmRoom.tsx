'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, 
  MapPin, 
  Play, 
  Settings, 
  Trash2, 
  Edit3, 
  Eye,
  Calendar,
  Trophy,
  BarChart3,
  LogOut
} from 'lucide-react';
import SmartLocationMap from './SmartLocationMap';
import PlayerSetup from './PlayerSetup';
import GameScreen from './GameScreen';

interface Farm {
  id: string;
  name: string;
  location: string;
  level: number;
  status: 'active' | 'completed' | 'paused' | 'new';
  score: number;
  lastPlayed: string;
  achievements: string[];
  progress: number;
  createdAt: string;
  description: string;
}

export default function FarmRoom() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [pendingFarmData, setPendingFarmData] = useState<Partial<Farm> | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [selectedFarmForPlay, setSelectedFarmForPlay] = useState<Farm | null>(null);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [currentPlayerData, setCurrentPlayerData] = useState<any>(null);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setIsLoading(true);
    
    try {
      const { data: player } = await supabase
        .from('players')
        .select('id')
        .eq('anon_id', user?.id)
        .single();
      
      if (player) {
        const { data: farmsData, error } = await supabase
          .from('farms')
          .select('*')
          .eq('player_id', player.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error loading farms:', error);
        } else if (farmsData) {
          const formattedFarms: Farm[] = farmsData.map(farm => ({
            id: farm.id,
            name: farm.name,
            location: farm.location,
            level: farm.level,
            status: farm.status as 'active' | 'completed' | 'paused' | 'new',
            score: farm.score || 0,
            lastPlayed: farm.last_played ? new Date(farm.last_played).toISOString().split('T')[0] : '',
            achievements: farm.achievements || [],
            progress: farm.progress || 0,
            createdAt: new Date(farm.created_at).toISOString().split('T')[0],
            description: farm.description || ''
          }));
          
          setFarms(formattedFarms);
        }
      }
    } catch (error) {
      console.error('Error in loadFarms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFarm = async (farmData: Partial<Farm>) => {
    if (selectedLocation && farmData.location) {
      try {
        const { data: player } = await supabase
          .from('players')
          .select('id')
          .eq('anon_id', user?.id)
          .single();
        
        if (!player) {
          console.error('No player found');
          return;
        }
        
        const { data: newFarmData, error } = await supabase
          .from('farms')
          .insert({
            player_id: player.id,
            name: farmData.name || 'New Farm',
            location: selectedLocation.name,
            location_data: {
              coordinates: selectedLocation.coordinates,
              region: selectedLocation.region
            },
            level: 1,
            status: 'new',
            score: 0,
            achievements: [],
            progress: 0,
            description: farmData.description || `Farm located in ${selectedLocation.name}`,
            seed_code: `SEED-${new Date().toISOString().split('T')[0]}`
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating farm:', error);
          return;
        }
        
        if (newFarmData) {
          const newFarm: Farm = {
            id: newFarmData.id,
            name: newFarmData.name,
            location: newFarmData.location,
            level: newFarmData.level,
            status: newFarmData.status as 'new',
            score: 0,
            lastPlayed: new Date().toISOString().split('T')[0],
            achievements: [],
            progress: 0,
            createdAt: new Date().toISOString().split('T')[0],
            description: newFarmData.description || ''
          };
          
          console.log('✅ New farm created:', newFarm);
          setFarms(prev => [newFarm, ...prev]);
          setShowCreateForm(false);
          setSelectedLocation(null);
          setPendingFarmData(null);
        }
      } catch (error) {
        console.error('Error in handleCreateFarm:', error);
      }
    } else {
      setPendingFarmData(farmData);
      setShowCreateForm(false);
      setShowLocationMap(true);
    }
  };

  const handleLocationSelect = (location: any) => {
    console.log('📍 Location selected:', location);
    
    setSelectedLocation(location);
    
    setShowLocationMap(false);
    setShowCreateForm(true);
  };

  const handleLocationMapClose = () => {
    setShowLocationMap(false);
    setPendingFarmData(null);
  };

  const handleEditFarm = (farm: Farm) => {
    setEditingFarm(farm);
    setShowCreateForm(true);
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (confirm('Are you sure you want to delete this farm?')) {
      try {
        const { error } = await supabase
          .from('farms')
          .delete()
          .eq('id', farmId);
        
        if (error) {
          console.error('Error deleting farm:', error);
        } else {
          setFarms(prev => prev.filter(farm => farm.id !== farmId));
        }
      } catch (error) {
        console.error('Error in handleDeleteFarm:', error);
      }
    }
  };

  const handlePlayFarm = (farm: Farm) => {
    const playerData = localStorage.getItem(`astrofarm-player-${farm.id}`);
    
    if (!playerData || farm.status === 'new') {
      setSelectedFarmForPlay(farm);
      setShowPlayerSetup(true);
    } else {
      localStorage.setItem('astrofarm-selected-farm', JSON.stringify(farm));
      localStorage.setItem('astrofarm-selected-location', farm.location);
      router.push('/play');
    }
  };

  const handlePlayerSetupComplete = (playerData: any) => {
    if (selectedFarmForPlay) {
      localStorage.setItem(`astrofarm-player-${selectedFarmForPlay.id}`, JSON.stringify(playerData));
      
      setFarms(prev => prev.map(f => 
        f.id === selectedFarmForPlay.id 
          ? { ...f, status: 'active' }
          : f
      ));
      
      localStorage.setItem('astrofarm-selected-farm', JSON.stringify({
        ...selectedFarmForPlay,
        status: 'active'
      }));
      localStorage.setItem('astrofarm-selected-location', selectedFarmForPlay.location);
      
      setCurrentPlayerData(playerData);
      setShowPlayerSetup(false);
      setShowGameScreen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'new': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      case 'new': return 'New';
      default: return 'Unknown';
    }
  };

  const getTierFromScore = (score: number) => {
    if (score >= 92) return { tier: 'PLATINUM', color: 'text-purple-600' };
    if (score >= 85) return { tier: 'GOLD', color: 'text-yellow-600' };
    if (score >= 75) return { tier: 'SILVER', color: 'text-gray-600' };
    if (score >= 60) return { tier: 'BRONZE', color: 'text-orange-600' };
    return { tier: 'NEW', color: 'text-gray-400' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your farm room...</p>
        </div>
      </div>
    );
  }

  if (showGameScreen && selectedFarmForPlay && currentPlayerData) {
    return (
      <GameScreen 
        farm={selectedFarmForPlay} 
        playerData={currentPlayerData} 
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/granja_2.png)',
        }}
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      <div className="relative z-10 min-h-screen">
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Farm Room
                </h1>
                <p className="text-white/80">
                  Welcome, {user?.name} - Manage your agricultural fields
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Total Farms</p>
                  <p className="text-3xl font-bold text-white">{farms.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-white">
                    {farms.filter(f => f.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Average Score</p>
                  <p className="text-3xl font-bold text-white">
                    {farms.length > 0 ? Math.round(farms.reduce((acc, farm) => acc + farm.score, 0) / farms.length) : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Last Activity</p>
                  <p className="text-sm font-semibold text-white">
                    {farms.length > 0 ? new Date(farms[0].lastPlayed).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-3 bg-farm-green hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-6 h-6" />
              Create New Farm
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => {
              const tier = getTierFromScore(farm.score);
              
              return (
                <div key={farm.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="p-6 border-b border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {farm.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-white/70 mb-2">
                          <MapPin className="w-4 h-4" />
                          {farm.location}
                        </div>
                        <p className="text-sm text-white/60">
                          {farm.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(farm.status)}`}>
                        {getStatusText(farm.status)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-white/70 mb-1">
                        <span>Progress</span>
                        <span>{farm.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-farm-green h-2 rounded-full transition-all duration-300"
                          style={{ width: `${farm.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-white/70">Level</p>
                        <p className="text-lg font-bold text-white">{farm.level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Score</p>
                        <p className={`text-lg font-bold ${tier.color}`}>
                          {farm.score} ({tier.tier})
                        </p>
                      </div>
                    </div>

                    {farm.achievements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-white/70 mb-2">Achievements</p>
                        <div className="flex flex-wrap gap-1">
                          {farm.achievements.map((achievement, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-yellow-500/20 text-yellow-200 text-xs rounded-full border border-yellow-500/30"
                            >
                              {achievement.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm text-white/60">
                        Last played: {new Date(farm.lastPlayed).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePlayFarm(farm)}
                        className="flex-1 bg-farm-green hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        Play
                      </button>
                      <button 
                        onClick={() => handleEditFarm(farm)}
                        className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFarm(farm.id)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-200 font-medium py-2 px-3 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {farms.length === 0 && (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-16 h-16 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                You don't have any farms yet
              </h3>
              <p className="text-white/70 mb-8 text-lg">
                Create your first farm to start your agricultural adventure
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-farm-green hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create First Farm
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <CreateFarmModal
          farm={editingFarm}
          pendingFarmData={pendingFarmData}
          onSave={handleCreateFarm}
          onClose={() => {
            setShowCreateForm(false);
            setEditingFarm(null);
            setSelectedLocation(null);
            setPendingFarmData(null);
          }}
          onOpenLocationMap={(currentFormData) => {
            setPendingFarmData(currentFormData);
            setShowCreateForm(false);
            setShowLocationMap(true);
          }}
          selectedLocation={selectedLocation}
        />
      )}

      {showLocationMap && (
        <SmartLocationMap
          farmName={pendingFarmData?.name}
          onLocationSelect={handleLocationSelect}
          onClose={handleLocationMapClose}
        />
      )}

      {showPlayerSetup && selectedFarmForPlay && (
        <PlayerSetup
          farm={selectedFarmForPlay}
          onComplete={handlePlayerSetupComplete}
          onClose={() => {
            setShowPlayerSetup(false);
            setSelectedFarmForPlay(null);
          }}
        />
      )}
    </div>
  );
}

interface CreateFarmModalProps {
  farm?: Farm | null;
  pendingFarmData?: Partial<Farm> | null;
  onSave: (farmData: Partial<Farm>) => void;
  onClose: () => void;
  onOpenLocationMap: (currentFormData: any) => void;
  selectedLocation?: any;
}

function CreateFarmModal({ farm, pendingFarmData, onSave, onClose, onOpenLocationMap, selectedLocation }: CreateFarmModalProps) {
  const [formData, setFormData] = useState({
    name: pendingFarmData?.name || farm?.name || '',
    location: selectedLocation?.name || farm?.location || '',
    description: pendingFarmData?.description || farm?.description || '',
  });

  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        location: selectedLocation.name,
        description: prev.description || `Farm located in ${selectedLocation.name}`
      }));
    }
  }, [selectedLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {farm ? 'Edit Farm' : 'Create New Farm'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green focus:border-transparent"
              placeholder="My Sustainable Farm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <button
              type="button"
              onClick={() => onOpenLocationMap(formData)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {formData.location || 'Select location on map'}
              </span>
              <span className="text-gray-400">→</span>
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Click to choose the exact location on the map
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green focus:border-transparent"
              rows={3}
              placeholder="Describe your farm and goals..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-farm-green hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {farm ? 'Update' : 'Create Farm'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
