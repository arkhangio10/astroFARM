// Supabase client configuration

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper to check if we have real credentials
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Create a null client for build time - returns a proxy that handles all method calls
const createNullClient = (): any => {
  const handler: ProxyHandler<any> = {
    get: (target, prop) => {
      // Return nested proxy for chained calls like supabase.auth.getUser()
      if (prop === 'auth' || prop === 'from') {
        return new Proxy({}, handler);
      }
      // Return a function that returns a promise with null data
      return () => Promise.resolve({ data: null, error: new Error('Supabase not configured') });
    }
  };
  return new Proxy({}, handler);
};

// Lazy initialization - client is created only when first accessed
let supabaseClient: any = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (isSupabaseConfigured() && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } else {
    supabaseClient = createNullClient();
  }

  return supabaseClient;
}

// Export a proxy that creates the client on first access
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    const value = client[prop as keyof typeof client];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

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
