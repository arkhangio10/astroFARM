// API route to test historical NASA data from 2017 onwards

import { NextRequest, NextResponse } from 'next/server';
import { getNasaClient } from '@/lib/nasaClient';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting NASA Historical Data Test (2017+)...');
    
    const nasaClient = getNasaClient();
    
    // Test 1: Historical wet year 2017 (record rainfall)
    console.log('Test 1: Wet Year 2017...');
    const wetYear2017 = await nasaClient.testDataAccess('NDVI', '2017.03.15', 'h08v05');
    
    // Test 2: Historical drought recovery 2018
    console.log('Test 2: Drought Recovery 2018...');
    const recovery2018 = await nasaClient.testDataAccess('NDVI', '2018.06.15', 'h08v05');
    
    // Test 3: Another wet year 2019
    console.log('Test 3: Wet Year 2019...');
    const wetYear2019 = await nasaClient.testDataAccess('NDVI', '2019.03.15', 'h08v05');
    
    // Test 4: Heat wave year 2020
    console.log('Test 4: Heat Wave 2020...');
    const heatWave2020 = await nasaClient.testDataAccess('TEMPERATURE', '2020.08.15', 'h08v05');
    
    // Test 5: Recent years 2021-2023
    console.log('Test 5: Recent Years 2021-2023...');
    const recentYears = ['2021.06.15', '2022.06.15', '2023.06.15'];
    const recentResults = await Promise.all(
      recentYears.map(async (date) => {
        const result = await nasaClient.testDataAccess('NDVI', date, 'h08v05');
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
    
    // Test 6: All Central Valley tiles for 2017
    console.log('Test 6: Central Valley Tiles 2017...');
    const centralValleyTiles = ['h08v05', 'h08v06', 'h09v05', 'h09v06'];
    const tileResults2017 = await Promise.all(
      centralValleyTiles.map(async (tile) => {
        const result = await nasaClient.testDataAccess('NDVI', '2017.06.15', tile);
        return {
          tile,
          status: result.status,
          success: !result.error,
          hasData: result.data?.feed?.entry?.length > 0,
          entryCount: result.data?.feed?.entry?.length || 0
        };
      })
    );
    
    // Test 7: Get actual historical granule data
    console.log('Test 7: Actual Historical Granule...');
    let historicalGranule = null;
    if (wetYear2017.data?.feed?.entry?.length > 0) {
      const firstEntry = wetYear2017.data.feed.entry[0];
      historicalGranule = {
        title: firstEntry.title,
        timeStart: firstEntry.time_start,
        timeEnd: firstEntry.time_end,
        downloadUrl: firstEntry.links?.find((link: any) => link.rel.includes('data#'))?.href,
        browseUrl: firstEntry.links?.find((link: any) => link.rel.includes('browse#'))?.href,
        granuleSize: firstEntry.granule_size
      };
    }
    
    // Test 8: Different products for 2017
    console.log('Test 8: Different Products 2017...');
    const products2017 = ['NDVI', 'TEMPERATURE', 'SOIL_MOISTURE', 'PRECIPITATION'];
    const productResults2017 = await Promise.all(
      products2017.map(async (product) => {
        const result = await nasaClient.testDataAccess(product, '2017.06.15', 'h08v05');
        return {
          product,
          status: result.status,
          success: !result.error,
          hasData: result.data?.feed?.entry?.length > 0,
          entryCount: result.data?.feed?.entry?.length || 0
        };
      })
    );
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        wetYear2017: {
          status: wetYear2017.status,
          success: !wetYear2017.error,
          hasData: wetYear2017.data?.feed?.entry?.length > 0,
          entryCount: wetYear2017.data?.feed?.entry?.length || 0,
          description: 'Record rainfall year - perfect for flood level'
        },
        recovery2018: {
          status: recovery2018.status,
          success: !recovery2018.error,
          hasData: recovery2018.data?.feed?.entry?.length > 0,
          entryCount: recovery2018.data?.feed?.entry?.length || 0,
          description: 'Drought recovery year - good for normal conditions'
        },
        wetYear2019: {
          status: wetYear2019.status,
          success: !wetYear2019.error,
          hasData: wetYear2019.data?.feed?.entry?.length > 0,
          entryCount: wetYear2019.data?.feed?.entry?.length || 0,
          description: 'Another wet year - good for flood scenarios'
        },
        heatWave2020: {
          status: heatWave2020.status,
          success: !heatWave2020.error,
          hasData: heatWave2020.data?.feed?.entry?.length > 0,
          entryCount: heatWave2020.data?.feed?.entry?.length || 0,
          description: 'Heat wave year - perfect for temperature challenges'
        },
        recentYears: recentResults,
        centralValleyTiles2017: {
          results: tileResults2017,
          availableTiles: tileResults2017.filter(r => r.hasData).map(r => r.tile),
          totalAvailable: tileResults2017.filter(r => r.hasData).length
        },
        historicalGranule,
        products2017: productResults2017
      },
      summary: {
        totalTests: 8,
        passedTests: [
          !wetYear2017.error,
          !recovery2018.error,
          !wetYear2019.error,
          !heatWave2020.error,
          recentResults.every(r => r.success),
          tileResults2017.every(t => t.success),
          !!historicalGranule,
          productResults2017.every(p => p.success)
        ].filter(Boolean).length,
        historicalDataAvailable: {
          wet2017: wetYear2017.data?.feed?.entry?.length > 0,
          recovery2018: recovery2018.data?.feed?.entry?.length > 0,
          wet2019: wetYear2019.data?.feed?.entry?.length > 0,
          heat2020: heatWave2020.data?.feed?.entry?.length > 0,
          recentYears: recentResults.filter(r => r.hasData).length,
          centralValley: tileResults2017.filter(t => t.hasData).length > 0
        }
      },
      gameIntegration: {
        historicalEvents: [
          {
            name: 'Flood Level 2017',
            year: '2017',
            description: 'Record rainfall year - use for maximum flood conditions',
            dataAvailable: wetYear2017.data?.feed?.entry?.length > 0
          },
          {
            name: 'Recovery Level 2018',
            year: '2018',
            description: 'Drought recovery - use for normal growing conditions',
            dataAvailable: recovery2018.data?.feed?.entry?.length > 0
          },
          {
            name: 'Flood Level 2019',
            year: '2019',
            description: 'Another wet year - alternative flood scenario',
            dataAvailable: wetYear2019.data?.feed?.entry?.length > 0
          },
          {
            name: 'Heat Wave Level 2020',
            year: '2020',
            description: 'Extreme heat - use for temperature challenges',
            dataAvailable: heatWave2020.data?.feed?.entry?.length > 0
          }
        ],
        recommendedLevels: [
          'Flood Level 2017: Use real 2017 data for maximum precipitation',
          'Recovery Level 2018: Use real 2018 data for normal conditions',
          'Flood Level 2019: Use real 2019 data for alternative flood scenario',
          'Heat Wave Level 2020: Use real 2020 data for temperature extremes'
        ],
        dataStrategy: {
          approach: 'Use historical data from 2017+ for realistic game scenarios',
          benefits: [
            'Real historical events make game more educational',
            'Players experience actual climate challenges',
            'Data is already processed and available',
            'Covers major climate events in California'
          ],
          implementation: [
            'Download historical granules for key years (2017-2023)',
            'Process and cache data for game levels',
            'Create historical scenarios based on real events',
            'Add educational content about historical events'
          ]
        }
      }
    };
    
    console.log('NASA Historical Data Test (2017+) completed:', results.summary);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('NASA Historical Data Test (2017+) failed:', error);
    
    return NextResponse.json({
      error: 'NASA Historical Data Test (2017+) failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
