-- AstroFarm Database Schema
-- Initial migration for AstroFarm game

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    anon_id TEXT UNIQUE NOT NULL,
    alias TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds (scenarios) table
CREATE TABLE seeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    region TEXT NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    layers_version JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Runs (game sessions) table
CREATE TABLE runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    score_total INTEGER NOT NULL,
    score_yield INTEGER NOT NULL,
    score_water INTEGER NOT NULL,
    score_env INTEGER NOT NULL,
    duration_s INTEGER NOT NULL,
    actions_log JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    tier TEXT NOT NULL,
    meta JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms (multiplayer sessions) table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    seed_id UUID REFERENCES seeds(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room members table
CREATE TABLE room_members (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, player_id)
);

-- Indexes for performance
CREATE INDEX idx_runs_seed_score ON runs(seed_id, score_total DESC);
CREATE INDEX idx_runs_player ON runs(player_id, created_at DESC);
CREATE INDEX idx_achievements_player ON achievements(player_id, created_at DESC);
CREATE INDEX idx_achievements_type ON achievements(type, tier);
CREATE INDEX idx_room_members_room ON room_members(room_id);
CREATE INDEX idx_room_members_player ON room_members(player_id);

-- Row Level Security (RLS) policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

-- Players can only see their own data
CREATE POLICY "Players can view own data" ON players
    FOR SELECT USING (anon_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Players can insert own data" ON players
    FOR INSERT WITH CHECK (anon_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Runs policies
CREATE POLICY "Players can view own runs" ON runs
    FOR SELECT USING (player_id IN (
        SELECT id FROM players WHERE anon_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

CREATE POLICY "Players can insert own runs" ON runs
    FOR INSERT WITH CHECK (player_id IN (
        SELECT id FROM players WHERE anon_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

-- Achievements policies
CREATE POLICY "Players can view own achievements" ON achievements
    FOR SELECT USING (player_id IN (
        SELECT id FROM players WHERE anon_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

CREATE POLICY "Players can insert own achievements" ON achievements
    FOR INSERT WITH CHECK (player_id IN (
        SELECT id FROM players WHERE anon_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

-- Room members policies
CREATE POLICY "Players can view room members" ON room_members
    FOR SELECT USING (player_id IN (
        SELECT id FROM players WHERE anon_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ) OR room_id IN (
        SELECT room_id FROM room_members rm 
        JOIN players p ON rm.player_id = p.id 
        WHERE p.anon_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

CREATE POLICY "Players can join rooms" ON room_members
    FOR INSERT WITH CHECK (player_id IN (
        SELECT id FROM players WHERE anon_id = current_setting('request.jwt.claims', true)::json->>'sub'
    ));

-- Public access for seeds and rooms (read-only)
CREATE POLICY "Public can view seeds" ON seeds FOR SELECT USING (true);
CREATE POLICY "Public can view rooms" ON rooms FOR SELECT USING (true);

-- Insert demo seed
INSERT INTO seeds (code, region, date_start, date_end, layers_version) VALUES (
    'WEEK-2025-01-15',
    'Central Valley, California',
    '2025-01-15',
    '2025-02-15',
    '{
        "ndvi": "MCD13Q1_v061",
        "soil_moisture": "SMAP_L3_v7",
        "temperature": "MOD11A2_v061",
        "precipitation": "IMERG_v06"
    }'::jsonb
);

