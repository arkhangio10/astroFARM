'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Importar SmartLocationMap de forma dinámica
const SmartLocationMap = dynamic(
  () => import('../(game)/components/SmartLocationMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando selector de mapas...</p>
        </div>
      </div>
    )
  }
);

interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  region: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  recommended: boolean;
}

export default function TestMapboxPage() {
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setShowMap(false);
    console.log('Ubicación seleccionada:', location);
  };

  const handleClose = () => {
    setShowMap(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-green to-farm-blue p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🗺️ Prueba de Mapbox - AstroFARM
          </h1>
          <p className="text-xl text-white/90 mb-6">
            Verificación de rendimiento y funcionalidad
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🚀 Rendimiento</h3>
            <p className="text-sm text-gray-600">
              Mapbox debería cargar 3x más rápido que Google Maps
            </p>
            <div className="mt-3 text-green-600 font-medium">
              ✅ Optimizado
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">🎨 Personalización</h3>
            <p className="text-sm text-gray-600">
              Estilo satelital perfecto para datos agrícolas
            </p>
            <div className="mt-3 text-green-600 font-medium">
              ✅ Configurado
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📱 Móvil</h3>
            <p className="text-sm text-gray-600">
              Rendimiento optimizado para dispositivos móviles
            </p>
            <div className="mt-3 text-green-600 font-medium">
              ✅ Responsive
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowMap(true)}
            className="bg-white text-farm-green px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            🗺️ Probar Mapbox
          </button>
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ✅ Ubicación Seleccionada
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700">{selectedLocation.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedLocation.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedLocation.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    selectedLocation.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedLocation.difficulty === 'beginner' ? 'Principiante' :
                     selectedLocation.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  </span>
                  <span className="text-xs text-gray-500">{selectedLocation.region}</span>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Características:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedLocation.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-farm-green rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Coordenadas: {selectedLocation.coordinates[0]}, {selectedLocation.coordinates[1]}
              </p>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📊 Métricas de Rendimiento Esperadas
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Mapbox vs Google Maps</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tiempo de carga:</span>
                  <span className="text-green-600">~800ms vs ~2.5s</span>
                </div>
                <div className="flex justify-between">
                  <span>Tamaño del bundle:</span>
                  <span className="text-green-600">~200KB vs ~400KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Requests de red:</span>
                  <span className="text-green-600">3-5 vs 8-12</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Beneficios</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Carga más rápida</li>
                <li>✅ Mejor rendimiento móvil</li>
                <li>✅ Mayor personalización</li>
                <li>✅ Costos más bajos</li>
                <li>✅ Ideal para datos científicos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🧪 Instrucciones de Prueba
          </h3>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>Haz clic en "Probar Mapbox" para abrir el selector de mapas</li>
            <li>Observa la velocidad de carga (debería ser muy rápida)</li>
            <li>Prueba la navegación y zoom del mapa</li>
            <li>Selecciona una ubicación para ver la funcionalidad completa</li>
            <li>Verifica que los marcadores se animen correctamente</li>
            <li>Prueba en diferentes tamaños de pantalla (responsive)</li>
          </ol>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <SmartLocationMap
          onLocationSelect={handleLocationSelect}
          onClose={handleClose}
          farmName="Prueba Mapbox"
        />
      )}
    </div>
  );
}
