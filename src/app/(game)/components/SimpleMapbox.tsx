'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function SimpleMapbox() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Configurar token
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      console.log('Token exists:', !!token);
      console.log('Token format:', token?.substring(0, 10) + '...');
      
      if (!token) {
        throw new Error('No Mapbox token found');
      }

      mapboxgl.accessToken = token;

      // Crear mapa simple
      console.log('Creating map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-119.5, 36.5],
        zoom: 8
      });

      // Manejar eventos
      map.current.on('load', () => {
        console.log('✅ Map loaded!');
        setLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError(`Map error: ${e.error?.message || e.message || 'Unknown error'}`);
        setLoading(false);
      });

    } catch (err) {
      console.error('❌ Setup error:', err);
      setError(err instanceof Error ? err.message : 'Setup error');
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p>Loading Mapbox...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
          <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold">Error:</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
