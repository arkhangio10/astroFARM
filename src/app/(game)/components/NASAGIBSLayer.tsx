'use client';

import { useState, useEffect } from 'react';
import { Satellite, Eye, EyeOff, Info } from 'lucide-react';

interface GIBSLayerConfig {
  name: string;
  layer: string;
  format: string;
  resolution: string;
  attribution: string;
  description: string;
}

interface NASAGIBSLayerProps {
  onLayerChange?: (layer: string) => void;
  onOpacityChange?: (opacity: number) => void;
}

const GIBS_LAYERS: Record<string, GIBSLayerConfig> = {
  NDVI: {
    name: 'Vegetación (NDVI)',
    layer: 'MODIS_Terra_NDVI_8Day',
    format: 'image/png',
    resolution: '250m',
    attribution: 'NASA MODIS Terra',
    description: 'Índice de vegetación que muestra la salud de tus cultivos'
  },
  Temperature: {
    name: 'Temperatura',
    layer: 'MODIS_Terra_Land_Surface_Temp_Day',
    format: 'image/png', 
    resolution: '1km',
    attribution: 'NASA MODIS Terra LST',
    description: 'Temperatura de la superficie del suelo'
  },
  SoilMoisture: {
    name: 'Humedad del Suelo',
    layer: 'SMAP_L3_Soil_Moisture_Daily',
    format: 'image/png',
    resolution: '9km',
    attribution: 'NASA SMAP',
    description: 'Humedad en los primeros 5cm del suelo'
  },
  Precipitation: {
    name: 'Precipitación',
    layer: 'GPM_3IMERGDL_DAY',
    format: 'image/png',
    resolution: '10km',
    attribution: 'NASA GPM',
    description: 'Lluvia acumulada en las últimas 24 horas'
  }
};

export default function NASAGIBSLayer({ onLayerChange, onOpacityChange }: NASAGIBSLayerProps) {
  const [activeLayer, setActiveLayer] = useState<string>('NDVI');
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.7);
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Actualizar timestamp cada minuto
    const interval = setInterval(() => {
      setTimestamp(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLayerChange = (layer: string) => {
    setActiveLayer(layer);
    onLayerChange?.(layer);
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    onOpacityChange?.(newOpacity);
  };

  const currentLayer = GIBS_LAYERS[activeLayer];

  return (
    <div className="absolute top-4 right-4 z-20 max-w-sm">
      <div className="bg-black/85 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700">
        {/* Header con animación LIVE */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
              <div className="relative bg-red-500 rounded-full w-3 h-3" />
            </div>
            <div className="flex items-center gap-2">
              <Satellite className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">LIVE NASA DATA</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <>
            {/* Selector de capas */}
            <div className="px-4 pb-3 space-y-2">
              {Object.entries(GIBS_LAYERS).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => handleLayerChange(key)}
                  onMouseEnter={() => setShowTooltip(key)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className={`relative w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeLayer === key 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{layer.name}</span>
                    <span className="text-xs opacity-70">{layer.resolution}</span>
                  </div>
                  
                  {/* Tooltip */}
                  {showTooltip === key && (
                    <div className="absolute left-0 right-0 -bottom-2 transform translate-y-full z-30">
                      <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-xl">
                        {layer.description}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Control de visibilidad y opacidad */}
            <div className="px-4 pb-3 space-y-3">
              {/* Toggle visibilidad */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Mostrar capa</span>
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className={`p-1.5 rounded transition-colors ${
                    isVisible ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Control de opacidad */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Opacidad</span>
                  <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity * 100}
                  onChange={(e) => handleOpacityChange(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${opacity * 100}%, #374151 ${opacity * 100}%, #374151 100%)`
                  }}
                />
              </div>
            </div>

            {/* Información de la capa actual */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-700">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Info className="w-3 h-3" />
                  <span className="font-medium">{currentLayer.attribution}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-gray-400">
                  <div>
                    <span className="text-gray-500">Resolución:</span>
                    <span className="ml-1 text-blue-400">{currentLayer.resolution}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Formato:</span>
                    <span className="ml-1">{currentLayer.format}</span>
                  </div>
                </div>
                <div className="text-gray-400">
                  <span className="text-gray-500">Última actualización:</span>
                  <span className="ml-1 text-green-400">{timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Badge de calidad de datos */}
            <div className="px-4 pb-3">
              <div className="bg-green-900/50 border border-green-700 rounded p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-300 font-medium">Calidad de Datos</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Estilos para el slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3B82F6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}
