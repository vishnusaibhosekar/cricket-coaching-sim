/**
 * Cricbuzz Scorecard Parser
 * 
 * Parses raw Cricbuzz markdown into structured MatchState objects
 */

/**
 * Parses Cricbuzz scorecard markdown into a MatchState object
 * @param {string} markdown - Raw markdown from Cricbuzz
 * @param {string} matchId - Match identifier
 * @returns {object} MatchState object
 */
function parseMatchState(markdown, matchId) {
    const lines = markdown.split('\n');

    // Extract team scores
    const team1 = extractTeamScore(lines, 0);
    const team2 = extractTeamScore(lines, 1);

    const currentInnings = team2.overs > 0 ? 2 : 1;

    const matchPhase = determineMatchPhase(team1.overs > 0 ? team1.overs : team2.overs);

    return {
        matchId,
        team1,
        team2,
        currentInnings,
        currentBatsmen: [],
        currentBowler: { name: 'TBD', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0 },
        recentOvers: [],
        bowlingCard: [],
        matchPhase,
        currentRunRate: team1.overs > 0 ? (team1.score / team1.overs).toFixed(2) : 0,
    };
}

/**
 * Extracts team score from Cricbuzz markdown lines
 * Handles the multi-line format:
 *   SRH
 *   Sunrisers Hyderabad
 *   235-4
 *   (20 Ov)
 * 
 * @param {string[]} lines - Array of markdown lines
 * @param {number} index - Which team to extract (0 for first, 1 for second)
 * @returns {object} Team score data
 */
function extractTeamScore(lines, index) {
    const teamAbbrevPattern = /^(SRH|PBKS|LSG|RCB|DC|CSK|MI|GT|KKR|RR)$/;
    const scorePattern = /^(\d+)[-\/](\d+)$/;
    const oversPattern = /^\((\d+\.?\d*)\s*Ov\)$/;

    let foundCount = 0;

    for (let i = 0; i < lines.length - 3; i++) {
        const teamMatch = lines[i].trim().match(teamAbbrevPattern);
        if (teamMatch) {
            // Look for score in next few lines
            for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                const scoreMatch = lines[j].trim().match(scorePattern);
                if (scoreMatch) {
                    // Look for overs in next line
                    for (let k = j + 1; k < Math.min(j + 3, lines.length); k++) {
                        const oversMatch = lines[k].trim().match(oversPattern);
                        if (oversMatch) {
                            foundCount++;
                            // Return the nth occurrence (0-indexed)
                            if (foundCount === index + 1) {
                                return {
                                    name: teamMatch[1],
                                    score: parseInt(scoreMatch[1]),
                                    wickets: parseInt(scoreMatch[2]),
                                    overs: parseFloat(oversMatch[1]),
                                };
                            }
                            // Break to continue searching for next team
                            k = lines.length;
                            j = lines.length;
                        }
                    }
                }
            }
        }
    }

    return { name: 'TBD', score: 0, wickets: 0, overs: 0 };
}

/**
 * Determines the match phase based on overs bowled
 * @param {number} overs - Overs bowled
 * @returns {string} 'powerplay' | 'middle' | 'death'
 */
function determineMatchPhase(overs) {
    if (overs <= 6) return 'powerplay';
    if (overs <= 15) return 'middle';
    return 'death';
}

module.exports = {
    parseMatchState,
    extractTeamScore,
    determineMatchPhase,
};
