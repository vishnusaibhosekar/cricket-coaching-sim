#!/usr/bin/env node
/**
 * Script 4: Decision Prompt Generation
 * 
 * Usage: node scripts/test-decision-prompts.js
 * 
 * This script:
 * 1. Takes tactical moments as input
 * 2. Generates appropriate decision prompts (bowling change / field placement)
 * 3. Includes match context, player data, and constraints
 * 4. Validates prompt structure
 */

const { fetchCricbuzzData, validateConfig } = require('../src/lib/cricbuzz-fetcher');
const { parseMatchState } = require('../src/lib/cricbuzz-parser');
const { detectTacticalMoments, getDecisionType } = require('../src/lib/tactical-detector');

/**
 * Generates a bowling change decision prompt
 * @param {object} matchState - Current match state
 * @param {object} bowlingOptions - Available bowlers
 * @returns {object} Decision prompt
 */
function generateBowlingChangePrompt(matchState, bowlingOptions) {
    const currentTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;
    const opposingTeam = matchState.currentInnings === 1 ? matchState.team2 : matchState.team1;

    return {
        type: 'bowling_change',
        title: `OVER ${Math.floor(currentTeam.overs) + 1} COMING UP`,
        timer: 45, // seconds
        context: {
            match: `${matchState.team1.name} vs ${matchState.team2.name}`,
            score: `${currentTeam.name} ${currentTeam.score}/${currentTeam.wickets} (${currentTeam.overs} ov)`,
            phase: matchState.matchPhase,
            runRate: matchState.currentRunRate,
            batsmenAtCrease: matchState.currentBatsmen.length > 0 ? matchState.currentBatsmen : [
                { name: 'Batsman 1', runs: 0, balls: 0, sr: 0 },
                { name: 'Batsman 2', runs: 0, balls: 0, sr: 0 }
            ]
        },
        bowlingOptions: bowlingOptions || [],
        message: 'Select who should bowl the next over',
    };
}

/**
 * Generates a field placement decision prompt
 * @param {object} matchState - Current match state
 * @param {string} reason - Reason for field placement (new_over, wicket, etc.)
 * @returns {object} Decision prompt
 */
function generateFieldPlacementPrompt(matchState, reason = 'new_over') {
    const currentTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;

    // Field placement zones
    const zones = [
        'Slip/Gully',
        'Point',
        'Cover',
        'Mid-off',
        'Mid-on',
        'Midwicket',
        'Square Leg',
        'Fine Leg',
        'Third Man'
    ];

    // Calculate max fielders outside circle based on phase
    let maxOutsideCircle = 5;
    if (matchState.matchPhase === 'powerplay') {
        maxOutsideCircle = 2;
    }

    return {
        type: 'field_placement',
        title: reason === 'wicket' ? 'NEW BATSMAN AT THE CREASE' : `SET FIELD FOR OVER ${Math.floor(currentTeam.overs) + 1}`,
        timer: 60, // seconds
        context: {
            match: `${matchState.team1.name} vs ${matchState.team2.name}`,
            score: `${currentTeam.name} ${currentTeam.score}/${currentTeam.wickets} (${currentTeam.overs} ov)`,
            phase: matchState.matchPhase,
            batsman: matchState.currentBatsmen[0] || { name: 'Batsman', sr: 0 },
            reason: reason
        },
        fieldZones: zones,
        totalFielders: 9, // Excluding bowler and wicket-keeper
        maxOutsideCircle: maxOutsideCircle,
        message: 'Place 9 fielders across the zones',
    };
}

/**
 * Generates sample bowling options for testing
 * @param {object} matchState - Current match state
 * @returns {Array} Array of bowler objects
 */
