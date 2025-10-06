'use client';

import React, { useState, useEffect } from 'react';
import { Location, WeatherData, CycleData } from '@/types/game';

interface EnvironmentVisualizationProps {
  location: Location;
  weatherData?: WeatherData;
  cycleData?: CycleData;
  isActive?: boolean;
}

export default function EnvironmentVisualization({ 
  location, 
  weatherData, 
  cycleData, 
  isActive = false 
}: EnvironmentVisualizationProps) {
  const [timeOfDay, setTimeOfDay] = useState(0); // 0-24 hours
  const [weatherIntensity, setWeatherIntensity] = useState(0);
  const [particleEffects, setParticleEffects] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Simulate time of day progression
    const timeInterval = setInterval(() => {
      setTimeOfDay(prev => (prev + 0.1) % 24);
    }, 1000);

    // Update weather intensity based on data
    if (weatherData) {
      setWeatherIntensity(weatherData.precipitation / 10);
    }

    // Generate particle effects based on location and weather
    const effects = generateParticleEffects(location, weatherData);
    setParticleEffects(effects);

    return () => clearInterval(timeInterval);
  }, [location, weatherData, isActive]);

  const getSkyColor = (): string => {
    const baseColor = location.visualTheme.skyColor;
    const timeMultiplier = getTimeMultiplier(timeOfDay);
    const weatherMultiplier = 1 - (weatherIntensity * 0.3);
    
    return adjustColorBrightness(baseColor, timeMultiplier * weatherMultiplier);
  };

  const getGroundColor = (): string => {
    const baseColor = location.visualTheme.groundTexture;
    const weatherMultiplier = 1 + (weatherIntensity * 0.2);
    
    return adjustColorBrightness(baseColor, weatherMultiplier);
  };

  const getVegetationColor = (): string => {
    const baseColor = location.visualTheme.vegetationColor;
    const seasonMultiplier = getSeasonMultiplier(cycleData?.day || 0);
    
    return adjustColorBrightness(baseColor, seasonMultiplier);
  };

  const getTimeMultiplier = (time: number): number => {
    // Simulate day/night cycle
    if (time >= 6 && time <= 18) {
      return 1.0; // Day
    } else if (time >= 5 && time <= 7) {
      return 0.5 + (time - 5) * 0.25; // Dawn
    } else if (time >= 17 && time <= 19) {
      return 1.0 - (time - 17) * 0.25; // Dusk
    } else {
      return 0.3; // Night
    }
  };

  const getSeasonMultiplier = (day: number): number => {
    // Simulate seasonal changes over 30 days
    const seasonProgress = (day % 30) / 30;
    return 0.8 + 0.4 * Math.sin(seasonProgress * Math.PI * 2);
  };

  const adjustColorBrightness = (color: string, multiplier: number): string => {
    // Simple color brightness adjustment
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.max(0, Math.floor(r * multiplier)));
    const newG = Math.min(255, Math.max(0, Math.floor(g * multiplier)));
    const newB = Math.min(255, Math.max(0, Math.floor(b * multiplier)));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  const generateParticleEffects = (location: Location, weather?: WeatherData): string[] => {
    const effects: string[] = [];
    
    // Location-specific effects
    effects.push(...location.visualTheme.particleEffects);
    
    // Weather-based effects
    if (weather) {
      if (weather.precipitation > 5) {
        effects.push('rain-drops');
      }
      if (weather.windSpeed > 5) {
        effects.push('wind-particles');
      }
      if (weather.temperature > 30) {
        effects.push('heat-waves');
      }
      if (weather.humidity > 80) {
        effects.push('humidity-mist');
      }
    }
    
    return effects;
  };

  const renderParticleEffect = (effect: string, index: number) => {
    const baseStyle = {
      position: 'absolute' as const,
      pointerEvents: 'none' as const,
      zIndex: 1,
    };

    switch (effect) {
      case 'dust-particles':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '2px',
              height: '2px',
              backgroundColor: '#8B7355',
              borderRadius: '50%',
              animation: 'float 3s ease-in-out infinite',
            }}
          />
        );
      case 'sun-rays':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              top: '10%',
              left: '20%',
              width: '2px',
              height: '60%',
              background: 'linear-gradient(to bottom, rgba(255,255,0,0.3), transparent)',
              animation: 'sunbeam 4s ease-in-out infinite',
            }}
          />
        );
      case 'rain-drops':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              top: '0%',
              left: `${Math.random() * 100}%`,
              width: '1px',
              height: '20px',
              background: 'linear-gradient(to bottom, rgba(0,150,255,0.6), transparent)',
              animation: 'rain 1s linear infinite',
            }}
          />
        );
      case 'heat-waves':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '100px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,100,0,0.3), transparent)',
              animation: 'heatwave 2s ease-in-out infinite',
            }}
          />
        );
      case 'humidity-mist':
        return (
          <div
            key={index}
            style={{
              ...baseStyle,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '50px',
              height: '50px',
              background: 'radial-gradient(circle, rgba(200,200,200,0.1), transparent)',
              animation: 'mist 5s ease-in-out infinite',
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Sky */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${getSkyColor()}, ${getGroundColor()})`,
        }}
      >
        {/* Sun/Moon */}
        <div
          className="absolute w-16 h-16 rounded-full transition-all duration-1000"
          style={{
            top: '10%',
            left: timeOfDay < 12 ? `${20 + (timeOfDay / 12) * 60}%` : `${80 - ((timeOfDay - 12) / 12) * 60}%`,
            backgroundColor: timeOfDay >= 6 && timeOfDay <= 18 ? '#FFD700' : '#F0F0F0',
            boxShadow: timeOfDay >= 6 && timeOfDay <= 18 ? '0 0 20px #FFD700' : '0 0 10px #F0F0F0',
          }}
        />

        {/* Clouds */}
        {weatherData && weatherData.cloudCover > 30 && (
          <div className="absolute top-20 left-10 w-20 h-10 bg-white bg-opacity-60 rounded-full animate-pulse" />
        )}
        {weatherData && weatherData.cloudCover > 50 && (
          <div className="absolute top-16 right-20 w-16 h-8 bg-white bg-opacity-60 rounded-full animate-pulse" />
        )}

        {/* Ground/Vegetation */}
        <div
          className="absolute bottom-0 w-full h-1/3 transition-all duration-1000"
          style={{
            background: `linear-gradient(to top, ${getGroundColor()}, ${getVegetationColor()})`,
          }}
        >
          {/* Vegetation elements */}
          <div className="absolute bottom-0 left-10 w-4 h-16 bg-green-600 rounded-t-full" />
          <div className="absolute bottom-0 left-20 w-3 h-12 bg-green-500 rounded-t-full" />
          <div className="absolute bottom-0 right-10 w-5 h-20 bg-green-700 rounded-t-full" />
          <div className="absolute bottom-0 right-20 w-3 h-14 bg-green-600 rounded-t-full" />
        </div>

        {/* Particle Effects */}
        {particleEffects.map((effect, index) => renderParticleEffect(effect, index))}

        {/* Weather Effects Overlay */}
        {weatherData && (
          <div className="absolute inset-0 pointer-events-none">
            {weatherData.precipitation > 5 && (
              <div className="absolute inset-0 bg-blue-200 bg-opacity-20 animate-pulse" />
            )}
            {weatherData.temperature > 35 && (
              <div className="absolute inset-0 bg-red-200 bg-opacity-10 animate-pulse" />
            )}
            {weatherData.humidity > 80 && (
              <div className="absolute inset-0 bg-gray-200 bg-opacity-15 animate-pulse" />
            )}
          </div>
        )}

        {/* Time of Day Indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {Math.floor(timeOfDay)}:00
        </div>

        {/* Weather Info */}
        {weatherData && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm">
            <div>🌡️ {Math.round(weatherData.temperature)}°C</div>
            <div>💧 {Math.round(weatherData.humidity)}%</div>
            <div>🌧️ {Math.round(weatherData.precipitation)}mm</div>
            <div>☀️ {Math.round(weatherData.solarRadiation)} kWh/m²</div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes sunbeam {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes rain {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        
        @keyframes heatwave {
          0%, 100% { opacity: 0; transform: scaleX(0); }
          50% { opacity: 0.6; transform: scaleX(1); }
        }
        
        @keyframes mist {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.3; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
