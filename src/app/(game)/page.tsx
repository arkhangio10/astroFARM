'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

// Dynamic import to avoid SSR issues
const GameView = dynamic(() => import('./components/GameView'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function GamePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <GameView />
    </div>
  );
}

