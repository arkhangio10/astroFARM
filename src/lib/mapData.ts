// Mock map data for development

export const mockMapTiles = {
  ndvi: {
    // Mock NDVI data (Normalized Difference Vegetation Index)
    // Values range from -1 to 1, where higher values indicate more vegetation
    tiles: [
      { x: 0, y: 0, z: 8, value: 0.7, color: '#228B22' }, // High vegetation
      { x: 1, y: 0, z: 8, value: 0.5, color: '#32CD32' }, // Medium vegetation
      { x: 0, y: 1, z: 8, value: 0.3, color: '#9ACD32' }, // Low vegetation
      { x: 1, y: 1, z: 8, value: 0.1, color: '#F0E68C' }, // Very low vegetation
    ],
    legend: {
      title: 'NDVI (Vegetation Health)',
      values: [
        { value: 0.8, color: '#006400', label: 'Very High' },
        { value: 0.6, color: '#228B22', label: 'High' },
        { value: 0.4, color: '#32CD32', label: 'Medium' },
        { value: 0.2, color: '#9ACD32', label: 'Low' },
        { value: 0.0, color: '#F0E68C', label: 'Very Low' },
      ],
    },
  },
  soilMoisture: {
    // Mock soil moisture data
    // Values range from 0 to 1, where 1 is completely saturated
    tiles: [
      { x: 0, y: 0, z: 8, value: 0.8, color: '#4169E1' }, // High moisture
      { x: 1, y: 0, z: 8, value: 0.6, color: '#87CEEB' }, // Medium moisture
      { x: 0, y: 1, z: 8, value: 0.4, color: '#F0E68C' }, // Low moisture
      { x: 1, y: 1, z: 8, value: 0.2, color: '#F4A460' }, // Very low moisture
    ],
    legend: {
      title: 'Soil Moisture',
      values: [
        { value: 0.8, color: '#4169E1', label: 'High' },
        { value: 0.6, color: '#87CEEB', label: 'Medium' },
        { value: 0.4, color: '#F0E68C', label: 'Low' },
        { value: 0.2, color: '#F4A460', label: 'Very Low' },
      ],
    },
  },
  temperature: {
    // Mock temperature data in Celsius
    tiles: [
      { x: 0, y: 0, z: 8, value: 25, color: '#FF6B6B' }, // Warm
      { x: 1, y: 0, z: 8, value: 20, color: '#FFA500' }, // Moderate
      { x: 0, y: 1, z: 8, value: 15, color: '#87CEEB' }, // Cool
      { x: 1, y: 1, z: 8, value: 10, color: '#4169E1' }, // Cold
    ],
    legend: {
      title: 'Temperature (°C)',
      values: [
        { value: 30, color: '#FF0000', label: 'Hot (>30°C)' },
        { value: 25, color: '#FF6B6B', label: 'Warm (25-30°C)' },
        { value: 20, color: '#FFA500', label: 'Moderate (20-25°C)' },
        { value: 15, color: '#87CEEB', label: 'Cool (15-20°C)' },
        { value: 10, color: '#4169E1', label: 'Cold (<15°C)' },
      ],
    },
  },
  precipitation: {
    // Mock precipitation data in mm
    tiles: [
      { x: 0, y: 0, z: 8, value: 15, color: '#0000FF' }, // High precipitation
      { x: 1, y: 0, z: 8, value: 8, color: '#4169E1' }, // Medium precipitation
      { x: 0, y: 1, z: 8, value: 3, color: '#87CEEB' }, // Low precipitation
      { x: 1, y: 1, z: 8, value: 0, color: '#F0E68C' }, // No precipitation
    ],
    legend: {
      title: 'Precipitation (mm)',
      values: [
        { value: 20, color: '#0000FF', label: 'High (>20mm)' },
        { value: 10, color: '#4169E1', label: 'Medium (10-20mm)' },
        { value: 5, color: '#87CEEB', label: 'Low (5-10mm)' },
        { value: 0, color: '#F0E68C', label: 'None (<5mm)' },
      ],
    },
  },
};

