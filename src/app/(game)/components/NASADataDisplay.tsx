'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { Droplets, Leaf, Thermometer, CloudRain, Satellite, AlertCircle } from 'lucide-react';

export default function NASADataDisplay() {
  const { updateEnvironmentData, environmentData, currentDay } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch NASA data when component mounts or day changes
    fetchNASAData();
  }, [currentDay]);

  const fetchNASAData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Central Valley coordinates (Fresno area)
      const lat = 36.7378;
      const lon = -119.7871;
      
      // Get current date based on game day
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() - 30 + currentDay); // Simulate 30 days ago + current day
      
      // Fetch from API
      const response = await fetch(`/api/nasa-game-data?lat=${lat}&lon=${lon}&date=${gameDate.toISOString()}`);
      const result = await response.json();
      
      if (result.success) {
        // Update game store with NASA data
        updateEnvironmentData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch NASA data');
      }
      
    } catch (err) {
      console.error('Error fetching NASA data:', err);
      setError('Unable to fetch NASA data');
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getNDVIColor = (ndvi: number) => {
    if (ndvi < 0.2) return 'text-red-400';
    if (ndvi < 0.4) return 'text-orange-400';
    if (ndvi < 0.6) return 'text-yellow-400';
    if (ndvi < 0.8) return 'text-green-400';
    return 'text-green-300';
  };

  const getSoilMoistureColor = (moisture: number) => {
    if (moisture < 20) return 'text-red-400';
    if (moisture < 40) return 'text-orange-400';
    if (moisture < 60) return 'text-blue-400';
    return 'text-blue-300';
  };

  if (loading) {
    return (
      <div className="bg-black/40 rounded-lg p-3 border border-white/10 animate-pulse">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-white/70 text-sm">Cargando datos NASA...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!environmentData) {
    return null;
  }

  return (
    <div className="bg-black/40 rounded-lg p-3 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium text-sm flex items-center gap-1.5">
          <div className="relative">
            <Satellite className="w-3.5 h-3.5 text-blue-400" />
            <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          Live NASA Data
        </h3>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">EN VIVO</span>
        </div>
      </div>
      
      {/* Data Quality Indicator */}
      {environmentData && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Calidad de datos:</span>
            <span className={`font-medium ${getQualityColor(environmentData.dataQuality)}`}>
              {environmentData.dataQuality === 'good' ? 'EXCELENTE' : 
               environmentData.dataQuality === 'moderate' ? 'MODERADA' : 'LIMITADA'}
            </span>
          </div>
        </div>
      )}
      
      {/* Datos compactos */}
      <div className="space-y-1.5">
        {/* NDVI */}
        <div className="bg-white/5 rounded p-2 border border-blue-400/20 hover:border-blue-400/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Leaf className="w-3 h-3 text-blue-400" />
              <span className="text-white text-xs">NDVI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs ${getNDVIColor(environmentData.ndvi)}`}>
                {(environmentData.ndvi * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-green-400">▲</span>
            </div>
          </div>
        </div>
        
        {/* Soil Moisture */}
        <div className="bg-white/5 rounded p-2 border border-blue-400/20 hover:border-blue-400/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span className="text-white text-xs">Humedad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs ${getSoilMoistureColor(environmentData.soilMoisture)}`}>
                {environmentData.soilMoisture.toFixed(0)}%
              </span>
              <span className="text-xs text-cyan-400">●</span>
            </div>
          </div>
        </div>
        
        {/* Temperature */}
        <div className="bg-white/5 rounded p-2 border border-orange-400/20 hover:border-orange-400/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span className="text-white text-xs">Temp</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-xs">{environmentData.temperature.toFixed(0)}°C</span>
              <span className="text-xs text-orange-400">◉</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Datos climáticos en línea */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10 text-xs">
        <div className="flex items-center gap-1">
          <CloudRain className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-white/70">Lluvia</span>
          <span className="text-white font-bold">{environmentData.precipitation.toFixed(0)}mm</span>
        </div>
        
        <button
          onClick={fetchNASAData}
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          disabled={loading}
        >
          <Satellite className="w-3 h-3" />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </div>
  );
}
