'use client';

import React, { useState } from 'react';
import { SuperVegetable, VegetableCharacteristics, VegetableStats, VegetableAbility } from '@/types/game';

interface SuperVegetableDisplayProps {
  vegetable: SuperVegetable;
  showDetails?: boolean;
  onBattle?: () => void;
  onEvolve?: () => void;
}

export default function SuperVegetableDisplay({ 
  vegetable, 
  showDetails = false, 
  onBattle, 
  onEvolve 
}: SuperVegetableDisplayProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'appearance'>('stats');

  const getSizeIcon = (size: string): string => {
    switch (size) {
      case 'giant': return '🌳';
      case 'large': return '🌿';
      case 'medium': return '🌱';
      case 'small': return '🌿';
      default: return '🌱';
    }
  };

  const getStatColor = (value: number): string => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    if (value >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatBarColor = (value: number): string => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    if (value >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAbilityTypeColor = (type: string): string => {
    switch (type) {
      case 'passive': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{vegetable.name}</h2>
            <p className="text-green-100">
              {getSizeIcon(vegetable.characteristics.size)} {vegetable.characteristics.size} • 
              {vegetable.characteristics.color} • {vegetable.baseType}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Power Level</div>
            <div className="text-3xl font-bold">
              {Math.round((vegetable.stats.health + vegetable.stats.strength + vegetable.stats.speed) / 3)}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Display */}
      <div className="p-6 bg-gray-50">
        <div className="flex justify-center">
          <div 
            className="relative w-32 h-32 rounded-full flex items-center justify-center text-6xl"
            style={{
              backgroundColor: vegetable.characteristics.color,
              transform: `scale(${vegetable.appearance.size})`
            }}
          >
            {getSizeIcon(vegetable.characteristics.size)}
            {vegetable.appearance.effects.includes('eco-glow') && (
              <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse"></div>
            )}
            {vegetable.appearance.effects.includes('solar-aura') && (
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping"></div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {vegetable.characteristics.shape}
          </h3>
          <p className="text-sm text-gray-600">
            {vegetable.characteristics.texture}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'stats', label: 'Statistics', icon: '📊' },
            { id: 'abilities', label: 'Abilities', icon: '⚡' },
            { id: 'appearance', label: 'Appearance', icon: '🎨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Super Vegetable Statistics</h3>
            
            {[
              { key: 'health', label: 'Health', icon: '❤️' },
              { key: 'strength', label: 'Strength', icon: '💪' },
              { key: 'speed', label: 'Speed', icon: '🏃' },
              { key: 'resistance', label: 'Resistance', icon: '🛡️' },
              { key: 'growthRate', label: 'Growth Rate', icon: '📈' },
              { key: 'waterEfficiency', label: 'Water Efficiency', icon: '💧' },
              { key: 'solarEfficiency', label: 'Solar Efficiency', icon: '☀️' }
            ].map((stat) => {
              const value = vegetable.stats[stat.key as keyof VegetableStats] as number;
              return (
                <div key={stat.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{stat.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${getStatColor(value)}`}>
                      {value}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStatBarColor(value)}`}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'abilities' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Special Abilities</h3>
            
            {vegetable.abilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🌱</div>
                <p>This vegetable hasn&apos;t developed special abilities yet.</p>
                <p className="text-sm">Keep playing to unlock them!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vegetable.abilities.map((ability, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{ability.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAbilityTypeColor(ability.type)}`}>
                        {ability.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ability.description}</p>
                    <div className="text-xs text-gray-500">
                      Effect: {ability.effect}
                    </div>
                    {ability.cooldown && (
                      <div className="text-xs text-blue-600 mt-1">
                        Cooldown: {ability.cooldown} turns
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Visual Characteristics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Physical Characteristics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="text-sm font-medium">{vegetable.characteristics.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Color:</span>
                    <span className="text-sm font-medium">{vegetable.characteristics.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shape:</span>
                    <span className="text-sm font-medium">{vegetable.characteristics.shape}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Texture:</span>
                    <span className="text-sm font-medium">{vegetable.characteristics.texture}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Special Features</h4>
                <div className="space-y-2">
                  {vegetable.characteristics.specialFeatures.length === 0 ? (
                    <p className="text-sm text-gray-500">No special features</p>
                  ) : (
                    vegetable.characteristics.specialFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3">Visual Effects</h4>
              <div className="flex flex-wrap gap-2">
                {vegetable.appearance.effects.length === 0 ? (
                  <span className="text-sm text-gray-500">No special effects</span>
                ) : (
                  vegetable.appearance.effects.map((effect, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {effect}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(onBattle || onEvolve) && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex space-x-4">
            {onBattle && (
              <button
                onClick={onBattle}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                ⚔️ Battle
              </button>
            )}
            {onEvolve && (
              <button
                onClick={onEvolve}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🌟 Evolve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
