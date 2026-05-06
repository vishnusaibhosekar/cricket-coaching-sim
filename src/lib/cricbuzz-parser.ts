import { MatchState, BatsmanStats, BowlerStats, BowlerCard } from './types';

export function parseCricbuzzScorecard(markdown: string, matchId: string): MatchState {
    // This is a resilient parser with fallbacks
    // Cricbuzz structure may vary, so we use multiple strategies

    const lines = markdown.split('\n');

    // Extract team scores
    const team1 = extractTeamScore(lines, 0);
    const team2 = extractTeamScore(lines, 1);

    // Determine current innings
    const currentInnings = team2.overs > 0 ? 2 : 1;

    // Extract batsmen
    const currentBatsmen = extractBatsmen(lines);

    // Extract bowler
    const currentBowler = extractCurrentBowler(lines);

    // Extract bowling card (all bowlers)
    const bowlingCard = extractBowlingCard(lines);

    // Extract recent overs
    const recentOvers = extractRecentOvers(lines);

    // Calculate run rates
    const battingTeam = currentInnings === 1 ? team1 : team2;
    const currentRunRate = battingTeam.overs > 0
        ? (battingTeam.score / battingTeam.overs).toFixed(2)
        : '0.00';

    // Determine match phase
    const matchPhase = determineMatchPhase(battingTeam.overs);

    return {
        matchId,
        team1,
        team2,
        currentInnings: currentInnings as 1 | 2,
        currentBatsmen,
        currentBowler,
        recentOvers,
        bowlingCard,
        matchPhase,
        currentRunRate: parseFloat(currentRunRate),
    };
}

function extractTeamScore(lines: string[], index: number) {
    // Look for patterns like "SRH 156/4 (17.2 ov)"
    const scorePattern = /([A-Z]{3,4})\s+(\d+)\/(\d+)\s+\((\d+\.?\d*)\s+ov\)/;

    for (const line of lines) {
        const match = line.match(scorePattern);
        if (match && index === 0) {
            return {
                name: match[1],
                score: parseInt(match[2]),
                wickets: parseInt(match[3]),
                overs: parseFloat(match[4]),
            };
        }
    }

    // Fallback
    return { name: 'TBD', score: 0, wickets: 0, overs: 0 };
}

function extractBatsmen(lines: string[]): BatsmanStats[] {
    const batsmen: BatsmanStats[] = [];
    const batsmanPattern = /(\*?\s*[A-Za-z\s\.]+?)\s+(\d+)\s+\((\d+)\)\s+4s:(\d+)\s+6s:(\d+)/;

    for (const line of lines) {
        const match = line.match(batsmanPattern);
        if (match) {
            const runs = parseInt(match[2]);
            const balls = parseInt(match[3]);
            batsmen.push({
                name: match[1].trim().replace('*', ''),
                runs,
                balls,
                fours: parseInt(match[4]),
                sixes: parseInt(match[5]),
                strikeRate: balls > 0 ? parseFloat(((runs / balls) * 100).toFixed(2)) : 0,
            });

            if (batsmen.length >= 2) break; // Only need 2 batsmen
        }
    }

    return batsmen;
}

function extractCurrentBowler(lines: string[]): BowlerStats {
    const bowlerPattern = /([A-Za-z\s\.]+?)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d\.]+)/;

    for (const line of lines) {
        if (line.includes('Bowler') || line.includes('Bowling')) {
            // Next few lines should have bowler stats
            const bowlerLines = lines.slice(lines.indexOf(line), lines.indexOf(line) + 5);
            for (const bLine of bowlerLines) {
                const match = bLine.match(bowlerPattern);
                if (match && !match[1].includes('Name')) {
                    return {
                        name: match[1].trim(),
                        overs: parseFloat(match[2]),
                        maidens: parseInt(match[3]),
                        runs: parseInt(match[4]),
                        wickets: parseInt(match[5]),
                        economy: parseFloat(match[6]),
                    };
                }
            }
        }
    }

    return { name: 'TBD', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0 };
}

function extractBowlingCard(lines: string[]): BowlerCard[] {
    const bowlers: BowlerCard[] = [];
    const bowlerPattern = /([A-Za-z\s\.]+?)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d\.]+)/;

    let inBowlingSection = false;

    for (const line of lines) {
        if (line.includes('Bowling') || line.includes('Bowler')) {
            inBowlingSection = true;
            continue;
        }

        if (inBowlingSection) {
            const match = line.match(bowlerPattern);
            if (match && !match[1].includes('Name')) {
                bowlers.push({
                    name: match[1].trim(),
                    overs: parseFloat(match[2]),
                    runs: parseInt(match[4]),
                    wickets: parseInt(match[5]),
                    economy: parseFloat(match[6]),
                });
            }

            // Stop if we hit another section
            if (line.includes('Batting') || line.includes('Partnership')) {
                break;
            }
        }
    }

    return bowlers;
}

function extractRecentOvers(lines: string[]): string[] {
    const overs: string[] = [];
    const overPattern = /Over\s+(\d+):\s+(.+)/;

    for (const line of lines) {
        const match = line.match(overPattern);
        if (match) {
            overs.push(match[2].trim());

            if (overs.length >= 3) break; // Last 3 overs
        }
    }

    return overs;
}

function determineMatchPhase(overs: number): 'powerplay' | 'middle' | 'death' {
    if (overs <= 6) return 'powerplay';
    if (overs <= 15) return 'middle';
    return 'death';
}
