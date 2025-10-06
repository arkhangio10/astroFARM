'use client';

import React, { useState } from 'react';
import { Location } from '@/types/game';
import { GAME_LOCATIONS, getLocationRecommendations } from '@/lib/locations';

interface LocationSelectionProps {
  onLocationSelect: (locationId: string) => void;
  playerLevel: number;
  completedLevels: number[];
}

export default function LocationSelection({ 
  onLocationSelect, 
  playerLevel, 
  completedLevels 
}: LocationSelectionProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const availableLocations = getLocationRecommendations(playerLevel, completedLevels);

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  const handleConfirmSelection = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const getLocationDifficulty = (locationId: string): string => {
    switch (locationId) {
      case 'central-valley':
        return 'Beginner';
      case 'sahara-oasis':
        return 'Intermediate';
      case 'amazon-rainforest':
        return 'Advanced';
      default:
        return 'Beginner';
    }
  };

  const getLocationDifficultyColor = (locationId: string): string => {
    switch (locationId) {
      case 'central-valley':
        return 'text-green-600 bg-green-100';
      case 'sahara-oasis':
        return 'text-yellow-600 bg-yellow-100';
      case 'amazon-rainforest':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Select Your Location
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose where you&apos;ll grow your crops. Each location has 
            unique climate conditions and challenges that will affect your strategy.
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableLocations.map((location) => (
            <div
              key={location.id}
              className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                selectedLocation === location.id
                  ? 'ring-4 ring-blue-500 scale-105'
                  : 'hover:scale-102 hover:shadow-xl'
              }`}
              onClick={() => handleLocationSelect(location.id)}
            >
              {/* Location Image/Visual */}
              <div 
                className="h-48 relative"
                style={{
                  background: `linear-gradient(135deg, ${location.visualTheme.skyColor} 0%, ${location.visualTheme.vegetationColor} 100%)`
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLocationDifficultyColor(location.id)}`}>
                    {getLocationDifficulty(location.id)}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{location.name}</h3>
                  <p className="text-sm opacity-90">{location.type}</p>
                </div>
              </div>

              {/* Location Info */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {location.description}
                </p>

                {/* Climate Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {location.climate.averageTemperature}°C
                    </div>
                    <div className="text-xs text-gray-500">Temperature</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {location.climate.averagePrecipitation}mm
                    </div>
                    <div className="text-xs text-gray-500">Rain/year</div>
                  </div>
                </div>

                {/* Advantages */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Advantages:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {location.advantages.slice(0, 2).map((advantage, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Challenges:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {location.challenges.slice(0, 2).map((challenge, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Details Button */}
                <button
                  className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(showDetails === location.id ? null : location.id);
                  }}
                >
                  {showDetails === location.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Detailed Information */}
              {showDetails === location.id && (
                <div className="px-6 pb-6 border-t border-gray-200">
                  <div className="pt-4">
                    {/* NASA Data Sources */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">NASA Data:</h4>
                      <div className="space-y-2">
                        {location.nasaDataSources.map((source, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <div className="font-medium">{source.product}</div>
                            <div className="text-gray-500">
                              {source.resolution} • {source.frequency}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Climate Details */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Detailed Climate:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Humidity: {location.climate.averageHumidity}%</div>
                        <div>Solar Radiation: {location.climate.solarRadiation} kWh/m²</div>
                        <div>Soil: {location.climate.soilType}</div>
                        <div>Season: {location.climate.growingSeason}</div>
                      </div>
                    </div>

                    {/* Educational Content */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Educational Tips:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {getLocationRecommendations(playerLevel, completedLevels)
                          .find(loc => loc.id === location.id)
                          ?.challenges.slice(0, 3)
                          .map((challenge, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5"></span>
                              {challenge}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Selected Location
            </h3>
            <p className="text-blue-700">
              You have selected <strong>{GAME_LOCATIONS.find(l => l.id === selectedLocation)?.name}</strong>.
              This location will present unique challenges and learning opportunities.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedLocation}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              selectedLocation
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm Selection
          </button>
        </div>

        {/* Educational Footer */}
        <div className="mt-12 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Why is location selection important?
            </h3>
            <p className="text-green-700 text-sm max-w-3xl mx-auto">
              Each location has unique climate conditions that affect crop growth. 
              By choosing different locations, you'll learn about sustainable agriculture in diverse 
              environments and how NASA data can help you make better agricultural decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
