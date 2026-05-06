#!/usr/bin/env node
/**
 * Script 6: Full Pipeline Integration
 * 
 * Usage: node scripts/test-full-pipeline.js
 * 
 * This script tests the COMPLETE flow:
 * 1. Fetch live match data from Cricbuzz via TinyFish
 * 2. Parse into MatchState
 * 3. Detect tactical moments
 * 4. Generate decision prompts
 * 5. Simulate user decision
 * 6. Score with Gemini AI
 * 7. Output complete decision record
 */

const { fetchCricbuzzData, validateConfig } = require('../src/lib/cricbuzz-fetcher');
const { parseMatchState } = require('../src/lib/cricbuzz-parser');
const { detectTacticalMoments, getDecisionType } = require('../src/lib/tactical-detector');
const { buildScoringPrompt, scoreDecisionWithGemini, validateScoreResponse } = require('./test-gemini-scoring');

/**
 * Generates bowling options for a decision
 */
function generateBowlingOptions() {
    return [
        { name: 'Pat Cummins', overs: 3.0, maidens: 0, runs: 28, wickets: 1, economy: 9.33 },
        { name: 'Nitish Reddy', overs: 2.0, maidens: 0, runs: 11, wickets: 1, economy: 5.50 },
        { name: 'Eshan Malinga', overs: 3.0, maidens: 0, runs: 32, wickets: 1, economy: 10.67 },
        { name: 'Sakib Hussain', overs: 3.0, maidens: 0, runs: 35, wickets: 1, economy: 11.67 },
        { name: 'Shivang Kumar', overs: 3.0, maidens: 0, runs: 40, wickets: 2, economy: 13.33 },
    ];
}

/**
 * Generates a bowling change decision prompt
 */
function generateBowlingPrompt(matchState, bowlingOptions) {
    return {
        type: 'bowling_change',
        title: `OVER ${Math.floor(matchState.team1.overs) + 1} COMING UP`,
        timer: 45,
        context: {
            match: `${matchState.team1.name} vs ${matchState.team2.name}`,
            score: `${matchState.team1.name} ${matchState.team1.score}/${matchState.team1.wickets} (${matchState.team1.overs} ov)`,
            phase: matchState.matchPhase,
            runRate: matchState.currentRunRate,
        },
        bowlingOptions,
        message: 'Select who should bowl the next over',
    };
}

