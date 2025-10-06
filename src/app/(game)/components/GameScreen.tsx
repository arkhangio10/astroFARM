'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Thermometer, Leaf, Timer, AlertTriangle, Info, Settings, Save, Target, Satellite, Cloud, Sun, MapPin, Wind, Sparkles } from 'lucide-react';
import { nasaDataService } from '@/lib/nasaIntegration';
import { geminiService, AIGeneratedScenario } from '@/lib/geminiService';
import VegetableBattleArena from './VegetableBattleArena';
import NASAGIBSLayer from './NASAGIBSLayer';
import DataCredibilityHUD from './DataCredibilityHUD';
import WhatIfPanel from './WhatIfPanel';
import DailyMissionSystem, { DailyMission } from './DailyMissionSystem';
import AutoDemoMode from './AutoDemoMode';
import NASADataDisplay from './NASADataDisplay';
import { evaluateAllTips, NASAEnhancedTipRule } from '@/lib/tips';
import { useGameStore } from '@/lib/store/gameStore';
import { createNASAMetricsTracker, calculateEnhancedScore } from '@/lib/engine/enhancedScoring';
import { calculateScores } from '@/lib/engine/scoring';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth/AuthContext';
import { Action, GameState as CoreGameState, Seed, Scores as ScoreType } from '@/types/game';

interface GameScreenProps {
  farm: any;
  playerData: {
    playerName: string;
    learningGoal: string;
    selectedCrop: string;
  };
}

interface Resources {
  water: number;
  fertilizer: number;
  pesticide: number;
}

interface CropState {
  growth: number; // 0-100%
  health: number; // 0-100%
  moisture: number; // 0-100%
  temperature: number; // in celsius
  nutrients: number; // 0-100%
  pests: number; // 0-100% pest level
}

interface CropVisualState {
  filter: string;
  animation: string;
  statusEmoji: string;
  healthIndicator: 'excellent' | 'healthy' | 'fair' | 'poor' | 'critical';
}

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  forecast: string;
}

interface VegetableAvatar {
  level: number;
  experience: number;
  traits: string[];
  powerLevel: number;
}

