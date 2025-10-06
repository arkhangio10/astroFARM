// Dataset management and metadata

import { DatasetMeta } from '@/types/game';
import { GAME_CONFIG } from './config';

export const DATASET_METADATA: Record<string, DatasetMeta> = {
  ndvi: {
    name: 'MODIS NDVI (MCD13Q1)',
    resolution: 250,
    latency: '1-2 days',
    source: 'NASA LP DAAC',
    limitations: [
      '250m spatial resolution',
      '16-day temporal resolution',
      'Affected by cloud cover',
      'Vegetation index, not direct measurement',
    ],
  },
  soilMoisture: {
    name: 'SMAP Soil Moisture',
    resolution: 1000,
    latency: '1-2 days',
    source: 'NASA SMAP Mission',
    limitations: [
      '~1km spatial resolution',
      'Surface soil moisture only',
      'Limited penetration depth',
      'Affected by vegetation cover',
    ],
  },
  temperature: {
    name: 'MODIS Land Surface Temperature',
    resolution: 1000,
    latency: '1-2 days',
    source: 'NASA LP DAAC',
    limitations: [
      '1km spatial resolution',
      '8-day temporal resolution',
      'Surface temperature, not air temperature',
      'Affected by cloud cover',
    ],
  },
  precipitation: {
    name: 'GPM Precipitation (IMERG)',
    resolution: 10000, // 0.1° ≈ 10km
    latency: '3-4 hours',
    source: 'NASA GPM Mission',
    limitations: [
      '~10km spatial resolution',
      'Estimated from satellite data',
      'Less accurate for light precipitation',
      'Limited in mountainous areas',
    ],
  },
};

export function getDatasetMetadata(datasetName: string): DatasetMeta | null {
  return DATASET_METADATA[datasetName] || null;
}

export function getAllDatasetMetadata(): DatasetMeta[] {
  return Object.values(DATASET_METADATA);
}

export function getDatasetLimitations(datasetName: string): string[] {
  const metadata = getDatasetMetadata(datasetName);
  return metadata?.limitations || [];
}

export function formatResolution(resolution: number): string {
  if (resolution < 1000) {
    return `${resolution}m`;
  } else {
    return `${resolution / 1000}km`;
  }
}

export function formatLatency(latency: string): string {
  return latency;
}

export function getDataQualityScore(datasetName: string, conditions: {
  cloudCover?: number;
  vegetation?: number;
  season?: string;
}): number {
  let score = 100;
  
  switch (datasetName) {
    case 'ndvi':
      if (conditions.cloudCover && conditions.cloudCover > 0.3) {
        score -= 50; // Heavy cloud cover significantly affects NDVI
      }
      if (conditions.season === 'winter') {
        score -= 20; // Lower vegetation in winter
      }
      break;
      
    case 'soilMoisture':
      if (conditions.vegetation && conditions.vegetation > 0.8) {
        score -= 30; // Dense vegetation affects soil moisture detection
      }
      break;
      
    case 'temperature':
      if (conditions.cloudCover && conditions.cloudCover > 0.5) {
        score -= 40; // Heavy clouds affect temperature measurement
      }
      break;
      
    case 'precipitation':
      if (conditions.season === 'summer') {
        score -= 10; // Summer precipitation is harder to detect
      }
      break;
  }
  
  return Math.max(0, Math.min(100, score));
}

export function getDataRecommendations(datasetName: string, qualityScore: number): string[] {
  const recommendations: string[] = [];
  
  if (qualityScore < 50) {
    recommendations.push('⚠️ Data quality is low - consider using alternative dates');
  } else if (qualityScore < 80) {
    recommendations.push('⚠️ Data quality is moderate - use with caution');
  }
  
  switch (datasetName) {
    case 'ndvi':
      if (qualityScore < 70) {
        recommendations.push('☁️ Check for cloud cover on this date');
        recommendations.push('📅 Try a different date for better NDVI data');
      }
      break;
      
    case 'soilMoisture':
      if (qualityScore < 70) {
        recommendations.push('🌱 Consider vegetation density in the area');
        recommendations.push('📊 Use multiple dates for soil moisture trends');
      }
      break;
      
    case 'temperature':
      if (qualityScore < 70) {
        recommendations.push('🌡️ Surface temperature may differ from air temperature');
        recommendations.push('☁️ Check for cloud interference');
      }
      break;
      
    case 'precipitation':
      if (qualityScore < 70) {
        recommendations.push('🌧️ Satellite precipitation estimates have limitations');
        recommendations.push('📡 Consider ground-based weather stations');
      }
      break;
  }
  
  return recommendations;
}

