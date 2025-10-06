// Game configuration and settings management

export interface GameSettings {
  // Audio settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;

  // Visual settings
  showTips: boolean;
  showAnimations: boolean;
  showParticles: boolean;
  uiScale: number;

  // Gameplay settings
  autoSave: boolean;
  autoSaveInterval: number; // in minutes
  showTutorial: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';

  // Accessibility settings
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

  // Advanced settings
  debugMode: boolean;
  showFPS: boolean;
  experimentalFeatures: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  // Audio settings
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.5,

  // Visual settings
  showTips: true,
  showAnimations: true,
  showParticles: true,
  uiScale: 1.0,

  // Gameplay settings
  autoSave: true,
  autoSaveInterval: 5, // 5 minutes
  showTutorial: true,
  difficulty: 'normal',

  // Accessibility settings
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  colorBlindMode: 'none',

  // Advanced settings
  debugMode: false,
  showFPS: false,
  experimentalFeatures: false,
};

export class GameConfig {
  private static readonly SETTINGS_KEY = 'astrofarm-settings';
  private static settings: GameSettings = { ...DEFAULT_SETTINGS };

  static loadSettings(): GameSettings {
    try {
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem(this.SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Merge with defaults to ensure all properties exist
          this.settings = { ...DEFAULT_SETTINGS, ...parsed };
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
    return this.settings;
  }

  static saveSettings(settings: Partial<GameSettings>): void {
    try {
      this.settings = { ...this.settings, ...settings };
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.settings[key];
  }

  static setSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value;
    this.saveSettings({ [key]: value });
  }

  static resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SETTINGS_KEY);
    }
  }

  static exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  static importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      // Validate settings structure
      if (this.validateSettings(imported)) {
        this.settings = { ...DEFAULT_SETTINGS, ...imported };
        this.saveSettings(this.settings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  private static validateSettings(settings: any): settings is GameSettings {
    // Basic validation - check if it's an object and has some expected properties
    return (
      typeof settings === 'object' &&
      settings !== null &&
      typeof settings.soundEnabled === 'boolean' &&
      typeof settings.musicEnabled === 'boolean' &&
      typeof settings.soundVolume === 'number' &&
      typeof settings.musicVolume === 'number'
    );
  }

  // Apply settings to the game
  static applySettings(): void {
    const settings = this.settings;

    // Apply audio settings
    if (typeof window !== 'undefined') {
      // Apply sound volume
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.volume = settings.soundVolume;
        audio.muted = !settings.soundEnabled;
      });
    }

    // Apply visual settings
    document.documentElement.style.setProperty('--ui-scale', settings.uiScale.toString());
    
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    // Apply colorblind mode
    document.documentElement.setAttribute('data-colorblind', settings.colorBlindMode);
  }

  // Get difficulty multiplier
  static getDifficultyMultiplier(): number {
    switch (this.settings.difficulty) {
      case 'easy':
        return 0.8;
      case 'normal':
        return 1.0;
      case 'hard':
        return 1.2;
      case 'expert':
        return 1.5;
      default:
        return 1.0;
    }
  }

  // Check if feature is enabled
  static isFeatureEnabled(feature: keyof GameSettings): boolean {
    return this.settings[feature] as boolean;
  }
}

// Initialize settings on load
if (typeof window !== 'undefined') {
  GameConfig.loadSettings();
  GameConfig.applySettings();
}
