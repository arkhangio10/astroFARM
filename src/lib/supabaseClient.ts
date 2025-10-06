// Supabase client configuration

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          anon_id: string;
          alias: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          anon_id: string;
          alias: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          anon_id?: string;
          alias?: string;
          created_at?: string;
        };
      };
      seeds: {
        Row: {
          id: string;
          code: string;
          region: string;
          date_start: string;
          date_end: string;
          layers_version: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          region: string;
          date_start: string;
          date_end: string;
          layers_version: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          region?: string;
          date_start?: string;
          date_end?: string;
          layers_version?: any;
          created_at?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          player_id: string;
          seed_id: string;
          level: number;
          score_total: number;
          score_yield: number;
          score_water: number;
          score_env: number;
          duration_s: number;
          actions_log: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          seed_id: string;
          level: number;
          score_total: number;
          score_yield: number;
          score_water: number;
          score_env: number;
          duration_s: number;
          actions_log: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          seed_id?: string;
          level?: number;
          score_total?: number;
          score_yield?: number;
          score_water?: number;
          score_env?: number;
          duration_s?: number;
          actions_log?: any;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          player_id: string;
          seed_id: string;
          type: string;
          tier: string;
          meta: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          seed_id: string;
          type: string;
          tier: string;
          meta: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          seed_id?: string;
          type?: string;
          tier?: string;
          meta?: any;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          seed_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          seed_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          seed_id?: string;
          created_at?: string;
        };
      };
      room_members: {
        Row: {
          room_id: string;
          player_id: string;
          joined_at: string;
        };
        Insert: {
          room_id: string;
          player_id: string;
          joined_at?: string;
        };
        Update: {
          room_id?: string;
          player_id?: string;
          joined_at?: string;
        };
      };
    };
  };
}
