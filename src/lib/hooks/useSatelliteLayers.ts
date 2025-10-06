'use client';

import { useState, useCallback } from 'react';

export interface SatelliteLayer {
  id: string;
  name: string;
  color: string;
  icon: string;
  visible: boolean;
  data?: any;
}

export interface SatelliteLayersState {
  layers: Record<string, SatelliteLayer>;
  activeLayer: string | null;
}

const initialLayers: Record<string, SatelliteLayer> = {
  ndvi: {
    id: 'ndvi',
    name: 'NDVI',
    color: '#10b981',
    icon: '🌱',
    visible: true,
  },
  temp: {
    id: 'temp',
    name: 'Temp',
    color: '#ef4444',
    icon: '🌡️',
    visible: false,
  },
  humedad: {
    id: 'humedad',
    name: 'Humedad',
    color: '#3b82f6',
    icon: '💧',
    visible: false,
  },
  lluvia: {
    id: 'lluvia',
    name: 'Lluvia',
    color: '#0ea5e9',
    icon: '🌧️',
    visible: false,
  },
};

export function useSatelliteLayers() {
  const [layers, setLayers] = useState<Record<string, SatelliteLayer>>(initialLayers);
  const [activeLayer, setActiveLayer] = useState<string | null>('ndvi');

  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        visible: !prev[layerId].visible,
      },
    }));
  }, []);

  const setActiveLayerById = useCallback((layerId: string) => {
    setActiveLayer(layerId);
    
    // When setting a layer as active, also make it visible
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        visible: true,
      },
    }));
  }, []);

  const getVisibleLayers = useCallback(() => {
    return Object.values(layers).filter(layer => layer.visible);
  }, [layers]);

  const getActiveLayer = useCallback(() => {
    return activeLayer ? layers[activeLayer] : null;
  }, [activeLayer, layers]);

  return {
    layers,
    activeLayer,
    toggleLayer,
    setActiveLayerById,
    getVisibleLayers,
    getActiveLayer,
  };
}
