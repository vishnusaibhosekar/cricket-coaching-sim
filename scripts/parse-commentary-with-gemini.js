#!/usr/bin/env node
/**
 * Script 8: Parse Commentary Overs with Gemini AI
 * 
 * Usage: node scripts/parse-commentary-with-gemini.js
 * 
 * Sends each over file to Gemini and gets back structured JSON
 * Outputs: PBKS_Innings/parsed-innings.json
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    process.exit(1);
}

const OVERS_DIR = path.join(__dirname, '../PBKS_Innings');
const OUTPUT_FILE = path.join(__dirname, '../PBKS_Innings/parsed-innings.json');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Build the parsing prompt for each over
 */
function buildParsingPrompt(overNumber, overContent) {
    return `Parse this cricket over commentary into structured JSON with shot placement zones.

Return ONLY valid JSON with this structure:
{
  "over": ${overNumber},
  "score_at_start": "score-wickets",
  "balls": [
    {
      "ball": "over.ball",
      "bowler": "Name",
      "batsman": "Name",
      "runs": 0,
      "is_wicket": false,
      "extras": null,
      "wicket": null,
      "shot_type": "drive",
      "shot_zone": "cover",
      "commentary": "short description"
    }
  ],
  "total_runs": 0,
  "wickets": 0
}

CRITICAL: Extract shot_zone from commentary based on where the ball was played:

SHOT ZONES (use exactly these values):
- slip_gully: Edges, catches behind, guiding shots
- point: Cuts, square cuts, punches through point
- cover: Drives through cover, straight drives, punches
- mid_off: Straight drives, pushes to mid-off region
- mid_on: Flicks to mid-on, pushes down the ground
- midwicket: Pulls, flicks through midwicket
- square_leg: Pulls, hooks, sweeps to square leg
- fine_leg: Hooks, pulls fine, deflections to fine leg
- third_man: Edges, glances, cuts to third man
- deep_cover: Lofted drives, big hits through cover
- deep_midwicket: Big pulls, lofted shots over midwicket
- long_on: Lofted straight drives, big hits down the ground
- long_off: Lofted drives over long-off
- deep_square_leg: Big pulls/sweeps to deep square leg
- deep_point: Cuts/power hits through deep point
- deep_third_man: Edges/cuts running away to third man
- boundary_rope: Shots that reach the boundary (specify direction if mentioned)
- no_shot: Defensive plays, dots, misses, no shot attempted

SHOT TYPE GUIDANCE:
- drive: Full ball, bat face straight, along ground
- pull: Short ball, horizontal bat swing, midwicket/square leg
- hook: Very short ball, upper body shot, square leg/fine leg
- cut: Wide/short ball, square of wicket, point region
- flick: Wristy shot, midwicket/mid-on region
- sweep: Low delivery, kneeling, square leg region
- lofted_drive: Full ball, aerial shot over infield
- edge: Unintended contact, usually slip/third man
- defend: Forward/backward defensive, no runs

Examples:
- "cuts a short and wide delivery" → shot_type: "cut", shot_zone: "point"
- "pulls to deep midwicket for six" → shot_type: "pull", shot_zone: "deep_midwicket"
- "drives straight to mid-off" → shot_type: "drive", shot_zone: "mid_off"
- "edges to slip" → shot_type: "edge", shot_zone: "slip_gully"
- "defends solidly" → shot_type: "defend", shot_zone: "no_shot"
- "hooked to fine leg" → shot_type: "hook", shot_zone: "fine_leg"

Rules:
- runs: number (0-6), or 0 for wickets
- is_wicket: true/false
- extras: "wide", "no_ball", or null
- wicket: {"type": "caught", "fielder": "Name", "batsman_out": "Name"} or null
- shot_type: infer from commentary (use guidance above)
- shot_zone: MUST be one of the zones listed above (infer from commentary context)
- commentary: keep it short (1 sentence max)
- Escape all quotes properly
- NO markdown, NO backticks, just raw JSON

Over commentary:
${overContent}

Return ONLY JSON:`;
}

/**
 * Repair JSON from Gemini response (handles truncation/malformation)
 */
function repairJSON(text) {
    // First try direct parse
    try {
        return JSON.parse(text);
    } catch (e) {
        // Extract JSON object
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON object found in response');
        }

        let jsonStr = jsonMatch[0];

        // Fix common issues
        jsonStr = jsonStr
            .replace(/,\s*}/g, '}') // Remove trailing commas
            .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
            .replace(/"([^"]*)"([^"]*)"/g, '"$1$2"'); // Fix unescaped quotes in strings

        try {
            return JSON.parse(jsonStr);
        } catch (e2) {
            console.warn(`  ⚠️  JSON repair failed: ${e2.message}`);
            throw new Error(`Failed to parse JSON: ${e2.message}`);
        }
    }
}

