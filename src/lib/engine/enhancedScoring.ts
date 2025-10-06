// Enhanced scoring system with NASA data bonuses
// Soporta tanto datos NASA satelitales como simulaciones de IA (Gemini)

import { GameState, Scores } from '@/types/game';

export interface NASAUsageMetrics {
  layersViewed: number;              // Capas satelitales NASA vistas
  simulationsRun: number;            // Simulaciones "What-If" ejecutadas
  missionsCompleted: number;         // Misiones diarias completadas
  alertsResponded: number;           // Alertas a las que se respondió
  correctDecisions: number;          // Decisiones correctas (NASA o IA)
  incorrectDecisions: number;        // Decisiones incorrectas (NASA o IA)
  alertsIgnored: number;             // Alertas ignoradas (penalización)
  totalDecisions: number;            // Total de decisiones tomadas
}

export interface EnhancedScores extends Scores {
  nasaBonus: {
    dataUsage: number;
    whatIfUsage: number;
    missionComplete: number;
    alertResponse: number;
    total: number;
  };
  penalties: {
    ignoredAlerts: number;
    badDecisions: number;
    total: number;
  };
  dataEfficiencyMultiplier: number;
  finalScore: number;
}

export function calculateEnhancedScore(
  gameState: GameState,
  nasaUsage: NASAUsageMetrics
): EnhancedScores {
  // Calcular puntuación base del juego original
  const baseScores = calculateBaseScores(gameState);
  
  // Calcular bonificaciones NASA
  const nasaBonus = {
    dataUsage: Math.min(50, nasaUsage.layersViewed * 5), // +5 pts por capa vista, máx 50
    whatIfUsage: Math.min(30, nasaUsage.simulationsRun * 10), // +10 pts por simulación, máx 30
    missionComplete: nasaUsage.missionsCompleted * 25, // +25 pts por misión
    alertResponse: Math.max(0, 20 - (nasaUsage.alertsIgnored * 10)), // Bonus reducido por alertas ignoradas
    total: 0
  };
  
  // Sumar todas las bonificaciones
  nasaBonus.total = nasaBonus.dataUsage + nasaBonus.whatIfUsage + 
                    nasaBonus.missionComplete + nasaBonus.alertResponse;
  
  // Calcular penalizaciones
  const penalties = {
    ignoredAlerts: nasaUsage.alertsIgnored * 25, // -25 pts por alerta ignorada
    badDecisions: nasaUsage.incorrectDecisions * 15, // -15 pts por decisión incorrecta
    total: 0
  };
  
  penalties.total = penalties.ignoredAlerts + penalties.badDecisions;
  
  // Calcular multiplicador por uso eficiente de datos
  // Puede ser menor que 1 si hay más decisiones incorrectas que correctas
  const correctDecisions = nasaUsage.correctDecisions;
  const incorrectDecisions = nasaUsage.incorrectDecisions;
  const totalDecisions = nasaUsage.totalDecisions || 1; // Evitar división por cero
  
  const rawMultiplier = 1 + ((correctDecisions - incorrectDecisions) / totalDecisions);
  const dataEfficiencyMultiplier = Math.max(0.5, Math.min(1.5, rawMultiplier));
  
  // Calcular puntuación final con eficiencia, bonus y penalizaciones
  const adjustedBaseScore = baseScores.total * dataEfficiencyMultiplier;
  const finalScore = Math.max(0, Math.round(adjustedBaseScore + nasaBonus.total - penalties.total));
  
  return {
    ...baseScores,
    nasaBonus,
    penalties,
    dataEfficiencyMultiplier,
    finalScore
  };
}

// Función auxiliar para calcular puntuaciones base
function calculateBaseScores(gameState: GameState): Scores {
  // Implementación simplificada - en producción usaría la función real
  const yieldScore = gameState.scores?.yield || 0;
  const waterScore = gameState.scores?.water || 0;
  const environmentScore = gameState.scores?.environment || 0;
  const efficiencyScore = gameState.scores?.efficiency || 0;
  
  return {
    yield: yieldScore,
    water: waterScore,
    environment: environmentScore,
    efficiency: efficiencyScore,
    total: yieldScore + waterScore + environmentScore
  };
}

