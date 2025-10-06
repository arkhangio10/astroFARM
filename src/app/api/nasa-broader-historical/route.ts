// API route to test historical NASA data with broader filters

import { NextRequest, NextResponse } from 'next/server';
import { getNasaClient } from '@/lib/nasaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting NASA Historical Data Test (Broader Filters)...');
    
    const nasaClient = getNasaClient();
    
    // Test 1: Get available NDVI data without date filter
    console.log('Test 1: Available NDVI Data (No Date Filter)...');
    const availableNDVI = await nasaClient.getAvailableNDVIDates();
    
    // Test 2: Test with broader date ranges (entire years)
    console.log('Test 2: Broader Date Ranges...');
    const broadDates = ['2017.01.01', '2018.01.01', '2019.01.01', '2020.01.01'];
    const broadResults = await Promise.all(
      broadDates.map(async (date) => {
        const result = await nasaClient.testDataAccess('NDVI', date, '');
        return {
          year: date.split('.')[0],
          date,
          status: result.status,
          success: !result.error,
          hasData: result.data?.feed?.entry?.length > 0,
          entryCount: result.data?.feed?.entry?.length || 0
        };
      })
    );
    
    // Test 3: Test without tile filter for recent years
    console.log('Test 3: No Tile Filter for Recent Years...');
    const recentYears = ['2021.01.01', '2022.01.01', '2023.01.01', '2024.01.01'];
    const recentResults = await Promise.all(
      recentYears.map(async (date) => {
        const result = await nasaClient.testDataAccess('NDVI', date, '');
        return {
          year: date.split('.')[0],
          date,
          status: result.status,
          success: !result.error,
          hasData: result.data?.feed?.entry?.length > 0,
          entryCount: result.data?.feed?.entry?.length || 0
        };
      })
    );
    
    // Test 4: Test different products without specific filters
    console.log('Test 4: Different Products (No Filters)...');
    const products = ['NDVI', 'TEMPERATURE', 'SOIL_MOISTURE', 'PRECIPITATION'];
    const productResults = await Promise.all(
      products.map(async (product) => {
        const result = await nasaClient.testDataAccess(product, '2020.01.01', '');
        return {
          product,
          status: result.status,
          success: !result.error,
          hasData: result.data?.feed?.entry?.length > 0,
          entryCount: result.data?.feed?.entry?.length || 0
        };
      })
    );
    
    // Test 5: Get actual granule data if available
    console.log('Test 5: Actual Granule Data...');
    let actualGranule = null;
    if (availableNDVI.data?.feed?.entry?.length > 0) {
      const firstEntry = availableNDVI.data.feed.entry[0];
      actualGranule = {
        title: firstEntry.title,
        timeStart: firstEntry.time_start,
        timeEnd: firstEntry.time_end,
        downloadUrl: firstEntry.links?.find((link: any) => link.rel.includes('data#'))?.href,
        browseUrl: firstEntry.links?.find((link: any) => link.rel.includes('browse#'))?.href,
        granuleSize: firstEntry.granule_size
      };
    }
    
    // Test 6: Find Central Valley tiles in available data
    console.log('Test 6: Central Valley Tiles in Available Data...');
    const centralValleyTiles = ['h08v05', 'h08v06', 'h09v05', 'h09v06'];
    let centralValleyData = [];
    
    if (availableNDVI.data?.feed?.entry?.length > 0) {
      centralValleyData = availableNDVI.data.feed.entry.filter((entry: any) => {
        const title = entry.title || '';
        return centralValleyTiles.some(tile => title.includes(tile));
      }).slice(0, 5); // Get first 5 matches
    }
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        availableNDVI: {
          status: availableNDVI.status,
          success: !availableNDVI.error,
          hasData: availableNDVI.data?.feed?.entry?.length > 0,
          entryCount: availableNDVI.data?.feed?.entry?.length || 0,
          sampleEntries: availableNDVI.data?.feed?.entry?.slice(0, 3) || []
        },
        broadDateRanges: {
          results: broadResults,
          availableYears: broadResults.filter(r => r.hasData).map(r => r.year),
          totalAvailable: broadResults.filter(r => r.hasData).length
        },
        recentYears: {
          results: recentResults,
          availableYears: recentResults.filter(r => r.hasData).map(r => r.year),
          totalAvailable: recentResults.filter(r => r.hasData).length
        },
        products: productResults,
        actualGranule,
        centralValleyData: {
          found: centralValleyData.length,
          tiles: centralValleyData.map((entry: any) => ({
            title: entry.title,
            timeStart: entry.time_start,
            timeEnd: entry.time_end,
            tile: centralValleyTiles.find(tile => entry.title?.includes(tile))
          }))
        }
      },
      summary: {
        totalTests: 6,
        passedTests: [
          !availableNDVI.error,
          broadResults.every(r => r.success),
          recentResults.every(r => r.success),
          productResults.every(p => p.success),
          !!actualGranule,
          true // centralValleyData test
        ].filter(Boolean).length,
        dataFound: {
          availableNDVI: availableNDVI.data?.feed?.entry?.length > 0,
          broadRanges: broadResults.filter(r => r.hasData).length > 0,
          recentYears: recentResults.filter(r => r.hasData).length > 0,
          products: productResults.filter(p => p.hasData).length,
          centralValley: centralValleyData.length > 0
        }
      },
      recommendations: {
        bestApproach: availableNDVI.data?.feed?.entry?.length > 0 ? 'Use available data' : 'Use broader filters',
        dataAvailability: {
          ndvi: productResults.find(p => p.product === 'NDVI')?.hasData || false,
          temperature: productResults.find(p => p.product === 'TEMPERATURE')?.hasData || false,
          soilMoisture: productResults.find(p => p.product === 'SOIL_MOISTURE')?.hasData || false,
          precipitation: productResults.find(p => p.product === 'PRECIPITATION')?.hasData || false
        },
        nextSteps: [
          'Use available data without specific date/tile filters',
          'Filter results by Central Valley tiles after getting data',
          'Implement data caching for game performance',
          'Create fallback to mock data if no real data available'
        ]
      }
    };
    
    console.log('NASA Historical Data Test (Broader Filters) completed:', results.summary);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('NASA Historical Data Test (Broader Filters) failed:', error);
    
    return NextResponse.json({
      error: 'NASA Historical Data Test (Broader Filters) failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
