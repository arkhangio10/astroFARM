-- Create multiplayer room updates table
CREATE TABLE IF NOT EXISTS public.room_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL, -- 'action', 'state', 'battle_request', 'battle_result'
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add battle_sessions table for vegetable battles
CREATE TABLE IF NOT EXISTS public.battle_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player1_id UUID NOT NULL REFERENCES public.players(id),
  player2_id UUID NOT NULL REFERENCES public.players(id),
  player1_vegetable JSONB NOT NULL,
  player2_vegetable JSONB NOT NULL,
  battle_state JSONB NOT NULL DEFAULT '{"status": "pending", "rounds": []}',
  winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add player_room_states for tracking each player's state in a room
CREATE TABLE IF NOT EXISTS public.player_room_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  crop_state JSONB NOT NULL,
  resources JSONB NOT NULL,
  avatar_state JSONB,
  last_action JSONB,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

-- Add indexes
CREATE INDEX idx_room_updates_room_id ON public.room_updates(room_id);
CREATE INDEX idx_room_updates_created_at ON public.room_updates(created_at);
CREATE INDEX idx_battle_sessions_room_id ON public.battle_sessions(room_id);
CREATE INDEX idx_player_room_states_room_player ON public.player_room_states(room_id, player_id);

-- Enable RLS
ALTER TABLE public.room_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_room_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_updates
CREATE POLICY "Players can view updates in their rooms" ON public.room_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      WHERE rooms.id = room_id 
      AND auth.uid()::text IN (
        SELECT anon_id FROM public.players 
        WHERE id = ANY(rooms.players)
      )
    )
  );

CREATE POLICY "Players can insert updates in their rooms" ON public.room_updates
  FOR INSERT WITH CHECK (
    auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player_id)
    AND EXISTS (
      SELECT 1 FROM public.rooms 
      WHERE rooms.id = room_id 
      AND player_id = ANY(rooms.players)
    )
  );

-- RLS Policies for battle_sessions
CREATE POLICY "Players can view their battles" ON public.battle_sessions
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT anon_id FROM public.players 
      WHERE id IN (player1_id, player2_id)
    )
  );

CREATE POLICY "Players can create battles" ON public.battle_sessions
  FOR INSERT WITH CHECK (
    auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player1_id)
  );

CREATE POLICY "Players can update their battles" ON public.battle_sessions
  FOR UPDATE USING (
    auth.uid()::text IN (
      SELECT anon_id FROM public.players 
      WHERE id IN (player1_id, player2_id)
    )
  );

-- RLS Policies for player_room_states
CREATE POLICY "Players can view room states" ON public.player_room_states
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rooms 
      WHERE rooms.id = room_id 
      AND auth.uid()::text IN (
        SELECT anon_id FROM public.players 
        WHERE id = ANY(rooms.players)
      )
    )
  );

CREATE POLICY "Players can manage their own room state" ON public.player_room_states
  FOR ALL USING (
    auth.uid()::text = (SELECT anon_id FROM public.players WHERE id = player_id)
  );

-- Trigger for updated_at
CREATE TRIGGER update_player_room_states_updated_at BEFORE UPDATE ON public.player_room_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
