'use client';

import MapboxDiagnostic from '../(game)/components/MapboxDiagnostic';
import SimpleMapbox from '../(game)/components/SimpleMapbox';
import { useState } from 'react';

export default function MapboxDiagnosticPage() {
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔧 Mapbox Diagnostic Tool
        </h1>

        {/* Diagnostic Results */}
        <div className="mb-6">
          <MapboxDiagnostic />
        </div>

        {/* Test Map */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Test Map
            </h2>
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {showMap && (
            <div className="h-[400px] relative border-2 border-gray-200 rounded-lg overflow-hidden">
              <SimpleMapbox />
            </div>
          )}
        </div>

        {/* Manual Token Test */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Manual Token Test
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Token:
              </label>
              <code className="block p-3 bg-gray-100 rounded-lg text-xs font-mono break-all">
                {process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'Not found'}
              </code>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>To test with a different token:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Update NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env.local</li>
                <li>Restart the development server</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Console Output */}
        <div className="mt-6 bg-gray-800 text-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">
            📋 Console Output
          </h2>
          <div className="text-sm font-mono">
            <p className="text-gray-400 mb-2">Check browser console for:</p>
            <ul className="space-y-1">
              <li className="text-green-400">• Token exists: true/false</li>
              <li className="text-green-400">• Token format: pk.eyJ...</li>
              <li className="text-green-400">• Creating map...</li>
              <li className="text-green-400">• ✅ Map loaded!</li>
              <li className="text-red-400">• ❌ Map error: [error details]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
