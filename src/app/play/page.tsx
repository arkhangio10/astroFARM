import { Suspense } from 'react';
import GameView from '../(game)/components/GameView';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Suspense fallback={<LoadingSpinner />}>
        <GameView />
      </Suspense>
    </div>
  );
}
