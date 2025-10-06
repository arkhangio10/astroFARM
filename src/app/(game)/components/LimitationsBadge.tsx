'use client';

import { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { GAME_CONFIG } from '@/lib/config';

export default function LimitationsBadge() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative">
      {/* Badge */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        <AlertTriangle className="w-4 h-4" />
        Data Limitations
      </button>

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 z-30">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Data Limitations</h3>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Satellite Data Limitations</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {GAME_CONFIG.DATA_LIMITATIONS.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Data Sources</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {Object.entries(GAME_CONFIG.NASA_SOURCES).map(([key, source]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{source.name}</span>
                        <span className="text-gray-500">{source.resolution}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800 mb-2">Educational Purpose</h4>
                  <p className="text-sm text-blue-700">
                    This simulation is for educational purposes only. Real farming decisions should be based on current, local data and expert advice.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-600">
                💡 For more information, visit the{' '}
                <a 
                  href="/datos-y-principios" 
                  className="text-farm-blue hover:text-blue-600 underline"
                >
                  Data & Principles
                </a>{' '}
                page
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

