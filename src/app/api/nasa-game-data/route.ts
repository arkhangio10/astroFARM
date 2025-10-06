// API route to fetch real NASA data for the game
import { NextRequest, NextResponse } from 'next/server';
import { nasaDataFetcher } from '@/lib/nasaDataFetcher';

export const dynamic = 'force-dynamic';

// Check if NASA is configured
function isNASAConfigured() {
  const token = process.env.NASA_EARTHDATA_TOKEN;
  const username = process.env.NASA_EARTHDATA_USERNAME;
  const password = process.env.NASA_EARTHDATA_PASSWORD;
  return Boolean(token || (username && password));
}

export async function GET(request: NextRequest) {
  // During build time, return mock data
  if (!isNASAConfigured()) {
    return NextResponse.json({
      success: true,
      data: {
        ndvi: 0.65,
        soilMoisture: 0.25,
        temperature: 22,
        precipitation: 0,
        lastUpdate: new Date().toISOString(),
        dataQuality: 'mock',
        metadata: { source: 'build-time-mock' }
      },
      location: { lat: 36.7378, lon: -119.7871 },
      requestedDate: new Date().toISOString()
    }, {
      headers: { 'X-Build-Time': 'true' }
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '36.7378');
    const lon = parseFloat(searchParams.get('lon') || '-119.7871');
    const dateStr = searchParams.get('date');
    
    // Use provided date or current date
    const date = dateStr ? new Date(dateStr) : new Date();
    
    console.log(`🛰️ Fetching NASA data for: ${lat}, ${lon} on ${date.toISOString()}`);
    
    // Fetch real NASA data
    const data = await nasaDataFetcher.getRealNASAData(lat, lon, date);
    
    // Return the data
    return NextResponse.json({
      success: true,
      data: {
        ndvi: data.ndvi,
        soilMoisture: data.soilMoisture,
        temperature: data.temperature,
        precipitation: data.precipitation,
        lastUpdate: data.timestamp.toISOString(),
        dataQuality: data.quality,
        metadata: data.metadata
      },
      location: { lat, lon },
      requestedDate: date.toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in NASA game data API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch NASA data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // During build time, return mock data
  if (!isNASAConfigured()) {
    return NextResponse.json({
      success: true,
      data: [{
        date: new Date().toISOString(),
        ndvi: 0.65,
        soilMoisture: 0.25,
        temperature: 22,
        precipitation: 0,
        quality: 'mock'
      }],
      location: { lat: 36.7378, lon: -119.7871 },
      period: { startDate: new Date().toISOString(), endDate: new Date().toISOString() },
      count: 1
    }, {
      headers: { 'X-Build-Time': 'true' }
    });
  }

  try {
    const body = await request.json();
    const { lat, lon, startDate, endDate } = body;
    
    if (!lat || !lon || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: lat, lon, startDate, endDate'
      }, { status: 400 });
    }
    
    console.log(`📊 Fetching historical NASA data from ${startDate} to ${endDate}`);
    
    // Fetch historical data
    const historicalData = await nasaDataFetcher.getHistoricalData(
      lat,
      lon,
      new Date(startDate),
      new Date(endDate)
    );
    
    return NextResponse.json({
      success: true,
      data: historicalData.map(d => ({
        date: d.timestamp.toISOString(),
        ndvi: d.ndvi,
        soilMoisture: d.soilMoisture,
        temperature: d.temperature,
        precipitation: d.precipitation,
        quality: d.quality
      })),
      location: { lat, lon },
      period: { startDate, endDate },
      count: historicalData.length
    });
    
  } catch (error) {
    console.error('❌ Error in NASA historical data API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch historical NASA data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
