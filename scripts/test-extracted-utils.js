#!/usr/bin/env node
/**
 * Test: Verify Extracted Utilities Work
 * 
 * Usage: node scripts/test-extracted-utils.js
 * 
 * Tests that the extracted utility modules work correctly
 */

const { fetchCricbuzzData, validateConfig } = require('../src/lib/cricbuzz-fetcher');
const { parseMatchState, determineMatchPhase } = require('../src/lib/cricbuzz-parser');
const { detectTacticalMoments, getDecisionType } = require('../src/lib/tactical-detector');

async function testExtractedUtils() {
    console.log('🧪 Testing Extracted Utilities\n');
    console.log('================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: Validate Config
    console.log('📋 Test 1: Configuration Validation');
    totalTests++;

    const configValid = validateConfig();
    console.log(`   Config valid: ${configValid ? '✅' : '❌'}`);

    if (configValid) testsPassed++;

    // Test 2: Fetch Cricbuzz Data
    console.log('\n📋 Test 2: Fetch Cricbuzz Data');
    totalTests++;

    try {
        const markdown = await fetchCricbuzzData();
        console.log(`   Fetched ${markdown.length} characters`);
        console.log(`   Contains SRH/PBKS: ${markdown.includes('SRH') || markdown.includes('PBKS') ? '✅' : '❌'}`);
        testsPassed++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 3: Parse Match State
    console.log('\n📋 Test 3: Parse Match State');
    totalTests++;

    try {
        const markdown = await fetchCricbuzzData();
        const matchState = parseMatchState(markdown, 'test-match');

        console.log(`   Team 1: ${matchState.team1.name} - ${matchState.team1.score}/${matchState.team1.wickets} (${matchState.team1.overs} ov)`);
        console.log(`   Team 2: ${matchState.team2.name} - ${matchState.team2.score}/${matchState.team2.wickets} (${matchState.team2.overs} ov)`);
        console.log(`   Match Phase: ${matchState.matchPhase}`);

        const valid = matchState.team1.name !== 'TBD' && matchState.team2.name !== 'TBD';
        console.log(`   Parse valid: ${valid ? '✅' : '❌'}`);

        if (valid) testsPassed++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 4: Determine Match Phase
    console.log('\n📋 Test 4: Match Phase Detection');
    totalTests++;

    const phases = [
        { overs: 3, expected: 'powerplay' },
        { overs: 10, expected: 'middle' },
        { overs: 18, expected: 'death' },
    ];

    let allPhasesCorrect = true;
    phases.forEach(({ overs, expected }) => {
        const result = determineMatchPhase(overs);
        const correct = result === expected;
        console.log(`   ${overs} overs → ${result} (expected: ${expected}) ${correct ? '✅' : '❌'}`);
        if (!correct) allPhasesCorrect = false;
    });

    if (allPhasesCorrect) testsPassed++;

    // Test 5: Detect Tactical Moments
    console.log('\n📋 Test 5: Tactical Moment Detection');
    totalTests++;

    const prevState = {
        team1: { name: 'SRH', score: 50, wickets: 1, overs: 5.6 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'powerplay'
    };

    const currState = {
        team1: { name: 'SRH', score: 54, wickets: 1, overs: 6.0 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle'
    };

    const moments = detectTacticalMoments(prevState, currState);
    console.log(`   Detected ${moments.length} moment(s):`);
    moments.forEach(m => console.log(`     - ${m.message}`));

    const hasNewOver = moments.some(m => m.type === 'new_over');
    const hasPowerplayEnd = moments.some(m => m.type === 'powerplay_end');

    if (hasNewOver && hasPowerplayEnd) testsPassed++;

    // Test 6: Get Decision Type
    console.log('\n📋 Test 6: Decision Type Determination');
    totalTests++;

    const decisionType = getDecisionType(moments);
    console.log(`   Decision type: ${decisionType || 'none'}`);
    console.log(`   Valid decision type: ${decisionType ? '✅' : '❌'}`);

    if (decisionType) testsPassed++;

    // Summary
    console.log('\n================================');
    console.log(`📊 Test Results: ${testsPassed}/${totalTests} passed`);

    if (testsPassed === totalTests) {
        console.log('\n✅ All extracted utilities working correctly!');
    } else {
        console.log(`\n⚠️  ${totalTests - testsPassed} test(s) failed`);
    }
}

testExtractedUtils();
