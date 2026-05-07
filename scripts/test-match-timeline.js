#!/usr/bin/env node
/**
 * Script 7 (Final): Test Match Timeline Data
 * 
 * Usage: node scripts/test-match-timeline.js
 * 
 * Tests that we can load and use the hardcoded match timeline
 */

const matchTimeline = require('../src/data/srh-vs-pbks-timeline.js');

function testMatchTimeline() {
    console.log('🧪 Script 7: Match Timeline Data\n');
    console.log('==================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: Load timeline
    console.log('📋 Test 1: Load Match Timeline');
    totalTests++;

    console.log(`   Match: ${matchTimeline.teams.team1.name} vs ${matchTimeline.teams.team2.name}`);
    console.log(`   Result: ${matchTimeline.result}`);
    console.log(`   Final Score: SRH ${matchTimeline.finalScore.SRH.score}/${matchTimeline.finalScore.SRH.wickets} (${matchTimeline.finalScore.SRH.overs} ov)`);
    console.log(`   Tactical Moments: ${matchTimeline.tacticalMoments.length}`);

    const loaded = matchTimeline.tacticalMoments.length > 0;
    console.log(`   Timeline loaded: ${loaded ? '✅' : '❌'}\n`);

    if (loaded) testsPassed++;

    // Test 2: Access key moments
    console.log('📋 Test 2: Access Key Tactical Moments');
    totalTests++;

    const keyMoments = matchTimeline.tacticalMoments.filter(m =>
        m.event === 'powerplay_end' || m.event === 'death_overs_start'
    );

    console.log(`   Found ${keyMoments.length} key moments:`);
    keyMoments.forEach(m => {
        console.log(`   - Over ${m.over}: ${m.description}`);
        console.log(`     Score: ${m.score}/${m.wickets}, Phase: ${m.phase}`);
        console.log(`     Decision: ${m.decisionType}\n`);
    });

    const hasKeyMoments = keyMoments.length >= 2;
    console.log(`   Key moments accessible: ${hasKeyMoments ? '✅' : '❌'}\n`);

    if (hasKeyMoments) testsPassed++;

    // Test 3: Get 16th over data (the one you asked about!)
    console.log('📋 Test 3: Get 16th Over Data');
    totalTests++;

    const over16 = matchTimeline.tacticalMoments.find(m => m.over === 16);

    if (over16) {
        console.log(`   Over: ${over16.over}`);
        console.log(`   Event: ${over16.event}`);
        console.log(`   Score: ${over16.score}/${over16.wickets}`);
        console.log(`   Phase: ${over16.phase}`);
        console.log(`   Batsmen: ${over16.context.batsmenAtCrease.join(', ')}`);
        console.log(`   Run Rate: ${over16.context.runRate}`);
        console.log(`   Decision Type: ${over16.decisionType}`);
        console.log(`   ✅ 16th over data available!\n`);
        testsPassed++;
    } else {
        console.log('   ❌ 16th over data not found\n');
    }

    // Test 4: Get bowling options
    console.log('📋 Test 4: Get Bowling Options');
    totalTests++;

    const bowlingOptions = matchTimeline.bowlingOptions.PBKS;
    console.log(`   Available bowlers: ${bowlingOptions.length}`);
    bowlingOptions.forEach(b => {
        console.log(`   - ${b.name}: ${b.overs} ov, ${b.wickets} wkts, ECO: ${b.economy}`);
    });

    const hasBowlers = bowlingOptions.length >= 5;
    console.log(`\n   Bowling options available: ${hasBowlers ? '✅' : '❌'}\n`);

    if (hasBowlers) testsPassed++;

    // Test 5: Simulate replay mode
    console.log('📋 Test 5: Simulate Replay Mode Decision');
    totalTests++;

    // Pick the 16th over moment for replay
    const replayMoment = matchTimeline.tacticalMoments.find(m => m.over === 16);

    if (replayMoment) {
        console.log('   📱 REPLAY MODE - Decision Card:');
        console.log(`   Title: OVER ${Math.floor(replayMoment.over) + 1} COMING UP`);
        console.log(`   Match: ${replayMoment.context.batsmenAtCrease.join(' & ')}`);
        console.log(`   Score: ${replayMoment.score}/${replayMoment.wickets} (${replayMoment.over} ov)`);
        console.log(`   Phase: ${replayMoment.phase.toUpperCase()}`);
        console.log(`   Run Rate: ${replayMoment.context.runRate}`);
        console.log(`   \n   Bowling Options:`);

        bowlingOptions.forEach(b => {
            console.log(`   ○ ${b.name.padEnd(25)} | ${b.overs} ov | ${b.wickets} wkts | ECO: ${b.economy}`);
        });

        console.log(`\n   ✅ Replay mode simulation successful!\n`);
        testsPassed++;
    } else {
        console.log('   ❌ Could not simulate replay\n');
    }

    // Summary
    console.log('==================================');
    console.log(`📊 Test Results: ${testsPassed}/${totalTests} passed\n`);

    if (testsPassed === totalTests) {
        console.log('✅ Script 7 PASSED - Match timeline data working!\n');
        console.log('Summary:');
        console.log('  ✅ Match timeline loaded');
        console.log('  ✅ Key tactical moments accessible');
        console.log('  ✅ 16th over data available (180/3)');
        console.log('  ✅ Bowling options available');
        console.log('  ✅ Replay mode simulation works\n');
        console.log('Ready for demo with REAL match data! 🏏');
    } else {
        console.log(`⚠️  ${totalTests - testsPassed} test(s) failed`);
    }
}

testMatchTimeline();
