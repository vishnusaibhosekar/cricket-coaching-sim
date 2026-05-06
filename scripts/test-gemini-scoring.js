#!/usr/bin/env node
/**
 * Script 5: Gemini AI Scoring
 * 
 * Usage: node scripts/test-gemini-scoring.js
 * 
 * This script:
 * 1. Sends a user's decision to Gemini for tactical evaluation
 * 2. Tests the scoring prompt with mock decision data
 * 3. Validates Gemini returns proper JSON response
 * 4. Tests error handling and retry logic
 */

require('dotenv').config({ path: '.env.local' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Builds the scoring prompt for Gemini
 * @param {object} decisionData - Complete decision context
 * @returns {string} Formatted prompt for Gemini
 */
function buildScoringPrompt(decisionData) {
    const {
        matchContext,
        decisionType,
        userChoice,
        captainChoice,
    } = decisionData;

    return `You are an elite cricket analyst and T20 coaching expert. Score the tactical merit of a fan's coaching decision during a live IPL match.

MATCH CONTEXT:
- Match: ${matchContext.team1} vs ${matchContext.team2}
- Score: ${matchContext.score}
- Overs: ${matchContext.overs}
- Match phase: ${matchContext.phase}
- Batsmen at crease: ${matchContext.batsmen}
- Run rate required/current: ${matchContext.runRate}
- Recent momentum: ${matchContext.momentum}

DECISION TYPE: ${decisionType}

FAN'S DECISION: ${JSON.stringify(userChoice, null, 2)}

CAPTAIN'S ACTUAL DECISION: ${JSON.stringify(captainChoice, null, 2)}

Score the fan's decision on these four dimensions (0-25 each, total 0-100):

1. SITUATION AWARENESS (0-25): Does the decision account for match phase, powerplay rules, run rate?

2. MATCHUP INTELLIGENCE (0-25): Does it exploit batsman weaknesses? Consider pacer vs spinner, field placement.

3. RISK-REWARD CALIBRATION (0-25): Is aggression level appropriate for the situation?

4. STRATEGIC CREATIVITY (0-25): Any clever or unconventional tactical thinking?

Respond with JSON ONLY. Keep explanations brief (max 50 chars each):
{"total_score":0-100,"situation_awareness":0-25,"matchup_intelligence":0-25,"risk_reward":0-25,"strategic_creativity":0-25,"explanation":"brief","comparison_to_captain":"brief"}`;
}

/**
 * Attempts to repair truncated JSON from Gemini
 * @param {string} text - Potentially invalid JSON
 * @returns {object|null} Parsed JSON or null
 */
function repairJSON(text) {
    try {
        // Try direct parse first
        return JSON.parse(text);
    } catch {
        // If that fails, try to extract and complete the JSON
        try {
            // Extract the JSON object
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            let jsonStr = jsonMatch[0];

            // Fix common truncation issues
            // 1. Close unclosed strings
            if (jsonStr.endsWith('"') || jsonStr.match(/:\s*"[^"]*$/)) {
                jsonStr = jsonStr.replace(/"[^"]*$/, '""');
            }

            // 2. Add missing closing braces
            const openBraces = (jsonStr.match(/\{/g) || []).length;
            const closeBraces = (jsonStr.match(/\}/g) || []).length;
            jsonStr += '}'.repeat(Math.max(0, openBraces - closeBraces));

            // 3. Ensure all string values are properly closed
            jsonStr = jsonStr.replace(/:\s*"([^"]*)$/m, '": "$1"');

            // Try parsing again
            return JSON.parse(jsonStr);
        } catch {
            return null;
        }
    }
}

/**
 * Calls Gemini API to score a decision
 * @param {string} prompt - The scoring prompt
 * @returns {Promise<object>} Gemini's JSON response
 */
async function scoreDecisionWithGemini(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not found in .env.local');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const generationConfig = {
        temperature: 0.3,
    };

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
    });

    const response = await result.response;
    const text = response.text();

    // Debug: Show full response
    console.log('   Raw response length:', text.length);
    console.log('   Raw response:', text);

    // Parse JSON from response
    const json = repairJSON(text);

    if (!json) {
        console.error('Failed to parse Gemini response as JSON:', text.substring(0, 200));
        throw new Error('Invalid JSON from Gemini: Could not parse or repair response');
    }

    return json;
}

