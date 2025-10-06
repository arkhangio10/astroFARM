// API route for leaderboards

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { LeaderboardRequest, LeaderboardResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seed = searchParams.get('seed');
    const room = searchParams.get('room');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!seed) {
      return NextResponse.json({ error: 'Seed parameter required' }, { status: 400 });
    }
    
    // Get seed ID
    const { data: seedData, error: seedError } = await supabase
      .from('seeds')
      .select('id')
      .eq('code', seed)
      .single();
    
    if (seedError || !seedData) {
      return NextResponse.json({ error: 'Seed not found' }, { status: 404 });
    }
    
    // Build query
    let query = supabase
      .from('runs')
      .select(`
        id,
        score_total,
        duration_s,
        created_at,
        players!inner(alias)
      `)
      .eq('seed_id', seedData.id)
      .order('score_total', { ascending: false })
      .limit(limit);
    
    // If room is specified, filter by room members
    if (room) {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', room)
        .single();
      
      if (roomError || !roomData) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      
      // Get room members
      const { data: members, error: membersError } = await supabase
        .from('room_members')
        .select('player_id')
        .eq('room_id', roomData.id);
      
      if (membersError || !members) {
        return NextResponse.json({ error: 'Failed to get room members' }, { status: 500 });
      }
      
      const playerIds = members.map(m => m.player_id);
      query = query.in('player_id', playerIds);
    }
    
    const { data: runs, error: runsError } = await query;
    
    if (runsError) {
      console.error('Error fetching runs:', runsError);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
    
    // Get total player count
    const { count: totalPlayers } = await supabase
      .from('runs')
      .select('*', { count: 'exact', head: true })
      .eq('seed_id', seedData.id);
    
    // Format response
    const leaderboardRuns = runs?.map((run, index) => ({
      rank: index + 1,
      playerAlias: (run as any).players?.alias || 'Anonymous',
      scoreTotal: run.score_total,
      tier: getTierFromScore(run.score_total),
      durationS: run.duration_s,
    })) || [];
    
    const response: LeaderboardResponse = {
      runs: leaderboardRuns,
      seed,
      totalPlayers: totalPlayers || 0,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getTierFromScore(score: number): string {
  if (score >= 92) return 'PLATINUM';
  if (score >= 85) return 'GOLD';
  if (score >= 75) return 'SILVER';
  if (score >= 60) return 'BRONZE';
  return 'NONE';
}
