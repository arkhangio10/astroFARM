'use client';

import { useState } from 'react';
import { Info, AlertCircle, Activity, Clock, Ruler, Layers } from 'lucide-react';

interface DataMetric {
  resolution: string;
  latency: string;
  accuracy?: string;
  depth?: string;
  height?: string;
  tooltip: string;
  limitations: string[];
}

interface DataCredibilityHUDProps {
  currentDataType?: 'NDVI' | 'SoilMoisture' | 'Temperature' | 'Precipitation';
  isExpanded?: boolean;
}

const DATA_METRICS: Record<string, DataMetric> = {
  NDVI: {
    resolution: '250m',
    latency: '16 días',
    accuracy: '±0.05',
    tooltip: '250m significa que cada píxel representa un área de 250x250 metros (6.25 hectáreas). Tu parcela de 10 hectáreas contiene aproximadamente 1-2 píxeles.',
    limitations: [
      'Las nubes pueden ocultar la vegetación',
      'Datos cada 16 días, no diarios',
      'Valores afectados por sombras'
    ]
  },
  SoilMoisture: {
    resolution: '9km',
    latency: '2-3 días',
    depth: '0-5cm',
    tooltip: '9km es más grande que muchas granjas pequeñas. Este dato representa un área de 81 km². Usamos modelos para estimar valores locales.',
    limitations: [
      'Solo mide los primeros 5cm del suelo',
      'Baja resolución para parcelas pequeñas',
      'No detecta humedad bajo cobertura densa'
    ]
  },
  Temperature: {
    resolution: '1km',
    latency: '8 días',
    height: 'Superficie',
    tooltip: 'Temperatura de la superficie del suelo, no del aire. Puede diferir hasta 10°C del pronóstico meteorológico que mide temperatura del aire a 2m de altura.',
    limitations: [
      'Es temperatura del suelo, no del aire',
      'Promedio de 8 días, no instantáneo',
      'Afectado por cobertura de nubes'
    ]
  },
  Precipitation: {
    resolution: '10km',
    latency: '4-12 horas',
    accuracy: '±20%',
    tooltip: 'Estimación satelital de lluvia en un área de 100 km². Puede diferir de mediciones locales debido a variaciones microclimáticas.',
    limitations: [
      'Estimación, no medición directa',
      'Puede subestimar lluvia ligera',
      'Resolución gruesa para tormentas locales'
    ]
  }
};

export default function DataCredibilityHUD({ 
  currentDataType = 'NDVI', 
  isExpanded: initialExpanded = true 
}: DataCredibilityHUDProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'limitations'>('metrics');
  
  const metrics = DATA_METRICS[currentDataType];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 max-w-sm">
      {/* Header */}
      <div 
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Credibilidad de Datos</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
              NASA Verified
            </span>
            <button className="text-gray-500 hover:text-gray-700">
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('metrics')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                selectedTab === 'metrics'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Métricas
            </button>
            <button
              onClick={() => setSelectedTab('limitations')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                selectedTab === 'limitations'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Limitaciones
            </button>
          </div>

          {/* Contenido de tabs */}
          <div className="p-4">
            {selectedTab === 'metrics' ? (
              <div className="space-y-3">
                {/* Tipo de dato actual */}
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Analizando: <span className="text-blue-600">{currentDataType}</span>
                </div>

                {/* Métricas principales */}
                <div className="space-y-2">
                  {/* Resolución */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('resolution')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-help">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Resolución</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{metrics.resolution}</span>
                    </div>
                    
                    {showTooltip === 'resolution' && (
                      <div className="absolute z-20 left-0 right-0 mt-1">
                        <div className="bg-gray-900 text-white p-3 rounded-lg text-xs leading-relaxed shadow-xl">
                          {metrics.tooltip}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Latencia */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Latencia</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">{metrics.latency}</span>
                  </div>

                  {/* Profundidad/Altura si aplica */}
                  {metrics.depth && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Profundidad</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{metrics.depth}</span>
                    </div>
                  )}

                  {metrics.height && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Altura medida</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{metrics.height}</span>
                    </div>
                  )}

                  {/* Precisión si aplica */}
                  {metrics.accuracy && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Precisión</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{metrics.accuracy}</span>
                    </div>
                  )}
                </div>

                {/* Indicador visual de calidad */}
                <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Calidad del dato</span>
                    <span className="text-xs text-green-600 font-bold">Alta</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 h-2 bg-green-500 rounded-l" />
                    <div className="flex-1 h-2 bg-green-500" />
                    <div className="flex-1 h-2 bg-green-500 rounded-r" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Limitaciones */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <h4 className="text-sm font-semibold text-orange-900">
                      Limitaciones importantes
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {metrics.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-orange-800">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recomendación */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Recomendación
                      </h4>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Combina estos datos satelitales con observaciones locales y tu experiencia 
                        para tomar las mejores decisiones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer con timestamp */}
          <div className="px-4 pb-3 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Fuente: NASA {currentDataType === 'NDVI' ? 'MODIS' : currentDataType === 'SoilMoisture' ? 'SMAP' : 'Satellites'}</span>
              <span>Actualizado: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
