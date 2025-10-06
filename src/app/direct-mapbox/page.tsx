'use client';

import { useEffect, useRef, useState } from 'react';

export default function DirectMapboxPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Importar Mapbox dinámicamente
    const loadMapbox = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        await import('mapbox-gl/dist/mapbox-gl.css');

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          throw new Error('No token found');
        }

        mapboxgl.default.accessToken = token;

        const map = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/satellite-streets-v12',
          center: [-119.5, 36.5],
          zoom: 8
        });

        map.on('load', () => {
          console.log('Map loaded!');
          setMapLoaded(true);

          // Agregar marcadores de prueba
          const locations = [
            { name: 'Fresno', coords: [-119.7871, 36.7378] },
            { name: 'Tulare', coords: [-119.3473, 36.2077] },
            { name: 'Merced', coords: [-120.4829, 37.3022] }
          ];

          locations.forEach((loc) => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.width = '30px';
            el.style.height = '30px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#22c55e';
            el.style.border = '3px solid white';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

            new mapboxgl.default.Marker({ element: el })
              .setLngLat(loc.coords)
              .addTo(map);

            el.addEventListener('click', () => {
              alert(`Clicked: ${loc.name}`);
            });
          });
        });

        map.on('error', (e) => {
          console.error('Map error:', e);
          setError(e.error?.message || 'Unknown error');
        });

      } catch (err) {
        console.error('Failed to load Mapbox:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      }
    };

    loadMapbox();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Direct Mapbox Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="relative h-[600px]">
            <div ref={mapContainer} className="w-full h-full rounded-lg" />
            
            {!mapLoaded && !error && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p>Loading Mapbox...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-semibold">Error:</p>
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800 mb-2">Info:</h2>
          <p className="text-sm text-blue-700">
            Esta es una prueba directa de Mapbox con importación dinámica.
            Debería mostrar el Valle Central de California con 3 marcadores verdes.
          </p>
        </div>
      </div>
    </div>
  );
}
