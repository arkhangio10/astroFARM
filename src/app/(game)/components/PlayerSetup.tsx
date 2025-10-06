'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Carrot, Leaf, Flower2, Wheat } from 'lucide-react';

interface PlayerSetupProps {
  farm: any;
  onComplete: (playerData: PlayerData) => void;
  onClose: () => void;
}

interface PlayerData {
  playerName: string;
  learningGoal: string;
  selectedCrop: string;
}

const LEARNING_GOALS = [
  { id: 'water', label: 'Efficient Water Management', icon: '💧' },
  { id: 'climate', label: 'Climate Change Adaptation', icon: '🌡️' },
  { id: 'soil', label: 'Soil Health', icon: '🌱' },
  { id: 'sustainability', label: 'Sustainable Agriculture', icon: '♻️' },
  { id: 'technology', label: 'Agricultural Technology', icon: '🛰️' },
];

// Cultivos por región
const CROPS_BY_REGION: Record<string, Array<{ id: string; name: string; icon?: any; emoji?: string; color: string }>> = {
  'Central Valley': [
    { id: 'almonds', name: 'Almonds', emoji: '🌰', color: 'text-amber-600' },
    { id: 'pistachios', name: 'Pistachios', emoji: '🥜', color: 'text-green-600' },
    { id: 'walnuts', name: 'Walnuts', emoji: '🌰', color: 'text-amber-700' },
    { id: 'grapes', name: 'Grapes (wine & table)', emoji: '🍇', color: 'text-purple-600' },
    { id: 'citrus', name: 'Citrus (oranges, lemons)', emoji: '🍊', color: 'text-orange-500' },
    { id: 'tomatoes', name: 'Tomatoes (processed & fresh)', emoji: '🍅', color: 'text-red-500' },
    { id: 'lettuce', name: 'Lettuce & leafy greens', emoji: '🥬', color: 'text-green-500' },
    { id: 'strawberries', name: 'Strawberries', emoji: '🍓', color: 'text-red-400' },
    { id: 'rice', name: 'Rice', emoji: '🌾', color: 'text-yellow-600' },
    { id: 'cotton', name: 'Cotton', emoji: '🌿', color: 'text-gray-500' },
  ],
  'default': [
    { id: 'carrot', name: 'Carrot', icon: Carrot, color: 'text-orange-500' },
    { id: 'lettuce', name: 'Lettuce', icon: Leaf, color: 'text-green-500' },
    { id: 'tomato', name: 'Tomato', icon: Flower2, color: 'text-red-500' },
    { id: 'corn', name: 'Corn', icon: Wheat, color: 'text-yellow-500' },
  ]
};

export default function PlayerSetup({ farm, onComplete, onClose }: PlayerSetupProps) {
  const [step, setStep] = useState(1);
  const [playerData, setPlayerData] = useState<PlayerData>({
    playerName: '',
    learningGoal: '',
    selectedCrop: '',
  });

  // Obtener cultivos según la región
  const getCropsForRegion = () => {
    // Buscar si la ubicación contiene "Central Valley"
    if (farm.location && farm.location.includes('Central Valley')) {
      return CROPS_BY_REGION['Central Valley'];
    }
    return CROPS_BY_REGION['default'];
  };

  const availableCrops = getCropsForRegion();

  const handleNext = () => {
    if (step === 1 && playerData.playerName) {
      setStep(2);
    } else if (step === 2 && playerData.learningGoal) {
      setStep(3);
    } else if (step === 3 && playerData.selectedCrop) {
      onComplete(playerData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/campo_virgen.png)',
          }}
        />
        
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Player Setup - {farm.name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {farm.location}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    i <= step ? 'bg-farm-green' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
              {/* Step 1: Player Name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      What&apos;s your name?
                    </h3>
                    <p className="text-gray-600">
                      Enter your name to personalize your experience
                    </p>
                  </div>
                  
                  <input
                    type="text"
                    value={playerData.playerName}
                    onChange={(e) => setPlayerData(prev => ({ ...prev, playerName: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-farm-green focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
              )}

              {/* Step 2: Learning Goal */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Hello {playerData.playerName}! 👋
                    </h3>
                    <p className="text-gray-600">
                      What would you like to learn about sustainable agriculture?
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {LEARNING_GOALS.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setPlayerData(prev => ({ ...prev, learningGoal: goal.id }))}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          playerData.learningGoal === goal.id
                            ? 'border-farm-green bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <span className="font-medium text-gray-800">{goal.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Crop Selection */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                      What crop do you want to plant?
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {farm.location.includes('Central Valley') 
                        ? 'Typical crops from California Central Valley'
                        : 'Each crop has its own challenges and rewards'}
                    </p>
                  </div>
                  
                  {/* Grid responsivo para cultivos */}
                  <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableCrops.map((crop) => {
                        const Icon = crop.icon;
                        return (
                          <button
                            key={crop.id}
                            onClick={() => setPlayerData(prev => ({ ...prev, selectedCrop: crop.id }))}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                              playerData.selectedCrop === crop.id
                                ? 'border-farm-green bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            {Icon ? (
                              <Icon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 ${crop.color}`} />
                            ) : (
                              <span className={`text-2xl sm:text-3xl block mb-1 ${crop.color}`}>
                                {crop.emoji}
                              </span>
                            )}
                            <span className="text-xs sm:text-sm font-medium text-gray-800 block">
                              {crop.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex gap-3">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !playerData.playerName) ||
                    (step === 2 && !playerData.learningGoal) ||
                    (step === 3 && !playerData.selectedCrop)
                  }
                  className="flex-1 px-4 py-3 bg-farm-green hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {step === 3 ? 'Start!' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}