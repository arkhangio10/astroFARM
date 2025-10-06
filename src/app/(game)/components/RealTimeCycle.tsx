'use client';

import React, { useState, useEffect } from 'react';
import { GameCycle, CycleData, WeatherData, GameEvent } from '@/types/game';
import { createRealTimeCycle, getCycleData, pauseCycle, resumeCycle, stopCycle } from '@/lib/realTimeCycles';
import EnvironmentVisualization from './EnvironmentVisualization';
import { Location } from '@/types/game';

interface RealTimeCycleProps {
  location: Location;
  playerId: string;
  totalDays?: number;
  onCycleComplete?: (cycle: GameCycle) => void;
}

export default function RealTimeCycle({ 
  location, 
  playerId, 
  totalDays = 30,
  onCycleComplete 
}: RealTimeCycleProps) {
  const [cycle, setCycle] = useState<GameCycle | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // Start the cycle when component mounts
    const newCycle = createRealTimeCycle(playerId, location.id, totalDays);
    setCycle(newCycle);
    
    // Set up interval to update cycle data
    const interval = setInterval(() => {
      if (newCycle.isActive && !isPaused) {
        const data = getCycleData(newCycle.id);
        if (data) {
          setCycleData(data);
          setCycle({ ...newCycle, currentDay: data.day });
        }
        
        // Check if cycle is complete
        if (newCycle.currentDay >= totalDays) {
          onCycleComplete?.(newCycle);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playerId, location.id, totalDays, isPaused, onCycleComplete]);

  useEffect(() => {
    if (cycle) {
      // Calculate time remaining (40 minutes per day)
      const totalMinutes = totalDays * 40;
      const elapsedMinutes = cycle.currentDay * 40;
      const remainingMinutes = totalMinutes - elapsedMinutes;
      setTimeRemaining(remainingMinutes);
    }
  }, [cycle, totalDays]);

  const handlePause = () => {
    if (cycle) {
      pauseCycle(cycle.id);
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (cycle) {
      resumeCycle(cycle.id);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (cycle) {
      stopCycle(cycle.id);
      onCycleComplete?.(cycle);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getDayProgress = (): number => {
    if (!cycle) return 0;
    return (cycle.currentDay / totalDays) * 100;
  };

  const getWeatherSeverity = (weather: WeatherData): 'low' | 'medium' | 'high' => {
    const severity = 
      (weather.temperature > 35 ? 1 : 0) +
      (weather.precipitation > 20 ? 1 : 0) +
      (weather.humidity < 20 ? 1 : 0) +
      (weather.windSpeed > 10 ? 1 : 0);
    
    if (severity >= 3) return 'high';
    if (severity >= 1) return 'medium';
    return 'low';
  };

  const getEventSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!cycle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Iniciando ciclo de tiempo real...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Ciclo de Tiempo Real</h2>
            <p className="text-blue-100">
              {location.name} • Día {cycle.currentDay} de {totalDays}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Tiempo Restante</div>
            <div className="text-2xl font-bold">{formatTime(timeRemaining)}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getDayProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex justify-center space-x-4">
          {isPaused ? (
            <button
              onClick={handleResume}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              ▶️ Reanudar
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
            >
              ⏸️ Pausar
            </button>
          )}
          
          <button
            onClick={handleStop}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            ⏹️ Detener
          </button>
        </div>
      </div>

      {/* Environment Visualization */}
      {cycleData && (
        <div className="h-64">
          <EnvironmentVisualization
            location={location}
            weatherData={cycleData.weather}
            cycleData={cycleData}
            isActive={!isPaused}
          />
        </div>
      )}

      {/* Weather Data */}
      {cycleData && (
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos Climáticos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(cycleData.weather.temperature)}°C
              </div>
              <div className="text-sm text-gray-600">Temperatura</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(cycleData.weather.humidity)}%
              </div>
              <div className="text-sm text-gray-600">Humedad</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {Math.round(cycleData.weather.precipitation)}mm
              </div>
              <div className="text-sm text-gray-600">Precipitación</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(cycleData.weather.solarRadiation)} kWh/m²
              </div>
              <div className="text-sm text-gray-600">Radiación Solar</div>
            </div>
          </div>
        </div>
      )}

      {/* NASA Data */}
      {cycleData && cycleData.nasaData.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de la NASA</h3>
          <div className="space-y-2">
            {cycleData.nasaData.map((dataPoint, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">{dataPoint.product}</div>
                  <div className="text-sm text-blue-600">{dataPoint.source}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-800">{dataPoint.value}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    dataPoint.quality === 'good' ? 'bg-green-100 text-green-800' :
                    dataPoint.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {dataPoint.quality}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events */}
      {cycleData && cycleData.events.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eventos del Día</h3>
          <div className="space-y-3">
            {cycleData.events.map((event, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{event.description}</div>
                    <div className="text-sm text-gray-600 mt-1">{event.type} • Duración: {event.duration} días</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventSeverityColor(event.severity)}`}>
                    {event.severity}
                  </span>
                </div>
                {event.effects.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Efectos: {event.effects.map(effect => 
                      `${effect.resource}: ${effect.change > 0 ? '+' : ''}${effect.change}`
                    ).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {cycleData && cycleData.recommendations.length > 0 && (
        <div className="p-6 border-t bg-green-50">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Recomendaciones</h3>
          <div className="space-y-2">
            {cycleData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-green-600 mt-1">💡</span>
                <span className="text-green-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="p-4 bg-gray-100 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Estado: {isPaused ? '⏸️ Pausado' : '▶️ Activo'}
          </div>
          <div>
            Velocidad: 1 día = 40 minutos
          </div>
        </div>
      </div>
    </div>
  );
}
