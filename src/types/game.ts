// Core game types for AstroFarm

export interface GameState {
  currentLevel: number;
  currentDay: number;
  totalDays: number;
  resources: Resources;
  actions: Action[];
  scores: Scores;
  achievements: Achievement[];
  isGameComplete: boolean;
  environmentData?: {
    ndvi: number;
    soilMoisture: number;
    temperature: number;
    precipitation: number;
    lastUpdate: string;
    dataQuality: 'good' | 'moderate' | 'poor';
  };
}

export interface Resources {
  water: number;
  fertilizer: number;
  money: number;
  seeds: number;
  solarEnergy: number;
}

export interface Action {
  id: string;
  type: ActionType;
  payload: any;
  day: number;
  cost: Resources;
}

export type ActionType = 
  | 'WATER'
  | 'FERTILIZE'
  | 'PLANT'
  | 'HARVEST'
  | 'WAIT'
  | 'SOLAR_CHARGE'
  | 'IRRIGATE';

export interface Scores {
  total: number;
  yield: number;
  water: number;
  environment: number;
  efficiency: number;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  tier: AchievementTier;
  title: string;
  description: string;
  earnedAt: Date;
  metadata: Record<string, any>;
}

export type AchievementType = 'SUPER_CARROT' | 'WATER_SAVER' | 'YIELD_MASTER' | 'ENVIRONMENTALIST';

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Seed {
  id: string;
  code: string;
  region: string;
  dateStart: string;
  dateEnd: string;
  cropType: string;
  targets: GameTargets;
  weights: ScoreWeights;
  datasets: DatasetConfig;
  notes: string;
}

export interface GameTargets {
  minHumidity: number;
  minNDVI: number;
  maxTemperature: number;
  minYield: number;
}

export interface ScoreWeights {
  yield: number;
  water: number;
  environment: number;
}

export interface DatasetConfig {
  ndvi: string;
  soilMoisture: string;
  temperature: string;
  precipitation: string;
  cloudMask: string;
}

export interface DatasetMeta {
  name: string;
  resolution: number;
  latency: string;
  source: string;
  limitations: string[];
}

export interface TipRule {
  id: string;
  when: (state: GameState) => boolean;
  message: (context: TipContext) => string;
  severity: 'info' | 'warning' | 'edu';
  cooldownTurns?: number;
  tags?: string[];
}

export interface TipContext {
  state: GameState;
  currentData: any;
  limitations: string[];
}

export interface Player {
  id: string;
  anonId: string;
  alias: string;
  createdAt: Date;
}

export interface Run {
  id: string;
  playerId: string;
  seedId: string;
  level: number;
  scoreTotal: number;
  scoreYield: number;
  scoreWater: number;
  scoreEnv: number;
  durationS: number;
  actionsLog: Action[];
  createdAt: Date;
}

export interface Room {
  id: string;
  code: string;
  seedId: string;
  createdAt: Date;
}

export interface RoomMember {
  roomId: string;
  playerId: string;
  joinedAt: Date;
}

// Location system types
export interface Location {
  id: string;
  name: string;
  type: 'arid' | 'temperate' | 'tropical';
  description: string;
  climate: ClimateData;
  visualTheme: VisualTheme;
  nasaDataSources: NasaDataSource[];
  challenges: string[];
  advantages: string[];
}

export interface ClimateData {
  averageTemperature: number;
  averageHumidity: number;
  averagePrecipitation: number;
  solarRadiation: number;
  soilType: string;
  growingSeason: string;
}

export interface VisualTheme {
  skyColor: string;
  groundTexture: string;
  vegetationColor: string;
  weatherEffects: string[];
  particleEffects: string[];
}

export interface NasaDataSource {
  product: string;
  resolution: string;
  frequency: string;
  coverage: string;
  limitations: string[];
}

// Super Vegetable system types
export interface SuperVegetable {
  id: string;
  playerId: string;
  name: string;
  baseType: 'carrot' | 'tomato' | 'lettuce' | 'corn';
  characteristics: VegetableCharacteristics;
  stats: VegetableStats;
  abilities: VegetableAbility[];
  appearance: VegetableAppearance;
  createdAt: Date;
  lastUpdated: Date;
}

export interface VegetableCharacteristics {
  size: 'small' | 'medium' | 'large' | 'giant';
  color: string;
  shape: string;
  texture: string;
  specialFeatures: string[];
}

export interface VegetableStats {
  health: number;
  strength: number;
  speed: number;
  resistance: number;
  growthRate: number;
  waterEfficiency: number;
  solarEfficiency: number;
}

export interface VegetableAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'special';
  cooldown?: number;
  effect: string;
}

export interface VegetableAppearance {
  model: string;
  texture: string;
  animations: string[];
  effects: string[];
  size: number;
}

// Battle system types
export interface Battle {
  id: string;
  participants: BattleParticipant[];
  status: 'waiting' | 'active' | 'completed';
  winner?: string;
  rounds: BattleRound[];
  createdAt: Date;
  completedAt?: Date;
}

export interface BattleParticipant {
  playerId: string;
  vegetableId: string;
  stats: VegetableStats;
  abilities: VegetableAbility[];
}

export interface BattleRound {
  roundNumber: number;
  actions: BattleAction[];
  results: BattleResult[];
  winner?: string;
}

export interface BattleAction {
  playerId: string;
  actionType: 'attack' | 'defend' | 'ability' | 'special';
  target?: string;
  abilityId?: string;
  power: number;
}

export interface BattleResult {
  attacker: string;
  defender: string;
  damage: number;
  effect: string;
  statusChange?: string;
}

// Real-time cycle system
export interface GameCycle {
  id: string;
  playerId: string;
  locationId: string;
  currentDay: number;
  totalDays: number;
  isActive: boolean;
  startTime: Date;
  lastUpdate: Date;
  timeMultiplier: number; // 1 day = 40 minutes
}

export interface CycleData {
  day: number;
  weather: WeatherData;
  nasaData: NasaDataPoint[];
  events: GameEvent[];
  recommendations: string[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  cloudCover: number;
  solarRadiation: number;
}

export interface NasaDataPoint {
  timestamp: Date;
  product: string;
  value: number;
  quality: 'good' | 'fair' | 'poor';
  source: string;
}

export interface GameEvent {
  id: string;
  type: 'weather' | 'disease' | 'pest' | 'opportunity' | 'challenge';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  effects: EventEffect[];
  duration: number;
}

export interface EventEffect {
  resource: keyof Resources;
  change: number;
  duration: number;
}