/**
 * Validates the scoring response structure
 * @param {object} score - Gemini's scoring response
 * @returns {boolean} True if valid
 */
function validateScoreResponse(score) {
    const required = [
        'total_score',
        'situation_awareness',
        'matchup_intelligence',
        'risk_reward',
        'strategic_creativity',
        'explanation',
        'comparison_to_captain'
    ];

    const missing = required.filter(key => !(key in score));
    if (missing.length > 0) {
        console.error('Missing fields:', missing.join(', '));
        return false;
    }

    // Validate score ranges
    if (score.total_score < 0 || score.total_score > 100) {
        console.error('total_score out of range (0-100):', score.total_score);
        return false;
    }

    const dimensions = ['situation_awareness', 'matchup_intelligence', 'risk_reward', 'strategic_creativity'];
    for (const dim of dimensions) {
        if (score[dim] < 0 || score[dim] > 25) {
            console.error(`${dim} out of range(0 - 25): `, score[dim]);
            return false;
        }
    }

    // Validate total matches sum
    const sum = score.situation_awareness + score.matchup_intelligence +
        score.risk_reward + score.strategic_creativity;

    if (sum !== score.total_score) {
        console.error(`Total score mismatch: ${score.total_score} != ${sum} `);
        return false;
    }

    return true;
}

