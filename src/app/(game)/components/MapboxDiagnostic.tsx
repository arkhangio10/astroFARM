'use client';

import { useEffect, useState } from 'react';

interface DiagnosticResult {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
}

export default function MapboxDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  useEffect(() => {
    const runDiagnostics = async () => {
      const diagnostics: DiagnosticResult[] = [];

      // 1. Check token exists
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      diagnostics.push({
        name: 'Token Exists',
        status: token ? 'success' : 'error',
        message: token ? `Token found: ${token.substring(0, 20)}...` : 'No token found'
      });

      // 2. Check token format
      if (token) {
        diagnostics.push({
          name: 'Token Format',
          status: token.startsWith('pk.eyJ') ? 'success' : 'error',
          message: token.startsWith('pk.eyJ') ? 'Valid format' : 'Invalid format - should start with pk.eyJ'
        });
      }

      // 3. Check if mapbox-gl is loaded
      try {
        const mapboxgl = await import('mapbox-gl');
        diagnostics.push({
          name: 'Mapbox GL JS',
          status: mapboxgl ? 'success' : 'error',
          message: mapboxgl ? 'Library loaded' : 'Library not loaded'
        });
      } catch (error) {
        diagnostics.push({
          name: 'Mapbox GL JS',
          status: 'error',
          message: 'Failed to load library'
        });
      }

      // 4. Test API connectivity
      if (token) {
        try {
          const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${token}`);
          diagnostics.push({
            name: 'API Connectivity',
            status: response.ok ? 'success' : 'error',
            message: response.ok ? 'API accessible' : `API error: ${response.status} ${response.statusText}`
          });
        } catch (error) {
          diagnostics.push({
            name: 'API Connectivity',
            status: 'error',
            message: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`
          });
        }
      }

      // 5. Check browser compatibility
      const isCompatible = 'WebGLRenderingContext' in window;
      diagnostics.push({
        name: 'WebGL Support',
        status: isCompatible ? 'success' : 'error',
        message: isCompatible ? 'Browser supports WebGL' : 'Browser does not support WebGL'
      });

      // 6. Check console errors
      const hasErrors = window.console && window.console.error;
      diagnostics.push({
        name: 'Console Errors',
        status: 'warning',
        message: 'Check browser console for detailed errors'
      });

      setResults(diagnostics);
    };

    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '🔄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔍 Mapbox Diagnostic Results
      </h2>
      
      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{getStatusIcon(result.status)}</span>
            <div className="flex-1">
              <h3 className={`font-semibold ${getStatusColor(result.status)}`}>
                {result.name}
              </h3>
              <p className="text-sm text-gray-600">{result.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Common Solutions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure token has no URL restrictions</li>
          <li>• Check browser console for CORS errors</li>
          <li>• Verify token is active in Mapbox dashboard</li>
          <li>• Try incognito mode to rule out extensions</li>
          <li>• Check if ad blockers are interfering</li>
        </ul>
      </div>
    </div>
  );
}
