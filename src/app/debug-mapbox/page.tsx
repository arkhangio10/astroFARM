'use client';

import { useEffect, useState } from 'react';

export default function DebugMapboxPage() {
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid' | 'missing'>('checking');
  const [tokenValue, setTokenValue] = useState<string>('');
  const [mapboxLoaded, setMapboxLoaded] = useState(false);

  useEffect(() => {
    // Verificar token
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    setTokenValue(token || '');
    
    if (!token) {
      setTokenStatus('missing');
      return;
    }

    if (!token.startsWith('pk.eyJ')) {
      setTokenStatus('invalid');
      return;
    }

    setTokenStatus('valid');

    // Verificar si Mapbox se puede cargar
    const script = document.createElement('script');
    script.src = `https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js`;
    script.onload = () => {
      setMapboxLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Mapbox GL JS');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'invalid': return 'text-red-600 bg-red-100';
      case 'missing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return '✅ Token válido';
      case 'invalid': return '❌ Token inválido';
      case 'missing': return '⚠️ Token no encontrado';
      default: return '🔄 Verificando...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green to-farm-blue p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔧 Debug Mapbox - AstroFARM
          </h1>

          {/* Token Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Estado del Token</h2>
            <div className={`inline-block px-4 py-2 rounded-lg font-medium ${getStatusColor(tokenStatus)}`}>
              {getStatusText(tokenStatus)}
            </div>
          </div>

          {/* Token Value (masked) */}
          {tokenValue && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Token (masked):</h3>
              <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono">
                {tokenValue.substring(0, 20)}...{tokenValue.substring(tokenValue.length - 10)}
              </code>
            </div>
          )}

          {/* Mapbox Load Status */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Mapbox GL JS:</h3>
            <div className={`inline-block px-4 py-2 rounded-lg font-medium ${
              mapboxLoaded ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'
            }`}>
              {mapboxLoaded ? '✅ Cargado correctamente' : '🔄 Cargando...'}
            </div>
          </div>

          {/* Environment Variables */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Variables de Entorno:</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <span className="text-blue-600">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:</span>{' '}
                  <span className="text-gray-600">
                    {process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? '✅ Configurada' : '❌ No configurada'}
                  </span>
                </div>
                <div>
                  <span className="text-blue-600">NODE_ENV:</span>{' '}
                  <span className="text-gray-600">{process.env.NODE_ENV}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Recomendaciones:</h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              {tokenStatus === 'missing' && (
                <li>• Agrega NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN a tu archivo .env.local</li>
              )}
              {tokenStatus === 'invalid' && (
                <li>• Verifica que el token comience con "pk.eyJ"</li>
              )}
              {tokenStatus === 'valid' && !mapboxLoaded && (
                <li>• El token es válido, pero Mapbox GL JS no se está cargando. Verifica tu conexión a internet.</li>
              )}
              {tokenStatus === 'valid' && mapboxLoaded && (
                <li>• ✅ Todo está configurado correctamente. El problema puede estar en el componente del mapa.</li>
              )}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Recargar Página
            </button>
            <button
              onClick={() => {
                console.log('Token:', process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
                console.log('Mapbox loaded:', mapboxLoaded);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🖥️ Log a Consola
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