async function testFullPipeline() {
    console.log('🧪 Script 6: Full Pipeline Integration\n');
    console.log('========================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    try {
        // ============================================
        // STEP 1: Fetch Match Data
        // ============================================
        console.log('📡 STEP 1: Fetching live match data from Cricbuzz...\n');
        totalTests++;

        if (!validateConfig()) {
            throw new Error('Configuration validation failed');
        }

        const markdown = await fetchCricbuzzData();
        console.log(`✅ Fetched ${markdown.length} characters from Cricbuzz\n`);
        testsPassed++;

        // ============================================
        // STEP 2: Parse Match State
        // ============================================
        console.log('📋 STEP 2: Parsing match data...\n');
        totalTests++;

        const matchState = parseMatchState(markdown, 'srh-vs-pbks-2026-05-06');

        console.log(`Match: ${matchState.team1.name} vs ${matchState.team2.name}`);
        console.log(`Score: ${matchState.team1.score}/${matchState.team1.wickets} (${matchState.team1.overs} ov)`);
        console.log(`Phase: ${matchState.matchPhase}`);
        console.log(`Run Rate: ${matchState.currentRunRate}\n`);

        const parseValid = matchState.team1.name !== 'TBD' && matchState.team1.score > 0;
        console.log(`✅ Match state parsed: ${parseValid ? 'YES' : 'NO'}\n`);

        if (parseValid) testsPassed++;

        // ============================================
        // STEP 3: Simulate Tactical Moment
        // ============================================
        console.log('📋 STEP 3: Detecting tactical moments...\n');
        totalTests++;

        // Simulate a state change (over 15 → 16, death overs starting)
        const prevState = {
            team1: { name: matchState.team1.name, score: 158, wickets: 3, overs: 15.6 },
            team2: { name: matchState.team2.name, score: 0, wickets: 0, overs: 0 },
            matchPhase: 'middle',
            currentInnings: 1,
            currentBatsmen: [],
            currentRunRate: '10.13'
        };

        const currState = {
            team1: { name: matchState.team1.name, score: 165, wickets: 3, overs: 16.0 },
            team2: { name: matchState.team2.name, score: 0, wickets: 0, overs: 0 },
            matchPhase: 'death',
            currentInnings: 1,
            currentBatsmen: [],
            currentRunRate: '10.31'
        };

        const moments = detectTacticalMoments(prevState, currState);
        const decisionType = getDecisionType(moments);

        console.log(`Detected ${moments.length} tactical moment(s):`);
        moments.forEach(m => console.log(`  - ${m.message}`));
        console.log(`\nDecision type: ${decisionType}\n`);

        const detectionValid = moments.length > 0 && decisionType;
        console.log(`✅ Tactical moments detected: ${detectionValid ? 'YES' : 'NO'}\n`);

        if (detectionValid) testsPassed++;

        // ============================================
        // STEP 4: Generate Decision Prompt
        // ============================================
        console.log('📋 STEP 4: Generating decision prompt...\n');
        totalTests++;

        const bowlingOptions = generateBowlingOptions();
        const decisionPrompt = generateBowlingPrompt(currState, bowlingOptions);

        console.log(`Prompt Title: ${decisionPrompt.title}`);
        console.log(`Decision Type: ${decisionPrompt.type}`);
        console.log(`Timer: ${decisionPrompt.timer}s`);
        console.log(`Bowling Options: ${decisionPrompt.bowlingOptions.length} bowlers`);
        console.log(`Match Context: ${decisionPrompt.context.score}\n`);

        const promptValid = decisionPrompt.type === decisionType && decisionPrompt.bowlingOptions.length > 0;
        console.log(`✅ Decision prompt generated: ${promptValid ? 'YES' : 'NO'}\n`);

        if (promptValid) testsPassed++;

        // ============================================
        // STEP 5: Simulate User Decision
        // ============================================
        console.log('📋 STEP 5: Simulating user decision...\n');
        totalTests++;

        // Simulate user selecting a bowler
        const userDecision = {
            bowler: 'Yuzvendra Chahal',
            reason: 'Spin option to break partnership in death overs'
        };

        // Simulate captain's actual decision
        const captainDecision = {
            bowler: 'Pat Cummins',
            reason: 'Death overs specialist with pace'
        };

        console.log(`User chose: ${userDecision.bowler}`);
        console.log(`Captain chose: ${captainDecision.bowler}\n`);

        const userDecisionValid = userDecision.bowler && captainDecision.bowler;
        console.log(`✅ User decision simulated: ${userDecisionValid ? 'YES' : 'NO'}\n`);

        if (userDecisionValid) testsPassed++;

        // ============================================
        // STEP 6: Score with Gemini
        // ============================================
        console.log('📋 STEP 6: Scoring decision with Gemini AI...\n');
        totalTests++;

        const scoringData = {
            matchContext: {
                team1: matchState.team1.name,
                team2: matchState.team2.name,
                score: `${currState.team1.score}/${currState.team1.wickets}`,
                overs: currState.team1.overs.toString(),
                phase: currState.matchPhase,
                batsmen: 'Nitish Reddy (29* off 13), Heinrich Klaasen (69* off 43)',
                runRate: currState.currentRunRate,
                momentum: 'SRH accelerating in death overs'
            },
            decisionType: decisionType,
            userChoice: userDecision,
            captainChoice: captainDecision
        };

        const prompt = buildScoringPrompt(scoringData);
        const score = await scoreDecisionWithGemini(prompt);
        const scoreValid = validateScoreResponse(score);

        console.log(`Scoring Results:`);
        console.log(`  Total Score: ${score.total_score}/100`);
        console.log(`  Situation Awareness: ${score.situation_awareness}/25`);
        console.log(`  Matchup Intelligence: ${score.matchup_intelligence}/25`);
        console.log(`  Risk-Reward: ${score.risk_reward}/25`);
        console.log(`  Strategic Creativity: ${score.strategic_creativity}/25`);
        console.log(`  Explanation: ${typeof score.explanation === 'string' ? score.explanation : JSON.stringify(score.explanation)}`);
        console.log(`  Captain Comparison: ${score.comparison_to_captain}\n`);

        console.log(`✅ Decision scored: ${scoreValid ? 'YES' : 'NO'}\n`);

        if (scoreValid) testsPassed++;

        // ============================================
        // STEP 7: Complete Decision Record
        // ============================================
        console.log('📋 STEP 7: Creating complete decision record...\n');
        totalTests++;

        const decisionRecord = {
            userId: 'user-123',
            matchId: matchState.matchId,
            overNumber: Math.floor(currState.team1.overs),
            decisionType: decisionType,
            userChoice: userDecision,
            actualChoice: captainDecision,
            matchContext: {
                score: currState.team1.score,
                wickets: currState.team1.wickets,
                overs: currState.team1.overs,
                phase: currState.matchPhase,
                runRate: currState.currentRunRate
            },
            meritScore: score.total_score,
            meritBreakdown: {
                situation_awareness: score.situation_awareness,
                matchup_intelligence: score.matchup_intelligence,
                risk_reward: score.risk_reward,
                strategic_creativity: score.strategic_creativity,
                explanation: score.explanation,
                comparison_to_captain: score.comparison_to_captain
            },
            createdAt: new Date().toISOString()
        };

        console.log('Complete Decision Record:');
        console.log(JSON.stringify(decisionRecord, null, 2));

        const recordValid =
            decisionRecord.userId &&
            decisionRecord.matchId &&
            decisionRecord.meritScore >= 0 &&
            decisionRecord.meritBreakdown;

        console.log(`\n✅ Decision record created: ${recordValid ? 'YES' : 'NO'}\n`);

        if (recordValid) testsPassed++;

        // ============================================
        // FINAL SUMMARY
        // ============================================
        console.log('========================================');
        console.log(`📊 FINAL RESULTS: ${testsPassed}/${totalTests} tests passed\n`);

        if (testsPassed === totalTests) {
            console.log('🎉 SCRIPT 6 PASSED - Full pipeline integration successful!\n');
            console.log('Pipeline Flow Verified:');
            console.log('  ✅ TinyFetch → Cricbuzz data fetched');
            console.log('  ✅ Parser → Match state extracted');
            console.log('  ✅ Detector → Tactical moments identified');
            console.log('  ✅ Generator → Decision prompt created');
            console.log('  ✅ User → Decision simulated');
            console.log('  ✅ Gemini → Decision scored');
            console.log('  ✅ Database → Decision record ready for storage\n');
            console.log('Ready to build the Next.js app! 🚀');
        } else {
            console.log(`⚠️  ${totalTests - testsPassed} test(s) failed`);
        }

    } catch (error) {
        console.error('\n❌ Pipeline failed with error:');
        console.error(error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

testFullPipeline();