/**
 * Parse a single over with Gemini
 */
async function parseOver(overNumber, overContent) {
    console.log(`\n📋 Parsing Over ${overNumber}...`);

    const prompt = buildParsingPrompt(overNumber, overContent);

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1, // Low temperature for deterministic parsing
            },
        });

        const responseText = result.response.text();

        // Remove markdown code blocks if present
        let cleanText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const parsedJSON = JSON.parse(cleanText);

        console.log(`  ✅ Over ${overNumber} parsed successfully`);
        console.log(`     - Balls: ${parsedJSON.balls.length}`);
        console.log(`     - Runs: ${parsedJSON.total_runs}`);
        console.log(`     - Wickets: ${parsedJSON.wickets}`);
        console.log(`     - Shot zones extracted: ${parsedJSON.balls.filter(b => b.shot_zone).length}`);

        return parsedJSON;
    } catch (error) {
        console.error(`  ❌ Failed to parse over ${overNumber}: ${error.message}`);
        throw error;
    }
}

/**
 * Main: Parse all 20 overs
 */
async function main() {
    console.log('🏏 Script 8: Parse Commentary with Gemini AI\n');
    console.log('='.repeat(60));

    // Read all over files
    const overFiles = fs.readdirSync(OVERS_DIR)
        .filter(f => f.startsWith('over') && f.endsWith('.txt'))
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });

    console.log(`\n📂 Found ${overFiles.length} over files\n`);

    const parsedOvers = [];
    let successCount = 0;
    let failCount = 0;

    // Parse each over sequentially - wait for success before moving to next
    for (const overFile of overFiles) {
        const overNumber = parseInt(overFile.match(/\d+/)[0]);
        const overContent = fs.readFileSync(path.join(OVERS_DIR, overFile), 'utf8');

        let success = false;
        let retries = 0;
        const maxRetries = 3;

        while (!success && retries < maxRetries) {
            try {
                const parsedOver = await parseOver(overNumber, overContent);
                parsedOvers.push(parsedOver);
                successCount++;
                success = true;
            } catch (error) {
                retries++;
                failCount++;
                if (retries < maxRetries) {
                    console.warn(`  ⚠️  Retrying over ${overNumber} (attempt ${retries + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                } else {
                    console.error(`  ❌ Skipping over ${overNumber} after ${maxRetries} failed attempts`);
                }
            }
        }

        // Small delay between overs to avoid rate limiting
        if (successCount < overFiles.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    // Save results
    const inningsData = {
        matchId: 'srh-vs-pbks-2026-05-06',
        innings: 2, // PBKS innings
        battingTeam: 'PBKS',
        bowlingTeam: 'SRH',
        totalOvers: parsedOvers.length,
        overs: parsedOvers,
        metadata: {
            parsedAt: new Date().toISOString(),
            parser: 'gemini-2.5-flash',
            sourceFile: 'Commentary.txt',
            totalBalls: parsedOvers.reduce((sum, over) => sum + over.balls.length, 0),
            totalRuns: parsedOvers.reduce((sum, over) => sum + over.total_runs, 0),
            totalWickets: parsedOvers.reduce((sum, over) => sum + over.wickets, 0),
        }
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inningsData, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Parsing Summary:');
    console.log(`   ✅ Successful: ${successCount} overs`);
    console.log(`   ❌ Failed: ${failCount} overs`);
    console.log(`   📦 Output: ${OUTPUT_FILE}`);
    console.log(`   🏏 Total balls: ${inningsData.metadata.totalBalls}`);
    console.log(`   🏃 Total runs: ${inningsData.metadata.totalRuns}`);
    console.log(`   💥 Total wickets: ${inningsData.metadata.totalWickets}`);

    // Extract tactical moments
    const tacticalMoments = [];
    parsedOvers.forEach(over => {
        over.balls.forEach(ball => {
            if (ball.tactical_notes && ball.tactical_notes.length > 0) {
                tacticalMoments.push({
                    ball: ball.ball_number,
                    over: over.over,
                    notes: ball.tactical_notes,
                    isWicket: ball.is_wicket,
                });
            }
        });
    });

    if (tacticalMoments.length > 0) {
        console.log(`\n🎯 Tactical Moments Detected: ${tacticalMoments.length}`);
        tacticalMoments.forEach(moment => {
            console.log(`   - Over ${moment.ball}: ${moment.notes.join(', ')}`);
        });
    }

    console.log('\n✅ Script 8 complete!\n');
}

// Run
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
