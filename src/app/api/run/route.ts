// API route for submitting game runs

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { simulate } from '@/lib/engine';
import { calculateAchievements } from '@/lib/achievements';
import { CreateRunRequest, CreateRunResponse } from '@/types/api';
import { z } from 'zod';

// Validation schema
const CreateRunSchema = z.object({
  seedCode: z.string(),
  level: z.number().min(1).max(5),
  actionsLog: z.array(z.any()),
  clientSummary: z.object({
    scoreTotal: z.number(),
    scoreYield: z.number(),
    scoreWater: z.number(),
    scoreEnv: z.number(),
  }),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateRunSchema.parse(body);
    
    // Get or create player
    const playerId = await getOrCreatePlayer();
    if (!playerId) {
      return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }
    
    // Get seed data
    const { data: seed, error: seedError } = await supabase
      .from('seeds')
      .select('*')
      .eq('code', validatedData.seedCode)
      .single();
    
    if (seedError || !seed) {
      return NextResponse.json({ error: 'Seed not found' }, { status: 404 });
    }
    
    // Convert seed to game format
    const gameSeed = {
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
      datasets: seed.layers_version,
      notes: 'Server-side simulation',
    };
    
    // Simulate game with server-side engine
    const initialResources = {
      water: 100,
      fertilizer: 50,
      money: 200,
      seeds: 20,
      solarEnergy: 100,
    };
    
    // TODO: Get actual NASA data for the simulation period
    // For now, we'll pass undefined and let the engine use fallback data
    const result = simulate(validatedData.actionsLog, gameSeed, initialResources, 30, undefined);
    
    // Calculate achievements
    const newAchievements = calculateAchievements(
      result.finalState,
      result.scores,
      [] // No previous achievements for now
    );
    
    // Save run to database
    const { data: run, error: runError } = await supabase
      .from('runs')
      .insert({
        player_id: playerId,
        seed_id: seed.id,
        level: validatedData.level,
        score_total: result.scores.total,
        score_yield: result.scores.yield,
        score_water: result.scores.water,
        score_env: result.scores.environment,
        duration_s: 0, // Could calculate from actions
        actions_log: validatedData.actionsLog,
      })
      .select()
      .single();
    
    if (runError) {
      console.error('Error saving run:', runError);
      return NextResponse.json({ error: 'Failed to save run' }, { status: 500 });
    }
    
    // Save achievements
    if (newAchievements.length > 0) {
      const achievementInserts = newAchievements.map(achievement => ({
        player_id: playerId,
        seed_id: seed.id,
        type: achievement.type,
        tier: achievement.tier,
        meta: achievement.metadata,
      }));
      
      await supabase
        .from('achievements')
        .insert(achievementInserts);
    }
    
    // Get ranking
    const { data: ranking } = await supabase
      .from('runs')
      .select('id, score_total')
      .eq('seed_id', seed.id)
      .order('score_total', { ascending: false });
    
    const playerRank = (ranking?.findIndex(r => r.id === run.id) ?? -1) + 1;
    const totalPlayers = ranking?.length || 1;
    
    // Prepare response
    const response: CreateRunResponse = {
      scores: {
        total: result.scores.total,
        yield: result.scores.yield,
        water: result.scores.water,
        environment: result.scores.environment,
      },
      awarded: newAchievements.length > 0 ? {
        type: newAchievements[0].type,
        tier: newAchievements[0].tier,
      } : undefined,
      rankSnapshot: {
        rank: playerRank,
        totalPlayers,
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in run API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getOrCreatePlayer(): Promise<string | null> {
  try {
    // For MVP, create anonymous player
    // In production, this would use proper authentication
    const anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alias = `Player-${Math.floor(Math.random() * 1000)}`;
    
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        anon_id: anonId,
        alias,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating player:', error);
      return null;
    }
    
    return player.id;
  } catch (error) {
    console.error('Error in getOrCreatePlayer:', error);
    return null;
  }
}
