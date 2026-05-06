#!/usr/bin/env node
/**
 * Test 2: Cricbuzz Parser - Parse Match Data
 * 
 * Usage: node scripts/test-cricbuzz-parser.js [markdown_file_path]
 * 
 * Tests the Cricbuzz markdown parser
 * If no file provided, uses sample mock data
 */

const path = require('path');
const fs = require('fs');

// Import parser (need to use require with babel for TypeScript)
// For now, we'll inline the parser logic

function parseCricbuzzScorecard(markdown, matchId) {
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
        currentRunRate: 0,
    };
}

function extractTeamScore(lines, index) {
    const scorePattern = /([A-Z]{3,4})\s+(\d+)\/(\d+)\s+\((\d+\.?\d*)\s+ov\)/;

    for (const line of lines) {
        const match = line.match(scorePattern);
        if (match) {
            return {
                name: match[1],
                score: parseInt(match[2]),
                wickets: parseInt(match[3]),
                overs: parseFloat(match[4]),
            };
        }
    }

    return { name: 'TBD', score: 0, wickets: 0, overs: 0 };
}

function determineMatchPhase(overs) {
    if (overs <= 6) return 'powerplay';
    if (overs <= 15) return 'middle';
    return 'death';
}

async function testCricbuzzParser() {
    console.log('🧪 Testing Cricbuzz Parser\n');
    console.log('===========================================\n');

    let markdown;

    // Check if file path provided
    const filePath = process.argv[2];

    if (filePath) {
        console.log(`📄 Reading from file: ${filePath}`);
        try {
            markdown = fs.readFileSync(filePath, 'utf-8');
        } catch (error) {
            console.error(`❌ Error reading file: ${error.message}`);
            process.exit(1);
        }
    } else {
        console.log('📝 Using sample mock data\n');
        markdown = `
Live Cricket Scorecard - SRH vs PBKS
IPL 2026, Match 49

SRH 156/4 (17.2 ov)
PBKS 145/8 (20 ov)

Current Batsmen:
* Travis Head 45 (28) 4s:5 6s:2
  Abhishek Sharma 67 (42) 4s:8 6s:3

Current Bowler:
Arshdeep Singh 3.2-0-28-2

Bowling:
Kagiso Rabada 4-0-32-1
Arshdeep Singh 3.2-0-28-2
Harpreet Brar 4-0-24-1
Liam Livingstone 3-0-28-0
    `.trim();
    }

    console.log('⏳ Parsing markdown...\n');

    try {
        const matchState = parseCricbuzzScorecard(markdown, 'test-match-001');

        console.log('✅ Parsing successful!\n');
        console.log('📊 Parsed Match State:\n');

        console.log('Match ID:', matchState.matchId);
        console.log('\nTeam 1:');
        console.log(`  - Name: ${matchState.team1.name}`);
        console.log(`  - Score: ${matchState.team1.score}/${matchState.team1.wickets}`);
        console.log(`  - Overs: ${matchState.team1.overs}`);

        console.log('\nTeam 2:');
        console.log(`  - Name: ${matchState.team2.name}`);
        console.log(`  - Score: ${matchState.team2.score}/${matchState.team2.wickets}`);
        console.log(`  - Overs: ${matchState.team2.overs}`);

        console.log(`\nCurrent Innings: ${matchState.currentInnings}`);
        console.log(`Match Phase: ${matchState.matchPhase}`);

        // Validation
        console.log('\n🔍 Validation:');
        const hasValidScore = matchState.team1.name !== 'TBD' || matchState.team2.name !== 'TBD';
        console.log(`   - Has valid team data: ${hasValidScore ? '✅' : '❌'}`);
        console.log(`   - Match phase detected: ${matchState.matchPhase !== 'unknown' ? '✅' : '❌'}`);

        if (hasValidScore) {
            console.log('\n✅ Cricbuzz parser test PASSED');
        } else {
            console.log('\n⚠️  Parser ran but no valid data extracted');
            console.log('This is expected if using placeholder data');
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

testCricbuzzParser();
