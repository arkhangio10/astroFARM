'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, CheckCircle, Info } from 'lucide-react';

// Importar Mapbox de forma segura
let mapboxgl: any;
if (typeof window !== 'undefined') {
  mapboxgl = require('mapbox-gl');
  require('mapbox-gl/dist/mapbox-gl.css');
}

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

// Datos de ubicaciones sugeridas
const LOCATIONS: Location[] = [
  {
    id: 'fresno-central',
    name: 'Fresno Central Valley',
    description: 'Región agrícola principal con excelente acceso a datos de la NASA',
    coordinates: [-119.7871, 36.7378], // [lng, lat] para Mapbox
    region: 'Central Valley',
    difficulty: 'beginner',
    features: ['Datos NDVI completos', 'Precipitación confiable', 'Temperatura estable'],
    recommended: true
  },
  {
    id: 'tulare-basin',
    name: 'Tulare Basin',
    description: 'Cuenca agrícola con desafíos de gestión de agua',
    coordinates: [-119.3473, 36.2077],
    region: 'Central Valley',
    difficulty: 'intermediate',
    features: ['Gestión de sequía', 'Datos de humedad del suelo', 'Variabilidad climática'],
    recommended: true
  },
  {
    id: 'kern-county',
    name: 'Kern County',
    description: 'Región desértica con agricultura de precisión',
    coordinates: [-118.7273, 35.3433],
    region: 'Central Valley',
    difficulty: 'advanced',
    features: ['Agricultura de precisión', 'Datos de riego', 'Tecnología avanzada'],
    recommended: false
  },
  {
    id: 'merced-valley',
    name: 'Merced Valley',
    description: 'Valle fértil con tradición agrícola',
    coordinates: [-120.4829, 37.3022],
    region: 'Central Valley',
    difficulty: 'beginner',
    features: ['Suelo fértil', 'Clima templado', 'Datos históricos completos'],
    recommended: true
  },
  {
    id: 'kings-county',
    name: 'Kings County',
    description: 'Condado con diversidad de cultivos',
    coordinates: [-119.8157, 36.0753],
    region: 'Central Valley',
    difficulty: 'intermediate',
    features: ['Diversidad de cultivos', 'Datos de rendimiento', 'Sostenibilidad'],
    recommended: false
  }
];

interface LocationMapMapboxProps {
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
  farmName?: string;
}

