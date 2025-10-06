'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Mic, Volume2 } from 'lucide-react';

interface DemoScene {
  id: string;
  duration: number;
  action: () => void;
  narration: string;
  focus?: string;
  highlight?: string[];
}

interface AutoDemoModeProps {
  onSceneChange?: (scene: DemoScene) => void;
  onComplete?: () => void;
}

export default function AutoDemoMode({ onSceneChange, onComplete }: AutoDemoModeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [showNarration, setShowNarration] = useState(true);
  const [narrationText, setNarrationText] = useState('');
  const sceneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const DEMO_FLOW: DemoScene[] = [
    {
      id: 'intro',
      duration: 5000,
      action: () => {
        // Mostrar logo y título
        showOverlay('welcome');
        animateCamera({ zoom: 10, center: [36.7, -119.7] });
      },
      narration: "Bienvenidos a AstroFARM, donde la agricultura se encuentra con la tecnología espacial de NASA.",
      focus: 'logo'
    },
    {
      id: 'satellite_view',
      duration: 6000,
      action: () => {
        // Activar capa GIBS
        toggleGIBSLayer('NDVI', true);
        showBadge('LIVE NASA DATA');
      },
      narration: "Utilizamos datos satelitales EN VIVO de NASA para monitorear cultivos en tiempo real. Cada píxel representa 250 metros de terreno.",
      focus: 'nasa-gibs-layer',
      highlight: ['satellite-badge', 'layer-selector']
    },
    {
      id: 'data_credibility',
      duration: 5000,
      action: () => {
        // Mostrar HUD de credibilidad
        showComponent('DataCredibilityHUD');
        highlightMetric('resolution', '250m');
      },
      narration: "Cada dato tiene resolución y latencia específicas. Entender estas limitaciones es clave para tomar decisiones informadas.",
      focus: 'credibility-hud',
      highlight: ['resolution-metric', 'latency-indicator']
    },
    {
      id: 'decision_simulation',
      duration: 7000,
      action: () => {
        // Abrir panel What-If
        openPanel('WhatIfSimulator');
        simulateDecision({ water: 25, fertilizer: 'organic' });
      },
      narration: "Los agricultores pueden simular el impacto de sus decisiones ANTES de actuar, optimizando recursos y maximizando rendimiento.",
      focus: 'what-if-panel',
      highlight: ['water-slider', 'simulate-button']
    },
    {
      id: 'mission_alert',
      duration: 5000,
      action: () => {
        // Activar misión de sequía
        triggerMission('drought_response');
        showNotification('🏜️ Alerta: Sequía detectada por satélite SMAP');
      },
      narration: "Misiones dinámicas se activan automáticamente basadas en datos NASA reales, guiando a los jugadores en situaciones críticas.",
      focus: 'mission-panel',
      highlight: ['mission-objectives', 'nasa-trigger']
    },
    {
      id: 'game_progression',
      duration: 4000,
      action: () => {
        // Mostrar progreso del cultivo
        showCropGrowth(60);
        displayScore({ yield: 85, efficiency: 92 });
      },
      narration: "Los jugadores aprenden agricultura sostenible mientras compiten por las mejores cosechas usando datos científicos reales.",
      focus: 'game-screen',
      highlight: ['crop-visual', 'score-display']
    },
    {
      id: 'educational_impact',
      duration: 5000,
      action: () => {
        // Mostrar métricas de impacto
        showImpactMetrics({
          waterSaved: '2,500 L',
          co2Reduced: '15 kg',
          yieldIncrease: '23%'
        });
      },
      narration: "Cada decisión tiene impacto medible. Los jugadores aprenden cómo la tecnología puede hacer la agricultura más sostenible.",
      focus: 'impact-dashboard',
      highlight: ['water-saved', 'sustainability-score']
    },
    {
      id: 'closing',
      duration: 4000,
      action: () => {
        // Mostrar resumen y CTA
        showSummary();
        highlightFeatures(['NASA Integration', 'Real-time Data', 'Educational Value']);
      },
      narration: "AstroFARM: Donde el futuro de la agricultura comienza hoy. Únete a miles de jugadores aprendiendo con datos reales de NASA.",
      focus: 'summary-screen'
    }
  ];

  // Funciones auxiliares para las acciones (simuladas)
  const showOverlay = (type: string) => {
    console.log(`Showing overlay: ${type}`);
    document.dispatchEvent(new CustomEvent('demo-overlay', { detail: { type } }));
  };

  const animateCamera = (params: any) => {
    console.log('Animating camera:', params);
    document.dispatchEvent(new CustomEvent('demo-camera', { detail: params }));
  };

  const toggleGIBSLayer = (layer: string, visible: boolean) => {
    console.log(`Toggle GIBS layer: ${layer} = ${visible}`);
    document.dispatchEvent(new CustomEvent('demo-gibs', { detail: { layer, visible } }));
  };

  const showBadge = (text: string) => {
    console.log(`Show badge: ${text}`);
    document.dispatchEvent(new CustomEvent('demo-badge', { detail: { text } }));
  };

  const showComponent = (component: string) => {
    console.log(`Show component: ${component}`);
    document.dispatchEvent(new CustomEvent('demo-component', { detail: { component } }));
  };

  const highlightMetric = (metric: string, value: string) => {
    console.log(`Highlight metric: ${metric} = ${value}`);
    document.dispatchEvent(new CustomEvent('demo-highlight', { detail: { metric, value } }));
  };

  const openPanel = (panel: string) => {
    console.log(`Open panel: ${panel}`);
    document.dispatchEvent(new CustomEvent('demo-panel', { detail: { panel } }));
  };

  const simulateDecision = (params: any) => {
    console.log('Simulate decision:', params);
    document.dispatchEvent(new CustomEvent('demo-simulate', { detail: params }));
  };

  const triggerMission = (mission: string) => {
    console.log(`Trigger mission: ${mission}`);
    document.dispatchEvent(new CustomEvent('demo-mission', { detail: { mission } }));
  };

  const showNotification = (text: string) => {
    console.log(`Show notification: ${text}`);
    document.dispatchEvent(new CustomEvent('demo-notification', { detail: { text } }));
  };

  const showCropGrowth = (percent: number) => {
    console.log(`Show crop growth: ${percent}%`);
    document.dispatchEvent(new CustomEvent('demo-crop', { detail: { growth: percent } }));
  };

  const displayScore = (scores: any) => {
    console.log('Display score:', scores);
    document.dispatchEvent(new CustomEvent('demo-score', { detail: scores }));
  };

  const showImpactMetrics = (metrics: any) => {
    console.log('Show impact metrics:', metrics);
    document.dispatchEvent(new CustomEvent('demo-impact', { detail: metrics }));
  };

  const showSummary = () => {
    console.log('Show summary');
    document.dispatchEvent(new CustomEvent('demo-summary'));
  };

  const highlightFeatures = (features: string[]) => {
    console.log('Highlight features:', features);
    document.dispatchEvent(new CustomEvent('demo-features', { detail: { features } }));
  };

  // Control de la demo
  const startDemo = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentSceneIndex(0);
    runScene(0);
  };

  const pauseDemo = () => {
    setIsPaused(!isPaused);
    if (isPaused && sceneTimerRef.current) {
      // Reanudar
      runScene(currentSceneIndex);
    } else {
      // Pausar
      if (sceneTimerRef.current) {
        clearTimeout(sceneTimerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }
  };

  const skipScene = () => {
    if (sceneTimerRef.current) {
      clearTimeout(sceneTimerRef.current);
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    
    const nextIndex = currentSceneIndex + 1;
    if (nextIndex < DEMO_FLOW.length) {
      setCurrentSceneIndex(nextIndex);
      runScene(nextIndex);
    } else {
      endDemo();
    }
  };

  const restartDemo = () => {
    if (sceneTimerRef.current) {
      clearTimeout(sceneTimerRef.current);
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    runScene(0);
  };

  const endDemo = () => {
    setIsRunning(false);
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setNarrationText('');
    onComplete?.();
  };

  const runScene = (index: number) => {
    if (index >= DEMO_FLOW.length || isPaused) return;

    const scene = DEMO_FLOW[index];
    setNarrationText(scene.narration);
    setSceneProgress(0);

    // Ejecutar acción de la escena
    scene.action();
    onSceneChange?.(scene);

    // Actualizar progreso
    let progress = 0;
    progressTimerRef.current = setInterval(() => {
      progress += 100;
      setSceneProgress((progress / scene.duration) * 100);
      
      if (progress >= scene.duration) {
        clearInterval(progressTimerRef.current!);
      }
    }, 100);

    // Programar siguiente escena
    sceneTimerRef.current = setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex < DEMO_FLOW.length) {
        setCurrentSceneIndex(nextIndex);
        runScene(nextIndex);
      } else {
        endDemo();
      }
    }, scene.duration);
  };

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  return (
    <>
      {/* Botón para iniciar demo */}
      {!isRunning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={startDemo}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <Play className="w-6 h-6" />
            <div className="text-left">
              <div className="font-bold text-lg">Iniciar Demo Automática</div>
              <div className="text-sm text-purple-200">3 minutos • 8 escenas</div>
            </div>
          </button>
        </div>
      )}

      {/* Controles de la demo */}
      {isRunning && (
        <div className="fixed top-0 left-0 right-0 z-50">
          {/* Barra superior */}
          <div className="bg-black/90 backdrop-blur-md text-white">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Info de escena */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                      <div className="relative bg-red-500 rounded-full w-3 h-3" />
                    </div>
                    <span className="font-medium">MODO DEMO</span>
                  </div>
                  <span className="text-sm text-gray-300">
                    Escena {currentSceneIndex + 1} de {DEMO_FLOW.length}
                  </span>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={pauseDemo}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={isPaused ? 'Reanudar' : 'Pausar'}
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={skipScene}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Siguiente escena"
                    disabled={currentSceneIndex >= DEMO_FLOW.length - 1}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <button
                    onClick={restartDemo}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowNarration(!showNarration)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Toggle narración"
                  >
                    {showNarration ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5 opacity-50" />}
                  </button>
                  <button
                    onClick={endDemo}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    Salir Demo
                  </button>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-100"
                  style={{ width: `${sceneProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Narración */}
          {showNarration && narrationText && (
            <div className="bg-gradient-to-r from-purple-900/95 to-indigo-900/95 backdrop-blur-sm text-white px-6 py-4 shadow-xl">
              <div className="container mx-auto">
                <div className="flex items-start gap-3">
                  <Mic className="w-5 h-5 mt-0.5 text-purple-300" />
                  <p className="text-lg leading-relaxed">{narrationText}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicadores de foco (overlay sutil) */}
      {isRunning && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="demo-focus-overlay" />
        </div>
      )}

      <style jsx>{`
        .demo-focus-overlay {
          background: radial-gradient(
            ellipse at center,
            transparent 30%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }
      `}</style>
    </>
  );
}
