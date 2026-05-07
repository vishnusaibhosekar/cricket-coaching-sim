import { MatchState, LeaderboardEntry, GeminiScore, TacticalMoment } from '@/lib/types';

// ============================================================================
// Mock Match State - mirrors output from parseCricbuzzScorecard (cricbuzz-parser.js)
// Based on real SRH vs PBKS match data from srh-vs-pbks-timeline.js
// ============================================================================

export const mockMatchState: MatchState = {
    matchId: 'srh-vs-pbks-2026-05-06',
    team1: { name: 'SRH', score: 180, wickets: 3, overs: 16 },
    team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
    currentInnings: 1,
    currentBatsmen: [
        { name: 'Heinrich Klaasen', runs: 65, balls: 40, fours: 6, sixes: 3, strikeRate: 162.5 },
        { name: 'Nitish Reddy', runs: 25, balls: 10, fours: 2, sixes: 2, strikeRate: 250.0 }
    ],
    currentBowler: { name: 'Arshdeep Singh', overs: 3, maidens: 0, runs: 32, wickets: 1, economy: 10.67 },
    recentOvers: ['1 4 6 1 2 1', 'W 1 1 4 1 1'],
    bowlingCard: [
        { name: 'Arshdeep Singh', overs: 3, runs: 32, wickets: 1, economy: 10.67 },
        { name: 'Marco Jansen', overs: 3, runs: 45, wickets: 0, economy: 15.0 },
        { name: 'Lockie Ferguson', overs: 3, runs: 28, wickets: 1, economy: 9.33 },
        { name: 'Yuzvendra Chahal', overs: 4, runs: 32, wickets: 1, economy: 8.0 },
        { name: 'Vijaykumar Vyshak', overs: 3, runs: 43, wickets: 0, economy: 14.33 }
    ],
    matchPhase: 'death',
    currentRunRate: 11.25
};

// ============================================================================
// Mock Match States for Demo Mode - progression through the match
// Mirrors tactical moments from srh-vs-pbks-timeline.js
// ============================================================================

