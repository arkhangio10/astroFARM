'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { useSatelliteLayers } from '@/lib/hooks/useSatelliteLayers';

// Tipos para Leaflet
interface LeafletMap {
  remove(): void;
  setView(latLng: [number, number], zoom: number): LeafletMap;
  addLayer(layer: any): LeafletMap;
  removeLayer(layer: any): LeafletMap;
}

interface LeafletTileLayer {
  addTo(map: LeafletMap): LeafletTileLayer;
}

interface LeafletControl {
  addTo(map: LeafletMap): LeafletControl;
}

interface LeafletLayerGroup {
  addLayer(layer: any): void;
  removeLayer(layer: any): void;
  clearLayers(): void;
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

export default function SatelliteMapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [layerGroups, setLayerGroups] = useState<Record<string, LeafletLayerGroup>>({});
  const { currentDay, totalDays } = useGameStore();
  const { activeLayer, getActiveLayer } = useSatelliteLayers();

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

        // Create layer groups for each satellite layer
        const groups = {
          ndvi: L.default.layerGroup(),
          temp: L.default.layerGroup(),
          humedad: L.default.layerGroup(),
          lluvia: L.default.layerGroup(),
        };

        // Add all layer groups to map
        Object.values(groups).forEach(group => group.addTo(leafletMap));
        
        setMap(leafletMap);
        setLayerGroups(groups);
        
        // Add initial data
        addSatelliteData(leafletMap, L.default, groups);
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

  // Update map when active layer changes
  useEffect(() => {
    if (map && layerGroups && activeLayer) {
      updateMapLayers();
    }
  }, [activeLayer, map, layerGroups]);

  const updateMapLayers = () => {
    if (!map || !layerGroups) return;

    // Clear all layers first
    Object.values(layerGroups).forEach(group => group.clearLayers());

    // Add data for active layer
    const activeLayerData = getActiveLayer();
    if (activeLayerData && layerGroups[activeLayerData.id]) {
      addLayerData(layerGroups[activeLayerData.id], activeLayerData);
    }
  };

  const addLayerData = (layerGroup: LeafletLayerGroup, layer: any) => {
    if (!map) return;

    import('leaflet').then((L: any) => {
      const dataPoints = getLayerDataPoints(layer.id);
      
      dataPoints.forEach(point => {
        const marker = L.default.circleMarker([point.lat, point.lng], {
          radius: 12,
          fillColor: point.color,
          color: '#000',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.7
        }).bindPopup(point.label);
        
        layerGroup.addLayer(marker);
      });
    });
  };

  const getLayerDataPoints = (layerId: string) => {
    const basePoints = [
      { lat: 36.1, lng: -119.4 },
      { lat: 36.0, lng: -119.5 },
      { lat: 35.9, lng: -119.6 },
      { lat: 36.0, lng: -119.7 },
      { lat: 36.2, lng: -119.3 },
      { lat: 35.8, lng: -119.8 },
    ];

    switch (layerId) {
      case 'ndvi':
        return basePoints.map((point, index) => ({
          ...point,
          color: ['#228B22', '#32CD32', '#9ACD32', '#F0E68C', '#DAA520', '#CD853F'][index],
          label: `NDVI: ${[0.7, 0.5, 0.3, 0.1, 0.6, 0.4][index]} - Vegetación ${['Muy Alta', 'Alta', 'Media', 'Baja', 'Alta', 'Media'][index]}`
        }));
      
      case 'temp':
        return basePoints.map((point, index) => ({
          ...point,
          color: ['#FF6B6B', '#FF8E53', '#FF6B35', '#F7931E', '#FFD23F', '#06FFA5'][index],
          label: `Temp: ${[25, 18, 12, 8, 22, 15][index]}°C - ${['Cálido', 'Templado', 'Fresco', 'Frío', 'Cálido', 'Templado'][index]}`
        }));
      
      case 'humedad':
        return basePoints.map((point, index) => ({
          ...point,
          color: ['#4169E1', '#87CEEB', '#F0E68C', '#F4A460', '#98FB98', '#90EE90'][index],
          label: `Humedad: ${[80, 60, 40, 20, 70, 50][index]}% - ${['Alta', 'Media', 'Baja', 'Muy Baja', 'Alta', 'Media'][index]}`
        }));
      
      case 'lluvia':
        return basePoints.map((point, index) => ({
          ...point,
          color: ['#1E90FF', '#87CEFA', '#B0C4DE', '#D3D3D3', '#4682B4', '#5F9EA0'][index],
          label: `Lluvia: ${[15, 8, 3, 0, 12, 5][index]}mm - ${['Fuerte', 'Moderada', 'Ligera', 'Sin lluvia', 'Fuerte', 'Ligera'][index]}`
        }));
      
      default:
        return [];
    }
  };

  const addSatelliteData = (leafletMap: LeafletMap, L: LeafletModule, groups: Record<string, LeafletLayerGroup>) => {
    // Add parcel markers (always visible)
    const parcels = [
      { lat: 36.1, lng: -119.4, name: 'North Field', crop: 'Carrot' },
      { lat: 35.9, lng: -119.6, name: 'South Field', crop: 'Tomato' },
      { lat: 36.0, lng: -119.5, name: 'Central Field', crop: 'Lettuce' },
    ];

    const parcelGroup = L.layerGroup();
    parcels.forEach(parcel => {
      const marker = L.marker([parcel.lat, parcel.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="bg-green-600 text-white text-xs px-2 py-1 rounded-full border-2 border-white shadow-lg">${parcel.crop}</div>`,
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        })
      }).bindPopup(`
        <div class="text-center">
          <h3 class="font-bold">${parcel.name}</h3>
          <p class="text-sm">Cultivo: ${parcel.crop}</p>
          <p class="text-xs text-gray-600">Día ${currentDay} de ${totalDays}</p>
        </div>
      `);
      
      parcelGroup.addLayer(marker);
    });
    
    parcelGroup.addTo(leafletMap);
  };

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
