'use client';

import MapboxWrapper from './MapboxWrapper';

interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  region: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  recommended: boolean;
}

interface SmartLocationMapProps {
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
  farmName?: string;
}

export default function SmartLocationMap({ onLocationSelect, onClose, farmName }: SmartLocationMapProps) {
  // Usar Mapbox directamente sin selector
  return (
    <MapboxWrapper
      onLocationSelect={onLocationSelect}
      onClose={onClose}
      farmName={farmName}
    />
  );
}