export const mockMatchStates: MatchState[] = [
    // State 1: Powerplay end (Over 6)
    {
        matchId: 'srh-vs-pbks-2026-05-06',
        team1: { name: 'SRH', score: 79, wickets: 1, overs: 6 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        currentInnings: 1,
        currentBatsmen: [
            { name: 'Travis Head', runs: 30, balls: 15, fours: 4, sixes: 2, strikeRate: 200.0 },
            { name: 'Ishan Kishan', runs: 12, balls: 8, fours: 1, sixes: 1, strikeRate: 150.0 }
        ],
        currentBowler: { name: 'Yuzvendra Chahal', overs: 1, maidens: 0, runs: 8, wickets: 0, economy: 8.0 },
        recentOvers: ['6 4 1 1 2 1', '1 1 1 1 1 1'],
        bowlingCard: [
            { name: 'Arshdeep Singh', overs: 2, runs: 18, wickets: 0, economy: 9.0 },
            { name: 'Marco Jansen', overs: 2, runs: 25, wickets: 0, economy: 12.5 },
            { name: 'Lockie Ferguson', overs: 1, runs: 12, wickets: 1, economy: 12.0 },
            { name: 'Yuzvendra Chahal', overs: 1, runs: 8, wickets: 0, economy: 8.0 },
            { name: 'Vijaykumar Vyshak', overs: 0, runs: 0, wickets: 0, economy: 0 }
        ],
        matchPhase: 'powerplay',
        currentRunRate: 13.17
    },
    // State 2: Middle overs (Over 10)
    {
        matchId: 'srh-vs-pbks-2026-05-06',
        team1: { name: 'SRH', score: 120, wickets: 2, overs: 10 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        currentInnings: 1,
        currentBatsmen: [
            { name: 'Ishan Kishan', runs: 35, balls: 22, fours: 4, sixes: 1, strikeRate: 159.09 },
            { name: 'Heinrich Klaasen', runs: 28, balls: 15, fours: 2, sixes: 2, strikeRate: 186.67 }
        ],
        currentBowler: { name: 'Lockie Ferguson', overs: 2, maidens: 0, runs: 18, wickets: 1, economy: 9.0 },
        recentOvers: ['1 1 4 1 1 2', '1 1 1 1 1 1'],
        bowlingCard: [
            { name: 'Arshdeep Singh', overs: 2, runs: 22, wickets: 0, economy: 11.0 },
            { name: 'Marco Jansen', overs: 2, runs: 28, wickets: 0, economy: 14.0 },
            { name: 'Lockie Ferguson', overs: 2, runs: 18, wickets: 1, economy: 9.0 },
            { name: 'Yuzvendra Chahal', overs: 2, runs: 16, wickets: 1, economy: 8.0 },
            { name: 'Vijaykumar Vyshak', overs: 2, runs: 24, wickets: 0, economy: 12.0 }
        ],
        matchPhase: 'middle',
        currentRunRate: 12.0
    },
    // State 3: Death overs start (Over 16) - same as mockMatchState
    mockMatchState,
    // State 4: Wicket scenario (Over 17.3)
    {
        matchId: 'srh-vs-pbks-2026-05-06',
        team1: { name: 'SRH', score: 188, wickets: 4, overs: 17.3 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        currentInnings: 1,
        currentBatsmen: [
            { name: 'Nitish Reddy', runs: 32, balls: 14, fours: 3, sixes: 2, strikeRate: 228.57 },
            { name: 'Pat Cummins', runs: 5, balls: 3, fours: 1, sixes: 0, strikeRate: 166.67 }
        ],
        currentBowler: { name: 'Arshdeep Singh', overs: 3.3, maidens: 0, runs: 38, wickets: 2, economy: 10.86 },
        recentOvers: ['1 4 W 1 2 1', '6 1 1 1'],
        bowlingCard: [
            { name: 'Arshdeep Singh', overs: 3.3, runs: 38, wickets: 2, economy: 10.86 },
            { name: 'Marco Jansen', overs: 3, runs: 52, wickets: 0, economy: 17.33 },
            { name: 'Lockie Ferguson', overs: 4, runs: 35, wickets: 1, economy: 8.75 },
            { name: 'Yuzvendra Chahal', overs: 4, runs: 32, wickets: 1, economy: 8.0 },
            { name: 'Vijaykumar Vyshak', overs: 3, runs: 48, wickets: 0, economy: 16.0 }
        ],
        matchPhase: 'death',
        currentRunRate: 10.74
    }
];

// ============================================================================
// Mock Tactical Moments - mirrors output from tactical-detector.js
// ============================================================================

export const mockTacticalMoments: TacticalMoment[] = [
    { type: 'new_over', overNumber: 17, message: 'Over 17 starting! Make your bowling change.' },
    { type: 'wicket', overNumber: 17, message: 'Wicket! Adjust your field placement.' },
    { type: 'powerplay_transition', overNumber: 16, message: 'Death overs begin! Maximum 5 fielders outside the ring.' }
];

// ============================================================================
// Mock Gemini Score - mirrors format from test-gemini-scoring.js
// ============================================================================

export const mockGeminiScore: GeminiScore = {
    total_score: 78,
    situation_awareness: 20,
    matchup_intelligence: 18,
    risk_reward: 22,
    strategic_creativity: 18,
    explanation: 'Excellent death over strategy. Bringing on Chahal to break the partnership shows strong matchup intelligence against Klaasen\'s weakness against quality spin.',
    comparison_to_captain: 'Captain chose Arshdeep Singh for the short ball advantage, but your spin option was tactically sound.'
};

// Alternative scores for variety in demo mode
export const mockGeminiScores: GeminiScore[] = [
    {
        total_score: 82,
        situation_awareness: 22,
        matchup_intelligence: 20,
        risk_reward: 20,
        strategic_creativity: 20,
        explanation: 'Smart bowling change! Using Chahal in the powerplay to exploit the new batsman\'s uncertainty against spin.',
        comparison_to_captain: 'Captain also chose Chahal - great minds think alike!'
    },
    {
        total_score: 71,
        situation_awareness: 18,
        matchup_intelligence: 16,
        risk_reward: 19,
        strategic_creativity: 18,
        explanation: 'Solid middle overs strategy. Good balance between attack and containment with your field placement.',
        comparison_to_captain: 'Captain opted for a more defensive field, but your attacking setup had merit.'
    },
    mockGeminiScore,
    {
        total_score: 85,
        situation_awareness: 23,
        matchup_intelligence: 21,
        risk_reward: 22,
        strategic_creativity: 19,
        explanation: 'Outstanding read of the situation! Your bowling change immediately after the wicket capitalized on the new batsman\'s vulnerability.',
        comparison_to_captain: 'Captain chose differently, but your decision showed superior tactical awareness.'
    }
];

// ============================================================================
// Mock Leaderboard - mirrors format from test-full-pipeline.js
// ============================================================================

export const mockLeaderboard: LeaderboardEntry[] = [
    { user_id: '1', display_name: 'You', avatar_url: '', total_decisions: 4, avg_merit: 79.0, total_merit: 316, best_decision: 85 },
    { user_id: '2', display_name: 'Rahul Dravid Fan', avatar_url: '', total_decisions: 4, avg_merit: 74.5, total_merit: 298, best_decision: 82 },
    { user_id: '3', display_name: 'Cricket Analyst', avatar_url: '', total_decisions: 3, avg_merit: 76.3, total_merit: 229, best_decision: 88 },
    { user_id: '4', display_name: 'IPL Tactics', avatar_url: '', total_decisions: 4, avg_merit: 71.2, total_merit: 285, best_decision: 79 },
    { user_id: '5', display_name: 'Captain Cool', avatar_url: '', total_decisions: 3, avg_merit: 73.0, total_merit: 219, best_decision: 80 }
];

// ============================================================================
// Mock Captain's Actual Decisions (for comparison)
// ============================================================================

export const mockCaptainDecisions = {
    over_7: { bowlerName: 'Yuzvendra Chahal' },
    over_11: { bowlerName: 'Lockie Ferguson' },
    over_17: { bowlerName: 'Arshdeep Singh' },
    wicket_17: {
        zones: [
            { zone: 'slip_gully', fielders: 1 },
            { zone: 'point', fielders: 1 },
            { zone: 'cover', fielders: 2 },
            { zone: 'mid_off', fielders: 1 },
            { zone: 'mid_on', fielders: 1 },
            { zone: 'midwicket', fielders: 1 },
            { zone: 'square_leg', fielders: 1 },
            { zone: 'fine_leg', fielders: 1 }
        ]
    }
};
