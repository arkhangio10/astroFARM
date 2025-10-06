'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/gameStore';
import { useAuth } from '@/lib/auth/AuthContext';
import HUD from './HUD';
import TipsPopover from './TipsPopover';
import AchievementToast from './AchievementToast';
import LevelCompleteModal from './LevelCompleteModal';
import Leaderboard from './Leaderboard';
import LevelSelection from './LevelSelection';
import GameStats from './GameStats';
import Tutorial from './Tutorial';
import SaveManager from './SaveManager';
import GameSettings from './GameSettings';
import PlayerSetup from './PlayerSetup';
import LocationSelection from './LocationSelection';
import SatelliteLayersPanel from './SatelliteLayersPanel';
import SatelliteMapView from './SatelliteMapView';
import { mockSeeds, mockGameData } from '@/lib/mockData';
import { createSeedForLevel } from '@/lib/levels';
import { SaveData } from '@/lib/saveSystem';
import { Location } from '@/types/game';
import { getLocationById } from '@/lib/locations';

interface PlayerData {
  name: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  goals: string;
}

export default function GameView() {
  const { initializeGame, isInitialized, isGameComplete } = useGameStore();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [gameFlow, setGameFlow] = useState<'setup' | 'location' | 'game'>('setup');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSaveManager, setShowSaveManager] = useState(false);
  const [showGameSettings, setShowGameSettings] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    // Check authentication first
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if player has completed setup and has a selected farm
    if (typeof window !== 'undefined' && isAuthenticated) {
      const savedPlayerData = localStorage.getItem('astrofarm-player-data');
      const savedLocation = localStorage.getItem('astrofarm-selected-location');
      const selectedFarm = localStorage.getItem('astrofarm-selected-farm');
      
      if (savedPlayerData && savedLocation && selectedFarm) {
        setPlayerData(JSON.parse(savedPlayerData));
        setSelectedLocation(getLocationById(savedLocation));
        setGameFlow('game');
        
        // Initialize game with saved data
        const currentSeed = mockSeeds[0];
        initializeGame(currentSeed, mockGameData.initialResources);
      } else if (savedPlayerData && savedLocation) {
        // Player has setup but no farm selected, go to farm room
        router.push('/farm-room');
      }
    }
  }, [initializeGame, isAuthenticated, isLoading, router]);

  const handlePlayerSetupComplete = (data: PlayerData) => {
    setPlayerData(data);
    setGameFlow('location');
    
    // Save player data
    if (typeof window !== 'undefined') {
      localStorage.setItem('astrofarm-player-data', JSON.stringify(data));
    }
  };

  const handleLocationSelect = (locationId: string) => {
    const location = getLocationById(locationId);
    if (location) {
      setSelectedLocation(location);
      setGameFlow('game');
      
      // Save selected location
      if (typeof window !== 'undefined') {
        localStorage.setItem('astrofarm-selected-location', locationId);
      }
      
      // Initialize game with selected location
      const currentSeed = mockSeeds[0];
      initializeGame(currentSeed, mockGameData.initialResources);
      
      // Show tutorial for new players
      if (typeof window !== 'undefined') {
        const hasSeenTutorial = localStorage.getItem('astrofarm-tutorial-seen');
        if (!hasSeenTutorial) {
          setShowTutorial(true);
        }
      }
    }
  };

  const handleLevelSelect = (levelId: number) => {
    const levelSeed = createSeedForLevel(levelId);
    setCurrentLevel(levelId);
    initializeGame(levelSeed, mockGameData.initialResources);
    setShowLevelSelection(false);
  };

  const handleTutorialComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('astrofarm-tutorial-seen', 'true');
    }
  };

  const handleLoadGame = (saveData: SaveData) => {
    // Load the saved game state
    setCurrentLevel(saveData.level);
    // Note: In a real implementation, you would restore the full game state
    // For now, we'll just show a message
    alert(`Loaded save: ${saveData.name}`);
  };

  const handleResetGame = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('astrofarm-player-data');
      localStorage.removeItem('astrofarm-selected-location');
      localStorage.removeItem('astrofarm-tutorial-seen');
    }
    setPlayerData(null);
    setSelectedLocation(null);
    setGameFlow('setup');
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render different screens based on game flow
  if (gameFlow === 'setup') {
    return <PlayerSetup onComplete={handlePlayerSetupComplete} />;
  }

  if (gameFlow === 'location') {
    return (
      <LocationSelection
        onLocationSelect={handleLocationSelect}
        playerLevel={playerData?.experience === 'beginner' ? 1 : playerData?.experience === 'intermediate' ? 2 : 3}
        completedLevels={[]}
      />
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
      {/* Satellite Map Background */}
      <div className="absolute inset-0 z-0">
        <SatelliteMapView />
      </div>

      {/* Satellite Layers Panel */}
      <div className="absolute top-20 left-4 z-20">
        <SatelliteLayersPanel />
      </div>

      {/* Game HUD */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <HUD 
          onLevelSelect={() => setShowLevelSelection(true)}
          onShowTutorial={() => setShowTutorial(true)}
          onShowSaveManager={() => setShowSaveManager(true)}
          onShowGameSettings={() => setShowGameSettings(true)}
          onResetGame={handleResetGame}
        />
      </div>

      {/* Tips Popover */}
      <div className="absolute top-4 right-4 z-20">
        <TipsPopover />
      </div>

      {/* Game Stats */}
      <div className="absolute bottom-4 left-4 z-20">
        <GameStats />
      </div>

      {/* Leaderboard */}
      <div className="absolute bottom-4 right-4 z-20">
        <Leaderboard seedCode="WEEK-2025-01-15" limit={5} />
      </div>

      {/* Achievement Toast */}
      <AchievementToast />

      {/* Level Selection Modal */}
      {showLevelSelection && (
        <LevelSelection
          onLevelSelect={handleLevelSelect}
          onClose={() => setShowLevelSelection(false)}
        />
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <Tutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={handleTutorialComplete}
        />
      )}

      {/* Save Manager Modal */}
      {showSaveManager && (
        <SaveManager
          isOpen={showSaveManager}
          onClose={() => setShowSaveManager(false)}
          onLoadGame={handleLoadGame}
        />
      )}

      {/* Game Settings Modal */}
      {showGameSettings && (
        <GameSettings
          isOpen={showGameSettings}
          onClose={() => setShowGameSettings(false)}
        />
      )}

      {/* Level Complete Modal */}
      {showLevelComplete && (
        <LevelCompleteModal
          onClose={() => setShowLevelComplete(false)}
          onNextLevel={() => {
            setShowLevelComplete(false);
            // Handle next level logic
          }}
        />
      )}

      {/* Game Complete Overlay */}
      {isGameComplete && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold text-center mb-4">Game Complete!</h2>
            <p className="text-center text-gray-600 mb-6">
              Congratulations! You&apos;ve completed the farming simulation.
            </p>
            <div className="flex gap-4">
              <button className="flex-1 bg-farm-green text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                View Results
              </button>
              <button className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
