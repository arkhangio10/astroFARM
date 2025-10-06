'use client';

import { useState, useEffect } from 'react';
import { SaveSystem, SaveData } from '@/lib/saveSystem';
import { useGameStore } from '@/lib/store/gameStore';
import { Download, Upload, Trash2, Play, Calendar, Trophy, Clock } from 'lucide-react';

interface SaveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadGame: (saveData: SaveData) => void;
}

export default function SaveManager({ isOpen, onClose, onLoadGame }: SaveManagerProps) {
  const [saves, setSaves] = useState<SaveData[]>([]);
  const [selectedSave, setSelectedSave] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  // Obtener el estado completo y las propiedades que necesitamos por separado
  const gameStore = useGameStore();
  const { currentLevel } = gameStore;

  useEffect(() => {
    if (isOpen) {
      loadSaves();
    }
  }, [isOpen]);

  const loadSaves = () => {
    const gameSaves = SaveSystem.getSaves();
    setSaves(gameSaves);
  };

  const handleSaveGame = () => {
    const saveName = prompt('Enter save name:', `Level ${currentLevel} - ${new Date().toLocaleDateString()}`);
    if (saveName) {
      // Pasamos el objeto 'gameStore' directamente, ya que contiene el GameState
      const saveId = SaveSystem.saveGame(gameStore, currentLevel, saveName);
      loadSaves();
      alert('Game saved successfully!');
    }
  };

  const handleLoadGame = (save: SaveData) => {
    if (confirm(`Load "${save.name}"? This will replace your current game.`)) {
      onLoadGame(save);
      onClose();
    }
  };

  const handleDeleteSave = (saveId: string) => {
    if (confirm('Are you sure you want to delete this save?')) {
      SaveSystem.deleteSave(saveId);
      loadSaves();
      if (selectedSave === saveId) {
        setSelectedSave(null);
      }
    }
  };

  const handleExportSave = (save: SaveData) => {
    const exportData = SaveSystem.exportSave(save.id);
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `astrofarm-save-${save.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportSave = () => {
    setImportError(null);
    try {
      const success = SaveSystem.importSave(importData);
      if (success) {
        loadSaves();
        setImportData('');
        setShowImport(false);
        alert('Save imported successfully!');
      } else {
        setImportError('Failed to import save. Please check the data format.');
      }
    } catch (error) {
      setImportError('Invalid save data format.');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSaveStats = () => {
    return SaveSystem.getSaveStats();
  };

  if (!isOpen) return null;

  const stats = getSaveStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-farm-green to-farm-blue text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Save Manager</h2>
              <p className="text-green-100">Manage your game saves</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSaves}</div>
              <div className="text-sm text-blue-800">Total Saves</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.highestScore}</div>
              <div className="text-sm text-green-800">Highest Score</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completedLevels}</div>
              <div className="text-sm text-purple-800">Max Level</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(stats.totalPlayTime / 60)}</div>
              <div className="text-sm text-orange-800">Hours Played</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleSaveGame}
              className="bg-farm-green hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Save Current Game
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="bg-farm-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Save
            </button>
          </div>

          {/* Import Section */}
          {showImport && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Import Save File</h3>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your save data here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
              />
              {importError && (
                <p className="text-red-600 text-sm mt-2">{importError}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleImportSave}
                  className="bg-farm-green hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Import
                </button>
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportData('');
                    setImportError(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Saves List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Saved Games</h3>
            {saves.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No saved games found</p>
                <p className="text-sm">Save your current game to get started!</p>
              </div>
            ) : (
              saves.map((save) => (
                <div
                  key={save.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedSave === save.id ? 'border-farm-green bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSave(save.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">{save.name}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Level {save.level}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>Score: {save.scores.total}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(save.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Yield: {save.scores.yield}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Achievements: {save.achievements.length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadGame(save);
                        }}
                        className="p-2 text-farm-green hover:bg-green-100 rounded-lg transition-colors"
                        title="Load Game"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportSave(save);
                        }}
                        className="p-2 text-farm-blue hover:bg-blue-100 rounded-lg transition-colors"
                        title="Export Save"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSave(save.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Save"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
