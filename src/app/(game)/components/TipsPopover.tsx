'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { evaluateTips, getTipMessage, getTipSeverity } from '@/lib/tips';
import { Info, AlertTriangle, BookOpen, X } from 'lucide-react';

export default function TipsPopover() {
  const { currentDay, actions, resources } = useGameStore();
  const [activeTips, setActiveTips] = useState<any[]>([]);
  const [showTips, setShowTips] = useState(false);
  const [currentTip, setCurrentTip] = useState<any>(null);

  useEffect(() => {
    // Evaluate tips based on current game state
    const gameState = useGameStore.getState();
    const context = {
      state: gameState,
      currentData: null, // Could be actual data from API
      limitations: ['Resolution: ~250m', 'Latency: 1-2 days', 'Cloud cover affects accuracy'],
    };

    const tips = evaluateTips(gameState, context);
    setActiveTips(tips);

    // Show the most recent tip
    if (tips.length > 0) {
      setCurrentTip(tips[tips.length - 1]);
      setShowTips(true);
    }
  }, [currentDay, actions, resources]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'edu':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'edu':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (!currentTip) return null;

  return (
    <div className="relative">
      {/* Tips Button */}
      <button
        onClick={() => setShowTips(!showTips)}
        className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg hover:bg-white transition-colors"
      >
        <div className="flex items-center gap-2">
          {getSeverityIcon(currentTip.severity)}
          <span className="text-sm font-medium">Tips</span>
          {activeTips.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeTips.length}
            </span>
          )}
        </div>
      </button>

      {/* Tips Panel */}
      {showTips && (
        <div className="absolute top-full right-0 mt-2 w-80 z-30">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Farming Tips</h3>
              <button
                onClick={() => setShowTips(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tips List */}
            <div className="max-h-96 overflow-y-auto">
              {activeTips.map((tip, index) => (
                <div
                  key={tip.id}
                  className={`p-4 border-b border-gray-100 ${getSeverityColor(tip.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(tip.severity)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {getTipMessage(tip, { state: useGameStore.getState(), currentData: null, limitations: [] })}
                      </p>
                      {tip.tags && tip.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tip.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-600">
                💡 Tips are based on real NASA data and sustainable farming practices
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

