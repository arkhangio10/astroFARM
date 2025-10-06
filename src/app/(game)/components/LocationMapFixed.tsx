'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, CheckCircle, Info } from 'lucide-react';

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

// Location data
const LOCATIONS: Location[] = [
  {
    id: 'fresno-central',
    name: 'Fresno Central Valley',
    description: 'Main agricultural region with excellent access to NASA data',
    coordinates: [-119.7871, 36.7378],
    region: 'Central Valley',
    difficulty: 'beginner',
    features: ['Complete NDVI data', 'Reliable precipitation', 'Stable temperature'],
    recommended: true
  },
  {
    id: 'tulare-basin',
    name: 'Tulare Basin',
    description: 'Agricultural basin with water management challenges',
    coordinates: [-119.3473, 36.2077],
    region: 'Central Valley',
    difficulty: 'intermediate',
    features: ['Drought management', 'Soil moisture data', 'Climate variability'],
    recommended: true
  },
  {
    id: 'kern-county',
    name: 'Kern County',
    description: 'Desert region with precision agriculture',
    coordinates: [-118.7273, 35.3433],
    region: 'Central Valley',
    difficulty: 'advanced',
    features: ['Precision agriculture', 'Irrigation data', 'Advanced technology'],
    recommended: false
  },
  {
    id: 'merced-valley',
    name: 'Merced Valley',
    description: 'Fertile valley with agricultural tradition',
    coordinates: [-120.4829, 37.3022],
    region: 'Central Valley',
    difficulty: 'beginner',
    features: ['Fertile soil', 'Temperate climate', 'Complete historical data'],
    recommended: true
  },
  {
    id: 'kings-county',
    name: 'Kings County',
    description: 'County with crop diversity',
    coordinates: [-119.8157, 36.0753],
    region: 'Central Valley',
    difficulty: 'intermediate',
    features: ['Crop diversity', 'Yield data', 'Sustainability'],
    recommended: false
  }
];

interface LocationMapFixedProps {
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
  farmName?: string;
}

export default function LocationMapFixed({ onLocationSelect, onClose, farmName }: LocationMapFixedProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initMap = async () => {
      try {
        setLoadingProgress(20);
        
        // Importar Mapbox dinámicamente
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        setLoadingProgress(40);

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          throw new Error('No Mapbox token found');
        }

        mapboxgl.default.accessToken = token;
        
        setLoadingProgress(60);

        // Crear el mapa
        const map = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [-119.5, 36.5],
          zoom: 8
        });

        mapRef.current = map;

        map.on('load', () => {
          setLoadingProgress(80);
          
          // Agregar marcadores
          LOCATIONS.forEach((location) => {
            const el = document.createElement('div');
            el.className = 'custom-marker';
            
            const color = location.recommended ? '#fbbf24' : '#3b82f6';
            const icon = location.recommended ? '⭐' : '📍';
            
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
            `;
            el.innerHTML = icon;

            const marker = new mapboxgl.default.Marker({ element: el })
              .setLngLat(location.coordinates)
              .addTo(map);

            el.addEventListener('click', () => {
              handleLocationClick(location);
            });

            el.addEventListener('mouseenter', () => {
              if (!selectedLocation || selectedLocation.id !== location.id) {
                el.style.transform = 'scale(1.1)';
              }
            });

            el.addEventListener('mouseleave', () => {
              if (!selectedLocation || selectedLocation.id !== location.id) {
                el.style.transform = 'scale(1)';
              }
            });

            markersRef.current.push({ marker, element: el, location });
          });

          setMapLoaded(true);
          setLoadingProgress(100);
        });

        map.on('error', (e: any) => {
          console.error('Map error:', e);
          setError(e.error?.message || 'Error loading map');
        });

      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setLoadingProgress(0);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    
    // Actualizar estilos de marcadores
    markersRef.current.forEach(({ element, location: loc }) => {
      const isSelected = loc.id === location.id;
      const color = isSelected ? '#22c55e' : (loc.recommended ? '#fbbf24' : '#3b82f6');
      
      element.style.background = color;
      element.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
      element.style.zIndex = isSelected ? '1000' : '100';
    });

    // Centrar mapa
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: location.coordinates,
        zoom: 10,
        duration: 1000
      });
    }
  };

  const handleConfirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

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
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return 'Unknown';
    }
  };

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
                Choose a location in California's Central Valley for your farm
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
              <div ref={mapContainer} className="w-full h-full" />
              
              {/* Loading overlay */}
              {!mapLoaded && !error && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Mapbox...</p>
                    
                    <div className="w-64 mx-auto mt-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-farm-green h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{loadingProgress}%</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error display */}
              {error && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-semibold">Error:</p>
                    <p className="text-red-500 text-sm">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="text-xs text-red-500 underline mt-2 hover:text-red-700"
                    >
                      Reload page
                    </button>
                  </div>
                </div>
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
              <span>Select a location to continue with your farm creation</span>
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
                className="px-6 py-2 bg-farm-green hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {selectedLocation ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm {selectedLocation.name}
                  </>
                ) : (
                  'Select a location'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
