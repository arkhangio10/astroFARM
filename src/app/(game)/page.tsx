
'use client';

import NextDynamic from 'next/dynamic';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
const GameView = NextDynamic(() => import('./components/GameView'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function HomePage() {
  return <GameView />;
}

