'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Play, Droplets, Zap, DollarSign, Sprout } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function Tutorial({ isOpen, onClose, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: 'Welcome to AstroFarm!',
      content: 'Learn sustainable farming using real NASA satellite data. Make decisions based on actual environmental conditions.',
      position: 'bottom',
    },
    {
      id: 2,
      title: 'Your Resources',
      content: 'Manage four key resources: Water, Fertilizer, Money, and Seeds. Each action costs resources, so plan carefully!',
      position: 'bottom',
    },
    {
      id: 3,
      title: 'Game Actions',
      content: 'Use the action buttons to water crops, fertilize soil, plant seeds, and harvest. Each action affects your scores.',
      position: 'bottom',
    },
    {
      id: 4,
      title: 'Scoring System',
      content: 'Your performance is measured by Yield (production), Water (efficiency), and Environment (sustainability) scores.',
      position: 'bottom',
    },
    {
      id: 5,
      title: 'Educational Tips',
      content: 'Read contextual tips that teach you about sustainable farming practices and NASA data interpretation.',
      position: 'left',
    },
    {
      id: 6,
      title: 'Achievements',
      content: 'Earn Super Carrot medals for excellent farming practices. Bronze, Silver, Gold, and Platinum tiers await!',
      position: 'top',
    },
    {
      id: 7,
      title: 'Ready to Farm!',
      content: 'You\'re ready to start your sustainable farming journey. Good luck and remember: every decision matters!',
      position: 'bottom',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleSkip}
      />

      {/* Tutorial Modal */}
      <div 
        className={`relative bg-white rounded-xl shadow-2xl max-w-md mx-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-farm-green to-farm-blue text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Tutorial</h2>
              <p className="text-green-100 text-sm">Step {currentStep + 1} of {tutorialSteps.length}</p>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {currentStepData.title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {currentStepData.content}
          </p>

          {/* Step-specific content */}
          {currentStep === 1 && (
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-800">
                <Play className="w-5 h-5" />
                <span className="font-medium">Interactive Learning</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                This game uses real NASA data to teach sustainable farming practices.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Water</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Fertilizer</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-3">
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Money</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-3">
                <Sprout className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Seeds</span>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-2xl">🥇</span>
                <span className="font-medium">Achievement System</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Earn medals for sustainable farming practices and high scores.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip Tutorial
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-farm-green hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Start Playing' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