function generateSampleBowlingOptions(matchState) {
    // Sample bowlers - in real app, this comes from match data
    return [
        { name: 'Pat Cummins', overs: 3.0, maidens: 0, runs: 28, wickets: 1, economy: 9.33 },
        { name: 'Nitish Reddy', overs: 2.0, maidens: 0, runs: 11, wickets: 1, economy: 5.50 },
        { name: 'Eshan Malinga', overs: 3.0, maidens: 0, runs: 32, wickets: 1, economy: 10.67 },
        { name: 'Sakib Hussain', overs: 3.0, maidens: 0, runs: 35, wickets: 1, economy: 11.67 },
        { name: 'Shivang Kumar', overs: 3.0, maidens: 0, runs: 40, wickets: 2, economy: 13.33 },
    ];
}

async function testDecisionPrompts() {
    console.log('🧪 Script 4: Decision Prompt Generation\n');
    console.log('==========================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    // Setup: Get real match data
    console.log('📡 Fetching live match data...');
    if (!validateConfig()) {
        console.error('❌ Configuration invalid');
        process.exit(1);
    }

    const markdown = await fetchCricbuzzData();
    const matchState = parseMatchState(markdown, 'srh-vs-pbks-2026-05-06');

    console.log(`✅ Match: ${matchState.team1.name} vs ${matchState.team2.name}`);
    console.log(`   Score: ${matchState.team1.score}/${matchState.team1.wickets} (${matchState.team1.overs} ov)`);
    console.log(`   Phase: ${matchState.matchPhase}\n`);

    // Test 1: Generate Bowling Change Prompt
    console.log('📋 Test 1: Generate Bowling Change Prompt');
    totalTests++;

    const bowlingOptions = generateSampleBowlingOptions(matchState);
    const bowlingPrompt = generateBowlingChangePrompt(matchState, bowlingOptions);

    console.log(`   Type: ${bowlingPrompt.type}`);
    console.log(`   Title: ${bowlingPrompt.title}`);
    console.log(`   Timer: ${bowlingPrompt.timer}s`);
    console.log(`   Bowling options: ${bowlingPrompt.bowlingOptions.length} bowlers`);
    console.log(`   Has context: ${bowlingPrompt.context ? '✅' : '❌'}`);
    console.log(`   Has message: ${bowlingPrompt.message ? '✅' : '❌'}`);

    const bowlingValid =
        bowlingPrompt.type === 'bowling_change' &&
        bowlingPrompt.bowlingOptions.length > 0 &&
        bowlingPrompt.context &&
        bowlingPrompt.timer > 0;

    console.log(`   Prompt valid: ${bowlingValid ? '✅' : '❌'}`);

    if (bowlingValid) testsPassed++;

    // Test 2: Generate Field Placement Prompt (New Over)
    console.log('\n📋 Test 2: Generate Field Placement Prompt (New Over)');
    totalTests++;

    const fieldPromptNewOver = generateFieldPlacementPrompt(matchState, 'new_over');

    console.log(`   Type: ${fieldPromptNewOver.type}`);
    console.log(`   Title: ${fieldPromptNewOver.title}`);
    console.log(`   Timer: ${fieldPromptNewOver.timer}s`);
    console.log(`   Field zones: ${fieldPromptNewOver.fieldZones.length} zones`);
    console.log(`   Total fielders: ${fieldPromptNewOver.totalFielders}`);
    console.log(`   Max outside circle: ${fieldPromptNewOver.maxOutsideCircle}`);
    console.log(`   Has context: ${fieldPromptNewOver.context ? '✅' : '❌'}`);

    const fieldValid =
        fieldPromptNewOver.type === 'field_placement' &&
        fieldPromptNewOver.fieldZones.length === 9 &&
        fieldPromptNewOver.totalFielders === 9 &&
        fieldPromptNewOver.maxOutsideCircle > 0;

    console.log(`   Prompt valid: ${fieldValid ? '✅' : '❌'}`);

    if (fieldValid) testsPassed++;

    // Test 3: Generate Field Placement Prompt (Wicket)
    console.log('\n📋 Test 3: Generate Field Placement Prompt (Wicket)');
    totalTests++;

    const fieldPromptWicket = generateFieldPlacementPrompt(matchState, 'wicket');

    console.log(`   Type: ${fieldPromptWicket.type}`);
    console.log(`   Title: ${fieldPromptWicket.title}`);
    console.log(`   Reason: ${fieldPromptWicket.context.reason}`);
    console.log(`   Has context: ${fieldPromptWicket.context ? '✅' : '❌'}`);

    const wicketValid =
        fieldPromptWicket.type === 'field_placement' &&
        fieldPromptWicket.context.reason === 'wicket';

    console.log(`   Prompt valid: ${wicketValid ? '✅' : '❌'}`);

    if (wicketValid) testsPassed++;

    // Test 4: Powerplay Constraints
    console.log('\n📋 Test 4: Powerplay Field Constraints');
    totalTests++;

    // Simulate powerplay state
    const powerplayState = {
        ...matchState,
        matchPhase: 'powerplay',
        team1: { ...matchState.team1, overs: 3.0 }
    };

    const powerplayField = generateFieldPlacementPrompt(powerplayState, 'new_over');

    console.log(`   Phase: ${powerplayState.matchPhase}`);
    console.log(`   Max outside circle: ${powerplayField.maxOutsideCircle}`);
    console.log(`   Correct for powerplay (max 2): ${powerplayField.maxOutsideCircle === 2 ? '✅' : '❌'}`);

    const powerplayValid = powerplayField.maxOutsideCircle === 2;

    if (powerplayValid) testsPassed++;

    // Test 5: Decision Type Mapping
    console.log('\n📋 Test 5: Decision Type Mapping from Tactical Moments');
    totalTests++;

    // Simulate tactical moments
    const moments = [
        { type: 'new_over', over: 7, message: 'Over 7 starting' }
    ];

    const decisionType = getDecisionType(moments);

    console.log(`   Moments: ${moments.map(m => m.type).join(', ')}`);
    console.log(`   Decision type: ${decisionType}`);
    console.log(`   Valid mapping: ${decisionType ? '✅' : '❌'}`);

    const mappingValid = decisionType === 'bowling_change';

    if (mappingValid) testsPassed++;

    // Test 6: Full Pipeline Integration
    console.log('\n📋 Test 6: Full Pipeline (Fetch → Parse → Detect → Generate)');
    totalTests++;

    // Simulate state change
    const prevState = {
        team1: { name: matchState.team1.name, score: 50, wickets: 1, overs: 5.6 },
        team2: { name: matchState.team2.name, score: 0, wickets: 0, overs: 0 },
        matchPhase: 'powerplay',
        currentInnings: 1,
        currentBatsmen: [],
        currentRunRate: '8.47'
    };

    const currState = {
        team1: { name: matchState.team1.name, score: 54, wickets: 1, overs: 6.0 },
        team2: { name: matchState.team2.name, score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle',
        currentInnings: 1,
        currentBatsmen: [],
        currentRunRate: '9.00'
    };

    const detectedMoments = detectTacticalMoments(prevState, currState);
    const finalDecisionType = getDecisionType(detectedMoments);

    console.log(`   Detected moments: ${detectedMoments.length}`);
    console.log(`   Decision type: ${finalDecisionType}`);

    let finalPrompt;
    if (finalDecisionType === 'bowling_change') {
        finalPrompt = generateBowlingChangePrompt(currState, bowlingOptions);
    } else if (finalDecisionType === 'field_placement') {
        finalPrompt = generateFieldPlacementPrompt(currState, 'new_over');
    }

    const pipelineValid =
        detectedMoments.length > 0 &&
        finalDecisionType &&
        finalPrompt &&
        finalPrompt.type === finalDecisionType;

    console.log(`   Generated prompt: ${finalPrompt ? '✅' : '❌'}`);
    console.log(`   Prompt matches decision type: ${pipelineValid ? '✅' : '❌'}`);

    if (pipelineValid) testsPassed++;

    // Summary
    console.log('\n==========================================');
    console.log(`📊 Test Results: ${testsPassed}/${totalTests} passed`);

    if (testsPassed === totalTests) {
        console.log('\n✅ Script 4 PASSED - Decision prompt generation working!');
    } else {
        console.log(`\n⚠️  ${totalTests - testsPassed} test(s) failed`);
    }
}

testDecisionPrompts();
