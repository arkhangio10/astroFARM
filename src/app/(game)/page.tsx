import { Suspense } from 'react';
import GameView from './components/GameView';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function GamePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<LoadingSpinner />}>
        <GameView />
      </Suspense>
    </div>
  );
}

