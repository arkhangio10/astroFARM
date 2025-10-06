'use client';

import dynamic from 'next/dynamic';

// Loading component inline
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-emerald-950">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
      <p className="text-emerald-400">Cargando AstroFarm...</p>
    </div>
  </div>
);

// Dynamic import with no SSR
const GameView = dynamic(() => import('./components/GameView'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function HomePage() {
  return <GameView />;
}

