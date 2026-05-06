#!/usr/bin/env node
/**
 * Script 3: Tactical Moment Detection
 * 
 * Usage: node scripts/test-tactical-detection.js
 * 
 * This script:
 * 1. Creates simulated match states (previous vs current)
 * 2. Runs diff logic to detect tactical moments
 * 3. Validates detection accuracy
 */

// Tactical moment detection logic
function detectTacticalMoments(previousState, currentState) {
    const moments = [];

    // 1. Detect new over
    const prevOver = Math.floor(previousState.team1.overs || previousState.team2.overs);
    const currOver = Math.floor(currentState.team1.overs || currentState.team2.overs);

    if (currOver > prevOver) {
        moments.push({
            type: 'new_over',
            over: currOver,
            message: `Over ${currOver} starting`
        });
    }

    // 2. Detect wicket
    const prevWickets = previousState.team1.wickets + previousState.team2.wickets;
    const currWickets = currentState.team1.wickets + currentState.team2.wickets;

    if (currWickets > prevWickets) {
        moments.push({
            type: 'wicket',
            wicketsLost: currWickets - prevWickets,
            message: `Wicket! ${currWickets - prevWickets} wicket(s) fallen`
        });
    }

    // 3. Detect powerplay transition
    if (prevOver < 6 && currOver >= 6) {
        moments.push({
            type: 'powerplay_end',
            message: 'Powerplay ended (overs 1-6 complete)'
        });
    }

    if (prevOver < 16 && currOver >= 16) {
        moments.push({
            type: 'death_overs_start',
            message: 'Death overs begin (overs 16-20)'
        });
    }

    // 4. Detect match phase change
    if (previousState.matchPhase !== currentState.matchPhase) {
        moments.push({
            type: 'phase_change',
            from: previousState.matchPhase,
            to: currentState.matchPhase,
            message: `Phase changed: ${previousState.matchPhase} → ${currentState.matchPhase}`
        });
    }

    return moments;
}

function runTacticalDetectionTests() {
    console.log('🧪 Script 3: Tactical Moment Detection\n');
    console.log('=========================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: New Over Detection
    console.log('📋 Test 1: New Over Detection');
    totalTests++;

    const test1Prev = {
        team1: { name: 'SRH', score: 50, wickets: 1, overs: 5.6 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'powerplay'
    };

    const test1Curr = {
        team1: { name: 'SRH', score: 54, wickets: 1, overs: 6.0 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle'
    };

    const test1Moments = detectTacticalMoments(test1Prev, test1Curr);
    const hasNewOver = test1Moments.some(m => m.type === 'new_over');

    console.log(`   Previous: Over 5.6 → Current: Over 6.0`);
    console.log(`   Detected moments: ${test1Moments.length}`);
    test1Moments.forEach(m => console.log(`     - ${m.message}`));
    console.log(`   New over detected: ${hasNewOver ? '✅' : '❌'}`);

    if (hasNewOver) testsPassed++;

    // Test 2: Wicket Detection
    console.log('\n📋 Test 2: Wicket Detection');
    totalTests++;

    const test2Prev = {
        team1: { name: 'SRH', score: 120, wickets: 2, overs: 12.0 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle'
    };

    const test2Curr = {
        team1: { name: 'SRH', score: 125, wickets: 3, overs: 12.4 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle'
    };

    const test2Moments = detectTacticalMoments(test2Prev, test2Curr);
    const hasWicket = test2Moments.some(m => m.type === 'wicket');

    console.log(`   Previous: 2 wickets → Current: 3 wickets`);
    console.log(`   Detected moments: ${test2Moments.length}`);
    test2Moments.forEach(m => console.log(`     - ${m.message}`));
    console.log(`   Wicket detected: ${hasWicket ? '✅' : '❌'}`);

    if (hasWicket) testsPassed++;

    // Test 3: Powerplay End
    console.log('\n📋 Test 3: Powerplay End Detection');
    totalTests++;

    const test3Prev = {
        team1: { name: 'SRH', score: 58, wickets: 1, overs: 5.6 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'powerplay'
    };

    const test3Curr = {
        team1: { name: 'SRH', score: 62, wickets: 1, overs: 6.2 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle'
    };

    const test3Moments = detectTacticalMoments(test3Prev, test3Curr);
    const hasPowerplayEnd = test3Moments.some(m => m.type === 'powerplay_end');

    console.log(`   Previous: Over 5.6 (powerplay) → Current: Over 6.2 (middle)`);
    console.log(`   Detected moments: ${test3Moments.length}`);
    test3Moments.forEach(m => console.log(`     - ${m.message}`));
    console.log(`   Powerplay end detected: ${hasPowerplayEnd ? '✅' : '❌'}`);

    if (hasPowerplayEnd) testsPassed++;

    // Test 4: Death Overs Start
    console.log('\n📋 Test 4: Death Overs Start Detection');
    totalTests++;

    const test4Prev = {
        team1: { name: 'SRH', score: 165, wickets: 3, overs: 15.4 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle'
    };

    const test4Curr = {
        team1: { name: 'SRH', score: 172, wickets: 3, overs: 16.0 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'death'
    };

    const test4Moments = detectTacticalMoments(test4Prev, test4Curr);
    const hasDeathOvers = test4Moments.some(m => m.type === 'death_overs_start');

    console.log(`   Previous: Over 15.4 (middle) → Current: Over 16.0 (death)`);
    console.log(`   Detected moments: ${test4Moments.length}`);
    test4Moments.forEach(m => console.log(`     - ${m.message}`));
    console.log(`   Death overs detected: ${hasDeathOvers ? '✅' : '❌'}`);

    if (hasDeathOvers) testsPassed++;

    // Test 5: Multiple Moments at Once
    console.log('\n📋 Test 5: Multiple Tactical Moments (Wicket + New Over + Phase Change)');
    totalTests++;

    const test5Prev = {
        team1: { name: 'SRH', score: 158, wickets: 3, overs: 15.6 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'middle'
    };

    const test5Curr = {
        team1: { name: 'SRH', score: 162, wickets: 4, overs: 16.0 },
        team2: { name: 'PBKS', score: 0, wickets: 0, overs: 0 },
        matchPhase: 'death'
    };

    const test5Moments = detectTacticalMoments(test5Prev, test5Curr);
    const hasMultiple = test5Moments.length >= 3;

    console.log(`   Previous: Over 15.6, 3 wickets → Current: Over 16.0, 4 wickets`);
    console.log(`   Detected moments: ${test5Moments.length}`);
    test5Moments.forEach(m => console.log(`     - ${m.message}`));
    console.log(`   Multiple moments detected: ${hasMultiple ? '✅' : '❌'}`);

    if (hasMultiple) testsPassed++;

    // Summary
    console.log('\n=========================================');
    console.log(`📊 Test Results: ${testsPassed}/${totalTests} passed`);

    if (testsPassed === totalTests) {
        console.log('\n✅ Script 3 PASSED - All tactical moment detections working!');
    } else {
        console.log(`\n⚠️  ${totalTests - testsPassed} test(s) failed`);
    }
}

runTacticalDetectionTests();
