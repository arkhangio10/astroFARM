-- Create farms table for storing user farms
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  location_data JSONB, -- Coordenadas y datos adicionales de ubicación
  level INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'active', 'completed', 'paused')),
  score INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  achievements TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  description TEXT,
  seed_code TEXT, -- Código del seed usado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_farms_player_id ON public.farms(player_id);
CREATE INDEX idx_farms_status ON public.farms(status);
CREATE INDEX idx_farms_created_at ON public.farms(created_at DESC);

-- Enable RLS
ALTER TABLE public.farms DISABLE ROW LEVEL SECURITY;

-- Add RLS policies when RLS is enabled
-- CREATE POLICY "Users can view their own farms" ON public.farms
--   FOR SELECT USING (
--     auth.uid() IS NOT NULL AND
--     player_id IN (SELECT id FROM public.players WHERE anon_id = auth.uid()::text)
--   );

-- CREATE POLICY "Users can create their own farms" ON public.farms
--   FOR INSERT WITH CHECK (
--     auth.uid() IS NOT NULL AND
--     player_id IN (SELECT id FROM public.players WHERE anon_id = auth.uid()::text)
--   );

-- CREATE POLICY "Users can update their own farms" ON public.farms
--   FOR UPDATE USING (
--     auth.uid() IS NOT NULL AND
--     player_id IN (SELECT id FROM public.players WHERE anon_id = auth.uid()::text)
--   );

-- CREATE POLICY "Users can delete their own farms" ON public.farms
--   FOR DELETE USING (
--     auth.uid() IS NOT NULL AND
--     player_id IN (SELECT id FROM public.players WHERE anon_id = auth.uid()::text)
--   );

-- Update function for updated_at
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

