#!/usr/bin/env node
/**
 * Script 2 (Integration): Parse Real Cricbuzz Data from TinyFish
 * 
 * Usage: node scripts/test-parser-with-real-data.js
 * 
 * This script:
 * 1. Fetches live data from Cricbuzz via TinyFish (Script 1)
 * 2. Parses it using the Cricbuzz parser (Script 2)
 * 3. Validates the parsed output
 */

require('dotenv').config({ path: '.env.local' });

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const CRICBUZZ_URL = process.env.CRICBUZZ_SCORECARD_URL;

// Parser functions (from test-cricbuzz-parser.js)
function parseCricbuzzScorecard(markdown, matchId) {
    const lines = markdown.split('\n');

    // Extract team scores - improved regex to handle both "235-4" and "156/4" formats
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

function extractTeamScore(lines, index) {
    // The format in Cricbuzz markdown is:
    // SRH
    // Sunrisers Hyderabad  
    // 235-4
    // (20 Ov)
    // So we need to look for team abbreviation followed by score pattern

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

function determineMatchPhase(overs) {
    if (overs <= 6) return 'powerplay';
    if (overs <= 15) return 'middle';
    return 'death';
}

async function testParserWithRealData() {
    console.log('🧪 Script 2: Parse Real Cricbuzz Data from TinyFish\n');
    console.log('======================================================\n');

    // Step 1: Fetch from TinyFish
    console.log('📡 Step 1: Fetching from TinyFish...');

    if (!TINYFISH_API_KEY || !CRICBUZZ_URL) {
        console.error('❌ Error: Missing API keys or URL in .env.local');
        process.exit(1);
    }

    try {
        const response = await fetch('https://api.fetch.tinyfish.ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': TINYFISH_API_KEY,
            },
            body: JSON.stringify({
                urls: [CRICBUZZ_URL],
            }),
        });

        if (!response.ok) {
            console.error(`❌ TinyFish request failed: ${response.status}`);
            process.exit(1);
        }

        const data = await response.json();
        const markdown = data.results[0].text || data.results[0].content;

        console.log(`✅ TinyFish fetch successful (${markdown.length} chars)\n`);

        // Step 2: Parse the data
        console.log('🔍 Step 2: Parsing Cricbuzz data...');

        const matchState = parseCricbuzzScorecard(markdown, 'srh-vs-pbks-2026-05-06');

        console.log('✅ Parsing successful!\n');

        // Step 3: Display results
        console.log('📊 Parsed Match State:\n');

        console.log(`Match ID: ${matchState.matchId}`);

        console.log('\nTeam 1 (1st Innings):');
        console.log(`  - Name: ${matchState.team1.name}`);
        console.log(`  - Score: ${matchState.team1.score}/${matchState.team1.wickets}`);
        console.log(`  - Overs: ${matchState.team1.overs}`);
        console.log(`  - Run Rate: ${matchState.team1.overs > 0 ? (matchState.team1.score / matchState.team1.overs).toFixed(2) : 'N/A'}`);

        console.log('\nTeam 2 (2nd Innings):');
        console.log(`  - Name: ${matchState.team2.name}`);
        console.log(`  - Score: ${matchState.team2.score}/${matchState.team2.wickets}`);
        console.log(`  - Overs: ${matchState.team2.overs}`);
        console.log(`  - Run Rate: ${matchState.team2.overs > 0 ? (matchState.team2.score / matchState.team2.overs).toFixed(2) : 'N/A'}`);

        console.log(`\nCurrent Innings: ${matchState.currentInnings}`);
        console.log(`Match Phase: ${matchState.matchPhase}`);

        // Validation
        console.log('\n🔍 Validation:');
        const hasValidTeam1 = matchState.team1.name !== 'TBD' && matchState.team1.score > 0;
        const hasValidTeam2 = matchState.team2.name !== 'TBD' && matchState.team2.score > 0;

        console.log(`   - Team 1 data valid: ${hasValidTeam1 ? '✅' : '❌'}`);
        console.log(`   - Team 2 data valid: ${hasValidTeam2 ? '✅' : '❌'}`);
        console.log(`   - Match phase detected: ${matchState.matchPhase !== 'unknown' ? '✅' : '❌'}`);

        if (hasValidTeam1 && hasValidTeam2) {
            console.log('\n✅ Script 2 PASSED - Real data parsing successful!');
        } else {
            console.log('\n⚠️  Parser ran but could not extract complete data');
            console.log('This might be because the match format differs from expected');
        }

    } catch (error) {
        console.error('\n❌ Test failed with error:');
        console.error(error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

testParserWithRealData();
