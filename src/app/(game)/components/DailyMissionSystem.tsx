'use client';

import { useState, useEffect } from 'react';
import { Target, Droplets, Thermometer, Cloud, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';

export interface MissionObjective {
  id: string;
  task: string;
  completed: boolean;
  progress?: number;
  target?: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  trigger: 'drought' | 'heatwave' | 'frost' | 'optimal' | 'rain';
  objectives: MissionObjective[];
  rewards: {
    experience: number;
    bonus?: Record<string, number>;
    achievement?: string;
  };
  dataThresholds: Record<string, number>;
  expiresIn: number; // minutos
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DailyMissionSystemProps {
  nasaData: any;
  gameState: any;
  onMissionComplete: (mission: DailyMission) => void;
  onObjectiveProgress?: (missionId: string, objectiveId: string, progress: number) => void;
}

const MISSION_TEMPLATES: Partial<DailyMission>[] = [
  {
    id: 'drought_response',
    title: '🏜️ Alerta de Sequía',
    description: 'Los datos SMAP muestran humedad crítica del suelo. Gestiona el agua sabiamente para salvar tu cultivo.',
    icon: <Droplets className="w-6 h-6 text-orange-600" />,
    trigger: 'drought',
    objectives: [
      { id: 'maintain_moisture', task: 'Mantén la humedad del suelo > 30%', completed: false, target: 30 },
      { id: 'efficient_irrigation', task: 'Usa riego eficiente (< 20L/m²)', completed: false, target: 20 },
      { id: 'harvest_early', task: 'Cosecha antes de pérdida total', completed: false }
    ],
    rewards: {
      experience: 500,
      bonus: { waterEfficiency: 1.2 },
      achievement: 'Drought Survivor'
    },
    dataThresholds: {
      soilMoisture: 0.2,
      precipitation: 5
    },
    expiresIn: 60,
    difficulty: 'hard'
  },
  {
    id: 'heatwave_management',
    title: '🔥 Ola de Calor Extrema',
    description: 'MODIS detecta temperaturas peligrosas. Protege tus cultivos del estrés térmico.',
    icon: <Thermometer className="w-6 h-6 text-red-600" />,
    trigger: 'heatwave',
    objectives: [
      { id: 'apply_mulch', task: 'Aplica mulch o cobertura', completed: false },
      { id: 'night_irrigation', task: 'Riega en horas nocturnas', completed: false },
      { id: 'maintain_ndvi', task: 'Mantén NDVI > 0.4', completed: false, target: 0.4 }
    ],
    rewards: {
      experience: 400,
      bonus: { heatResistance: 1.5 },
      achievement: 'Heat Manager'
    },
    dataThresholds: {
      temperature: 38,
      ndvi: 0.5
    },
    expiresIn: 45,
    difficulty: 'medium'
  },
  {
    id: 'frost_protection',
    title: '❄️ Alerta de Helada',
    description: 'Se aproximan temperaturas bajo cero. Actúa rápido para proteger tus cultivos.',
    icon: <Thermometer className="w-6 h-6 text-blue-600" />,
    trigger: 'frost',
    objectives: [
      { id: 'cover_crops', task: 'Cubre los cultivos sensibles', completed: false },
      { id: 'water_before', task: 'Riega antes de la helada', completed: false },
      { id: 'monitor_temp', task: 'Monitorea temperatura > 0°C', completed: false, target: 0 }
    ],
    rewards: {
      experience: 450,
      bonus: { coldResistance: 1.3 },
      achievement: 'Frost Fighter'
    },
    dataThresholds: {
      temperature: 2,
      frostRisk: 0.7
    },
    expiresIn: 30,
    difficulty: 'medium'
  },
  {
    id: 'optimal_growth',
    title: '🌱 Condiciones Óptimas',
    description: 'Los datos NASA muestran condiciones ideales. ¡Maximiza tu crecimiento!',
    icon: <TrendingUp className="w-6 h-6 text-green-600" />,
    trigger: 'optimal',
    objectives: [
      { id: 'fertilize_now', task: 'Aplica fertilizante orgánico', completed: false },
      { id: 'maintain_balance', task: 'Mantén todos los indicadores > 70%', completed: false, target: 70 },
      { id: 'grow_20', task: 'Aumenta crecimiento en +20%', completed: false, target: 20 }
    ],
    rewards: {
      experience: 350,
      bonus: { growthRate: 1.4 },
      achievement: 'Green Thumb'
    },
    dataThresholds: {
      ndvi: 0.7,
      soilMoisture: 0.6,
      temperature: 25
    },
    expiresIn: 40,
    difficulty: 'easy'
  },
  {
    id: 'rain_preparation',
    title: '🌧️ Lluvia Inminente',
    description: 'GPM predice precipitación fuerte. Prepara tu campo para aprovechar el agua.',
    icon: <Cloud className="w-6 h-6 text-blue-500" />,
    trigger: 'rain',
    objectives: [
      { id: 'reduce_irrigation', task: 'Reduce el riego preventivamente', completed: false },
      { id: 'check_drainage', task: 'Verifica el drenaje del campo', completed: false },
      { id: 'harvest_ready', task: 'Cosecha cultivos maduros', completed: false }
    ],
    rewards: {
      experience: 300,
      bonus: { waterSavings: 1.5 },
      achievement: 'Rain Dancer'
    },
    dataThresholds: {
      precipitationForecast: 20,
      cloudCover: 0.8
    },
    expiresIn: 35,
    difficulty: 'easy'
  }
];

export default function DailyMissionSystem({ 
  nasaData, 
  gameState, 
  onMissionComplete,
  onObjectiveProgress 
}: DailyMissionSystemProps) {
  const [activeMission, setActiveMission] = useState<DailyMission | null>(null);
  const [missionProgress, setMissionProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Chequear triggers de misiones
  useEffect(() => {
    if (activeMission) return; // Ya hay una misión activa

    const checkMissionTriggers = () => {
      for (const template of MISSION_TEMPLATES) {
        const triggered = checkThresholds(template.dataThresholds!, nasaData);
        if (triggered) {
          // Crear misión completa desde el template
          const newMission: DailyMission = {
            ...template as DailyMission,
            objectives: template.objectives!.map(obj => ({ ...obj })) // Clonar objetivos
          };
          setActiveMission(newMission);
          setTimeRemaining(newMission.expiresIn * 60); // Convertir a segundos
          break;
        }
      }
    };

    checkMissionTriggers();
  }, [nasaData, activeMission]);

  // Timer para la misión activa
  useEffect(() => {
    if (!activeMission || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Misión expirada
          setActiveMission(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeMission, timeRemaining]);

  // Actualizar progreso de la misión
  useEffect(() => {
    if (!activeMission) return;

    const completedObjectives = activeMission.objectives.filter(obj => obj.completed).length;
    const totalObjectives = activeMission.objectives.length;
    const progress = (completedObjectives / totalObjectives) * 100;
    
    setMissionProgress(progress);

    // Verificar si la misión está completa
    if (progress === 100) {
      onMissionComplete(activeMission);
      setTimeout(() => setActiveMission(null), 3000); // Mostrar por 3 segundos antes de cerrar
    }
  }, [activeMission, onMissionComplete]);

  const checkThresholds = (thresholds: Record<string, number>, data: any): boolean => {
    // Lógica simplificada de verificación de umbrales
    if (thresholds.soilMoisture && data.soilMoisture < thresholds.soilMoisture) return true;
    if (thresholds.temperature && data.temperature > thresholds.temperature) return true;
    if (thresholds.precipitationForecast && data.precipitationForecast > thresholds.precipitationForecast) return true;
    return false;
  };

  const updateObjectiveProgress = (objectiveId: string, value: number) => {
    if (!activeMission) return;

    setActiveMission(prev => {
      if (!prev) return null;
      
      const updatedMission = { ...prev };
      updatedMission.objectives = prev.objectives.map(obj => {
        if (obj.id === objectiveId) {
          const progress = obj.target ? (value / obj.target) * 100 : 0;
          const completed = obj.target ? value >= obj.target : false;
          
          onObjectiveProgress?.(prev.id, obj.id, progress);
          
          return { ...obj, progress, completed };
        }
        return obj;
      });
      
      return updatedMission;
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!activeMission) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-30 transition-all duration-300 ${
      isMinimized ? 'w-20' : 'w-96'
    }`}>
      <div className="bg-white rounded-lg shadow-2xl border-l-4 border-orange-500 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white ${
          isMinimized ? 'cursor-pointer' : ''
        }`} onClick={() => isMinimized && setIsMinimized(false)}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isMinimized ? 'justify-center' : ''}`}>
              {activeMission.icon}
              {!isMinimized && (
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{activeMission.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-orange-100">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(timeRemaining)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(activeMission.difficulty)}`}>
                      {activeMission.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {!isMinimized && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="text-white/80 hover:text-white"
              >
                −
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        {!isMinimized && (
          <>
            <div className="p-4">
              {/* Descripción */}
              <p className="text-sm text-gray-600 mb-4">
                {activeMission.description}
              </p>

              {/* Objetivos */}
              <div className="space-y-2 mb-4">
                {activeMission.objectives.map((obj) => (
                  <div key={obj.id} className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {obj.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${obj.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {obj.task}
                      </span>
                      {obj.progress !== undefined && !obj.completed && (
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-orange-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${obj.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progreso general */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso de la misión</span>
                  <span className="font-medium">{missionProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${missionProgress}%` }}
                  />
                </div>
              </div>

              {/* Recompensas */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">Recompensas:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{activeMission.rewards.experience} XP</span>
                  </div>
                  {activeMission.rewards.achievement && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {activeMission.rewards.achievement}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Indicador NASA */}
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-center gap-2 text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Misión activada por datos NASA en tiempo real</span>
            </div>
          </>
        )}
      </div>

      {/* Notificación de misión completada */}
      {missionProgress === 100 && (
        <div className="absolute inset-0 bg-green-500 text-white flex items-center justify-center rounded-lg animate-pulse">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
            <h3 className="font-bold text-lg">¡Misión Completada!</h3>
            <p className="text-sm">+{activeMission.rewards.experience} XP</p>
          </div>
        </div>
      )}
    </div>
  );
}