export const mockTimeSeriesData = {
  // Mock time series data for a specific parcel
  parcelId: 'parcel-001',
  location: { lat: 36.0, lng: -119.5 },
  data: {
    ndvi: [
      { date: '2025-01-15', value: 0.65 },
      { date: '2025-01-16', value: 0.67 },
      { date: '2025-01-17', value: 0.69 },
      { date: '2025-01-18', value: 0.71 },
      { date: '2025-01-19', value: 0.73 },
      { date: '2025-01-20', value: 0.75 },
      { date: '2025-01-21', value: 0.77 },
      { date: '2025-01-22', value: 0.79 },
      { date: '2025-01-23', value: 0.81 },
      { date: '2025-01-24', value: 0.83 },
    ],
    soilMoisture: [
      { date: '2025-01-15', value: 0.45 },
      { date: '2025-01-16', value: 0.47 },
      { date: '2025-01-17', value: 0.49 },
      { date: '2025-01-18', value: 0.51 },
      { date: '2025-01-19', value: 0.53 },
      { date: '2025-01-20', value: 0.55 },
      { date: '2025-01-21', value: 0.57 },
      { date: '2025-01-22', value: 0.59 },
      { date: '2025-01-23', value: 0.61 },
      { date: '2025-01-24', value: 0.63 },
    ],
    temperature: [
      { date: '2025-01-15', value: 18 },
      { date: '2025-01-16', value: 19 },
      { date: '2025-01-17', value: 20 },
      { date: '2025-01-18', value: 21 },
      { date: '2025-01-19', value: 22 },
      { date: '2025-01-20', value: 23 },
      { date: '2025-01-21', value: 24 },
      { date: '2025-01-22', value: 25 },
      { date: '2025-01-23', value: 26 },
      { date: '2025-01-24', value: 27 },
    ],
    precipitation: [
      { date: '2025-01-15', value: 0 },
      { date: '2025-01-16', value: 2 },
      { date: '2025-01-17', value: 0 },
      { date: '2025-01-18', value: 5 },
      { date: '2025-01-19', value: 0 },
      { date: '2025-01-20', value: 0 },
      { date: '2025-01-21', value: 3 },
      { date: '2025-01-22', value: 0 },
      { date: '2025-01-23', value: 0 },
      { date: '2025-01-24', value: 1 },
    ],
  },
};

export const mockParcels = [
  {
    id: 'parcel-001',
    name: 'North Field',
    location: { lat: 36.1, lng: -119.4 },
    area: 2.5, // hectares
    cropType: 'carrot',
    soilType: 'clay',
    irrigation: 'drip',
    lastHarvest: '2024-12-15',
    nextPlanting: '2025-02-01',
  },
  {
    id: 'parcel-002',
    name: 'South Field',
    location: { lat: 35.9, lng: -119.6 },
    area: 3.2, // hectares
    cropType: 'tomato',
    soilType: 'sandy',
    irrigation: 'sprinkler',
    lastHarvest: '2024-11-20',
    nextPlanting: '2025-01-25',
  },
  {
    id: 'parcel-003',
    name: 'East Field',
    location: { lat: 36.0, lng: -119.3 },
    area: 1.8, // hectares
    cropType: 'lettuce',
    soilType: 'loam',
    irrigation: 'drip',
    lastHarvest: '2024-12-01',
    nextPlanting: '2025-01-30',
  },
  {
    id: 'parcel-004',
    name: 'West Field',
    location: { lat: 36.0, lng: -119.7 },
    area: 2.1, // hectares
    cropType: 'corn',
    soilType: 'clay',
    irrigation: 'flood',
    lastHarvest: '2024-10-15',
    nextPlanting: '2025-03-01',
  },
];

export const mockWeatherData = {
  current: {
    temperature: 22,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NW',
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    condition: 'Partly Cloudy',
  },
  forecast: [
    {
      date: '2025-01-25',
      high: 25,
      low: 15,
      condition: 'Sunny',
      precipitation: 0,
      windSpeed: 10,
    },
    {
      date: '2025-01-26',
      high: 23,
      low: 13,
      condition: 'Partly Cloudy',
      precipitation: 2,
      windSpeed: 8,
    },
    {
      date: '2025-01-27',
      high: 20,
      low: 11,
      condition: 'Rainy',
      precipitation: 8,
      windSpeed: 15,
    },
    {
      date: '2025-01-28',
      high: 18,
      low: 9,
      condition: 'Cloudy',
      precipitation: 3,
      windSpeed: 12,
    },
    {
      date: '2025-01-29',
      high: 21,
      low: 12,
      condition: 'Sunny',
      precipitation: 0,
      windSpeed: 6,
    },
  ],
};

