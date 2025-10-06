'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';

// Tipos para Leaflet
interface LeafletMap {
  remove(): void;
  setView(latLng: [number, number], zoom: number): LeafletMap;
  addLayer(layer: any): void;
}

interface LeafletTileLayer {
  addTo(map: LeafletMap): LeafletTileLayer;
}

interface LeafletControl {
  addTo(map: LeafletMap): LeafletControl;
}

interface LeafletLayerGroup {
  addLayer(layer: any): void;
}

interface LeafletMarker {
  bindPopup(content: string): LeafletMarker;
}

interface LeafletCircleMarker {
  bindPopup(content: string): LeafletCircleMarker;
}

interface LeafletDivIcon {
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
}

interface LeafletModule {
  map(element: HTMLElement): LeafletMap;
  tileLayer(url: string, options?: any): LeafletTileLayer;
  layerGroup(): LeafletLayerGroup;
  circleMarker(latLng: [number, number], options?: any): LeafletCircleMarker;
  marker(latLng: [number, number], options?: any): LeafletMarker;
  divIcon(options: LeafletDivIcon): any;
  control: {
    layers(baseLayers?: any, overlays?: any): LeafletControl;
  };
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const { currentDay, totalDays } = useGameStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !map) {
      // Dynamic import for Leaflet to avoid SSR issues
      import('leaflet').then((L: any) => {
        // Check if map container is already initialized
        if (mapRef.current && (mapRef.current as any)._leaflet_id) {
          return; // Map already initialized
        }
        
        // Initialize map
        const leafletMap = L.default.map(mapRef.current!).setView([36.0, -119.5], 8);
        
        // Add tile layer (using OpenStreetMap for demo)
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMap);

        // Add NASA data layers (placeholder)
        addNASALayers(leafletMap, L.default);
        
        setMap(leafletMap);
      });
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [map]);

  const addNASALayers = (leafletMap: LeafletMap, L: LeafletModule) => {
    // Create mock data layers using colored rectangles
    const mockDataLayer = L.layerGroup();
    
    // Add mock data tiles as colored rectangles
    const mockTiles = [
      { lat: 36.1, lng: -119.4, color: '#228B22', label: 'NDVI: 0.7' },
      { lat: 36.0, lng: -119.5, color: '#32CD32', label: 'NDVI: 0.5' },
      { lat: 35.9, lng: -119.6, color: '#9ACD32', label: 'NDVI: 0.3' },
      { lat: 36.0, lng: -119.7, color: '#F0E68C', label: 'NDVI: 0.1' },
    ];

    mockTiles.forEach(tile => {
      const marker = L.circleMarker([tile.lat, tile.lng], {
        radius: 15,
        fillColor: tile.color,
        color: '#000',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.7
      }).bindPopup(tile.label);
      
      mockDataLayer.addLayer(marker);
    });

    // Add parcel markers
    const parcels = [
      { lat: 36.1, lng: -119.4, name: 'North Field', crop: 'Carrot' },
      { lat: 35.9, lng: -119.6, name: 'South Field', crop: 'Tomato' },
      { lat: 36.0, lng: -119.3, name: 'East Field', crop: 'Lettuce' },
      { lat: 36.0, lng: -119.7, name: 'West Field', crop: 'Corn' },
    ];

    parcels.forEach(parcel => {
      const marker = L.marker([parcel.lat, parcel.lng], {
        icon: L.divIcon({
          className: 'parcel-marker',
          html: `<div style="background: #4ade80; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${parcel.crop}</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        })
      }).bindPopup(`
        <div>
          <h3>${parcel.name}</h3>
          <p><strong>Crop:</strong> ${parcel.crop}</p>
          <p><strong>Status:</strong> Growing</p>
          <p><strong>Health:</strong> Good</p>
        </div>
      `);
      
      mockDataLayer.addLayer(marker);
    });

    // Add layer control
    const layerControl = L.control.layers({
      'Base Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      'NASA Data': mockDataLayer,
    }).addTo(leafletMap);

    // Add the mock data layer by default
    leafletMap.addLayer(mockDataLayer);
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Timeline Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Day {currentDay + 1} of {totalDays}</span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentDay + 1) / totalDays) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-farm-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentDay + 1) / totalDays) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Data Legend */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Data Layers</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-xs text-gray-600">NDVI (Vegetation)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Soil Moisture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600">Temperature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

