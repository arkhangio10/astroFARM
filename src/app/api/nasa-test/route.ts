// API route to test NASA Earthdata connection

import { NextRequest, NextResponse } from 'next/server';
import { getNasaClient } from '@/lib/nasaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting NASA API test...');
    
    const nasaClient = getNasaClient();
    
    // Test 1: Basic connection
    console.log('📡 Test 1: Basic connection...');
    const connectionTest = await nasaClient.testConnection();
    
    // Test 2: Available dates
    console.log('📅 Test 2: Available dates...');
    const datesTest = await nasaClient.getAvailableNDVIDates();
    
    // Test 3: Central Valley tiles
    console.log('🗺️ Test 3: Central Valley tiles...');
    const tiles = nasaClient.getCentralValleyTiles();
    
    // Test 4: Data access for recent date
    console.log('📊 Test 4: Data access test...');
    const recentDate = nasaClient.formatDateForAPI(new Date('2024-01-01'));
    const dataAccessTest = await nasaClient.testDataAccess('NDVI', recentDate, tiles[0]);
    
    // Test 5: Multiple products test
    console.log('🔬 Test 5: Multiple products test...');
    const productsTest = await Promise.all([
      nasaClient.testDataAccess('NDVI', recentDate, tiles[0]),
      nasaClient.testDataAccess('TEMPERATURE', recentDate, tiles[0]),
      nasaClient.testDataAccess('SOIL_MOISTURE', recentDate, tiles[0]),
      nasaClient.testDataAccess('PRECIPITATION', recentDate, tiles[0])
    ]);
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        connection: {
          status: connectionTest.status,
          success: !connectionTest.error,
          error: connectionTest.error,
          dataType: typeof connectionTest.data,
          hasData: !!connectionTest.data
        },
        dates: {
          status: datesTest.status,
          success: !datesTest.error,
          error: datesTest.error,
          dataType: typeof datesTest.data,
          hasData: !!datesTest.data
        },
        tiles: {
          success: true,
          tiles: tiles,
          count: tiles.length,
          description: 'MODIS tiles covering Central Valley, California'
        },
        dataAccess: {
          status: dataAccessTest.status,
          success: !dataAccessTest.error,
          error: dataAccessTest.error,
          product: 'NDVI',
          date: recentDate,
          tile: tiles[0],
          hasData: !!dataAccessTest.data
        },
        products: {
          success: productsTest.every(test => !test.error),
          results: productsTest.map((test, index) => ({
            product: ['NDVI', 'TEMPERATURE', 'SOIL_MOISTURE', 'PRECIPITATION'][index],
            status: test.status,
            success: !test.error,
            error: test.error,
            hasData: !!test.data
          }))
        }
      },
      summary: {
        totalTests: 5,
        passedTests: [
          connectionTest.status > 0,
          datesTest.status > 0,
          true, // tiles test
          dataAccessTest.status > 0,
          productsTest.every(test => test.status > 0)
        ].filter(Boolean).length,
        nasaTokenConfigured: !!process.env.NASA_EARTHDATA_TOKEN,
        tokenLength: process.env.NASA_EARTHDATA_TOKEN?.length || 0,
        environment: process.env.NODE_ENV
      },
      nasaInfo: {
        baseUrl: 'https://cmr.earthdata.nasa.gov/search',
        authorizedApplications: [
          'NASA CMR (Common Metadata Repository)',
          'LAADS DAAC API',
          'GES DISC API',
          'LP DAAC Data Pool'
        ],
        datasets: {
          NDVI: 'MODIS MOD13Q1 (250m, 16-day)',
          TEMPERATURE: 'MODIS MOD11A2 (1km, 8-day)',
          SOIL_MOISTURE: 'SMAP SPL3SMP_E (1km, daily)',
          PRECIPITATION: 'GPM 3IMERGDF (0.1°, 30-min)'
        }
      }
    };
    
    console.log('✅ NASA API test completed:', results.summary);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ NASA API test failed:', error);
    
    return NextResponse.json({
      error: 'NASA API test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      nasaTokenConfigured: !!process.env.NASA_EARTHDATA_TOKEN,
      tokenLength: process.env.NASA_EARTHDATA_TOKEN?.length || 0
    }, { status: 500 });
  }
}