export default function GameScreen({ farm, playerData }: GameScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [gameTime, setGameTime] = useState(0); // minutes in game
  const [realTime, setRealTime] = useState(0); // real seconds
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTips, setShowTips] = useState(true);
  
  // Ensure farm has a seedCode
  const farmWithSeed = {
    ...farm,
    seedCode: farm?.seedCode || `SEED-${new Date().toISOString().split('T')[0]}`
  };
  
  // Database state
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [seedId, setSeedId] = useState<string | null>(null);
  const [gameStateId, setGameStateId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date>(new Date());
  const [actions, setActions] = useState<Action[]>([]);
  
  // NASA Metrics Tracker
  const nasaMetricsRef = useRef(createNASAMetricsTracker());
  const { trackLayerView, trackSimulation, trackMissionComplete, trackDecision } = nasaMetricsRef.current;
  
  // Estados del juego
  const [resources, setResources] = useState<Resources>({
    water: 100,
    fertilizer: 100,
    pesticide: 100,
  });
  
  const [cropState, setCropState] = useState<CropState>({
    growth: 0,
    health: 100,
    moisture: 50,
    temperature: 22,
    nutrients: 75,
    pests: 0,
  });
  
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    humidity: 65,
    precipitation: 0,
    windSpeed: 10,
    forecast: 'sunny',
  });
  const weatherTemperature = weather.temperature;
  const weatherPrecipitation = weather.precipitation;
  
  const [vegetableAvatar, setVegetableAvatar] = useState<VegetableAvatar>({
    level: 1,
    experience: 0,
    traits: [],
    powerLevel: 100,
  });

  const [currentTip, setCurrentTip] = useState('');
  const [nasaDataConnected, setNasaDataConnected] = useState(false);
  const [dataQuality, setDataQuality] = useState<'good' | 'moderate' | 'poor'>('good');
  const [lastDataUpdate, setLastDataUpdate] = useState<Date>(new Date());
  const [showBattleArena, setShowBattleArena] = useState(false);
  
  // NUEVOS estados para mejoras NASA
  const [showGIBSLayer, setShowGIBSLayer] = useState(true);
  const [activeGIBSLayer, setActiveGIBSLayer] = useState('NDVI');
  const [gibsOpacity, setGibsOpacity] = useState(0.7);
  
  const [showCredibilityHUD, setShowCredibilityHUD] = useState(true);
  const [currentDataType, setCurrentDataType] = useState<'NDVI' | 'SoilMoisture' | 'Temperature' | 'Precipitation'>('NDVI');
  
  const [showWhatIfPanel, setShowWhatIfPanel] = useState(false);
  const [lastSimulation, setLastSimulation] = useState<any>(null);
  
  const [activeMission, setActiveMission] = useState<DailyMission | null>(null);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  
  const [demoMode, setDemoMode] = useState(false);
  
  // Estados para tracking de alertas
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  // Estado para el aspecto visual del cultivo
  const [cropVisualState, setCropVisualState] = useState<CropVisualState>({
    filter: '',
    animation: '',
    statusEmoji: '🌱',
    healthIndicator: 'healthy'
  });
  
  // Sistema de recursos mínimos por aprendizaje
  const [learningBonus, setLearningBonus] = useState({
    water: 0,
    fertilizer: 0,
    pesticide: 0
  });
  
  // Control de duración de tips
  const [tipDisplayTime, setTipDisplayTime] = useState(0);
  const [isPersistentTip, setIsPersistentTip] = useState(false);
  
  // Estados para sistema IA con Gemini
  const [useAISimulation, setUseAISimulation] = useState(false);
  const [aiGeneratedData, setAIGeneratedData] = useState<AIGeneratedScenario | null>(null);
  const [activeDataSource, setActiveDataSource] = useState<'NASA' | 'AI'>('NASA');
  
  // Estados para el sistema de recursos pasivos por aprendizaje
  const [passiveLearningActive, setPassiveLearningActive] = useState(false);
  const [lastPassiveBonus, setLastPassiveBonus] = useState(Date.now());
  const [historicalNASAData, setHistoricalNASAData] = useState<{
    ndvi: number[];
    soilMoisture: number[];
    temperature: number[];
    precipitation: number[];
  }>({
    ndvi: [],
    soilMoisture: [],
    temperature: [],
    precipitation: []
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [credibilityExpanded, setCredibilityExpanded] = useState(true);
  
  // Sistema de notificaciones flotantes para acciones del jugador
  const [actionNotifications, setActionNotifications] = useState<Array<{
    id: number;
    message: string;
    type: 'growth' | 'health' | 'action' | 'warning';
    timestamp: number;
  }>>([]);
  
  // Sistema mejorado de retroalimentación y aprendizaje
  const [decisionHistory, setDecisionHistory] = useState<Array<{
    timestamp: number;
    action: string;
    wasCorrect: boolean;
    explanation: string;
    dataUsed: any;
    consequence: string;
  }>>([]);
  
  const [showLearningPanel, setShowLearningPanel] = useState(false);
  const [learningContent, setLearningContent] = useState<{
    title: string;
    content: string;
    suggestions: string[];
    correctAction: string;
    actionTaken: string;
  }>({
    title: '',
    content: '',
    suggestions: [],
    correctAction: '',
    actionTaken: ''
  });
  
  const [canCorrectLastAction, setCanCorrectLastAction] = useState(false);
  const [lastIncorrectAction, setLastIncorrectAction] = useState<{
    type: 'water' | 'fertilize' | 'pesticide';
    timestamp: number;
  } | null>(null);
  
  const [scoreSummary, setScoreSummary] = useState({
    yield: 0,
    water: 0,
    environment: 0,
    efficiency: 0,
    total: 0,
    final: 0,
    dataMultiplier: 1,
    nasaBonusTotal: 0,
    nasaBonusBreakdown: {
      dataUsage: 0,
      whatIfUsage: 0,
      missionComplete: 0,
      alertResponse: 0,
      total: 0,
    },
    penalties: {
      ignoredAlerts: 0,
      badDecisions: 0,
      total: 0,
    },
  });
  
  // Obtener datos NASA reales del store
  const { environmentData } = useGameStore();
  
  // Combinar datos NASA con simulación IA
  // effectiveData contiene los datos activos según el modo seleccionado:
  // - Modo NASA: Datos satelitales reales (SMAP, MODIS, etc.)
  // - Modo IA: Escenarios generados por Gemini basados en histórico NASA
  // Las decisiones del jugador se evalúan con estos datos en ambos modos
  const effectiveData = useMemo(() => {
    if (useAISimulation && aiGeneratedData) {
      return {
        ndvi: aiGeneratedData.ndvi,
        soilMoisture: aiGeneratedData.soilMoisture,
        temperature: aiGeneratedData.temperature,
        precipitationForecast: aiGeneratedData.precipitationForecast,
        cloudCover: aiGeneratedData.cloudCover,
        dataAge: aiGeneratedData.dataAge
      };
    }
    return environmentData ? {
      ndvi: environmentData.ndvi,
      soilMoisture: environmentData.soilMoisture / 100,
      temperature: environmentData.temperature,
      precipitationForecast: environmentData.precipitation,
      cloudCover: 0.2,
      dataAge: 2
    } : {
      ndvi: 0.65,
      soilMoisture: 0.45,
      temperature: 22,
      precipitationForecast: 0,
      cloudCover: 0.2,
      dataAge: 2
    };
  }, [environmentData, useAISimulation, aiGeneratedData]);
  
  // Usar datos efectivos (NASA o IA) para todas las evaluaciones
  const nasaRealTimeData = effectiveData;

  const scoringSeed = useMemo<Seed>(() => {
    const defaultDatasets = {
      ndvi: 'MCD13Q1_v061',
      soilMoisture: 'SMAP_L3_v7',
      temperature: 'MOD11A2_v061',
      precipitation: 'IMERG_v06',
      cloudMask: 'MOD35_L2',
    };

    const defaultTargets = {
      minHumidity: 55,
      minNDVI: 0.5,
      maxTemperature: 35,
      minYield: 70,
    };

    const defaultWeights = {
      yield: 0.4,
      water: 0.3,
      environment: 0.3,
    };

    return {
      id: (seedId as string) || 'local-seed',
      code: farmWithSeed.seedCode,
      region: farm?.location || 'Central Valley, California',
      dateStart: farm?.dateStart || new Date().toISOString().split('T')[0],
      dateEnd: farm?.dateEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cropType: playerData.selectedCrop,
      targets: farm?.targets ? { ...defaultTargets, ...farm.targets } : defaultTargets,
      weights: farm?.weights ? { ...defaultWeights, ...farm.weights } : defaultWeights,
      datasets: farm?.datasets ? { ...defaultDatasets, ...farm.datasets } : defaultDatasets,
      notes: farm?.notes || 'Seed generated on client for scoring calculations.'
    };
  }, [farm?.dateEnd, farm?.dateStart, farm?.datasets, farm?.location, farm?.notes, farm?.targets, farm?.weights, farmWithSeed.seedCode, playerData.selectedCrop, seedId]);

  // Initialize player and load saved state
  useEffect(() => {
    const initializeGame = async () => {
      if (!user) return;
      
      // Recursos por defecto para nuevas granjas - todos al 100%
      const defaultResources = {
        water: 100,
        fertilizer: 100,
        pesticide: 100,
      };
      
      try {
        // Get or create player
        console.log('Looking for player with anon_id:', user.id);
        let { data: players, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('anon_id', user.id);
          
        let player = players && players.length > 0 ? players[0] : null;
        
        if (!player) {
          console.log('No player found, creating new one...');
          const { data: newPlayer, error: createError } = await supabase
            .from('players')
            .insert({
              anon_id: user.id,
              alias: playerData.playerName
            })
            .select()
            .single();
            
          if (createError) {
            // If player already exists, try to fetch it again
            if (createError.code === '23505') {
              console.log('Player already exists, fetching...');
              const { data: existingPlayers } = await supabase
                .from('players')
                .select('*')
                .eq('anon_id', user.id);
              player = existingPlayers && existingPlayers.length > 0 ? existingPlayers[0] : null;
            } else {
              console.error('Error creating player:', createError);
              return;
            }
          } else {
            player = newPlayer;
            // Establecer recursos iniciales para nuevo jugador
            setResources(defaultResources);
          }
        }
        
        if (player) {
          setPlayerId(player.id);
          
          // Get current seed
          const { data: seed, error: seedError } = await supabase
            .from('seeds')
            .select('*')
            .eq('code', farmWithSeed.seedCode)
            .maybeSingle();
            
          if (seed && !seedError) {
            setSeedId(seed.id);
            
            // Load saved game state
            const { data: gameState, error: stateError } = await supabase
              .from('game_states')
              .select('*')
              .eq('player_id', player.id)
              .eq('seed_id', seed.id)
              .maybeSingle();
              
            if (gameState && !stateError) {
              setGameStateId(gameState.id);
              
              // Validar recursos guardados más estrictamente
              const savedResources = gameState.resources;
              const hasValidResources = savedResources && 
                                       typeof savedResources.water === 'number' && 
                                       typeof savedResources.fertilizer === 'number' &&
                                       typeof savedResources.pesticide === 'number' &&
                                       savedResources.water >= 0 && savedResources.water <= 100 &&
                                       savedResources.fertilizer >= 0 && savedResources.fertilizer <= 100 &&
                                       savedResources.pesticide >= 0 && savedResources.pesticide <= 100;
              
              if (hasValidResources) {
                // OPCIÓN DE DEBUG: Descomentar la siguiente línea para FORZAR recursos al 100%
                // setResources(defaultResources);
                // console.log('🔄 FORCED reset to default resources:', defaultResources);
                
                // Cargar recursos guardados (comentar estas 2 líneas si usas force reset arriba)
                setResources(savedResources);
                console.log('✅ Loaded saved resources:', savedResources);
              } else {
                console.log('⚠️ Invalid saved resources, using defaults:', defaultResources);
                setResources(defaultResources);
              }
              
              setCropState(gameState.crop_state || {
                growth: 0,
                health: 100,
                moisture: 50,
                temperature: 22,
                nutrients: 75,
                pests: 0,
              });
              setGameTime(gameState.game_time);
              setVegetableAvatar(gameState.avatar_state || vegetableAvatar);
              setActions(gameState.actions_log || []);
              console.log('Game state loaded successfully');
            } else {
              // Nueva granja - establecer recursos iniciales
              console.log('New farm - setting default resources');
              setResources(defaultResources);
            }
          } else if (!seed) {
            // Create default seed if none exists
            console.log('No seed found for code:', farmWithSeed.seedCode);
            // Try creating a default seed
            const defaultSeedCode = farmWithSeed.seedCode;
            const { data: newSeed, error: seedCreateError } = await supabase
              .from('seeds')
              .insert({
                code: defaultSeedCode,
                region: 'Central Valley, California',
                date_start: new Date().toISOString().split('T')[0],
                date_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                layers_version: {
                  ndvi: "MCD13Q1_v061",
                  soil_moisture: "SMAP_L3_v7",
                  temperature: "MOD11A2_v061",
                  precipitation: "IMERG_v06"
                }
              })
              .select()
              .single();
              
            if (newSeed && !seedCreateError) {
              setSeedId(newSeed.id);
              setResources(defaultResources);
              console.log('Created new seed:', newSeed);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        // En caso de error, usar recursos por defecto
        setResources(defaultResources);
      }
    };
    
    initializeGame();
  }, [user, farmWithSeed.seedCode, playerData.playerName]);

  // Sistema de tiempo del juego (1 día = 40 minutos reales)
  useEffect(() => {
    if (isPaused) return;

    const timeInterval = setInterval(() => {
      setRealTime(prev => prev + 1);
      
      // Cada 100 segundos reales = 1 hora del juego (24 horas = 40 minutos)
      if (realTime % 100 === 0) {
        setGameTime(prev => prev + 60); // +1 hora
      }
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [realTime, isPaused]);

  // Actualizar estado del cultivo basado en el tiempo y las condiciones
  useEffect(() => {
    if (isPaused) return;

    const gameInterval = setInterval(() => {
      updateCropState();
      updateWeather();
      checkNasaData();
    }, 5000); // Actualizar cada 5 segundos

    // Intervalo separado para tips (cada 20 segundos para dar más tiempo de lectura)
    const tipsInterval = setInterval(() => {
      generateTips();
    }, 20000);

    return () => {
      clearInterval(gameInterval);
      clearInterval(tipsInterval);
    };
  }, [cropState, resources, isPaused]);

  // Auto-save game state every 30 seconds
  useEffect(() => {
    if (!playerId || !seedId || isPaused) return;
    
    const saveInterval = setInterval(async () => {
      setIsSaving(true);
      try {
        const gameStateData = {
          player_id: playerId,
          seed_id: seedId,
          resources,
          crop_state: cropState,
          game_time: gameTime,
          avatar_state: vegetableAvatar,
          actions_log: actions,
          nasa_data: nasaRealTimeData,
          completed_missions: completedMissions,
          updated_at: new Date().toISOString()
        };
        
        if (gameStateId) {
          // Update existing game state
          await supabase
            .from('game_states')
            .update(gameStateData)
            .eq('id', gameStateId);
        } else {
          // Create new game state
          const { data } = await supabase
            .from('game_states')
            .insert(gameStateData)
            .select()
            .single();
          
          if (data) {
            setGameStateId(data.id);
          }
        }
        
        setLastSaveTime(new Date());
      } catch (error) {
        console.error('Error saving game state:', error);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [playerId, seedId, gameStateId, resources, cropState, gameTime, vegetableAvatar, actions, nasaRealTimeData, completedMissions, isPaused]);

  const updateCropState = () => {
    setCropState(prev => {
      let newState = { ...prev };
      
      // Crecimiento basado en condiciones
      if (prev.moisture > 30 && prev.moisture < 80 && prev.health > 50) {
        newState.growth = Math.min(100, prev.growth + 0.5);
      }
      
      // Salud afectada por recursos y condiciones
      if (prev.moisture < 20) {
        newState.health = Math.max(0, prev.health - 2);
      }
      
      // Humedad disminuye con el tiempo (esto es del CULTIVO, no de tus recursos)
      newState.moisture = Math.max(0, prev.moisture - 1);
      
      // Nutrientes disminuyen con el crecimiento (del CULTIVO, no tus recursos)
      if (prev.growth > 0) {
        newState.nutrients = Math.max(0, prev.nutrients - 0.3);
      }
      
      return newState;
    });

    // IMPORTANTE: Los recursos del jugador (water, fertilizer, pesticide)
    // NO se modifican aquí. Solo se reducen cuando usas las acciones.
    
    // Actualizar avatar basado en el progreso
    updateAvatar();
  };

  const updateWeather = () => {
    // Simulación básica de clima - integrar con NASA aquí
    setWeather(prev => ({
      ...prev,
      temperature: prev.temperature + (Math.random() - 0.5) * 2,
      humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 5)),
    }));
  };

  const checkNasaData = async () => {
    try {
      // Obtener coordenadas de la granja (Central Valley California por defecto)
      const lat = 36.5;
      const lon = -119.5;
      const now = new Date();

      // Obtener datos de NASA
      const [soilMoisture, ndvi, weatherData] = await Promise.all([
        nasaDataService.getSoilMoisture(lat, lon, now),
        nasaDataService.getNDVI(lat, lon, now),
        nasaDataService.getWeatherData(lat, lon, now),
      ]);

      // Convertir a datos del juego
      const gameData = nasaDataService.convertToGameData(soilMoisture, ndvi, weatherData);

      // Actualizar estado del cultivo con datos reales
      setCropState(prev => ({
        ...prev,
        moisture: gameData.moisture,
        temperature: gameData.temperature,
      }));

      // Actualizar clima
      setWeather({
        temperature: weatherData.temperature.current,
        humidity: weatherData.humidity,
        precipitation: weatherData.precipitation,
        windSpeed: weatherData.windSpeed,
        forecast: weatherData.precipitation > 0 ? 'rainy' : 'sunny',
      });

      setDataQuality(gameData.dataQuality);
      setLastDataUpdate(new Date());
      setNasaDataConnected(true);

      // Generate tips based on real data
      if (soilMoisture.rootZone < 30) {
        setCurrentTip('🛰️ NASA SMAP detects low soil moisture. Water soon!');
      } else if (ndvi.value < 0.3) {
        setCurrentTip('🛰️ NDVI index shows vegetation stress. Check your crop health.');
      }
    } catch (error) {
      console.error('Error fetching NASA data:', error);
    }
  };

  // Función para generar escenarios con Gemini
  const generateAIScenario = useCallback(async () => {
    setIsGeneratingAI(true);
    try {
      const scenario = await geminiService.generateScenarioFromHistoricalData(
        farm?.location || 'Central Valley, California',
        playerData.selectedCrop,
        historicalNASAData.ndvi.length > 0 ? historicalNASAData : {
          ndvi: [0.65, 0.68, 0.70, 0.67, 0.69],
          soilMoisture: [45, 48, 50, 47, 46],
          temperature: [22, 24, 26, 23, 25],
          precipitation: [0, 2, 0, 0, 1]
        }
      );
      
      setAIGeneratedData(scenario);
      
      // Generar tip adaptativo con Gemini
      const tip = await geminiService.generateAdaptiveTip(
        scenario,
        cropState,
        true,
        scenario.scenario
      );
      setCurrentTip(`🤖 ${tip}`);
      
      return scenario;
    } catch (error) {
      console.error('Error generating AI scenario:', error);
      const fallback: AIGeneratedScenario = {
        ndvi: 0.65,
        soilMoisture: 0.45,
        temperature: 25,
        precipitationForecast: 5,
        cloudCover: 0.3,
        scenario: 'Normal conditions',
        description: 'Typical seasonal conditions',
        risks: [],
        recommendations: ['Maintain current practices'],
        dataAge: 1
      };
      setAIGeneratedData(fallback);
      return fallback;
    } finally {
      setIsGeneratingAI(false);
    }
  }, [farm?.location, playerData.selectedCrop, historicalNASAData, cropState]);

  // Actualizar histórico de datos NASA
  useEffect(() => {
    if (environmentData && !useAISimulation) {
      setHistoricalNASAData(prev => ({
        ndvi: [...prev.ndvi.slice(-6), environmentData.ndvi].filter(v => v !== undefined),
        soilMoisture: [...prev.soilMoisture.slice(-6), environmentData.soilMoisture].filter(v => v !== undefined),
        temperature: [...prev.temperature.slice(-6), environmentData.temperature].filter(v => v !== undefined),
        precipitation: [...prev.precipitation.slice(-6), environmentData.precipitation].filter(v => v !== undefined)
      }));
    }
  }, [environmentData, useAISimulation]);

  const generateTips = useCallback(async () => {
    // Si está en modo IA, generar tip con Gemini
    if (useAISimulation && aiGeneratedData) {
      try {
        const tip = await geminiService.generateAdaptiveTip(
          nasaRealTimeData,
          cropState,
          true,
          aiGeneratedData.scenario
        );
        showTip(`🤖 ${tip}`, 10000); // 10 segundos para mensajes de IA
        return;
      } catch (error) {
        console.error('Error generating tip with Gemini:', error);
      }
    }
    
    // Usar el nuevo sistema de tips mejorado con datos NASA
    const gameState = {
      resources,
      currentDay: Math.floor(gameTime / (24 * 60)),
      actions: [],
    };
    
    const context = {
      state: gameState as any,
      currentData: nasaRealTimeData,
      limitations: [
        'Datos SMAP: resolución 9km',
        'NDVI: actualización cada 16 días',
        'Temperatura: superficie, no aire'
      ],
      nasaData: nasaRealTimeData,
      region: farm?.location || 'Central Valley',
      cropType: playerData.selectedCrop
    };
    
    const allTips = evaluateAllTips(gameState as any, context);
    
    if (allTips.length > 0) {
      // Priorizar tips NASA si están disponibles
      const nasaTips = allTips.filter(tip => 'dataSource' in tip);
      const selectedTip = nasaTips.length > 0 ? nasaTips[0] : allTips[0];
      
      const message = typeof selectedTip.message === 'function' 
        ? selectedTip.message(context as any)
        : selectedTip.message;
      
      // Check if this is a critical alert
      const isCriticalAlert = message.includes('⚠️') || message.includes('🚨') || message.toLowerCase().includes('crítico') || message.toLowerCase().includes('urgente');
      
      if (isCriticalAlert && !activeAlerts.includes(message)) {
        setActiveAlerts(prev => [...prev, message]);
      }
      
      // Usar duración apropiada según tipo de mensaje
      const duration = isCriticalAlert ? 8000 : 5000;
      showTip(message, duration);
    } else {
      // Tips por defecto si no hay tips específicos
      const defaultTips = [
        'Soil moisture is crucial. Keep between 40-70% for optimal growth.',
        'NASA NDVI data shows your crop health from space.',
        'Beware of night frosts. Monitor the temperature.',
        'Excess water can be as harmful as drought.',
        'Soil nutrients decrease over time. Don\'t forget to fertilize!',
      ];
      showTip(defaultTips[Math.floor(Math.random() * defaultTips.length)], 5000);
    }
  }, [useAISimulation, aiGeneratedData, nasaRealTimeData, cropState, resources, gameTime, farm?.location, playerData.selectedCrop]);

  const updateAvatar = () => {
    setVegetableAvatar(prev => {
      let newAvatar = { ...prev };
      
      // Ganar experiencia basada en el crecimiento
      newAvatar.experience = Math.floor(cropState.growth * 10);
      
      // Subir de nivel cada 100 puntos de experiencia
      newAvatar.level = Math.floor(newAvatar.experience / 100) + 1;
      
      // Calcular poder basado en salud y crecimiento
      newAvatar.powerLevel = Math.floor((cropState.health + cropState.growth) / 2);
      
      // Add special traits
      if (cropState.growth > 80 && !prev.traits.includes('Mature')) {
        newAvatar.traits.push('Mature');
      }
      if (cropState.health > 90 && !prev.traits.includes('Healthy')) {
        newAvatar.traits.push('Healthy');
      }
      
      return newAvatar;
    });
  };

  // Sistema de mensajes con duración variable según tipo
  const showTip = useCallback((
    message: string, 
    duration: number = 5000
  ) => {
    setCurrentTip(message);
    setTipDisplayTime(duration);
    setIsPersistentTip(duration > 7000); // Persistente si dura más de 7 segundos
    setShowTips(true); // Asegurar que los tips estén visibles
    
    setTimeout(() => {
      setCurrentTip('');
      setIsPersistentTip(false);
    }, duration);
  }, []);

  // Sistema de recompensa por aprendizaje: otorga recursos cuando el jugador aprende
  const grantLearningResources = useCallback(() => {
    const metrics = nasaMetricsRef.current.getMetrics 
      ? nasaMetricsRef.current.getMetrics()
      : nasaMetricsRef.current.metrics;
      
    if (!metrics) return;
    
    const totalDecisions = metrics.totalDecisions || 0;
    const correctDecisions = metrics.correctDecisions || 0;
    
    // Otorgar bonus cada 3 decisiones correctas (antes 5) - MÁS FRECUENTE
    if (correctDecisions > 0 && correctDecisions % 3 === 0) {
      const correctRatio = totalDecisions > 0 ? correctDecisions / totalDecisions : 0;
      
      // Aumentar bonuses base
      const baseWaterBonus = 15;    // Aumentado de 10
      const baseFertilizerBonus = 8; // Aumentado de 5
      const basePesticideBonus = 5;  // Aumentado de 3
      
      // Escalar bonus del 5% al 20% basado en ratio (antes era 3% a 15%)
      const scalingFactor = 0.05 + (correctRatio * 0.15);
      
      const waterBonus = Math.floor(baseWaterBonus * (1 + scalingFactor));
      const fertilizerBonus = Math.floor(baseFertilizerBonus * (1 + scalingFactor));
      const pesticideBonus = Math.floor(basePesticideBonus * (1 + scalingFactor));
      
      setResources(prev => ({
        water: Math.min(100, prev.water + waterBonus),
        fertilizer: Math.min(100, prev.fertilizer + fertilizerBonus),
        pesticide: Math.min(100, prev.pesticide + pesticideBonus)
      }));
      
      setLearningBonus({
        water: waterBonus,
        fertilizer: fertilizerBonus,
        pesticide: pesticideBonus
      });
      
      console.log(`🎓 Learning bonus granted! Ratio: ${(correctRatio * 100).toFixed(1)}%, Bonuses: W:${waterBonus} F:${fertilizerBonus} P:${pesticideBonus}`);
      
      // Show notification
      showTip(`🎓 Learning rewarded! +${waterBonus} water, +${fertilizerBonus} fertilizer, +${pesticideBonus} pesticide`, 6000);
      
      // Limpiar bonus visual después de 3 segundos
      setTimeout(() => {
        setLearningBonus({ water: 0, fertilizer: 0, pesticide: 0 });
      }, 3000);
    }
  }, [showTip]);

  // Función para mostrar notificaciones flotantes de acciones
  const showActionNotification = useCallback((message: string, type: 'growth' | 'health' | 'action' | 'warning' = 'action') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: id };
    
    setActionNotifications(prev => [...prev, notification]);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      setActionNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // Función para sugerir la acción correcta basada en datos NASA/IA
  const getCorrectActionSuggestion = useCallback((data: any) => {
    const suggestions = [];
    
    if (data.soilMoisture < 0.3) {
      suggestions.push('💧 You should water - critical moisture (<30%)');
    } else if (data.soilMoisture < 0.4) {
      suggestions.push('💧 Consider watering soon - low moisture (<40%)');
    }
    
    if (data.ndvi < 0.4) {
      suggestions.push('🌱 Fertilize urgently - critical NDVI (<40%)');
    } else if (data.ndvi < 0.5) {
      suggestions.push('🌱 Consider fertilizing - low NDVI (<50%)');
    }
    
    if (data.temperature > 35) {
      suggestions.push('🌡️ High temperature (>35°C) - water to cool the soil');
    } else if (data.temperature < 5) {
      suggestions.push('❄️ Frost risk (<5°C) - protect your crop');
    }
    
    if (cropState.pests > 20) {
      suggestions.push('🐛 Pests detected (>20%) - apply pesticide');
    }
    
    return suggestions.length > 0 ? 
      suggestions.join('\n') : 
      '✅ Optimal conditions - no immediate action needed';
  }, [cropState.pests]);

  // Sistema de retroalimentación mejorado con IA
  const provideEnhancedFeedback = useCallback(async (
    action: 'water' | 'fertilize' | 'pesticide',
    wasCorrect: boolean,
    currentData: any,
    consequence: string
  ) => {
    const dataSource = useAISimulation ? '🤖 IA Gemini' : '🛰️ NASA';
    
    // 1. VISUAL DRAMÁTICO para errores
    if (!wasCorrect) {
      // Efecto visual de error
      const body = document.body;
      body.style.animation = 'none';
      setTimeout(() => {
        body.style.animation = 'flash-red 0.5s';
      }, 10);
      
      // Vibración si está disponible
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    
    // 2. MENSAJE DETALLADO
    const actionNames = {
      water: 'Water',
      fertilize: 'Fertilize',
      pesticide: 'Apply Pesticide'
    };
    
    const correctConditions = {
      water: 'Soil moisture < 40%',
      fertilize: 'NDVI < 50% (stressed vegetation)',
      pesticide: 'Pests > 20% or Health < 70%'
    };
    
    // 3. GUARDAR EN HISTORIAL
    setDecisionHistory(prev => [...prev, {
      timestamp: Date.now(),
      action: actionNames[action],
      wasCorrect,
      explanation: consequence,
      dataUsed: { ...currentData, pests: cropState.pests },
      consequence
    }].slice(-20)); // Mantener últimas 20 decisiones
    
    // 4. GENERAR CONSEJO PERSONALIZADO CON IA para errores
    if (!wasCorrect) {
      try {
        // Generar consejo personalizado con Gemini
        const aiAdvice = await geminiService.generateAdaptiveTip(
          currentData,
          cropState,
          false, // wasCorrect
          aiGeneratedData?.scenario || `Error al ${actionNames[action].toLowerCase()}`
        );
        
        const detailedExplanation = 
          `📊 **Análisis de Datos ${dataSource}:**\n\n` +
          `• Humedad del suelo: ${(currentData.soilMoisture * 100).toFixed(0)}%\n` +
          `• Índice NDVI: ${(currentData.ndvi * 100).toFixed(0)}% (salud vegetación)\n` +
          `• Temperatura: ${currentData.temperature.toFixed(1)}°C\n` +
          `• Nivel de plagas: ${cropState.pests.toFixed(0)}%\n\n` +
          `❌ **¿Por qué estuvo mal?**\n${consequence}\n\n` +
          `💡 **Consejo personalizado de IA:**\n${aiAdvice}`;
        
        setLastIncorrectAction({ type: action, timestamp: Date.now() });
        setLearningContent({
          title: `Learn from your mistake`,
          content: detailedExplanation,
          suggestions: [
            getCorrectActionSuggestion(currentData),
            'Review satellite data before each decision',
            'Use the "What if...?" simulator to practice',
            'Check your history to see error patterns'
          ],
          correctAction: `✅ You should ${actionNames[action].toLowerCase()} when: ${correctConditions[action]}`,
          actionTaken: actionNames[action]
        });
        
        setShowLearningPanel(true);
        
        // 5. OFRECER CORRECCIÓN
        setTimeout(() => {
          const resourceKey = action === 'fertilize' ? 'fertilizer' : action;
          if (resources[resourceKey] >= 10) {
            setCanCorrectLastAction(true);
            showTip('💡 Sugerencia: Aún puedes tomar otra decisión para mejorar tu situación', 10000);
          }
        }, 1000);
      } catch (error) {
        console.error('Error generando consejo IA:', error);
        // Fallback a mensaje estático si falla la IA
        const basicMessage = 
          `📊 Data ${dataSource}:\n` +
          `• Moisture: ${(currentData.soilMoisture * 100).toFixed(0)}%\n` +
          `• NDVI: ${(currentData.ndvi * 100).toFixed(0)}%\n` +
          `• Temperature: ${currentData.temperature.toFixed(1)}°C\n\n` +
          `${consequence}`;
        
        setLearningContent({
          title: `Learn from your mistake`,
          content: basicMessage,
          suggestions: [
            'Review data before acting',
            'Check optimal conditions',
            'Practice with the simulator'
          ],
          correctAction: `${correctConditions[action]}`,
          actionTaken: actionNames[action]
        });
        setShowLearningPanel(true);
      }
    } else {
      // Positive feedback for correct decisions
      const successMessage = 
        `✅ CORRECT DECISION!\n\n` +
        `You interpreted the ${dataSource} data well.\n` +
        `${consequence}`;
      showTip(successMessage, 6000);
    }
  }, [useAISimulation, cropState, getCorrectActionSuggestion, aiGeneratedData, resources, showTip]);

  // Función para corregir la última acción
  const handleCorrectAction = useCallback(() => {
    if (!lastIncorrectAction) return;
    
    const suggestion = getCorrectActionSuggestion(nasaRealTimeData);
    showTip(`💡 According to current data:\n${suggestion}`, 10000);
    setCanCorrectLastAction(false);
    setLastIncorrectAction(null);
  }, [lastIncorrectAction, getCorrectActionSuggestion, nasaRealTimeData, showTip]);

  // Efecto para limpiar notificaciones antiguas
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setActionNotifications(prev => 
        prev.filter(n => now - n.timestamp < 3500)
      );
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Las notificaciones solo se muestran cuando el jugador realiza acciones manuales
  // (regar, fertilizar, pesticida) - no en hitos automáticos

  // Sistema de recursos pasivos basado en aprendizaje (cada 2 minutos)
  useEffect(() => {
    if (isPaused) return;
    
    const passiveResourceInterval = setInterval(() => {
      const metrics = nasaMetricsRef.current.getMetrics 
        ? nasaMetricsRef.current.getMetrics()
        : nasaMetricsRef.current.metrics;
      
      if (!metrics) return;
      
      const totalDecisions = metrics.totalDecisions || 0;
      const correctDecisions = metrics.correctDecisions || 0;
      
      // Solo dar recursos pasivos si el jugador ha demostrado aprendizaje
      if (totalDecisions >= 10 && correctDecisions / totalDecisions >= 0.5) {
        const learningRatio = correctDecisions / totalDecisions;
        
        // Calcular bonus pasivo basado en ratio de aprendizaje
        const passiveWaterBonus = Math.floor(5 * learningRatio); // 2.5-5 agua
        const passiveFertilizerBonus = Math.floor(2 * learningRatio); // 1-2 fertilizante
        const passivePesticideBonus = Math.floor(1 * learningRatio); // 0.5-1 pesticida
        
        setResources(prev => ({
          ...prev,
          water: Math.min(100, prev.water + passiveWaterBonus),
          fertilizer: Math.min(100, prev.fertilizer + passiveFertilizerBonus),
          pesticide: Math.min(100, prev.pesticide + passivePesticideBonus)
        }));
        
        // Show passive bonus notification
        showTip(
          `📚 Knowledge bonus: +${passiveWaterBonus} water, +${passiveFertilizerBonus} fertilizer (Ratio: ${(learningRatio * 100).toFixed(0)}%)`, 
          4000
        );
        
        setPassiveLearningActive(true);
        setLastPassiveBonus(Date.now());
        
        console.log('📚 Passive learning bonus granted:', {
          water: passiveWaterBonus,
          fertilizer: passiveFertilizerBonus,
          pesticide: passivePesticideBonus,
          learningRatio: (learningRatio * 100).toFixed(1) + '%'
        });
      } else if (totalDecisions < 10) {
        console.log('⏳ Need more decisions for passive bonus (current:', totalDecisions, '/10)');
      }
    }, 120000); // Cada 2 minutos (120000ms)
    
    return () => clearInterval(passiveResourceInterval);
  }, [isPaused, showTip]);

  // Función para actualizar el estado visual del cultivo basado en decisiones
  const updateCropVisualState = useCallback(() => {
    const metrics = nasaMetricsRef.current.getMetrics 
      ? nasaMetricsRef.current.getMetrics()
      : nasaMetricsRef.current.metrics;
    
    const incorrectRatio = metrics.totalDecisions > 0 
      ? metrics.incorrectDecisions / metrics.totalDecisions 
      : 0;
    
    let newVisualState: CropVisualState = {
      filter: '',
      animation: '',
      statusEmoji: '🌱',
      healthIndicator: 'healthy'
    };
    
    // Determinar estado visual basado en ratio de errores y salud
    if (cropState.health < 30 || incorrectRatio > 0.6) {
      // Estado crítico
      newVisualState = {
        filter: 'grayscale(60%) brightness(0.7) sepia(0.3)',
        animation: 'pulse-red',
        statusEmoji: '🥀',
        healthIndicator: 'critical'
      };
    } else if (cropState.health < 50 || incorrectRatio > 0.4) {
      // Estado malo
      newVisualState = {
        filter: 'brightness(0.8) contrast(0.9) hue-rotate(-20deg)',
        animation: 'shake-slight',
        statusEmoji: '😰',
        healthIndicator: 'poor'
      };
    } else if (cropState.health < 70 || incorrectRatio > 0.2) {
      // Estado regular
      newVisualState = {
        filter: 'brightness(0.95) saturate(0.8)',
        animation: '',
        statusEmoji: '😐',
        healthIndicator: 'fair'
      };
    } else if (cropState.health >= 90 && incorrectRatio < 0.1) {
      // Estado excelente
      newVisualState = {
        filter: 'brightness(1.1) saturate(1.2)',
        animation: 'glow',
        statusEmoji: '😊',
        healthIndicator: 'excellent'
      };
    } else {
      // Estado bueno (normal)
      newVisualState = {
        filter: '',
        animation: '',
        statusEmoji: '🌱',
        healthIndicator: 'healthy'
      };
    }
    
    setCropVisualState(newVisualState);
  }, [cropState.health]);

  // Actualizar estado visual cuando cambian las métricas
  useEffect(() => {
    updateCropVisualState();
  }, [cropState.health, updateCropVisualState]);

  const handleWater = async (amount?: number) => {
    const waterToUse = amount || 10;
    
    // Evaluar si la decisión es correcta basada en datos (NASA o IA)
    const currentMoisture = effectiveData.soilMoisture;
    const wasCorrectDecision = currentMoisture < 0.4; // Correcto si humedad está bajo 40%
    
    // Trackear la decisión
    trackDecision('water', wasCorrectDecision);
    
    if (resources.water >= waterToUse) {
      setResources(prev => ({ ...prev, water: prev.water - waterToUse }));
      
      // Aplicar efectos en el cultivo según la decisión
      if (wasCorrectDecision) {
        setCropState(prev => ({ 
          ...prev, 
          moisture: Math.min(100, prev.moisture + (waterToUse * 2)),
          health: Math.min(100, prev.health + 2) // Slightly improves health
        }));
        showActionNotification(`💧 Moisture +${waterToUse * 2}% | Health +2%`, 'action');
      } else {
        // Incorrect decision - can cause damage
        setCropState(prev => ({ 
          ...prev, 
          moisture: Math.min(100, prev.moisture + (waterToUse * 2)),
          health: Math.max(0, prev.health - 5), // Damages health due to excess water
          pests: Math.min(100, prev.pests + 3) // Increases pest risk
        }));
        showActionNotification(`⚠️ Excess water! Health -5%`, 'warning');
      }
      
      // Actualizar estado visual inmediatamente
      updateCropVisualState();
      
      // Provide enhanced feedback
      const consequence = !wasCorrectDecision
        ? `Soil moisture is at ${(currentMoisture * 100).toFixed(0)}%, above the 40% threshold. Watering moist soil causes:\n• Excess water that damages roots (-5% health)\n• Environment conducive to pests (+3% pests)\n• Waste of a valuable resource\n\nThe soil needs time to absorb existing water before watering again.`
        : `Moisture was at ${(currentMoisture * 100).toFixed(0)}%, below the critical 40%. Your decision was correct because:\n• Plants needed water for photosynthesis\n• Prevents wilting and water stress\n• Maintains healthy crop growth (+2% health)\n\nExcellent interpretation of satellite data!`;
      
      provideEnhancedFeedback('water', wasCorrectDecision, effectiveData, consequence);
      
      if (wasCorrectDecision) {
        grantLearningResources();
      }
      
      // Crear acción
      const action: Action = {
        id: `water_${Date.now()}`,
        type: 'WATER',
        payload: { amount: waterToUse },
        day: Math.floor(gameTime / (24 * 60)),
        cost: { water: waterToUse, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 }
      };
      
      setActions(prev => [...prev, action]);
      
      // Guardar acción en base de datos
      if (playerId && seedId) {
        try {
          await supabase.from('actions').insert({
            player_id: playerId,
            seed_id: seedId,
            action_type: 'WATER',
            payload: action.payload,
            game_time: gameTime,
            nasa_data_snapshot: nasaRealTimeData,
            created_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving action:', error);
        }
      }
      
      // Registrar uso para misiones
      updateMissionProgress('water_usage', waterToUse);
    }
  };

  const handleFertilize = async (type?: 'organic' | 'synthetic') => {
    const fertilizerType = type || 'organic';
    const amount = fertilizerType === 'organic' ? 10 : 15;
    
    // Evaluar si la decisión es correcta basada en datos (NASA o IA)
    const currentNDVI = effectiveData.ndvi;
    const wasCorrectDecision = currentNDVI < 0.5; // Correcto si NDVI está bajo 0.5
    
    // Trackear la decisión
    trackDecision('fertilize', wasCorrectDecision);
    
    if (resources.fertilizer >= amount) {
      setResources(prev => ({ ...prev, fertilizer: prev.fertilizer - amount }));
      const nutrientBoost = fertilizerType === 'organic' ? 20 : 30;
      
      // Apply effects according to decision
      if (wasCorrectDecision) {
        setCropState(prev => ({ 
          ...prev, 
          nutrients: Math.min(100, prev.nutrients + nutrientBoost),
          health: Math.min(100, prev.health + 3) // Improves health
        }));
        showActionNotification(`🌱 Nutrients +${nutrientBoost}% | Health +3%`, 'action');
      } else {
        // Over-fertilization can damage
        setCropState(prev => ({ 
          ...prev, 
          nutrients: Math.min(100, prev.nutrients + nutrientBoost),
          health: Math.max(0, prev.health - 7), // Damage from excess
          growth: Math.max(0, prev.growth - 2) // Delays growth
        }));
        showActionNotification(`⚠️ Over-fertilization! Health -7%, Growth -2%`, 'warning');
      }
      
      // Actualizar estado visual
      updateCropVisualState();
      
      // Provide enhanced feedback
      const consequence = !wasCorrectDecision
        ? `NDVI is at ${(currentNDVI * 100).toFixed(0)}%, indicating healthy vegetation (>50%). Fertilizing with high NDVI causes:\n• Over-fertilization that burns roots (-7% health)\n• Unbalanced growth (-2% growth)\n• Soil and groundwater contamination\n• Economic waste of fertilizer\n\nPlants only need nutrients when showing deficiencies (NDVI <50%).`
        : `NDVI was at ${(currentNDVI * 100).toFixed(0)}%, below 50%. Your decision was perfect because:\n• Low NDVI indicates reduced chlorophyll = nutrient deficiency\n• ${fertilizerType === 'organic' ? 'Organic' : 'Synthetic'} fertilizer provides necessary nutrients\n• Recovers photosynthetic capacity (+3% health)\n• Accelerates crop growth\n\nExcellent use of MODIS satellite data!`;
      
      provideEnhancedFeedback('fertilize', wasCorrectDecision, effectiveData, consequence);
      
      if (wasCorrectDecision) {
        grantLearningResources();
      }
      
      // Crear acción
      const action: Action = {
        id: `fertilize_${Date.now()}`,
        type: 'FERTILIZE',
        payload: { type: fertilizerType, amount },
        day: Math.floor(gameTime / (24 * 60)),
        cost: { water: 0, fertilizer: amount, money: 0, seeds: 0, solarEnergy: 0 }
      };
      
      setActions(prev => [...prev, action]);
      
      // Guardar en base de datos
      if (playerId && seedId) {
        try {
          await supabase.from('actions').insert({
            player_id: playerId,
            seed_id: seedId,
            action_type: 'FERTILIZE',
            payload: action.payload,
            game_time: gameTime,
            nasa_data_snapshot: nasaRealTimeData,
            created_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving action:', error);
        }
      }
      
      // Registrar para misiones
      updateMissionProgress('fertilizer_type', fertilizerType);
    }
  };

  const handlePesticide = async () => {
    if (resources.pesticide >= 10) {
      setResources(prev => ({ ...prev, pesticide: prev.pesticide - 10 }));
      
      // Evaluar si había plagas que justifiquen el uso
      const hadPests = cropState.pests > 20;
      const healthWasLow = cropState.health < 70;
      const wasCorrectDecision = hadPests || healthWasLow;
      
      // Trackear la decisión
      trackDecision('pesticide', wasCorrectDecision);
      
      setCropState(prev => ({ 
        ...prev, 
        health: Math.min(100, prev.health + 15),
        pests: Math.max(0, prev.pests - 30)
      }));
      showActionNotification(`🐛 Pests eliminated | Health +15%`, 'action');
      
      // Provide enhanced feedback
      const consequence = !wasCorrectDecision && cropState.pests < 10
        ? `Your crop had only ${cropState.pests.toFixed(0)}% pests, a low and manageable level. Using pesticide preventively causes:\n• Development of pest resistance\n• Elimination of beneficial insects\n• Ecosystem contamination\n• Unnecessary resource expenditure\n\nPesticides should only be used when pests exceed 20% or health is critical (<70%).`
        : `Pests were at ${cropState.pests.toFixed(0)}% and/or your health was compromised. Your decision was correct because:\n• Pests >20% cause significant crop damage\n• Early intervention prevents greater losses\n• Recovers crop health and vigor (+15% health)\n• Effectively eliminates up to 30% of pests\n\nGood integrated pest management!`;
      
      provideEnhancedFeedback('pesticide', wasCorrectDecision, effectiveData, consequence);
      
      if (wasCorrectDecision) {
        grantLearningResources();
      }
      
      // Crear acción
      const action: Action = {
        id: `pesticide_${Date.now()}`,
        type: 'WAIT', // Usando WAIT como placeholder para pesticide
        payload: { type: 'pesticide' },
        day: Math.floor(gameTime / (24 * 60)),
        cost: { water: 0, fertilizer: 0, money: 0, seeds: 0, solarEnergy: 0 }
      };
      
      setActions(prev => [...prev, action]);
      
      // Guardar en base de datos
      if (playerId && seedId) {
        try {
          await supabase.from('actions').insert({
            player_id: playerId,
            seed_id: seedId,
            action_type: 'PESTICIDE',
            payload: action.payload,
            game_time: gameTime,
            nasa_data_snapshot: nasaRealTimeData,
            created_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving action:', error);
        }
      }
    }
  };

  const updateScores = useCallback(() => {
    try {
      const currentDay = Math.floor(gameTime / (24 * 60));
      const totalDays = Math.max(1, currentDay + 1);

      const environmentSnapshot: CoreGameState['environmentData'] = {
        ndvi: nasaRealTimeData.ndvi ?? 0.6,
        soilMoisture: Math.max(0, Math.min(100, (nasaRealTimeData.soilMoisture ?? cropState.moisture / 100) * 100)),
        temperature: nasaRealTimeData.temperature ?? weatherTemperature,
        precipitation: nasaRealTimeData.precipitationForecast ?? weatherPrecipitation,
        lastUpdate: new Date().toISOString(),
        dataQuality,
      };

      const baseGameState: CoreGameState = {
        currentLevel: 1,
        currentDay,
        totalDays,
        resources: {
          water: resources.water,
          fertilizer: resources.fertilizer,
          money: Math.max(0, 100 - resources.water - resources.fertilizer - resources.pesticide),
          seeds: Math.max(0, 25 - currentDay),
          solarEnergy: Math.max(0, 40 - currentDay),
        },
        actions,
        scores: {
          total: 0,
          yield: 0,
          water: 0,
          environment: 0,
          efficiency: 0,
        },
        achievements: [],
        environmentData: environmentSnapshot,
        isGameComplete: cropState.growth >= 100 // <-- Added property
      };

      const baseScores = calculateScores(baseGameState, scoringSeed);

      const cropPerformance = Math.min(100, (cropState.growth * 0.7) + (cropState.health * 0.3));
      const adjustedYield = Math.round((baseScores.yield * 0.5) + (cropPerformance * 0.5));

      const moistureTarget = scoringSeed.targets.minHumidity;
      const moistureDeviation = Math.abs(cropState.moisture - moistureTarget);
      const moistureScore = Math.max(0, Math.min(100, 100 - moistureDeviation * 2));
      const adjustedWater = Math.round((baseScores.water * 0.6) + (moistureScore * 0.4));

      const pesticidePenalty = Math.max(0, resources.pesticide - 60) * 0.8;
      const nutrientBonus = Math.min(20, Math.max(0, cropState.nutrients - 60) * 0.5);
      const sustainabilityScore = Math.max(0, Math.min(100, baseScores.environment - pesticidePenalty + nutrientBonus));

      const efficiencyScore = Math.round(baseScores.efficiency);
      const baseTotal = Math.round((adjustedYield + adjustedWater + sustainabilityScore + efficiencyScore) / 4);

      const combinedScores: ScoreType = {
        total: baseTotal,
        yield: adjustedYield,
        water: adjustedWater,
        environment: sustainabilityScore,
        efficiency: efficiencyScore,
      };

      const metrics = nasaMetricsRef.current.getMetrics
        ? nasaMetricsRef.current.getMetrics()
        : nasaMetricsRef.current.metrics;

      const enhanced = calculateEnhancedScore(
        { ...baseGameState, scores: combinedScores },
        metrics
      );

      setScoreSummary({
        yield: combinedScores.yield,
        water: combinedScores.water,
        environment: combinedScores.environment,
        efficiency: combinedScores.efficiency,
        total: combinedScores.total,
        final: enhanced.finalScore,
        dataMultiplier: enhanced.dataEfficiencyMultiplier,
        nasaBonusTotal: enhanced.nasaBonus.total,
        nasaBonusBreakdown: enhanced.nasaBonus,
        penalties: enhanced.penalties,
      });
    } catch (error) {
      console.error('Error updating scores:', error);
    }
  }, [actions, cropState.growth, cropState.health, cropState.moisture, cropState.nutrients, dataQuality, gameTime, nasaRealTimeData, resources.fertilizer, resources.pesticide, resources.water, scoringSeed, weatherPrecipitation, weatherTemperature]);
  
  // Nuevas funciones para las mejoras NASA
  const handleGIBSLayerChange = (layer: string) => {
    setActiveGIBSLayer(layer);
    setCurrentDataType(layer as any);
    
    // Trackear uso de capa NASA
    trackLayerView(layer);
    
    // Actualizar datos simulados según la capa
    updateNASADataForLayer(layer);
    updateScores();
    
    // Alternar visualización de la capa (si ya está activa la misma, la ocultamos)
    if (activeGIBSLayer === layer && showGIBSLayer) {
      setShowGIBSLayer(false);
    } else {
      setShowGIBSLayer(true);
    }
    
    // Notificamos al usuario que la capa ha sido activada
    console.log(`Capa satelital ${layer} activada - Visualizando datos NASA`);
  };
  
  const updateNASADataForLayer = (layer: string) => {
    // Convertir datos NASA según la capa seleccionada
    let dataValue = 0;
    
    switch(layer) {
      case 'NDVI':
        dataValue = nasaRealTimeData.ndvi * 100;
        break;
      case 'Temp':
        dataValue = nasaRealTimeData.temperature;
        break;
      case 'Humedad':
        dataValue = nasaRealTimeData.soilMoisture * 100;
        break;
      case 'Lluvia':
        dataValue = nasaRealTimeData.precipitationForecast;
        break;
    }
    
    // Actualizamos el estado del cultivo según la capa activa
    setCropState(prev => {
      // Efecto suave en el estado del cultivo basado en la capa seleccionada
      return {
        ...prev,
        moisture: layer === 'Humedad' ? 
          Math.min(100, Math.max(0, prev.moisture + (Math.random() * 5 - 2))) : 
          prev.moisture,
        temperature: layer === 'Temp' ? 
          Math.min(45, Math.max(0, prev.temperature + (Math.random() * 3 - 1))) : 
          prev.temperature
      };
    });
    
    console.log(`Capa seleccionada: ${layer}, Valor: ${dataValue.toFixed(2)}`);
  };
  
  const handleWhatIfSimulation = (waterAmount: number, fertilizerType: string) => {
    setLastSimulation({ waterAmount, fertilizerType, timestamp: new Date() });
    
    // Trackear simulación
    trackSimulation();
    
    // Aplicar recomendación si el usuario lo desea
    if (waterAmount > 0) {
      handleWater(waterAmount);
      // Trackear decisión basada en simulación
      trackDecision('water_simulated', true);
    }
    if (fertilizerType) {
      handleFertilize(fertilizerType as any);
      trackDecision('fertilize_simulated', true);
    }
    
    setShowWhatIfPanel(false);
    updateScores();
  };
  
  const handleMissionComplete = (mission: DailyMission) => {
    setCompletedMissions(prev => [...prev, mission.id]);
    
    // Trackear misión completada
    trackMissionComplete(mission.id);
    
    // Aplicar recompensas
    if (mission.rewards.experience) {
      setVegetableAvatar(prev => ({
        ...prev,
        experience: prev.experience + mission.rewards.experience
      }));
    }
    
    // Mostrar notificación de logro
    if (mission.rewards.achievement) {
      // Aquí iría la lógica de achievements
      console.log('Achievement unlocked:', mission.rewards.achievement);
    }
    updateScores();
  };
  
  const updateMissionProgress = (metric: string, value: any) => {
    // Actualizar progreso de misiones activas
    if (activeMission) {
      // Lógica simplificada - en producción sería más compleja
      console.log('Mission progress:', metric, value);
    }
  };

  useEffect(() => {
    updateScores();
  }, [updateScores]);

  const formatGameTime = () => {
    const days = Math.floor(gameTime / (24 * 60));
    const hours = Math.floor((gameTime % (24 * 60)) / 60);
    return `Día ${days + 1}, ${hours}:00`;
  };

  const generateDailyMission = () => {
    // Generar una misión aleatoria simple
    const missions = [
      {
        id: 'water-efficient',
        description: 'Mantén la humedad del suelo entre 40-70% durante 2 ciclos',
        rewards: { experience: 50, achievement: 'Agricultor Eficiente' }
      },
      {
        id: 'nasa-explorer',
        description: 'Usa 3 capas satelitales diferentes de NASA',
        rewards: { experience: 50, achievement: 'Explorador Espacial' }
      },
      {
        id: 'healthy-crop',
        description: 'Alcanza 80% de salud en tu cultivo',
        rewards: { experience: 50, achievement: 'Cultivo Saludable' }
      }
    ];
    
    const randomMission = missions[Math.floor(Math.random() * missions.length)];
    setActiveMission(randomMission as any);
  };

  const getCropEmoji = () => {
    const cropEmojis: Record<string, string> = {
      'carrot': '🥕',
      'lettuce': '🥬',
      'tomato': '🍅',
      'corn': '🌽',
      'almonds': '🌰',
      'pistachios': '🥜',
      'walnuts': '🌰',
      'grapes': '🍇',
      'citrus': '🍊',
      'strawberries': '🍓',
      'rice': '🌾',
      'cotton': '🌿',
    };
    return cropEmojis[playerData.selectedCrop] || '🌱';
  };

  // Función para manejar el dismiss de alertas
  const handleDismissAlert = (alert: string) => {
    setActiveAlerts(prev => prev.filter(a => a !== alert));
    setDismissedAlerts(prev => [...prev, alert]);
    
    // Track que una alerta fue ignorada
    const { trackAlertIgnored } = nasaMetricsRef.current;
    trackAlertIgnored();
    
    // Mostrar advertencia
    setCurrentTip('⚠️ Has ignorado una alerta importante. Esto puede afectar tu puntuación final.');
  };

  // Submit final score when level is complete
  const submitFinalScore = async () => {
    if (!playerId || !seedId || actions.length === 0) return;
    
    try {
      // Prepare actions log for submission
      const actionsLog = actions.map(action => ({
        type: action.type,
        payload: action.payload,
        day: action.day,
        cost: action.cost
      }));
      
      // Prepare client summary with current scores
      const clientSummary = {
        scoreTotal: scoreSummary.total,
        scoreYield: scoreSummary.yield,
        scoreWater: scoreSummary.water,
        scoreEnv: scoreSummary.environment,
      };
      
      // Submit to API
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seedCode: farm?.seedCode || 'WEEK-001',
          level: 1, // You might want to track current level
          actionsLog,
          clientSummary
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Show leaderboard position
        console.log('Score submitted:', result);
        
        // TODO: Show completion modal with ranking
        // setShowCompletionModal(true);
        // setRanking(result.rankSnapshot);
      } else {
        const errorData = await response.json();
        console.error('Error response from API:', errorData);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };
  
  // Check if level is complete
  useEffect(() => {
    if (cropState.growth >= 100 && !isPaused) {
      // Level complete!
      submitFinalScore();
    }
  }, [cropState.growth]);

  // Multiplayer real-time sync
  useEffect(() => {
    if (!farm?.roomId || !playerId) return;
    
    // Subscribe to room updates
    const channel = supabase
      .channel(`room:${farm.roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_updates',
          filter: `room_id=eq.${farm.roomId}`
        },
        async (payload) => {
          const newData = payload.new as any;
          if (newData && newData.player_id !== playerId) {
            // Handle updates from other players
            const update = newData;
            
            switch (update.update_type) {
              case 'action':
                // Show notification of other player's action
                console.log('Other player action:', update.payload);
                break;
              case 'battle_request':
                // Handle battle request
                // TODO: Show battle request modal
                console.log('Battle request received:', update.payload);
                break;
              case 'state':
                // Update other player's visible state
                console.log('Player state update:', update.payload);
                break;
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player_room_states',
          filter: `room_id=eq.${farm.roomId}`
        },
        async (payload) => {
          // Update other players' states in UI
          const newData = payload.new as any;
          if (newData && newData.player_id !== playerId) {
            console.log('Other player state:', newData);
            // TODO: Update UI to show other players' progress
          }
        }
      )
      .subscribe();
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [farm?.roomId, playerId]);
  
  // Update room state periodically
  useEffect(() => {
    if (!farm?.roomId || !playerId) return;
    
    const updateInterval = setInterval(async () => {
      try {
        await supabase
          .from('player_room_states')
          .upsert({
            room_id: farm.roomId,
            player_id: playerId,
            crop_state: cropState,
            resources: resources,
            avatar_state: vegetableAvatar,
            last_action: actions[actions.length - 1] || null,
            score: Math.floor(cropState.growth * 100 + cropState.health),
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error updating room state:', error);
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(updateInterval);
  }, [farm?.roomId, playerId, cropState, resources, vegetableAvatar, actions]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modo Demo Automático */}
      {demoMode && (
        <AutoDemoMode 
          onSceneChange={(scene) => console.log('Demo scene:', scene)}
          onComplete={() => setDemoMode(false)}
        />
      )}
      
      {/* Fondo del campo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/campo_virgen.png)',
        }}
      />

      {/* Overlay para visibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      
      {/* Panel de información AI cuando está activo - Versión compacta horizontal */}
      {useAISimulation && aiGeneratedData && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 w-[800px] max-w-[90vw]">
          <div className="bg-black/85 backdrop-blur-lg rounded-lg p-2.5 border border-purple-500/50 shadow-xl">
            {/* Header compacto en una sola línea */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <h3 className="text-white font-bold text-xs">🤖 {aiGeneratedData.scenario}</h3>
              </div>
              <p className="text-white/60 text-[10px] italic truncate max-w-md">{aiGeneratedData.description}</p>
            </div>
            
            {/* Contenido en grid horizontal - Máximo 3 items por columna */}
            <div className="grid grid-cols-2 gap-2">
              {/* Columna de Riesgos */}
              {aiGeneratedData.risks.length > 0 && (
                <div className="bg-red-500/10 rounded p-2 border border-red-500/30">
                  <h4 className="text-red-400 text-[10px] font-semibold mb-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Riesgos ({Math.min(aiGeneratedData.risks.length, 3)})</span>
                  </h4>
                  <ul className="text-white/70 text-[9px] space-y-0.5">
                    {aiGeneratedData.risks.slice(0, 3).map((risk, i) => (
                      <li key={i} className="truncate" title={risk}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Columna de Recomendaciones */}
              {aiGeneratedData.recommendations.length > 0 && (
                <div className="bg-green-500/10 rounded p-2 border border-green-500/30">
                  <h4 className="text-green-400 text-[10px] font-semibold mb-1 flex items-center gap-1">
                    <span>💡</span>
                    <span>Acciones ({Math.min(aiGeneratedData.recommendations.length, 3)})</span>
                  </h4>
                  <ul className="text-white/70 text-[9px] space-y-0.5">
                    {aiGeneratedData.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="truncate" title={rec}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay de visualización de datos en el mapa */}
      {showGIBSLayer && activeGIBSLayer && (
        <div 
          className="absolute inset-0 z-5 pointer-events-none"
          style={{ 
            opacity: gibsOpacity,
            background: activeGIBSLayer === 'NDVI' 
              ? `radial-gradient(circle at center, rgba(34, 197, 94, ${nasaRealTimeData.ndvi * 0.3}) 0%, transparent 70%)`
              : activeGIBSLayer === 'Temp'
              ? `radial-gradient(circle at center, rgba(239, 68, 68, ${Math.min(nasaRealTimeData.temperature / 40, 0.4)}) 0%, transparent 70%)`
              : activeGIBSLayer === 'Humedad'
              ? `radial-gradient(circle at center, rgba(59, 130, 246, ${nasaRealTimeData.soilMoisture * 0.4}) 0%, transparent 70%)`
              : `radial-gradient(circle at center, rgba(14, 165, 233, ${Math.min(nasaRealTimeData.precipitationForecast / 10, 0.4)}) 0%, transparent 70%)`
          }}
        >
          {/* Indicador de datos en el centro */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">
                  {activeGIBSLayer === 'NDVI' && 'Índice de Vegetación'}
                  {activeGIBSLayer === 'Temp' && 'Temperatura Superficial'}
                  {activeGIBSLayer === 'Humedad' && 'Humedad del Suelo'}
                  {activeGIBSLayer === 'Lluvia' && 'Precipitación'}
                </div>
                <div className="text-2xl font-bold text-white">
                  {activeGIBSLayer === 'NDVI' && `${(nasaRealTimeData.ndvi * 100).toFixed(0)}%`}
                  {activeGIBSLayer === 'Temp' && `${nasaRealTimeData.temperature}°C`}
                  {activeGIBSLayer === 'Humedad' && `${(nasaRealTimeData.soilMoisture * 100).toFixed(0)}%`}
                  {activeGIBSLayer === 'Lluvia' && `${nasaRealTimeData.precipitationForecast}mm`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Panel What-If */}
      {showWhatIfPanel && (
        <WhatIfPanel
          cropState={cropState}
          cropType={playerData.selectedCrop}
          onClose={() => setShowWhatIfPanel(false)}
          onApplyRecommendation={handleWhatIfSimulation}
        />
      )}

      {/* Contenedor principal optimizado */}
      <div className="absolute inset-0 grid grid-cols-[280px_1fr_320px] h-screen">
        {/* Panel NASA - Más compacto */}
        <div className="bg-gradient-to-b from-blue-900/20 to-purple-900/20 backdrop-blur-md border-r border-white/10 flex flex-col h-full overflow-hidden">
          <div className="p-2 space-y-1.5 flex flex-col h-full">
            {/* Título NASA - Más pequeño */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-blue-400/30">
                <Satellite className="w-3 h-3 text-blue-400 animate-pulse" />
                <h2 className="text-white font-bold text-[11px]">NASA Space Farm</h2>
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Demo - Más compacta */}
            <button
              onClick={() => setDemoMode(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-1.5 px-2 rounded-md shadow-sm transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <span className="text-sm">▶️</span>
              <div className="text-left">
                <div className="text-[11px] font-semibold">Demo Automática</div>
                <div className="text-[9px] opacity-80">3 min • 8 escenas</div>
              </div>
            </button>

            {/* Credibilidad - Versión mini */}
            <div className="bg-black/40 rounded-md border border-white/10 p-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  Credibility
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-green-500/20 text-green-400 px-1 py-0.5 rounded-full">NASA</span>
                  <span className="text-white text-[11px] font-bold">95%</span>
                </div>
              </div>
            </div>

            {/* Switch NASA/IA */}
            <div className="bg-black/40 rounded-md border border-white/10 p-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-[11px] flex items-center gap-1">
                  <span className="text-xs">🔄</span>
                  Data mode 
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useAISimulation}
                    onChange={async (e) => {
                      setUseAISimulation(e.target.checked);
                      setActiveDataSource(e.target.checked ? 'AI' : 'NASA');
                      if (e.target.checked) {
                        await generateAIScenario();
                      } else {
                        const tip = `🛰️ Using NASA satellite data in real-time`;
                        setCurrentTip(tip);
                      }
                    }}
                    disabled={isGeneratingAI}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-blue-600/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ms-2 text-[10px] font-medium text-white">
                    {isGeneratingAI ? '⏳' : useAISimulation ? '🤖 Gemini' : '🛰️ NASA'}
                  </span>
                </label>
              </div>
              {useAISimulation && aiGeneratedData && (
                <div className="mt-2 text-[9px] text-purple-300">
                  <div className="font-medium">{aiGeneratedData.scenario}</div>
                  <div className="text-white/60 text-[8px] mt-0.5">{aiGeneratedData.description}</div>
                </div>
              )}
            </div>

            {/* Capas Satelitales - Grid 2x2 más compacto */}
            <div className="bg-black/40 rounded-md p-2 border border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-white font-medium text-[11px]">
                  📡 Satellite Layers
                </h3>
                {showGIBSLayer && activeGIBSLayer && (
                  <button
                    onClick={() => setShowGIBSLayer(false)}
                    className="text-white/60 hover:text-white text-[10px] px-1"
                    title="Ocultar visualización"
                  >
                    👁️‍🗨️
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  {id: 'NDVI', icon: '🌱', desc: 'Vegetation'},
                  {id: 'Temp', icon: '🌡️', desc: 'Temperature'},
                  {id: 'Humedad', icon: '💧', desc: 'Moisture'},
                  {id: 'Lluvia', icon: '🌧️', desc: 'Precipitation'}
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => handleGIBSLayerChange(layer.id)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex flex-col items-center gap-0.5 ${
                      activeGIBSLayer === layer.id && showGIBSLayer
                        ? 'bg-purple-500 text-white shadow-md border border-purple-300/40' 
                        : activeGIBSLayer === layer.id && !showGIBSLayer
                        ? 'bg-purple-500/50 text-white/80 border border-purple-300/20'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:scale-105 border border-transparent'
                    }`}
                  >
                    <div className="text-lg">{layer.icon}</div>
                    <div>{layer.id}</div>
                    <div className="text-[8px] opacity-70">{layer.desc}</div>
                  </button>
                ))}
              </div>
              
              {/* Información de la capa activa */}
              {activeGIBSLayer && showGIBSLayer && (
                <div className="mt-2 p-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded border border-purple-500/30">
                  <div className="text-[10px] space-y-1.5">
                    {/* Descripción del satélite y su importancia */}
                    <div className="bg-black/30 rounded p-2 mb-2">
                      <div className="text-white/90 font-medium mb-1 text-[11px]">
                        {activeGIBSLayer === 'NDVI' && '🛰️ MODIS Terra - Índice NDVI'}
                        {activeGIBSLayer === 'Temp' && '🛰️ MODIS Terra - Temperatura LST'}
                        {activeGIBSLayer === 'Humedad' && '🛰️ SMAP - Humedad del Suelo'}
                        {activeGIBSLayer === 'Lluvia' && '🛰️ GPM - Precipitación IMERG'}
                      </div>
                      <p className="text-white/70 leading-relaxed text-[9px]">
                        {activeGIBSLayer === 'NDVI' && 
                          'Measures vegetation health using infrared light. High values (>60%) indicate healthy and vigorous crops. Detects stress 2 weeks before visible.'
                        }
                        {activeGIBSLayer === 'Temp' && 
                          'Land surface temperature from space. Helps detect night frosts and thermal stress in crops. Critical for planning irrigation.'
                        }
                        {activeGIBSLayer === 'Humedad' && 
                          'Measures moisture in the top 5cm of soil using microwaves. Essential for optimizing irrigation and avoiding water waste. Updates every 2-3 days.'
                        }
                        {activeGIBSLayer === 'Lluvia' && 
                          'Precipitation estimation via satellite radars. Allows anticipating rain and adjusting irrigation. Data every 30 minutes with global coverage.'
                        }
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-white/80">
                      <span>Current value:</span>
                      <span className="font-bold text-white">
                        {activeGIBSLayer === 'NDVI' && `${(nasaRealTimeData.ndvi * 100).toFixed(0)}%`}
                        {activeGIBSLayer === 'Temp' && `${nasaRealTimeData.temperature}°C`}
                        {activeGIBSLayer === 'Humedad' && `${(nasaRealTimeData.soilMoisture * 100).toFixed(0)}%`}
                        {activeGIBSLayer === 'Lluvia' && `${nasaRealTimeData.precipitationForecast}mm`}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-white/60">
                      <span>Resolution:</span>
                      <span className="text-blue-300">
                        {activeGIBSLayer === 'NDVI' && '250m'}
                        {activeGIBSLayer === 'Temp' && '1km'}
                        {activeGIBSLayer === 'Humedad' && '9km'}
                        {activeGIBSLayer === 'Lluvia' && '10km'}
                      </span>
                    </div>

                    {/* Indicador de importancia */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-1.5 mt-1">
                      <div className="flex items-start gap-1">
                        <span className="text-yellow-400 text-xs">💡</span>
                        <p className="text-yellow-200/80 text-[9px] leading-relaxed">
                          {activeGIBSLayer === 'NDVI' && 
                            'Keep NDVI >50% for healthy crops. Below indicates stress or pests.'
                          }
                          {activeGIBSLayer === 'Temp' && 
                            '<5°C can cause frost. >35°C reduces growth. Ideal: 18-28°C.'
                          }
                          {activeGIBSLayer === 'Humedad' && 
                            'Optimal: 40-70%. <30% requires urgent irrigation. >80% risk of fungi.'
                          }
                          {activeGIBSLayer === 'Lluvia' && 
                            '>10mm/day suspend irrigation. Plan 2-3 days ahead.'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <span className="text-white/50 text-[9px]">Overlay opacity</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={gibsOpacity * 100}
                          onChange={(e) => setGibsOpacity(Number(e.target.value) / 100)}
                          className="w-12 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[9px] text-white/60 w-7">{Math.round(gibsOpacity * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Misión - Ultra compacta */}
            <div className="bg-black/40 rounded-md p-2 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-medium text-[11px]">🎯 Mission</h3>
                <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded-full">+50XP</span>
              </div>
              
              {activeMission ? (
                <div>
                  <p className="text-white/80 text-[10px] leading-tight line-clamp-2">{activeMission.description}</p>
                  <div className="bg-white/10 rounded-full h-1 mt-1">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => generateDailyMission()}
                  className="w-full py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded text-[10px] font-medium"
                >
                  Generate Mission
                </button>
              )}
            </div>

            {/* Tips - Moved below Mission */}
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-md p-2 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-medium text-[11px]">💡 Tips</h3>
              </div>
              <p className="text-white/70 text-[10px] leading-tight line-clamp-3">
                {currentTip || 'NASA satellites detect plant stress 2 weeks before it\'s visible.'}
              </p>
            </div>

            {/* Spacer para empujar el último elemento al fondo */}
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Área principal del campo (Centro) */}
        <div className="relative">
          {/* Header más compacto */}
          <div className="absolute top-0 left-0 right-0 z-10 p-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px]">
                <h1 className="text-white font-bold">{farm.name}</h1>
                <span className="text-white/50">|</span>
                <span className="text-white/70">{playerData.playerName}</span>
                <span className="text-white/50">|</span>
                <span className="text-white font-mono">{formatGameTime()}</span>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="ml-1 p-1 bg-white/20 rounded hover:bg-white/30 text-xs"
                >
                  {isPaused ? '▶️' : '⏸️'}
                </button>
              </div>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span className="text-white text-[11px] font-medium">
                  {farm?.location || 'Fresno Central Valley'}
                </span>
              </div>
            </div>
          </div>

          {/* Área del cultivo optimizada */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Indicador de estado del cultivo */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20">
                <div className={`
                  px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg
                  ${cropVisualState.healthIndicator === 'critical' ? 'bg-red-900/90 text-red-200 animate-pulse border-2 border-red-500' :
                    cropVisualState.healthIndicator === 'poor' ? 'bg-orange-900/90 text-orange-200 border-2 border-orange-500' :
                    cropVisualState.healthIndicator === 'fair' ? 'bg-yellow-900/90 text-yellow-200 border-2 border-yellow-500' :
                    cropVisualState.healthIndicator === 'excellent' ? 'bg-green-900/90 text-green-200 animate-pulse border-2 border-green-400' :
                    'bg-gray-900/90 text-gray-200 border-2 border-gray-500'}
                `}>
                  <span className="text-lg">{cropVisualState.statusEmoji}</span>
                  <span>
                    {cropVisualState.healthIndicator === 'critical' ? 'CRITICAL' :
                     cropVisualState.healthIndicator === 'poor' ? 'POOR' :
                     cropVisualState.healthIndicator === 'fair' ? 'FAIR' :
                     cropVisualState.healthIndicator === 'excellent' ? 'EXCELLENT' :
                     'HEALTHY'}
                  </span>
                </div>
              </div>
              
              {/* Visualización del cultivo con efectos visuales */}
              <div 
                className={`relative bg-gradient-to-br from-green-900/30 to-amber-900/30 backdrop-blur-sm rounded-full w-48 h-48 flex items-center justify-center border-2 border-white/30 shadow-xl ${cropVisualState.animation}`}
                style={{
                  filter: cropVisualState.filter,
                  transition: 'filter 0.5s ease-in-out'
                }}
              >
                {/* Indicador de salud */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      ${cropState.health > 70 ? '#10b981' : cropState.health > 40 ? '#f59e0b' : '#ef4444'} ${cropState.health * 3.6}deg,
                      transparent ${cropState.health * 3.6}deg
                    )`,
                    padding: '3px',
                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))'
                  }}
                />
                
                {/* Overlay de daño si está en mal estado */}
                {cropVisualState.healthIndicator === 'critical' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-red-900/20 animate-pulse rounded-full"></div>
                    <div className="absolute top-2 right-2 text-2xl animate-bounce">⚠️</div>
                  </div>
                )}
                
                {/* Partículas de éxito si está excelente */}
                {cropVisualState.healthIndicator === 'excellent' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">✨</div>
                    <div className="absolute -bottom-2 left-1/4 text-xl animate-pulse">🌟</div>
                    <div className="absolute -bottom-2 right-1/4 text-xl animate-pulse">⭐</div>
                  </div>
                )}
                
                <div className="text-center z-10">
                  <div className="text-6xl mb-1" 
                    style={{ 
                      opacity: 0.3 + (cropState.growth / 100) * 0.7,
                      transform: `scale(${0.5 + (cropState.growth / 100) * 0.5})`
                    }}
                  >
                    {getCropEmoji()}
                  </div>
                  
                  {/* Información removida - ahora se muestra en notificaciones flotantes */}
                </div>
              </div>
              
              {/* Barra de salud visual del cultivo con stats compactos */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-56">
                <div className="bg-gray-800/90 rounded-full h-3 overflow-hidden border-2 border-white/30 shadow-lg">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      cropState.health < 30 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                      cropState.health < 50 ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                      cropState.health < 70 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                      'bg-gradient-to-r from-green-600 to-green-500'
                    }`}
                    style={{ width: `${cropState.health}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-white/80 mt-2 font-semibold">
                  <span>🌱 Growth: {cropState.growth.toFixed(0)}%</span>
                  <span>❤️ Health: {cropState.health.toFixed(0)}%</span>
                </div>
              </div>

              {/* Indicadores flotantes más pequeños */}
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 space-y-1">
                <div className="bg-black/60 backdrop-blur-sm rounded p-1.5 text-white text-[10px]">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-2.5 h-2.5" />
                    <span>Moisture</span>
                  </div>
                  <div className="w-20 bg-white/20 rounded-full h-1 mt-0.5">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: `${cropState.moisture}%` }} />
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-sm rounded p-1.5 text-white text-[10px]">
                  <div className="flex items-center gap-1">
                    <Leaf className="w-2.5 h-2.5" />
                    <span>Nutrients</span>
                  </div>
                  <div className="w-20 bg-white/20 rounded-full h-1 mt-0.5">
                    <div className="bg-green-400 h-full rounded-full" style={{ width: `${cropState.nutrients}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones flotantes de acciones - Esquina superior derecha */}
        <div className="absolute top-16 right-6 pointer-events-none z-50 max-w-sm">
          <div className="flex flex-col items-end gap-2">
            {actionNotifications.map((notification) => {
              const age = Date.now() - notification.timestamp;
              const opacity = age < 300 ? age / 300 : age > 2700 ? (3000 - age) / 300 : 1;
              const translateX = age < 300 ? (20 - (age / 300) * 20) : 0; // Desliza desde la derecha
              const scale = 0.85 + opacity * 0.15;
              
              return (
                <div
                  key={notification.id}
                  className={`px-5 py-2.5 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-2 backdrop-blur-lg transform transition-all duration-200 ${
                    notification.type === 'growth' ? 'bg-green-900/95 border-green-400 text-green-50 shadow-green-500/40' :
                    notification.type === 'health' ? 'bg-blue-900/95 border-blue-400 text-blue-50 shadow-blue-500/40' :
                    notification.type === 'warning' ? 'bg-red-900/95 border-red-400 text-red-50 shadow-red-500/40 animate-pulse' :
                    'bg-purple-900/95 border-purple-400 text-purple-50 shadow-purple-500/40'
                  }`}
                  style={{
                    opacity,
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    filter: `brightness(${1 + opacity * 0.15})`,
                    boxShadow: `0 0 ${20 * opacity}px ${notification.type === 'growth' ? 'rgba(34, 197, 94, 0.5)' : 
                                                         notification.type === 'health' ? 'rgba(59, 130, 246, 0.5)' :
                                                         notification.type === 'warning' ? 'rgba(239, 68, 68, 0.5)' :
                                                         'rgba(168, 85, 247, 0.5)'}`,
                  }}
                >
                  <div className="text-sm font-bold whitespace-nowrap drop-shadow-lg flex items-center gap-2">
                    {notification.type === 'growth' && '🌱'}
                    {notification.type === 'health' && '💚'}
                    {notification.type === 'warning' && '⚠️'}
                    {notification.type === 'action' && '✨'}
                    <span>{notification.message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel de Control - Súper optimizado */}
        <div className="bg-gray-900/95 backdrop-blur-lg shadow-2xl flex flex-col h-full overflow-hidden">
          <div className="p-2 flex flex-col gap-1.5 h-full">
            {/* Title */}
            <div className="text-center pb-1 border-b border-white/20">
              <h2 className="text-white font-bold text-[10px] uppercase tracking-wider">Control Panel</h2>
            </div>

            {/* NASA Data - Versión compacta */}
            <div className="bg-black/40 rounded p-2 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-medium text-[11px]">
                  {useAISimulation ? '🤖 IA Gemini Data' : '🛰️ Live NASA Data'}
                </h3>
                <span className={`text-[8px] px-1 py-0.5 rounded ${useAISimulation ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {useAISimulation ? 'SIMULADO' : 'REAL-TIME'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">NDVI</span>
                  <span className="text-green-400 font-bold font-mono">{((nasaRealTimeData.ndvi ?? 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Humidity</span>
                  <span className="text-blue-400 font-bold font-mono">{((nasaRealTimeData.soilMoisture ?? 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Temp</span>
                  <span className="text-orange-400 font-bold font-mono">{(nasaRealTimeData.temperature ?? 0).toFixed(1)}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Rain</span>
                  <span className="text-cyan-400 font-bold font-mono">{(nasaRealTimeData.precipitationForecast ?? 0).toFixed(0)}mm</span>
                </div>
              </div>
            </div>

            {/* Puntuación - Ultra compacta */}
            <div className="bg-black/40 rounded p-2 border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-medium text-[11px]">📊 Score</h3>
                <span className="text-[9px] text-white/60">x{scoreSummary.dataMultiplier.toFixed(1)}</span>
              </div>

              <div className="grid grid-cols-4 gap-1 mb-1">
                <div className="text-center p-1 rounded bg-green-500/10">
                  <div className="text-lg font-bold text-green-300">{scoreSummary.yield.toFixed(0)}</div>
                  <div className="text-[9px] text-white/60">Rend</div>
                </div>
                <div className="text-center p-1 rounded bg-blue-500/10">
                  <div className="text-lg font-bold text-blue-300">{scoreSummary.water.toFixed(0)}</div>
                  <div className="text-[9px] text-white/60">Agua</div>
                </div>
                <div className="text-center p-1 rounded bg-purple-500/10">
                  <div className="text-lg font-bold text-purple-300">{scoreSummary.environment.toFixed(0)}</div>
                  <div className="text-[9px] text-white/60">Amb</div>
                </div>
                <div className="text-center p-1 rounded bg-amber-500/10">
                  <div className="text-lg font-bold text-amber-300">{scoreSummary.efficiency.toFixed(0)}</div>
                  <div className="text-[9px] text-white/60">Efic</div>
                </div>
              </div>

              {/* Mostrar penalizaciones si existen */}
              {scoreSummary.penalties.total > 0 && (
                <div className="bg-red-500/10 rounded p-1 mb-1 border border-red-500/30">
                  <div className="text-[9px] text-red-400 flex items-center justify-between">
                    <span>⚠️ Penalties</span>
                    <span className="font-bold">-{scoreSummary.penalties.total}</span>
                  </div>
                  {scoreSummary.penalties.ignoredAlerts > 0 && (
                    <div className="text-[8px] text-red-300/80 pl-3">
                      • Ignored Alerts: -{scoreSummary.penalties.ignoredAlerts}
                    </div>
                  )}
                  {scoreSummary.penalties.badDecisions > 0 && (
                    <div className="text-[8px] text-red-300/80 pl-3">
                      • Bad Decisions: -{scoreSummary.penalties.badDecisions}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded p-1.5 border border-blue-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">Total (+{scoreSummary.nasaBonusTotal} NASA)</span>
                  <span className="text-2xl font-bold text-white">{scoreSummary.final}</span>
                </div>
              </div>
            </div>

            {/* Recursos - Barras horizontales */}
            <div className="bg-black/40 rounded p-2 border border-white/10">
              <h3 className="text-white font-medium text-[11px] mb-1">⚡ Resources</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <div className="flex-1 bg-white/10 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="bg-blue-400 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.max(0, Math.min(100, resources.water))}%` }} 
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-lg">
                      {Math.round(resources.water)} 💧
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-green-400" />
                  <div className="flex-1 bg-white/10 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="bg-green-400 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.max(0, Math.min(100, resources.fertilizer))}%` }} 
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-lg">
                      {Math.round(resources.fertilizer)} 🌿
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <div className="flex-1 bg-white/10 rounded-full h-3 relative overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.max(0, Math.min(100, resources.pesticide))}%` }} 
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-lg">
                      {Math.round(resources.pesticide)} ⚠️
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Bonus por Aprendizaje */}
              {(learningBonus.water > 0 || learningBonus.fertilizer > 0 || learningBonus.pesticide > 0) && (
                <div className="mt-2 p-1.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded border border-green-400/30 animate-pulse">
                  <div className="text-[9px] text-green-400 font-semibold mb-0.5 flex items-center gap-1">
                    <span>🎓</span>
                    <span>Bonus por Aprendizaje</span>
                  </div>
                  <div className="flex gap-2 text-[9px] text-white">
                    {learningBonus.water > 0 && <span>+{learningBonus.water} 💧</span>}
                    {learningBonus.fertilizer > 0 && <span>+{learningBonus.fertilizer} 🌿</span>}
                    {learningBonus.pesticide > 0 && <span>+{learningBonus.pesticide} ⚠️</span>}
                  </div>
                </div>
              )}
              
              {/* Indicador de bonus pasivo activo */}
              {passiveLearningActive && (
                <div className="mt-2 p-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded border border-blue-400/30">
                  <div className="text-[9px] text-blue-400 font-semibold flex items-center gap-1 animate-pulse">
                    <span>📚</span>
                    <span>Bonus pasivo activo</span>
                  </div>
                  <div className="text-[8px] text-white/70 mt-0.5">
                    +Resources every 2 minutes for your learning
                  </div>
                </div>
              )}
            </div>

            {/* Avatar - Mini versión */}
            <div className="bg-black/40 rounded p-2 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{getCropEmoji()}</span>
                  <div>
                    <div className="text-[11px] font-medium text-white">Nivel {vegetableAvatar.level}</div>
                    <div className="text-[9px] text-white/60">Poder: {vegetableAvatar.powerLevel}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBattleArena(true)}
                  className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 text-[10px] rounded"
                >
                  Battle
                </button>
              </div>
              
              {/* Botón DEBUG: Resetear Recursos */}
              {(resources.water < 50 || resources.fertilizer < 50 || resources.pesticide < 50) && (
                <button
                  onClick={() => {
                    setResources({ water: 100, fertilizer: 100, pesticide: 100 });
                    showTip('🔄 Recursos reseteados al 100%', 3000);
                    console.log('🔄 Resources manually reset to 100%');
                  }}
                  className="mt-2 w-full px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 text-[9px] rounded flex items-center justify-center gap-1"
                >
                  <span>🔄</span>
                  <span>Resetear Recursos (DEBUG)</span>
                </button>
              )}
            </div>

            {/* Acciones - Botones más grandes y accesibles */}
            <div className="bg-black/40 rounded p-2 border border-white/10 mt-auto">
              <div className="grid grid-cols-3 gap-1 mb-1">
                <button
                  onClick={() => handleWater()}
                  disabled={resources.water < 10}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/10 disabled:cursor-not-allowed border border-blue-500/50 disabled:border-gray-500/30 text-white disabled:text-gray-500 rounded transition-all flex flex-col items-center gap-1"
                >
                  <Droplets className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Regar</span>
                </button>

                <button
                  onClick={() => handleFertilize()}
                  disabled={resources.fertilizer < 10}
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-500/10 disabled:cursor-not-allowed border border-green-500/50 disabled:border-gray-500/30 text-white disabled:text-gray-500 rounded transition-all flex flex-col items-center gap-1"
                >
                  <Leaf className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Fertilize</span>
                </button>

                <button
                  onClick={handlePesticide}
                  disabled={resources.pesticide < 10}
                  className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:bg-gray-500/10 disabled:cursor-not-allowed border border-yellow-500/50 disabled:border-gray-500/30 text-white disabled:text-gray-500 rounded transition-all flex flex-col items-center gap-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Pesticide</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowWhatIfPanel(true)}
                className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-white rounded transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-medium">What if...?</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de alertas críticas */}
      {activeAlerts.length > 0 && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 w-[600px] max-w-[90vw] space-y-2">
          {activeAlerts.map((alert, index) => (
            <div key={index} className="bg-red-900/90 backdrop-blur-lg rounded-lg p-3 border border-red-500 shadow-xl animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <span className="text-xl">🚨</span>
                  <p className="text-white text-sm">{alert}</p>
                </div>
                <button
                  onClick={() => handleDismissAlert(alert)}
                  className="text-white/60 hover:text-white ml-2 transition-colors"
                  title="Ignore alert (penalty: -25 pts)"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-red-300 mt-1">
                ⚠️ Ignoring this alert will result in a -25 points penalty
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips educativos - Mensaje emergente debajo del vegetal */}
      {showTips && currentTip && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none" style={{ marginTop: '180px', maxWidth: '600px' }}>
          <div className={`backdrop-blur-xl text-white rounded-xl p-4 shadow-[0_10px_60px_rgba(0,0,0,0.6)] relative border-3 pointer-events-auto animate-bounce-in ${
            currentTip.includes('⚠️') || currentTip.includes('🚨') 
              ? 'bg-red-900/95 border-red-400 shadow-red-500/50' 
              : currentTip.includes('✅') || currentTip.includes('🎓')
              ? 'bg-green-900/95 border-green-400 shadow-green-500/50'
              : currentTip.includes('🤖')
              ? 'bg-purple-900/95 border-purple-400 shadow-purple-500/50'
              : 'bg-blue-900/95 border-blue-400 shadow-blue-500/50'
          }`}
          style={{
            boxShadow: currentTip.includes('⚠️') ? '0 0 40px rgba(239, 68, 68, 0.6), 0 10px 60px rgba(0,0,0,0.6)' :
                       currentTip.includes('✅') ? '0 0 40px rgba(34, 197, 94, 0.6), 0 10px 60px rgba(0,0,0,0.6)' :
                       currentTip.includes('🤖') ? '0 0 40px rgba(168, 85, 247, 0.6), 0 10px 60px rgba(0,0,0,0.6)' :
                       '0 0 40px rgba(59, 130, 246, 0.6), 0 10px 60px rgba(0,0,0,0.6)'
          }}>
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">
                {currentTip.includes('⚠️') && '⚠️'}
                {currentTip.includes('✅') && '✅'}
                {currentTip.includes('🎓') && '🎓'}
                {currentTip.includes('🤖') && '🤖'}
                {!currentTip.includes('⚠️') && !currentTip.includes('✅') && !currentTip.includes('🎓') && !currentTip.includes('🤖') && '💡'}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                  {currentTip.includes('⚠️') ? 'Attention' : currentTip.includes('✅') ? 'Excellent!' : 'Tip'}
                </div>
                <span className="text-base leading-relaxed font-medium">{currentTip}</span>
              </div>
              <button
                onClick={() => {
                  setShowTips(false);
                  setCurrentTip('');
                }}
                className="text-white/60 hover:text-white transition-colors text-xl flex-shrink-0 hover:scale-110"
              >
                ✕
              </button>
            </div>
            {/* Barra de progreso para tips persistentes */}
            {isPersistentTip && tipDisplayTime > 0 && (
              <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/80 transition-all ease-linear shrink-progress rounded-full"
                  style={{ 
                    animation: `shrink ${tipDisplayTime}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botones de configuración - Posicionados en la esquina inferior izquierda */}
      <div className="absolute bottom-4 left-4 z-50 flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏠 Navegando a /farm-room');
                router.push('/farm-room');
              }}
              className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 backdrop-blur-sm p-3 rounded-lg transition-all duration-300 text-white shadow-lg hover:shadow-xl hover:scale-105 border-2 border-green-400/50"
              title="Return to create farms"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🏠</span>
                <span className="text-[10px] font-semibold">Farms</span>
              </div>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-black/70 backdrop-blur-sm p-3 rounded-lg hover:bg-black/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button
              className="bg-black/70 backdrop-blur-sm p-3 rounded-lg hover:bg-black/80 transition-all duration-300 relative shadow-lg"
              title={`${isSaving ? 'Saving' : 'Auto-save'}`}
            >
              <Save className={`w-5 h-5 text-white ${isSaving ? 'animate-pulse' : ''}`} />
              {isSaving && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              )}
              {!isSaving && lastSaveTime && (
                <div className="absolute -bottom-6 left-0 text-xs text-white/60 whitespace-nowrap">
                  {new Date().getTime() - lastSaveTime.getTime() < 60000 
                    ? 'Saved' 
                    : `${Math.floor((new Date().getTime() - lastSaveTime.getTime()) / 60000)}m ago`}
                </div>
              )}
            </button>
          </div>

      {/* Panel de Aprendizaje Mejorado con IA */}
      {showLearningPanel && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-[shake-error_0.3s]">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 border-b-2 border-red-500 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <span className="text-4xl">🎓</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Learning Panel</h2>
                  <p className="text-red-100 text-sm">Analyze your decision and improve your strategy</p>
                </div>
              </div>
              <button
                onClick={() => setShowLearningPanel(false)}
                className="text-white/80 hover:text-white text-3xl font-bold transition-all hover:rotate-90 duration-300"
              >
                ×
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              
              {/* Análisis de la decisión - Diseño mejorado */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Tu decisión */}
                <div className="relative bg-gradient-to-br from-red-900/40 to-red-950/40 border-2 border-red-500/50 rounded-xl p-5 overflow-hidden">
                  <div className="absolute top-0 right-0 text-[120px] opacity-5">❌</div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-red-500 p-2 rounded-lg">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <h3 className="text-lg font-bold text-red-200">Your decision</h3>
                    </div>
                    <p className="text-white text-xl font-bold mb-2">{learningContent.actionTaken}</p>
                    <div className="bg-red-950/50 rounded-lg p-3 mt-3">
                      <p className="text-red-300 text-xs font-semibold mb-1">Consequence:</p>
                      <p className="text-red-200 text-sm">{decisionHistory[decisionHistory.length - 1]?.consequence}</p>
                    </div>
                  </div>
                </div>

                {/* Acción correcta */}
                <div className="relative bg-gradient-to-br from-green-900/40 to-green-950/40 border-2 border-green-500/50 rounded-xl p-5 overflow-hidden">
                  <div className="absolute top-0 right-0 text-[120px] opacity-5">✅</div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <span className="text-2xl">💡</span>
                      </div>
                      <h3 className="text-lg font-bold text-green-200">Optimal decision</h3>
                    </div>
                    <div className="bg-green-950/50 rounded-lg p-3">
                      <p className="text-green-100 text-sm whitespace-pre-line leading-relaxed">
                        {learningContent.correctAction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explicación con IA - Diseño card mejorado */}
              <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-200">Intelligent Analysis</h3>
                    <p className="text-blue-300 text-xs">Powered by Gemini AI + NASA Data</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="text-blue-50 text-sm leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                    {learningContent.content}
                  </div>
                </div>
              </div>

              {/* Consejos prácticos - Grid mejorado */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <span className="text-2xl">💡</span>
                  </div>
                  <h3 className="text-lg font-bold text-purple-200">Recommendations</h3>
                </div>
                <div className="grid gap-2">
                  {learningContent.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/30 rounded-lg p-3 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-purple-100 text-sm flex-1">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial reciente - Timeline mejorado */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-slate-600/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-slate-600 p-2 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">Recent History</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {decisionHistory.slice(-6).reverse().map((decision, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        decision.wasCorrect
                          ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30'
                          : 'bg-red-900/20 border-red-500/30 hover:bg-red-900/30'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${
                        decision.wasCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <span className="text-lg">{decision.wasCorrect ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{decision.action}</p>
                        <p className="text-gray-400 text-xs">{decision.explanation.slice(0, 50)}...</p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(decision.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estadísticas - Cards mejoradas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">
                    {decisionHistory.filter(d => d.wasCorrect).length}
                  </p>
                  <p className="text-xs text-green-100 mt-1">Correct</p>
                </div>
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">
                    {decisionHistory.filter(d => !d.wasCorrect).length}
                  </p>
                  <p className="text-xs text-red-100 mt-1">Incorrect</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-white">
                    {decisionHistory.length > 0
                      ? Math.round((decisionHistory.filter(d => d.wasCorrect).length / decisionHistory.length) * 100)
                      : 0}%
                  </p>
                  <p className="text-xs text-yellow-100 mt-1">Accuracy</p>
                </div>
              </div>
            </div>

            {/* Footer con acciones - Sticky */}
            <div className="bg-slate-900 border-t-2 border-slate-700 p-4 flex gap-3">
              <button
                onClick={() => {
                  setShowLearningPanel(false);
                  handleCorrectAction();
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50"
              >
                <span className="text-xl">✓</span>
                <span>Understood, give me tips</span>
              </button>
              <button
                onClick={() => setShowLearningPanel(false)}
                className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
              >
                Continue playing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Battle Arena Modal */}
      {showBattleArena && (
        <VegetableBattleArena
          playerAvatar={{
            id: playerId || 'player-1',
            playerId: playerId || 'player',
            playerName: playerData.playerName,
            vegetableType: playerData.selectedCrop,
            level: vegetableAvatar.level,
            experience: vegetableAvatar.experience,
            powerLevel: vegetableAvatar.powerLevel,
            health: cropState.health,
            maxHealth: 100,
            traits: vegetableAvatar.traits,
            wins: 0,
            losses: 0,
          }}
          onClose={() => setShowBattleArena(false)}
          onBattleRequest={async (opponentId: string) => {
            // Send battle request to other player
            if (farm?.roomId && playerId) {
              await supabase.from('room_updates').insert({
                room_id: farm.roomId,
                player_id: playerId,
                update_type: 'battle_request',
                payload: {
                  challenger_id: playerId,
                  challenger_name: playerData.playerName,
                  challenger_vegetable: vegetableAvatar,
                  target_player_id: opponentId
                }
              });
            }
          }}
        />
      )}
    </div>
  );
}