export default function LocationMapMapbox({ onLocationSelect, onClose, farmName }: LocationMapMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Función para crear iconos personalizados
  const createCustomMarker = (location: Location, isSelected: boolean = false) => {
    const color = isSelected ? '#22c55e' : (location.recommended ? '#fbbf24' : '#3b82f6');
    const icon = location.recommended ? '⭐' : '📍';
    
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: 40px;
      height: 40px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: all 0.2s ease;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      z-index: ${isSelected ? '1000' : '100'};
    `;
    el.innerHTML = icon;
    
    return el;
  };

  // Función para inicializar el mapa
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || map.current) return;

    // Verificar que mapboxgl esté disponible
    if (!mapboxgl) {
      console.error('Mapbox GL JS not available');
      setError('Mapbox GL JS no está disponible. Recarga la página.');
      return;
    }

    try {
      setLoadingProgress(10);
      
      // Verificar token de Mapbox
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!mapboxToken) {
        setError('Mapbox access token not found. Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN');
        return;
      }

      // Validar formato del token
      if (!mapboxToken.startsWith('pk.eyJ')) {
        setError('Invalid Mapbox token format. Token should start with "pk.eyJ"');
        return;
      }

      setLoadingProgress(20);
      
      // Configurar el token de Mapbox
      mapboxgl.accessToken = mapboxToken;
      console.log('🔑 Mapbox token configured:', mapboxToken.substring(0, 20) + '...');

      setLoadingProgress(40);

      // Crear el mapa con configuración simplificada
      console.log('🗺️ Creating Mapbox map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [-119.5, 36.5],
        zoom: 8,
        // Configuración simplificada para mejor compatibilidad
        attributionControl: false,
        logoPosition: 'bottom-left'
      });

      setLoadingProgress(60);

      // Agregar controles básicos
      if (map.current) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      setLoadingProgress(80);

      // Esperar a que el mapa esté listo
      if (map.current) {
        map.current.on('load', () => {
          console.log('✅ Mapbox map loaded successfully');
          setLoadingProgress(90);
          
          // Crear marcadores para cada ubicación
          LOCATIONS.forEach((location, index) => {
            const markerEl = createCustomMarker(location, false);
            
            const marker = new mapboxgl.Marker({
              element: markerEl,
              anchor: 'center'
            })
              .setLngLat(location.coordinates)
              .addTo(map.current!);

            // Agregar evento de click
            markerEl.addEventListener('click', () => {
              handleLocationClick(location);
            });

            // Efecto hover
            markerEl.addEventListener('mouseenter', () => {
              if (!selectedLocation || selectedLocation.id !== location.id) {
                markerEl.style.transform = 'scale(1.1)';
              }
            });

            markerEl.addEventListener('mouseleave', () => {
              if (!selectedLocation || selectedLocation.id !== location.id) {
                markerEl.style.transform = 'scale(1)';
              }
            });

            markers.current.push(marker);
          });

          setMapLoaded(true);
          setLoadingProgress(100);
          console.log('🎯 Map initialization complete');
        });

        // Manejar errores del mapa
        map.current.on('error', (e) => {
          console.error('❌ Mapbox error:', e);
          setError(`Error al cargar el mapa: ${e.error?.message || 'Error desconocido'}`);
        });
      }

    } catch (error) {
      console.error('❌ Error initializing Mapbox:', error);
      setError(error instanceof Error ? error.message : 'Error al inicializar el mapa');
      setLoadingProgress(0);
    }
  }, []);

  // Manejar click en ubicación
  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    
    // Actualizar marcadores visualmente
    markers.current.forEach((marker, index) => {
      const loc = LOCATIONS[index];
      const isSelected = loc.id === location.id;
      const markerEl = marker.getElement();
      
      if (markerEl) {
        const color = isSelected ? '#22c55e' : (loc.recommended ? '#fbbf24' : '#3b82f6');
        const icon = loc.recommended ? '⭐' : '📍';
        
        markerEl.style.background = color;
        markerEl.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
        markerEl.style.zIndex = isSelected ? '1000' : '100';
        markerEl.innerHTML = icon;
      }
    });

    // Centrar el mapa en la ubicación
    if (map.current) {
      map.current.flyTo({
        center: location.coordinates,
        zoom: 10,
        duration: 1000
      });
    }
  };

  // Confirmar selección
  const handleConfirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  // Inicializar el mapa cuando el componente se monte
  useEffect(() => {
    console.log('🚀 LocationMapMapbox component mounted');
    
    // Inicializar inmediatamente si el container está listo
    if (mapContainer.current) {
      initializeMap();
    } else {
      // Pequeño delay si el container no está listo
      const timer = setTimeout(() => {
        if (mapContainer.current && !map.current) {
          initializeMap();
        }
      }, 200);

      return () => clearTimeout(timer);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markers.current = [];
    };
  }, [initializeMap]);

  // Funciones de utilidad para estilos
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'Desconocido';
    }
  };

  // Renderizar fallback visual del mapa
  const renderMapFallback = () => (
    <div className="relative h-full bg-gradient-to-br from-green-100 to-blue-100">
      {/* Simulated map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-green-100 to-blue-100">
        {/* Simulated terrain features */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-300 rounded-full opacity-30"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-blue-300 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-blue-400 rounded-full opacity-25"></div>
      </div>

      {/* Location Markers */}
      {LOCATIONS.map((location, index) => (
        <div
          key={location.id}
          className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
            selectedLocation?.id === location.id 
              ? 'scale-125 z-10' 
              : 'hover:scale-110'
          }`}
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index % 2) * 20}%`,
          }}
          onClick={() => handleLocationClick(location)}
        >
          <div className={`relative ${
            selectedLocation?.id === location.id 
              ? 'text-farm-green' 
              : 'text-blue-600'
          }`}>
            <MapPin className="w-8 h-8 drop-shadow-lg" />
            {location.recommended && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs">⭐</span>
              </div>
            )}
            {selectedLocation?.id === location.id && (
              <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full text-farm-green" />
            )}
          </div>
        </div>
      ))}

      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <h3 className="font-semibold text-gray-800">Valle Central de California</h3>
        <p className="text-sm text-gray-600">Región Agrícola Principal</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-gray-700">Ubicaciones disponibles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs">⭐</span>
          </div>
          <span className="text-sm text-gray-700">Recomendadas</span>
        </div>
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando Mapbox...</p>
            
            {/* Progress bar */}
            <div className="w-64 mx-auto mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-farm-green h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{loadingProgress}%</p>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs text-red-500 underline mt-1 hover:text-red-700"
                >
                  Recargar página
                </button>
              </div>
            )}
            
            {/* Loading tips */}
            <div className="mt-4 text-xs text-gray-500 max-w-xs mx-auto">
              {loadingProgress < 20 && "Verificando token de acceso..."}
              {loadingProgress >= 20 && loadingProgress < 40 && "Configurando Mapbox..."}
              {loadingProgress >= 40 && loadingProgress < 60 && "Cargando estilos del mapa..."}
              {loadingProgress >= 60 && loadingProgress < 80 && "Inicializando controles..."}
              {loadingProgress >= 80 && loadingProgress < 90 && "Agregando marcadores..."}
              {loadingProgress >= 90 && "Finalizando configuración..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Select Location for {farmName || 'New Farm'}
              </h2>
              <p className="text-gray-600">
                Choose a location in California&apos;s Central Valley for your farm
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  🗺️ Mapbox
                </span>
                <span className="text-xs text-gray-500">Optimized loading</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Map Area */}
          <div className="flex-1 p-6">
            <div className="h-full rounded-lg border-2 border-gray-300 relative overflow-hidden">
              {!mapLoaded ? (
                renderMapFallback()
              ) : (
                <div ref={mapContainer} className="w-full h-full" />
              )}
            </div>
          </div>

          {/* Location Details Panel */}
          <div className="w-96 border-l border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Available Locations
            </h3>

            <div className="space-y-4">
              {LOCATIONS.map((location) => (
                <div
                  key={location.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedLocation?.id === location.id
                      ? 'border-farm-green bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{location.name}</h4>
                    {location.recommended && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{location.description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(location.difficulty)}`}>
                      {getDifficultyText(location.difficulty)}
                    </span>
                    <span className="text-xs text-gray-500">{location.region}</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Features:</p>
                    {location.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-farm-green rounded-full"></div>
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Location Summary */}
            {selectedLocation && (
              <div className="mt-6 p-4 bg-farm-green/10 rounded-lg border border-farm-green/20">
                <h4 className="font-semibold text-farm-green mb-2">Selected Location</h4>
                <p className="text-sm text-gray-700 mb-2">{selectedLocation.name}</p>
                <p className="text-xs text-gray-600">{selectedLocation.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Select a location to continue creating your farm</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedLocation}
                className="px-6 py-2 bg-farm-green hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
