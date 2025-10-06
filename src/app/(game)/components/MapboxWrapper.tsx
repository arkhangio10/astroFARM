'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar Mapbox de forma dinámica para evitar SSR
const LocationMapMapbox = dynamic(
  () => import('./LocationMapFixed'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando Mapbox...</p>
        </div>
      </div>
    )
  }
);

interface MapboxWrapperProps {
  onLocationSelect: (location: any) => void;
  onClose: () => void;
  farmName?: string;
}

export default function MapboxWrapper(props: MapboxWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto mb-4"></div>
            <p className="text-gray-600">Preparando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  return <LocationMapMapbox {...props} />;
}
