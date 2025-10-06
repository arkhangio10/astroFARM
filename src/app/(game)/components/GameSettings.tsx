'use client';

import { useState, useEffect } from 'react';
import { GameConfig, GameSettings as GameSettingsType } from '@/lib/gameConfig';
import { Volume2, VolumeX, Eye, EyeOff, Palette, Accessibility, Settings as SettingsIcon } from 'lucide-react';

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GameSettings({ isOpen, onClose }: GameSettingsProps) {
  const [settings, setSettings] = useState<GameSettingsType>(GameConfig.loadSettings());
  const [activeTab, setActiveTab] = useState<'audio' | 'visual' | 'gameplay' | 'accessibility' | 'advanced'>('audio');

  useEffect(() => {
    if (isOpen) {
      setSettings(GameConfig.loadSettings());
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof GameSettingsType>(key: K, value: GameSettingsType[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    GameConfig.saveSettings({ [key]: value });
    GameConfig.applySettings();
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      GameConfig.resetSettings();
      setSettings(GameConfig.loadSettings());
      GameConfig.applySettings();
    }
  };

  const exportSettings = () => {
    const settingsJson = GameConfig.exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrofarm-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (GameConfig.importSettings(content)) {
          setSettings(GameConfig.loadSettings());
          GameConfig.applySettings();
          alert('Settings imported successfully!');
        } else {
          alert('Failed to import settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'gameplay', label: 'Gameplay', icon: SettingsIcon },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'advanced', label: 'Advanced', icon: Palette },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-farm-green to-farm-blue text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Game Settings</h2>
              <p className="text-green-100">Customize your gaming experience</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-farm-green text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Audio Settings */}
            {activeTab === 'audio' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Audio Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sound Effects</label>
                      <p className="text-xs text-gray-500">Enable sound effects</p>
                    </div>
                    <button
                      onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.soundEnabled ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Sound Volume: {Math.round(settings.soundVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.soundVolume}
                      onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Background Music</label>
                      <p className="text-xs text-gray-500">Enable background music</p>
                    </div>
                    <button
                      onClick={() => updateSetting('musicEnabled', !settings.musicEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.musicEnabled ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Music Volume: {Math.round(settings.musicVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.musicVolume}
                      onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Visual Settings */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Visual Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Tips</label>
                      <p className="text-xs text-gray-500">Display contextual tips</p>
                    </div>
                    <button
                      onClick={() => updateSetting('showTips', !settings.showTips)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.showTips ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.showTips ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Animations</label>
                      <p className="text-xs text-gray-500">Enable UI animations</p>
                    </div>
                    <button
                      onClick={() => updateSetting('showAnimations', !settings.showAnimations)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.showAnimations ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.showAnimations ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Particles</label>
                      <p className="text-xs text-gray-500">Show particle effects</p>
                    </div>
                    <button
                      onClick={() => updateSetting('showParticles', !settings.showParticles)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.showParticles ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.showParticles ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      UI Scale: {Math.round(settings.uiScale * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.1"
                      value={settings.uiScale}
                      onChange={(e) => updateSetting('uiScale', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gameplay Settings */}
            {activeTab === 'gameplay' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Gameplay Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto Save</label>
                      <p className="text-xs text-gray-500">Automatically save your progress</p>
                    </div>
                    <button
                      onClick={() => updateSetting('autoSave', !settings.autoSave)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoSave ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      value={settings.difficulty}
                      onChange={(e) => updateSetting('difficulty', e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="normal">Normal</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Settings */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Accessibility Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">High Contrast</label>
                      <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
                    </div>
                    <button
                      onClick={() => updateSetting('highContrast', !settings.highContrast)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.highContrast ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Large Text</label>
                      <p className="text-xs text-gray-500">Increase text size</p>
                    </div>
                    <button
                      onClick={() => updateSetting('largeText', !settings.largeText)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.largeText ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.largeText ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Reduced Motion</label>
                      <p className="text-xs text-gray-500">Minimize animations and transitions</p>
                    </div>
                    <button
                      onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.reducedMotion ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Colorblind Mode</label>
                    <select
                      value={settings.colorBlindMode}
                      onChange={(e) => updateSetting('colorBlindMode', e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="protanopia">Protanopia</option>
                      <option value="deuteranopia">Deuteranopia</option>
                      <option value="tritanopia">Tritanopia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Advanced Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Debug Mode</label>
                      <p className="text-xs text-gray-500">Show debug information</p>
                    </div>
                    <button
                      onClick={() => updateSetting('debugMode', !settings.debugMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.debugMode ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.debugMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show FPS</label>
                      <p className="text-xs text-gray-500">Display frames per second</p>
                    </div>
                    <button
                      onClick={() => updateSetting('showFPS', !settings.showFPS)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.showFPS ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.showFPS ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experimental Features</label>
                      <p className="text-xs text-gray-500">Enable experimental features</p>
                    </div>
                    <button
                      onClick={() => updateSetting('experimentalFeatures', !settings.experimentalFeatures)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.experimentalFeatures ? 'bg-farm-green' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.experimentalFeatures ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Import/Export */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-4">Settings Management</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={exportSettings}
                      className="bg-farm-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Export Settings
                    </button>
                    <label className="bg-farm-green hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
                      Import Settings
                      <input
                        type="file"
                        accept=".json"
                        onChange={importSettings}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={resetSettings}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
