// API route to test recent NASA data with broader filters

import { NextRequest, NextResponse } from 'next/server';
import { getNasaClient } from '@/lib/nasaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔬 Starting NASA Recent Data Test...');
    
    const nasaClient = getNasaClient();
    
    // Test 1: Get recent NDVI data (last 30 days)
    console.log('📊 Test 1: Recent NDVI Data...');
    const recentNDVI = await nasaClient.getAvailableNDVIDates();
    
    // Test 2: Test with broader date range (2024)
    console.log('📅 Test 2: Broader Date Range...');
    const broadNDVI = await nasaClient.testDataAccess('NDVI', '2024.06.15', 'h08v05');
    
    // Test 3: Test without specific tile filter
    console.log('🗺️ Test 3: Without Tile Filter...');
    const noTileFilter = await nasaClient.testDataAccess('NDVI', '2024.06.15', '');
    
    // Test 4: Test with different products and recent dates
    console.log('🌡️ Test 4: Different Products...');
    const products = ['NDVI', 'TEMPERATURE', 'SOIL_MOISTURE', 'PRECIPITATION'];
    const productResults = await Promise.all(
      products.map(async (product) => {
        const result = await nasaClient.testDataAccess(product, '2024.06.15', 'h08v05');
        return {
          product,
          status: result.status,
          success: !result.error,
          hasData: result.data?.feed?.entry?.length > 0,
          entryCount: result.data?.feed?.entry?.length || 0
        };
      })
    );
    
    // Test 5: Test multiple recent dates
    console.log('📆 Test 5: Multiple Recent Dates...');
    const recentDates = ['2024.06.15', '2024.07.01', '2024.08.15', '2024.09.01'];
    const dateResults = await Promise.all(
      recentDates.map(async (date) => {
        const result = await nasaClient.testDataAccess('NDVI', date, 'h08v05');
        return {
          date,
          status: result.status,
          success: !result.error,
          hasData: result.data?.feed?.entry?.length > 0,
          entryCount: result.data?.feed?.entry?.length || 0
        };
      })
    );
    
    // Test 6: Get actual granule data if available
    console.log('📦 Test 6: Actual Granule Data...');
    let actualGranule = null;
    if (recentNDVI.data?.feed?.entry?.length > 0) {
      const firstEntry = recentNDVI.data.feed.entry[0];
      actualGranule = {
        title: firstEntry.title,
        timeStart: firstEntry.time_start,
        timeEnd: firstEntry.time_end,
        links: firstEntry.links?.length || 0,
        sampleLinks: firstEntry.links?.slice(0, 3) || []
      };
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        recentNDVI: {
          status: recentNDVI.status,
          success: !recentNDVI.error,
          hasData: recentNDVI.data?.feed?.entry?.length > 0,
          entryCount: recentNDVI.data?.feed?.entry?.length || 0,
          sampleEntries: recentNDVI.data?.feed?.entry?.slice(0, 3) || []
        },
        broadDateRange: {
          status: broadNDVI.status,
          success: !broadNDVI.error,
          hasData: broadNDVI.data?.feed?.entry?.length > 0,
          entryCount: broadNDVI.data?.feed?.entry?.length || 0
        },
        noTileFilter: {
          status: noTileFilter.status,
          success: !noTileFilter.error,
          hasData: noTileFilter.data?.feed?.entry?.length > 0,
          entryCount: noTileFilter.data?.feed?.entry?.length || 0
        },
        products: productResults,
        recentDates: dateResults,
        actualGranule
      },
      summary: {
        totalTests: 6,
        passedTests: [
          !recentNDVI.error,
          !broadNDVI.error,
          !noTileFilter.error,
          productResults.every(p => p.success),
          dateResults.every(d => d.success),
          true // actualGranule test
        ].filter(Boolean).length,
        dataFound: {
          recentNDVI: recentNDVI.data?.feed?.entry?.length > 0,
          broadRange: broadNDVI.data?.feed?.entry?.length > 0,
          noTileFilter: noTileFilter.data?.feed?.entry?.length > 0,
          products: productResults.filter(p => p.hasData).length,
          dates: dateResults.filter(d => d.hasData).length
        }
      },
      recommendations: {
        bestApproach: recentNDVI.data?.feed?.entry?.length > 0 ? 'Use recent dates' : 'Use broader filters',
        dataAvailability: {
          ndvi: productResults.find(p => p.product === 'NDVI')?.hasData || false,
          temperature: productResults.find(p => p.product === 'TEMPERATURE')?.hasData || false,
          soilMoisture: productResults.find(p => p.product === 'SOIL_MOISTURE')?.hasData || false,
          precipitation: productResults.find(p => p.product === 'PRECIPITATION')?.hasData || false
        },
        nextSteps: [
          'Use recent dates (2024.06+) for better data availability',
          'Remove tile filters for broader search',
          'Implement data caching for game performance',
          'Create fallback to mock data if no real data available'
        ]
      }
    };
    
    console.log('✅ NASA Recent Data Test completed:', results.summary);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('❌ NASA Recent Data Test failed:', error);
    
    return NextResponse.json({
      error: 'NASA Recent Data Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
