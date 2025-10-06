'use client';

import { MapPin } from 'lucide-react';
import { useSatelliteLayers } from '@/lib/hooks/useSatelliteLayers';

interface SatelliteLayersPanelProps {
  onLayerChange?: (layerId: string, visible: boolean) => void;
}

export default function SatelliteLayersPanel({ onLayerChange }: SatelliteLayersPanelProps) {
  const { layers, activeLayer, setActiveLayerById, toggleLayer } = useSatelliteLayers();

  const handleLayerClick = (layerId: string) => {
    setActiveLayerById(layerId);
    onLayerChange?.(layerId, true);
  };

  const layerOrder = ['ndvi', 'temp', 'humedad', 'lluvia'];

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Capas Satelitales</h3>
      </div>

      {/* Layer Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        {layerOrder.map((layerId) => {
          const layer = layers[layerId];
          const isActive = activeLayer === layerId;
          
          return (
            <button
              key={layerId}
              onClick={() => handleLayerClick(layerId)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${isActive 
                  ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/25' 
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{layer.icon}</span>
                <span className="text-sm font-medium text-white">{layer.name}</span>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border-2 border-gray-800"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Layer Info */}
      {activeLayer && (
        <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{layers[activeLayer].icon}</span>
            <span className="text-sm font-medium text-white">{layers[activeLayer].name}</span>
          </div>
          <div className="text-xs text-gray-300">
            {getLayerDescription(activeLayer)}
          </div>
        </div>
      )}
    </div>
  );
}

function getLayerDescription(layerId: string): string {
  const descriptions: Record<string, string> = {
    ndvi: 'Índice de vegetación normalizado. Muestra la salud de la vegetación (0-1)',
    temp: 'Temperatura de la superficie terrestre. Detecta heladas y estrés térmico',
    humedad: 'Humedad del suelo. Optimiza el riego y detecta sequía',
    lluvia: 'Precipitación estimada. Predice lluvia para planificar riego',
  };
  
  return descriptions[layerId] || 'Datos satelitales de la NASA';
}
