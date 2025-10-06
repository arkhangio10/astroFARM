// API route for current seed

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { CurrentSeedResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the current weekly seed
    // For MVP, we'll use a hardcoded seed
    const currentSeedCode = 'WEEK-2025-01-15';
    
    const { data: seed, error } = await supabase
      .from('seeds')
      .select('*')
      .eq('code', currentSeedCode)
      .single();
    
    if (error || !seed) {
      return NextResponse.json({ error: 'Current seed not found' }, { status: 404 });
    }
    
    // Calculate time remaining (simplified)
    const now = new Date();
    const endDate = new Date(seed.date_end);
    const timeRemaining = Math.max(0, endDate.getTime() - now.getTime());
    
    const response: CurrentSeedResponse = {
      seed: {
        id: seed.id,
        code: seed.code,
        region: seed.region,
        dateStart: seed.date_start,
        dateEnd: seed.date_end,
        cropType: 'carrot', // Default for MVP
        targets: {
          minHumidity: 0.6,
          minNDVI: 0.4,
          maxTemperature: 35,
          minYield: 80,
        },
        weights: {
          yield: 0.4,
          water: 0.3,
          environment: 0.3,
        },
      },
      timeRemaining: Math.floor(timeRemaining / 1000), // seconds
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in current seed API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
