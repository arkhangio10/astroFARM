// API request/response types

export interface CreateRunRequest {
  seedCode: string;
  level: number;
  actionsLog: any[];
  clientSummary: {
    scoreTotal: number;
    scoreYield: number;
    scoreWater: number;
    scoreEnv: number;
  };
}

export interface CreateRunResponse {
  scores: {
    total: number;
    yield: number;
    water: number;
    environment: number;
  };
  awarded?: {
    type: string;
    tier: string;
  };
  rankSnapshot: {
    rank: number;
    totalPlayers: number;
  };
}

export interface LeaderboardRequest {
  seed: string;
  room?: string;
  limit?: number;
}

export interface LeaderboardResponse {
  runs: {
    rank: number;
    playerAlias: string;
    scoreTotal: number;
    tier: string;
    durationS: number;
  }[];
  seed: string;
  totalPlayers: number;
}

export interface CreateRoomRequest {
  code: string;
  seedCode: string;
}

export interface CreateRoomResponse {
  room: {
    id: string;
    code: string;
    seedCode: string;
  };
  members: {
    playerAlias: string;
    joinedAt: string;
  }[];
}

export interface JoinRoomRequest {
  code: string;
}

export interface JoinRoomResponse {
  room: {
    id: string;
    code: string;
    seedCode: string;
  };
  members: {
    playerAlias: string;
    joinedAt: string;
  }[];
}

export interface CurrentSeedResponse {
  seed: {
    id: string;
    code: string;
    region: string;
    dateStart: string;
    dateEnd: string;
    cropType: string;
    targets: any;
    weights: any;
  };
  timeRemaining: number;
}

export interface ProfileResponse {
  player: {
    id: string;
    alias: string;
    createdAt: string;
  };
  achievements: {
    type: string;
    tier: string;
    title: string;
    description: string;
    earnedAt: string;
  }[];
  skillRating: number;
  totalRuns: number;
}

