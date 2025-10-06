'use client';

import { useState } from 'react';
import { Info, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { getDatasetMetadata, formatResolution } from '@/lib/datasets';

export default function DataLegend() {
  const [expanded, setExpanded] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    ndvi: true,
    soilMoisture: true,
    temperature: true,
    precipitation: false,
  });

  const toggleLayer = (layer: string) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer as keyof typeof prev]
    }));
  };

  const layers = [
    {
      id: 'ndvi',
      name: 'NDVI (Vegetation)',
      color: '#10b981',
      icon: '🌱',
      metadata: getDatasetMetadata('ndvi'),
    },
    {
      id: 'soilMoisture',
      name: 'Soil Moisture',
      color: '#3b82f6',
      icon: '💧',
      metadata: getDatasetMetadata('soilMoisture'),
    },
    {
      id: 'temperature',
      name: 'Temperature',
      color: '#ef4444',
      icon: '🌡️',
      metadata: getDatasetMetadata('temperature'),
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      color: '#0ea5e9',
      icon: '🌧️',
      metadata: getDatasetMetadata('precipitation'),
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Data Layers</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {expanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="p-4 space-y-3">
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center gap-3">
            <button
              onClick={() => toggleLayer(layer.id)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                visibleLayers[layer.id as keyof typeof visibleLayers]
                  ? 'border-gray-400 bg-gray-100'
                  : 'border-gray-300'
              }`}
            >
              {visibleLayers[layer.id as keyof typeof visibleLayers] && (
                <div className="w-3 h-3 rounded" style={{ backgroundColor: layer.color }} />
              )}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{layer.icon}</span>
                <span className="text-sm font-medium text-gray-700">{layer.name}</span>
              </div>
              {layer.metadata && (
                <div className="text-xs text-gray-500">
                  {formatResolution(layer.metadata.resolution)} • {layer.metadata.latency}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Information</h4>
          <div className="space-y-3">
            {layers.map((layer) => (
              <div key={layer.id} className="text-xs">
                <div className="font-medium text-gray-700 mb-1">{layer.name}</div>
                {layer.metadata && (
                  <div className="text-gray-600 space-y-1">
                    <div>Source: {layer.metadata.source}</div>
                    <div>Resolution: {formatResolution(layer.metadata.resolution)}</div>
                    <div>Latency: {layer.metadata.latency}</div>
                    {layer.metadata.limitations.length > 0 && (
                      <div className="flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-yellow-700">Limitations:</div>
                          <ul className="list-disc list-inside ml-2">
                            {layer.metadata.limitations.map((limitation, index) => (
                              <li key={index}>{limitation}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <div className="font-medium mb-1">Data Quality Notice</div>
            <div>Satellite data has inherent limitations. Resolution varies by dataset, and cloud cover affects accuracy. Use multiple dates for better insights.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