// Función para evaluar decisiones basadas en datos NASA
export function evaluateDecisionQuality(
  decision: string,
  nasaData: any,
  outcome: any
): boolean {
  // Lógica simplificada para evaluar si una decisión fue correcta
  switch (decision) {
    case 'water':
      // Fue correcto regar si la humedad era baja
      return nasaData.soilMoisture < 0.4 && outcome.moistureIncreased;
      
    case 'fertilize':
      // Fue correcto fertilizar si NDVI era bajo
      return nasaData.ndvi < 0.5 && outcome.nutrientsIncreased;
      
    case 'protect':
      // Fue correcto proteger si había riesgo de helada
      return nasaData.temperature < 5 && outcome.damagePrevented;
      
    default:
      return false;
  }
}

// Función para calcular bonus por achievements NASA
export function calculateNASAAchievementBonus(achievements: string[]): number {
  const nasaAchievements = {
    'Data Explorer': 25, // Usar todas las capas GIBS
    'Simulation Master': 50, // 10+ simulaciones What-If
    'Mission Commander': 100, // Completar 5 misiones
    'NASA Farmer': 200, // Puntuación perfecta con datos NASA
    'Drought Survivor': 75, // Sobrevivir sequía con datos SMAP
    'Frost Fighter': 75, // Prevenir heladas con MODIS
    'Efficiency Expert': 150 // 90%+ decisiones correctas
  };
  
  return achievements.reduce((total, achievement) => {
    return total + (nasaAchievements[achievement as keyof typeof nasaAchievements] || 0);
  }, 0);
}

// Función para trackear métricas NASA
export function createNASAMetricsTracker(): {
  metrics: NASAUsageMetrics;
  trackLayerView: (layer: string) => void;
  trackSimulation: () => void;
  trackMissionComplete: (missionId: string) => void;
  trackAlertResponse: (alertType: string) => void;
  trackDecision: (decision: string, wasCorrect: boolean) => void;
  trackAlertIgnored: () => void;
  getMetrics: () => NASAUsageMetrics;
} {
  const metrics: NASAUsageMetrics = {
    layersViewed: 0,
    simulationsRun: 0,
    missionsCompleted: 0,
    alertsResponded: 0,
    correctDecisions: 0,
    incorrectDecisions: 0,
    alertsIgnored: 0,
    totalDecisions: 0
  };
  
  const viewedLayers = new Set<string>();
  const completedMissions = new Set<string>();
  const respondedAlerts = new Set<string>();
  
  return {
    metrics,
    
    trackLayerView: (layer: string) => {
      if (!viewedLayers.has(layer)) {
        viewedLayers.add(layer);
        metrics.layersViewed = viewedLayers.size;
      }
    },
    
    trackSimulation: () => {
      metrics.simulationsRun++;
    },
    
    trackMissionComplete: (missionId: string) => {
      if (!completedMissions.has(missionId)) {
        completedMissions.add(missionId);
        metrics.missionsCompleted = completedMissions.size;
      }
    },
    
    trackAlertResponse: (alertType: string) => {
      if (!respondedAlerts.has(alertType)) {
        respondedAlerts.add(alertType);
        metrics.alertsResponded = respondedAlerts.size;
      }
    },
    
    trackDecision: (decision: string, wasCorrect: boolean) => {
      metrics.totalDecisions++;
      if (wasCorrect) {
        metrics.correctDecisions++;
      } else {
        metrics.incorrectDecisions++;
      }
      console.log(`Decision tracked: ${decision} - ${wasCorrect ? 'Correct' : 'Incorrect'}`);
    },
    
    trackAlertIgnored: () => {
      metrics.alertsIgnored++;
      console.log('Alert ignored by player');
    },
    
    getMetrics: () => metrics
  };
}

export default {
  calculateEnhancedScore,
  evaluateDecisionQuality,
  calculateNASAAchievementBonus,
  createNASAMetricsTracker
};
