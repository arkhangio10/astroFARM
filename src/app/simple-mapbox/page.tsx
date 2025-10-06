'use client';

import SimpleMapbox from '../(game)/components/SimpleMapbox';

export default function SimpleMapboxTest() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Simple Mapbox Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="h-[500px] relative">
            <SimpleMapbox />
          </div>
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800 mb-2">Debugging Info:</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Open the browser console (F12)</li>
            <li>• Check for error messages</li>
            <li>• Look for "Token exists: true"</li>
            <li>• Look for "Map loaded!" message</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
