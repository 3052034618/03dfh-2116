export type SurveyStatus = 'not_sent' | 'sent' | 'partial' | 'completed';

export type FinalRolePlan = AssignmentPair;

// ========== 剧本角色库 ==========
export interface Script {
  id: string;
  name: string;
  cover: string;
  genre: string[];
  playerCount: number;
  minPlayers: number;
  maxPlayers: number;
  duration: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  roles: Role[];
  relations: RoleRelation[];
  createdAt: string;
}

export interface Role {
  id: string;
  scriptId: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female' | 'any';
  difficulty: 1 | 2 | 3 | 4 | 5;
  emotionLevel: 1 | 2 | 3 | 4 | 5;
  deductionLevel: 1 | 2 | 3 | 4 | 5;
  beginnerFriendly: boolean;
  hostType: boolean;
  tags: string[];
  description: string;
}

export interface RoleRelation {
  roleA: string;
  roleB: string;
  type: 'lover' | 'enemy' | 'family' | 'partner' | 'secret';
  intensity: 1 | 2 | 3;
}

// ========== 预约车次 ==========
export interface Schedule {
  id: string;
  scriptId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  dmId: string;
  status: 'pending' | 'ready' | 'playing' | 'finished' | 'cancelled';
  players: SchedulePlayer[];
  surveyStatus: 'not_sent' | 'sent' | 'partial' | 'completed';
  createdAt: string;
}

export interface SchedulePlayer {
  playerId: string;
  isNew: boolean;
  acquaintanceWith: string[];
  relationType?: 'lover' | 'friend' | 'family' | 'colleague' | 'stranger';
  surveyResponse?: PlayerSurvey;
  finalRoleId?: string;
}

export interface PlayerSurvey {
  submittedAt: string;
  preferredGenres: string[];
  tabooContent: string[];
  socialStyle: 'social' | 'normal' | 'introvert';
  willingToLead: boolean;
  genderPreference: 'match' | 'cross' | 'any';
  extraNotes: string;
}

export interface PastAssignment {
  scheduleId: string;
  scriptId: string;
  scriptName: string;
  roleId: string;
  roleName: string;
  date: string;
  satisfactionScore: 1 | 2 | 3 | 4 | 5;
  score: 1 | 2 | 3 | 4 | 5;
  experienceTags: string[];
  roleTags: string[];
}

export interface PlayerProfile {
  id: string;
  name: string;
  nickname?: string;
  phone: string;
  avatar: string;
  gender: 'male' | 'female';
  totalGames: number;
  averageSatisfaction: number;
  tagWeights: Record<string, number>;
  pastAssignments: PastAssignment[];
}

// ========== 分角与复盘 ==========
export interface AssignmentSuggestion {
  scheduleId: string;
  generatedAt: string;
  matchMatrix: MatchCell[][];
  recommendedPlan: AssignmentPair[];
  warnings: AssignmentWarning[];
  manualAdjusted: boolean;
  finalPlan: AssignmentPair[];
}

export interface MatchScoreItem {
  description: string;
  score: number;
  icon?: string;
  category?: string;
}

export interface MatchCell {
  playerId: string;
  roleId: string;
  score: number;
  reasons: string[];
  warnings: string[];
  positiveFactors: MatchScoreItem[];
  negativeFactors: MatchScoreItem[];
}

export interface AssignmentPair {
  playerId: string;
  roleId: string;
  isLocked: boolean;
}

export interface AssignmentWarning {
  type: 'conflict' | 'risk' | 'manual_check';
  severity: 'high' | 'medium' | 'low';
  playerIds: string[];
  roleIds: string[];
  message: string;
  suggestion?: string;
}

export interface AssignmentReview {
  id: string;
  scheduleId: string;
  scriptId?: string;
  dmId: string;
  reviewedAt: string;
  createdAt: string;
  overallScore: 1 | 2 | 3 | 4 | 5;
  overallRating: number;
  bestExperience: string[];
  disappointingExperience: string[];
  perPlayerFeedback: PlayerRoleFeedback[];
  dmNotes: string;
  suggestedTagAdjustments: TagAdjustment[];
}

export interface PlayerRoleFeedback {
  playerId: string;
  roleId: string;
  experienceTags: string[];
  score: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export interface TagAdjustment {
  roleId: string;
  tagName: string;
  currentWeight: number;
  suggestedWeight: number;
  reason: string;
}

// ========== 门店运营 ==========
export interface DM {
  id: string;
  name: string;
  avatar: string;
  specialty: string[];
  totalSessions: number;
  averageRating: number;
}
