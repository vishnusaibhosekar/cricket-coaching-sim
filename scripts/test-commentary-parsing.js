#!/usr/bin/env node
/**
 * Script 7: Fetch & Parse Ball-by-Ball Commentary
 * 
 * Usage: node scripts/test-commentary-parsing.js
 * 
 * This script:
 * 1. Fetches commentary page from Cricbuzz via TinyFish
 * 2. Parses ball-by-ball data
 * 3. Reconstructs score at each over
 * 4. Extracts key tactical moments with real data
 */

require('dotenv').config({ path: '.env.local' });

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const CRICBUZZ_URL = process.env.CRICBUZZ_SCORECARD_URL;

/**
 * Fetches commentary from Cricbuzz
 */
async function fetchCommentary() {
    // Use the full commentary URL
    const commentaryUrl = 'https://www.cricbuzz.com/live-cricket-full-commentary/152042/srh-vs-pbks-49th-match-indian-premier-league-2026';

    console.log('📡 Fetching commentary from Cricbuzz...');
    console.log(`   URL: ${commentaryUrl}\n`);

    const response = await fetch('https://api.fetch.tinyfish.ai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': TINYFISH_API_KEY,
        },
        body: JSON.stringify({
            urls: [commentaryUrl],
        }),
    });

    if (!response.ok) {
        throw new Error(`TinyFish request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.results[0].text || data.results[0].content;

    console.log(`✅ Fetched ${content.length} characters\n`);

    return content;
}

/**
 * Parses ball-by-ball commentary
 * Looks for patterns like: "15.6 - Bowler to Batsman, 4 runs"
 */
function parseCommentary(content) {
    const lines = content.split('\n');
    const balls = [];

    // Pattern: "over.ball - Bowler to Batsman, description"
    // Examples:
    // "15.6 - Sakib Hussain to Nitish Reddy, FOUR runs"
    // "16.1 - Pat Cummins to Klaasen, 1 run"
    // "16.2 - Pat Cummins to Nitish Reddy, no run"
    const ballPattern = /(\d+)\.(\d+)\s*[-–—]\s*([^,]+)\s+to\s+([^,]+),\s+(.+)/i;

    for (const line of lines) {
        const match = line.match(ballPattern);
        if (match) {
            const over = parseInt(match[1]);
            const ball = parseInt(match[2]);
            const bowler = match[3].trim();
            const batsman = match[4].trim();
            const description = match[5].trim();

            // Parse runs from description
            let runs = 0;
            if (description.includes('FOUR') || description.includes('4 runs')) {
                runs = 4;
            } else if (description.includes('SIX') || description.includes('6 runs')) {
                runs = 6;
            } else if (description.includes('1 run')) {
                runs = 1;
            } else if (description.includes('2 run')) {
                runs = 2;
            } else if (description.includes('3 run')) {
                runs = 3;
            }

            // Check for wicket
            const isWicket = description.includes('OUT') ||
                description.includes('WICKET') ||
                description.includes('caught') ||
                description.includes('bowled') ||
                description.includes('lbw');

            balls.push({
                over,
                ball,
                ballNumber: `${over}.${ball}`,
                bowler,
                batsman,
                description,
                runs,
                isWicket,
            });
        }
    }

    console.log(`📊 Parsed ${balls.length} balls\n`);

    return balls;
}

/**
 * Reconstructs score at the end of each over
 */
function reconstructOvers(balls) {
    const overs = {};
    let currentScore = 0;
    let currentWickets = 0;
    let currentOver = 0;

    for (const ball of balls) {
        // If we moved to a new over, save the previous over's state
        if (ball.over > currentOver && currentOver > 0) {
            overs[currentOver] = {
                over: currentOver,
                score: currentScore,
                wickets: currentWickets,
                runsInOver: 0, // Will calculate
            };
        }

        currentScore += ball.runs;
        if (ball.isWicket) currentWickets++;
        currentOver = ball.over;
    }

    // Save the last over
    if (currentOver > 0) {
        overs[currentOver] = {
            over: currentOver,
            score: currentScore,
            wickets: currentWickets,
        };
    }

    console.log(`📈 Reconstructed ${Object.keys(overs).length} overs\n`);

    return overs;
}

/**
 * Extracts key tactical moments from the overs data
 */
function extractTacticalMoments(overs) {
    const moments = [];

    const overNumbers = Object.keys(overs).map(Number).sort((a, b) => a - b);

    for (const over of overNumbers) {
        const overData = overs[over];

        // Powerplay end (over 6)
        if (over === 6) {
            moments.push({
                type: 'powerplay_end',
                over: 6,
                score: `${overData.score}/${overData.wickets}`,
                description: `Powerplay ended - SRH ${overData.score}/${overData.wickets} after 6 overs`
            });
        }

        // Death overs start (over 16)
        if (over === 16) {
            moments.push({
                type: 'death_overs_start',
                over: 16,
                score: `${overData.score}/${overData.wickets}`,
                description: `Death overs began - SRH ${overData.score}/${overData.wickets} after 15 overs`
            });
        }

        // Every 5 overs (key moments)
        if (over % 5 === 0 && over > 0) {
            moments.push({
                type: 'milestone',
                over: over,
                score: `${overData.score}/${overData.wickets}`,
                description: `After ${over} overs - SRH ${overData.score}/${overData.wickets}`
            });
        }
    }

    return moments;
}

async function testCommentaryParsing() {
    console.log('🧪 Script 7: Fetch & Parse Ball-by-Ball Commentary\n');
    console.log('====================================================\n');

    try {
        // Step 1: Fetch commentary
        console.log('📡 STEP 1: Fetching commentary...\n');
        const content = await fetchCommentary();

        // Show a sample of the content to understand the format
        console.log('📄 Content preview (first 1000 chars):');
        console.log('─'.repeat(60));
        console.log(content.substring(0, 1000));
        console.log('─'.repeat(60));
        console.log('\n');

        // Step 2: Parse ball-by-ball
        console.log('📋 STEP 2: Parsing ball-by-ball data...\n');
        const balls = parseCommentary(content);

        if (balls.length === 0) {
            console.log('⚠️  No ball-by-ball data found in commentary');
            console.log('   The commentary format might be different than expected');
            console.log('\nSearching for alternative patterns...\n');

            // Try to find over-by-over summary instead
            const overSummaryPattern = /Over\s+(\d+).*?(\d+)\s+runs?.*?\(([^)]+)\)/gi;
            let match;
            const overs_summary = [];

            while ((match = overSummaryPattern.exec(content)) !== null) {
                overs_summary.push({
                    over: parseInt(match[1]),
                    runs: parseInt(match[2]),
                    score: match[3]
                });
            }

            if (overs_summary.length > 0) {
                console.log(`✅ Found ${overs_summary.length} over summaries:`);
                overs_summary.slice(0, 10).forEach(o => {
                    console.log(`   Over ${o.over}: ${o.runs} runs (Score: ${o.score})`);
                });
            } else {
                console.log('❌ No over data found in this format');
            }

            return;
        }

        // Show first 10 balls
        console.log('📊 First 10 balls:');
        balls.slice(0, 10).forEach(b => {
            console.log(`   ${b.ballNumber} - ${b.bowler} to ${b.batsman}: ${b.description}`);
        });
        console.log('\n');

        // Step 3: Reconstruct overs
        console.log('📋 STEP 3: Reconstructing score at each over...\n');
        const overs = reconstructOvers(balls);

        console.log('Score progression:');
        const overNumbers = Object.keys(overs).map(Number).sort((a, b) => a - b);
        overNumbers.slice(0, 20).forEach(over => {
            const data = overs[over];
            console.log(`   Over ${over.toString().padStart(2, 's')}: ${data.score}/${data.wickets}`);
        });
        console.log('\n');

        // Step 4: Extract tactical moments
        console.log('📋 STEP 4: Extracting tactical moments...\n');
        const moments = extractTacticalMoments(overs);

        console.log(`Found ${moments.length} tactical moments:`);
        moments.forEach(m => {
            console.log(`   Over ${m.over}: ${m.description}`);
        });
        console.log('\n');

        // Step 5: Show key moments for demo
        console.log('📋 STEP 5: Key moments for replay mode...\n');

        const keyMoments = [
            { over: 6, label: 'Powerplay End' },
            { over: 10, label: 'Middle Overs' },
            { over: 15, label: 'Before Death Overs' },
            { over: 16, label: 'Death Overs Start' },
            { over: 20, label: 'Final Score' }
        ];

        keyMoments.forEach(({ over, label }) => {
            if (overs[over]) {
                console.log(`   ${label} (Over ${over}): SRH ${overs[over].score}/${overs[over].wickets}`);
            }
        });

        console.log('\n✅ Commentary parsing successful!');

    } catch (error) {
        console.error('\n❌ Script failed:');
        console.error(error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

testCommentaryParsing();
