#!/usr/bin/env node
/**
 * Test 3: Gemini API - Score a Decision
 * 
 * Usage: node scripts/test-gemini-scoring.js
 * 
 * Tests the Gemini AI scoring integration with mock match data
 */

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGeminiScoring() {
    console.log('🧪 Testing Gemini API - Decision Scoring\n');
    console.log('===========================================\n');

    // Check configuration
    if (!GEMINI_API_KEY) {
        console.error('❌ Error: GEMINI_API_KEY not found in .env.local');
        process.exit(1);
    }

    console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 20)}...`);
    console.log('📝 Using mock match data\n');

    // Mock match context
    const matchContext = {
        team1: { name: 'SRH' },
        team2: { name: 'PBKS' },
        currentInnings: 1,
        team1: { name: 'SRH', score: 156, wickets: 4, overs: 17.2 },
        matchPhase: 'death',
        currentBatsmen: [
            { name: 'Travis Head', strikeRate: 160.71 },
            { name: 'Abhishek Sharma', strikeRate: 159.52 }
        ],
        currentBowler: { name: 'Arshdeep Singh', economy: 8.25 },
        currentRunRate: 9.02,
        recentOvers: ['1 4 2 1 6 1', '2 1 1 4 1 W', '1 1 2 1 4 1'],
    };

    const userChoice = { bowlerName: 'Kagiso Rabada' };
    const actualChoice = { bowlerName: 'Pat Cummins' };

    const prompt = `You are an elite cricket analyst and T20 coaching expert. Score the tactical merit of a fan's coaching decision during a live IPL match.

MATCH CONTEXT:
- Match: ${matchContext.team1.name} vs ${matchContext.team2.name}
- Score: ${matchContext.team1.name} ${matchContext.team1.score}/${matchContext.team1.wickets} (${matchContext.team1.overs} ov)
- Overs: ${matchContext.team1.overs}
- Match phase: ${matchContext.matchPhase}
- Batsmen at crease: ${matchContext.currentBatsmen.map(b => `${b.name} (SR: ${b.strikeRate})`).join(', ')}
- Current bowler: ${matchContext.currentBowler.name} (Economy: ${matchContext.currentBowler.economy})
- Run rate: ${matchContext.currentRunRate}
- Recent momentum: Last ${matchContext.recentOvers.length} overs: ${matchContext.recentOvers.join(', ')}

DECISION TYPE: bowling_change

FAN'S DECISION: ${JSON.stringify(userChoice)}

CAPTAIN'S ACTUAL DECISION: ${JSON.stringify(actualChoice)}

Score the fan's decision on these four dimensions (0-25 each, total 0-100):

1. SITUATION AWARENESS (0-25): Does the decision account for the match phase, powerplay rules, required run rate, and current momentum?

2. MATCHUP INTELLIGENCE (0-25): Does the decision exploit known weaknesses of the batsman? For bowling: pacer vs spinner matchup, left-arm angle. For field: placement targeting the batsman's scoring zones or cutting off strengths.

3. RISK-REWARD CALIBRATION (0-25): Is the aggression level appropriate? Attacking field when defending a big total, defensive setup when protecting a small total, etc.

4. STRATEGIC CREATIVITY (0-25): Is there something clever or unconventional that could work? Bonus for non-obvious but sound tactical thinking.

Respond in JSON only, no markdown:
{
  "total_score": <0-100>,
  "situation_awareness": <0-25>,
  "matchup_intelligence": <0-25>,
  "risk_reward": <0-25>,
  "strategic_creativity": <0-25>,
  "explanation": "<2-3 sentence analysis of the fan's decision>",
  "comparison_to_captain": "<1 sentence comparing to what the captain actually did>"
}`;

    console.log('⏳ Sending request to Gemini...\n');

    try {
        const startTime = Date.now();

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500,
                    responseMimeType: 'application/json',
                }
            }),
        });

        const duration = Date.now() - startTime;

        console.log(`⏱️  Response time: ${duration}ms`);
        console.log(`📊 Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error(`\n❌ Request failed with status ${response.status}`);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            process.exit(1);
        }

        const data = await response.json();

        console.log('\n✅ Request successful!\n');

        // Extract response text
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            console.error('❌ No response text from Gemini');
            console.log('Full response:', JSON.stringify(data, null, 2));
            process.exit(1);
        }

        console.log('📄 Raw response:');
        console.log('─'.repeat(60));
        console.log(responseText);
        console.log('─'.repeat(60));

        // Parse JSON
        console.log('\n🔍 Parsing JSON response...\n');

        try {
            const score = JSON.parse(responseText);

            console.log('✅ JSON parsed successfully!\n');
            console.log('📊 Score Breakdown:');
            console.log(`   - Total Score: ${score.total_score}/100`);
            console.log(`   - Situation Awareness: ${score.situation_awareness}/25`);
            console.log(`   - Matchup Intelligence: ${score.matchup_intelligence}/25`);
            console.log(`   - Risk-Reward: ${score.risk_reward}/25`);
            console.log(`   - Strategic Creativity: ${score.strategic_creativity}/25`);
            console.log(`\n💬 Explanation: ${score.explanation}`);
            console.log(`\n🆚 Captain Comparison: ${score.comparison_to_captain}`);

            // Validation
            console.log('\n🔍 Validation:');
            const validScore = score.total_score >= 0 && score.total_score <= 100;
            const validDimensions =
                score.situation_awareness >= 0 && score.situation_awareness <= 25 &&
                score.matchup_intelligence >= 0 && score.matchup_intelligence <= 25 &&
                score.risk_reward >= 0 && score.risk_reward <= 25 &&
                score.strategic_creativity >= 0 && score.strategic_creativity <= 25;

            console.log(`   - Total score in range (0-100): ${validScore ? '✅' : '❌'}`);
            console.log(`   - All dimensions in range (0-25): ${validDimensions ? '✅' : '❌'}`);
            console.log(`   - Has explanation: ${score.explanation ? '✅' : '❌'}`);
            console.log(`   - Has captain comparison: ${score.comparison_to_captain ? '✅' : '❌'}`);

            if (validScore && validDimensions) {
                console.log('\n✅ Gemini scoring test PASSED');
            } else {
                console.log('\n⚠️  Response structure invalid');
                process.exit(1);
            }

        } catch (parseError) {
            console.error('❌ Failed to parse JSON response:');
            console.error(parseError.message);
            process.exit(1);
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

testGeminiScoring();
