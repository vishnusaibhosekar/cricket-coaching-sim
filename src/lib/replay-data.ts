import parsedInnings from '../../PBKS_Innings/parsed-innings.json';

export interface BallData {
    ball: string;
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
    commentary: string;
}

export interface OverData {
    over: number;
    score_at_start: string;
    balls: BallData[];
    total_runs: number;
    wickets: number;
}

export interface ParsedInnings {
    matchId: string;
    innings: number;
    battingTeam: string;
    bowlingTeam: string;
    totalOvers: number;
    overs: OverData[];
}

// Type assertion for the imported JSON
const inningsData = parsedInnings as ParsedInnings;

// Tactical moments - overs with wickets or high scoring (>15 runs)
export const tacticalMoments = inningsData.overs.filter(
    (over) => over.wickets > 0 || over.total_runs > 15
);

// Get all balls as a flat array for sequential replay
export const getAllBalls = (): (BallData & { overNumber: number; overScoreAtStart: string })[] => {
    const allBalls: (BallData & { overNumber: number; overScoreAtStart: string })[] = [];

    inningsData.overs.forEach((over) => {
        over.balls.forEach((ball) => {
            allBalls.push({
                ...ball,
                overNumber: over.over,
                overScoreAtStart: over.score_at_start,
            });
        });
    });

    return allBalls;
};

// Get tactical moments with ball-level detail
export const getTacticalMomentBalls = (): (BallData & { overNumber: number })[] => {
    const tacticalBalls: (BallData & { overNumber: number })[] = [];

    inningsData.overs.forEach((over) => {
        over.balls.forEach((ball) => {
            // Include wickets, boundaries (4s and 6s), and extras
            if (ball.is_wicket || ball.runs >= 4 || ball.extras) {
                tacticalBalls.push({
                    ...ball,
                    overNumber: over.over,
                });
            }
        });
    });

    return tacticalBalls;
};

// Get cumulative score at any ball
export const getCumulativeScore = (ballIndex: number) => {
    const allBalls = getAllBalls();
    let runs = 0;
    let wickets = 0;

    for (let i = 0; i <= ballIndex && i < allBalls.length; i++) {
        runs += allBalls[i].runs;
        if (allBalls[i].is_wicket) {
            wickets++;
        }
    }

    const ballsBowled = ballIndex + 1;
    const overs = Math.floor(ballsBowled / 6);
    const balls = ballsBowled % 6;

    return {
        runs,
        wickets,
        overs: `${overs}.${balls}`,
        runRate: ballsBowled > 0 ? (runs / ballsBowled) * 6 : 0,
    };
};

export const replayInnings = inningsData;

export default inningsData;