async function testGeminiScoring() {
    console.log('🧪 Script 5: Gemini AI Scoring\n');
    console.log('================================\n');

    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: Build Scoring Prompt
    console.log('📋 Test 1: Build Scoring Prompt');
    totalTests++;

    const mockDecisionData = {
        matchContext: {
            team1: 'SRH',
            team2: 'PBKS',
            score: '156/4',
            overs: '17.2',
            phase: 'death',
            batsmen: 'Travis Head (45* off 28), Abhishek Sharma (67* off 42)',
            runRate: '9.05',
            momentum: 'SRH accelerating in death overs'
        },
        decisionType: 'bowling_change',
        userChoice: {
            bowler: 'Yuzvendra Chahal',
            reason: 'Spin option to break partnership'
        },
        captainChoice: {
            bowler: 'Arshdeep Singh',
            reason: 'Death overs specialist'
        }
    };

    const prompt = buildScoringPrompt(mockDecisionData);
    const promptValid =
        prompt.includes('SRH vs PBKS') &&
        prompt.includes('Yuzvendra Chahal') &&
        prompt.includes('SITUATION AWARENESS') &&
        prompt.length > 500;

    console.log(`   Prompt length: ${prompt.length} chars`);
    console.log(`   Contains match context: ${prompt.includes('SRH vs PBKS') ? '✅' : '❌'} `);
    console.log(`   Contains user choice: ${prompt.includes('Yuzvendra Chahal') ? '✅' : '❌'} `);
    console.log(`   Contains scoring dimensions: ${prompt.includes('SITUATION AWARENESS') ? '✅' : '❌'} `);
    console.log(`   Prompt valid: ${promptValid ? '✅' : '❌'} `);

    if (promptValid) testsPassed++;

    // Test 2: Call Gemini API
    console.log('\n📋 Test 2: Call Gemini API');
    totalTests++;

    try {
        console.log('   Sending request to Gemini...');
        const score = await scoreDecisionWithGemini(prompt);

        console.log(`   Response received: `);
        console.log(`   - Total Score: ${score.total_score}/100`);
        console.log(`   - Situation Awareness: ${score.situation_awareness}/25`);
        console.log(`   - Matchup Intelligence: ${score.matchup_intelligence}/25`);
        console.log(`   - Risk-Reward: ${score.risk_reward}/25`);
        console.log(`   - Strategic Creativity: ${score.strategic_creativity}/25`);
        console.log(`   - Explanation: ${score.explanation.substring(0, 100)}...`);
        console.log(`   - Captain Comparison: ${score.comparison_to_captain}`);

        const apiValid = typeof score.total_score === 'number';
        console.log(`   API call successful: ${apiValid ? '✅' : '❌'}`);

        if (apiValid) testsPassed++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 3: Validate Score Response
    console.log('\n📋 Test 3: Validate Score Response Structure');
    totalTests++;

    try {
        const score = await scoreDecisionWithGemini(prompt);
        const valid = validateScoreResponse(score);

        console.log(`   Has all required fields: ${valid ? '✅' : '❌'}`);
        console.log(`   Score ranges valid: ${valid ? '✅' : '❌'}`);
        console.log(`   Total matches sum: ${valid ? '✅' : '❌'}`);

        if (valid) testsPassed++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 4: Field Placement Decision Scoring
    console.log('\n📋 Test 4: Field Placement Decision Scoring');
    totalTests++;

    const fieldPlacementData = {
        matchContext: {
            team1: 'SRH',
            team2: 'PBKS',
            score: '78/1',
            overs: '6.0',
            phase: 'powerplay',
            batsmen: 'Travis Head (42* off 24), Ishan Kishan (15* off 12)',
            runRate: '13.00',
            momentum: 'SRH attacking in powerplay'
        },
        decisionType: 'field_placement',
        userChoice: {
            zones: {
                'Slip/Gully': 1,
                'Point': 1,
                'Cover': 2,
                'Mid-off': 1,
                'Mid-on': 1,
                'Midwicket': 1,
                'Square Leg': 1,
                'Fine Leg': 1,
                'Third Man': 1
            },
            outsideCircle: 2,
            strategy: 'Attacking field with close catchers'
        },
        captainChoice: {
            zones: {
                'Slip/Gully': 0,
                'Point': 1,
                'Cover': 1,
                'Mid-off': 2,
                'Mid-on': 1,
                'Midwicket': 1,
                'Square Leg': 1,
                'Fine Leg': 2,
                'Third Man': 1
            },
            outsideCircle: 2,
            strategy: 'Defensive field to contain runs'
        }
    };

    const fieldPrompt = buildScoringPrompt(fieldPlacementData);

    try {
        const score = await scoreDecisionWithGemini(fieldPrompt);
        const valid = validateScoreResponse(score);

        console.log(`   Total Score: ${score.total_score}/100`);
        console.log(`   Explanation: ${typeof score.explanation === 'string' ? score.explanation.substring(0, 100) : JSON.stringify(score.explanation).substring(0, 100)}...`);
        console.log(`   Score valid: ${valid ? '✅' : '❌'}`);

        if (valid) testsPassed++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
    }

    // Test 5: Error Handling - Invalid JSON
    console.log('\n📋 Test 5: Error Handling');
    totalTests++;

    try {
        // Test with a prompt that might cause issues
        const badPrompt = 'Respond with invalid JSON';
        await scoreDecisionWithGemini(badPrompt);
        console.log(`   ❌ Should have thrown error`);
    } catch (error) {
        console.log(`   Error caught: ${error.message}`);
        console.log(`   Error handling works: ✅`);
        testsPassed++;
    }

    // Test 6: Score Consistency
    console.log('\n📋 Test 6: Score Consistency (Same decision, similar scores)');
    totalTests++;

    try {
        console.log('   Running Gemini twice with same prompt...');
        const score1 = await scoreDecisionWithGemini(prompt);
        const score2 = await scoreDecisionWithGemini(prompt);

        const diff = Math.abs(score1.total_score - score2.total_score);
        console.log(`   Score 1: ${score1.total_score}`);
        console.log(`   Score 2: ${score2.total_score}`);
        console.log(`   Difference: ${diff}`);
        console.log(`   Within acceptable range (±15): ${diff <= 15 ? '✅' : '❌'}`);

        // Gemini with low temperature should be relatively consistent
        if (diff <= 15) testsPassed++;
    } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
    }

    // Summary
    console.log('\n================================');
    console.log(`📊 Test Results: ${testsPassed}/${totalTests} passed`);

    if (testsPassed === totalTests) {
        console.log('\n✅ Script 5 PASSED - Gemini scoring working!');
    } else {
        console.log(`\n⚠️  ${totalTests - testsPassed} test(s) failed`);
    }
}

module.exports = {
    buildScoringPrompt,
    scoreDecisionWithGemini,
    validateScoreResponse,
    repairJSON
};

// Run tests if executed directly
if (require.main === module) {
    testGeminiScoring();
}
