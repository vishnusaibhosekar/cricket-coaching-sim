// Match State - parsed from Cricbuzz
export interface MatchState {
    matchId: string;
    team1: TeamScore;
    team2: TeamScore;
    currentInnings: 1 | 2;
    currentBatsmen: BatsmanStats[];
    currentBowler: BowlerStats;
    recentOvers: string[];
    bowlingCard: BowlerCard[];
    matchPhase: 'powerplay' | 'middle' | 'death';
    requiredRunRate?: number;
    currentRunRate: number;
}

export interface TeamScore {
    name: string;
    score: number;
    wickets: number;
    overs: number;
}

export interface BatsmanStats {
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
}

export interface BowlerStats {
    name: string;
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
}

export interface BowlerCard {
    name: string;
    overs: number;
    runs: number;
    wickets: number;
    economy: number;
}

// Player Profile from Cricbuzz
export interface PlayerProfile {
    name: string;
    role: string;
    battingStyle: string;
    bowlingStyle: string;
    iplStats: {
        matches: number;
        runs: number;
        average: number;
        strikeRate: number;
        fifties: number;
        hundreds: number;
    };
}

// Decision types
export type DecisionType = 'bowling_change' | 'field_placement';

export interface Decision {
    id?: string;
    user_id?: string;
    match_id: string;
    over_number: number;
    decision_type: DecisionType;
    user_choice: BowlingChoice | FieldPlacementChoice;
    actual_choice?: BowlingChoice | FieldPlacementChoice;
    match_context: MatchContext;
    merit_score?: number;
    merit_breakdown?: GeminiScore;
    created_at?: string;
}

export interface MatchContext {
    score: string;
    overs: number;
    batsmen: BatsmanStats[];
    phase: 'powerplay' | 'middle' | 'death';
    runRate: number;
    requiredRate?: number;
}

export interface BowlingChoice {
    bowlerName: string;
}

export interface FieldPlacementChoice {
    zones: FieldZone[];
}

export interface FieldZone {
    zone: string;
    fielders: number; // 0-2 fielders per zone
}

// Gemini scoring response
export interface GeminiScore {
    total_score: number;
    situation_awareness: number;
    matchup_intelligence: number;
    risk_reward: number;
    strategic_creativity: number;
    explanation: string;
    comparison_to_captain: string;
}

// Leaderboard entry
export interface LeaderboardEntry {
    user_id: string;
    display_name: string;
    avatar_url: string;
    total_decisions: number;
    avg_merit: number;
    total_merit: number;
    best_decision: number;
}

// Tactical moment detection
export interface TacticalMoment {
    type: 'new_over' | 'wicket' | 'powerplay_transition' | 'timeout';
    overNumber: number;
    message: string;
}

// Ball-by-ball field placement simulation
export type ShotZone = 
    // Close catching positions
    | 'short_leg' | 'silly_point' | 'leg_slip' | 'slip_gully'
    // Inner circle positions
    | 'point' | 'backward_point' | 'cover' | 'extra_cover' 
    | 'mid_off' | 'mid_on' | 'midwicket' | 'square_leg' 
    | 'short_fine_leg' | 'fine_leg' | 'third_man'
    // Deep positions
    | 'deep_cover' | 'deep_extra_cover' | 'deep_point' | 'deep_backward_point'
    | 'deep_midwicket' | 'deep_square_leg' | 'long_on' | 'long_off'
    | 'deep_third_man'
    // Special
    | 'boundary_rope' | 'no_shot';

export interface BallData {
    ball: string; // e.g., "3.4"
    over: number;
    bowler: string;
    batsman: string;
    runs: number;
    is_wicket: boolean;
    extras: string | null;
    wicket: {
        type: string;
        fielder: string;
        batsman_out: string;
    } | null;
    shot_type: string;
    shot_zone: ShotZone;
    commentary: string;
}

export interface UserFieldPlacement {
    zones: Record<ShotZone, number>; // zone -> number of fielders (0-2)
    total_fielders: number; // Should be 9
}

export interface BallDecision {
    ball: BallData;
    user_placement: UserFieldPlacement;
    score: number;
    score_breakdown: {
        zone_coverage: number; // Did you cover the actual shot zone?
        phase_appropriateness: number; // Field appropriate for match phase?
        batsman_awareness: number; // Exploited batsman weaknesses?
    };
    feedback: string;
}

export interface CumulativeScore {
    total_score: number;
    balls_faced: number;
    avg_score_per_ball: number;
    best_ball: number;
    decisions: BallDecision[];
}
