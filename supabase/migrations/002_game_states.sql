-- Create game_states table for saving game progress
CREATE TABLE IF NOT EXISTS public.game_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  seed_id UUID NOT NULL REFERENCES public.seeds(id) ON DELETE CASCADE,
  resources JSONB NOT NULL DEFAULT '{"water": 100, "fertilizer": 100, "pesticide": 100}',
  crop_state JSONB NOT NULL DEFAULT '{"growth": 0, "health": 100, "moisture": 50, "temperature": 22, "nutrients": 75}',
  game_time INTEGER NOT NULL DEFAULT 0,
  avatar_state JSONB,
  actions_log JSONB[] DEFAULT '{}',
  nasa_data JSONB,
  completed_missions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, seed_id)
);

-- Create actions table for tracking player actions
CREATE TABLE IF NOT EXISTS public.actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  seed_id UUID NOT NULL REFERENCES public.seeds(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  payload JSONB,
  game_time INTEGER NOT NULL,
  nasa_data_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_game_states_player_seed ON public.game_states(player_id, seed_id);
CREATE INDEX idx_actions_player_seed ON public.actions(player_id, seed_id);
CREATE INDEX idx_actions_created_at ON public.actions(created_at);

-- Add RLS policies for game_states
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own game states" ON public.game_states
  FOR SELECT USING (auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player_id));

CREATE POLICY "Players can insert their own game states" ON public.game_states
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player_id));

CREATE POLICY "Players can update their own game states" ON public.game_states
  FOR UPDATE USING (auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player_id));

-- Add RLS policies for actions
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their own actions" ON public.actions
  FOR SELECT USING (auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player_id));

CREATE POLICY "Players can insert their own actions" ON public.actions
  FOR INSERT WITH CHECK (auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player_id));

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON public.game_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
