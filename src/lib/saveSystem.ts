// Game save/load system for AstroFarm

import { GameState } from '@/types/game';

export interface SaveData {
  id: string;
  name: string;
  timestamp: number;
  level: number;
  gameState: GameState;
  scores: {
    total: number;
    yield: number;
    water: number;
    environment: number;
  };
  achievements: string[];
  completedLevels: number[];
}

export class SaveSystem {
  private static readonly SAVE_KEY = 'astrofarm-saves';
  private static readonly MAX_SAVES = 10;

  static saveGame(gameState: GameState, level: number, saveName?: string): string {
    const saves = this.getSaves();
    const saveId = `save_${Date.now()}`;
    
    const saveData: SaveData = {
      id: saveId,
      name: saveName || `Level ${level} - ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      level,
      gameState: { ...gameState },
      scores: {
        total: gameState.scores.total,
        yield: gameState.scores.yield,
        water: gameState.scores.water,
        environment: gameState.scores.environment,
      },
      achievements: gameState.achievements.map(achievement => achievement.id),
      completedLevels: gameState.currentLevel > 1 ? Array.from({length: gameState.currentLevel - 1}, (_, i) => i + 1) : [],
    };

    // Add new save
    saves.unshift(saveData);

    // Keep only the most recent saves
    if (saves.length > this.MAX_SAVES) {
      saves.splice(this.MAX_SAVES);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
    }
    return saveId;
  }

  static loadGame(saveId: string): SaveData | null {
    const saves = this.getSaves();
    return saves.find(save => save.id === saveId) || null;
  }

  static getSaves(): SaveData[] {
    try {
      if (typeof window !== 'undefined') {
        const savesData = localStorage.getItem(this.SAVE_KEY);
        return savesData ? JSON.parse(savesData) : [];
      }
      return [];
    } catch (error) {
      console.error('Error loading saves:', error);
      return [];
    }
  }

  static deleteSave(saveId: string): boolean {
    const saves = this.getSaves();
    const initialLength = saves.length;
    const filteredSaves = saves.filter(save => save.id !== saveId);
    
    if (filteredSaves.length < initialLength) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(filteredSaves));
      }
      return true;
    }
    return false;
  }

  static exportSave(saveId: string): string | null {
    const save = this.loadGame(saveId);
    if (!save) return null;
    
    return JSON.stringify(save, null, 2);
  }

  static importSave(saveData: string): boolean {
    try {
      const save: SaveData = JSON.parse(saveData);
      
      // Validate save data structure
      if (!this.validateSaveData(save)) {
        throw new Error('Invalid save data structure');
      }

      const saves = this.getSaves();
      saves.unshift(save);
      
      // Keep only the most recent saves
      if (saves.length > this.MAX_SAVES) {
        saves.splice(this.MAX_SAVES);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saves));
      }
      return true;
    } catch (error) {
      console.error('Error importing save:', error);
      return false;
    }
  }

  private static validateSaveData(save: any): save is SaveData {
    return (
      save &&
      typeof save.id === 'string' &&
      typeof save.name === 'string' &&
      typeof save.timestamp === 'number' &&
      typeof save.level === 'number' &&
      save.gameState &&
      save.scores &&
      Array.isArray(save.achievements) &&
      Array.isArray(save.completedLevels)
    );
  }

  static getSaveStats(): {
    totalSaves: number;
    totalPlayTime: number;
    highestScore: number;
    completedLevels: number;
  } {
    const saves = this.getSaves();
    
    return {
      totalSaves: saves.length,
      totalPlayTime: saves.reduce((total, save) => {
        // Estimate play time based on game state
        return total + (save.gameState.currentDay * 2); // 2 minutes per day estimate
      }, 0),
      highestScore: Math.max(...saves.map(save => save.scores.total), 0),
      completedLevels: Math.max(...saves.map(save => save.level), 0),
    };
  }

  static clearAllSaves(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SAVE_KEY);
    }
  }
}

// Auto-save functionality
export class AutoSave {
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private static intervalId: NodeJS.Timeout | null = null;

  static start(gameState: GameState, level: number): void {
    this.stop(); // Stop any existing auto-save
    
    this.intervalId = setInterval(() => {
      try {
        SaveSystem.saveGame(gameState, level, `Auto-save - Level ${level}`);
        console.log('Game auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.AUTO_SAVE_INTERVAL);
  }

  static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  static isRunning(): boolean {
    return this.intervalId !== null;
  }
}
