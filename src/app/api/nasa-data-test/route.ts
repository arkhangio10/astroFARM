// API route to test specific NASA data retrieval

import { NextRequest, NextResponse } from 'next/server';
import { getNasaClient } from '@/lib/nasaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔬 Starting NASA Data Test...');
    
    const nasaClient = getNasaClient();
    
    // Test 1: Get specific NDVI granule for Central Valley
    console.log('📊 Test 1: NDVI Granule for Central Valley...');
    const ndviGranule = await nasaClient.getDataFile('NDVI', '2024.01.01', 'h08v05');
    
    // Test 2: Get temperature data
    console.log('🌡️ Test 2: Temperature Data...');
    const tempGranule = await nasaClient.getDataFile('TEMPERATURE', '2024.01.01', 'h08v05');
    
    // Test 3: Get soil moisture data
    console.log('💧 Test 3: Soil Moisture Data...');
    const soilGranule = await nasaClient.getDataFile('SOIL_MOISTURE', '2024.01.01', 'h08v05');
    
    // Test 4: Get precipitation data
    console.log('🌧️ Test 4: Precipitation Data...');
    const precipGranule = await nasaClient.getDataFile('PRECIPITATION', '2024.01.01', 'h08v05');
    
    // Test 5: Test different dates
    console.log('📅 Test 5: Different Dates...');
    const recentDate = nasaClient.formatDateForAPI(new Date('2024-06-15'));
    const recentGranule = await nasaClient.getDataFile('NDVI', recentDate, 'h08v05');
    
    // Test 6: Test all Central Valley tiles
    console.log('🗺️ Test 6: All Central Valley Tiles...');
    const tiles = nasaClient.getCentralValleyTiles();
    const tileResults = await Promise.all(
      tiles.map(async (tile) => {
        const result = await nasaClient.testDataAccess('NDVI', '2024.01.01', tile);
        return { tile, success: !result.error, status: result.status };
      })
    );
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        ndviGranule: {
          status: ndviGranule.status,
          success: !ndviGranule.error,
          error: ndviGranule.error,
          hasData: !!ndviGranule.data,
          dataStructure: ndviGranule.data ? Object.keys(ndviGranule.data) : null,
          sampleData: ndviGranule.data ? JSON.stringify(ndviGranule.data).substring(0, 500) + '...' : null
        },
        temperatureGranule: {
          status: tempGranule.status,
          success: !tempGranule.error,
          error: tempGranule.error,
          hasData: !!tempGranule.data,
          dataStructure: tempGranule.data ? Object.keys(tempGranule.data) : null
        },
        soilMoistureGranule: {
          status: soilGranule.status,
          success: !soilGranule.error,
          error: soilGranule.error,
          hasData: !!soilGranule.data,
          dataStructure: soilGranule.data ? Object.keys(soilGranule.data) : null
        },
        precipitationGranule: {
          status: precipGranule.status,
          success: !precipGranule.error,
          error: precipGranule.error,
          hasData: !!precipGranule.data,
          dataStructure: precipGranule.data ? Object.keys(precipGranule.data) : null
        },
        recentDate: {
          date: recentDate,
          status: recentGranule.status,
          success: !recentGranule.error,
          error: recentGranule.error,
          hasData: !!recentGranule.data
        },
        allTiles: {
          tiles: tileResults,
          successCount: tileResults.filter(t => t.success).length,
          totalTiles: tiles.length
        }
      },
      summary: {
        totalTests: 6,
        passedTests: [
          !ndviGranule.error,
          !tempGranule.error,
          !soilGranule.error,
          !precipGranule.error,
          !recentGranule.error,
          tileResults.every(t => t.success)
        ].filter(Boolean).length,
        dataAvailable: {
          ndvi: !!ndviGranule.data,
          temperature: !!tempGranule.data,
          soilMoisture: !!soilGranule.data,
          precipitation: !!precipGranule.data
        }
      },
      gameIntegration: {
        centralValleyTiles: tiles,
        availableProducts: ['NDVI', 'TEMPERATURE', 'SOIL_MOISTURE', 'PRECIPITATION'],
        dataFormat: 'NASA CMR Granules with download links',
        nextSteps: [
          'Parse granule metadata for game values',
          'Extract download URLs for data files',
          'Implement data processing functions',
          'Create game data pipeline'
        ]
      }
    };
    
    console.log('✅ NASA Data Test completed:', results.summary);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ NASA Data Test failed:', error);
    
    return NextResponse.json({
      error: 'NASA Data Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
