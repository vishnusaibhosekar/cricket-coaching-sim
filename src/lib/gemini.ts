import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiScore, MatchState, DecisionType, BowlingChoice, FieldPlacementChoice } from './types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not configured');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export async function scoreDecision(
    matchState: MatchState,
    decisionType: DecisionType,
    userChoice: BowlingChoice | FieldPlacementChoice,
    actualChoice: BowlingChoice | FieldPlacementChoice
): Promise<GeminiScore> {
    if (!genAI) {
        throw new Error('Gemini API not configured');
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
            responseMimeType: 'application/json',
        }
    });

    const battingTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;
    const prompt = `You are an elite cricket analyst and T20 coaching expert. Score the tactical merit of a fan's coaching decision during a live IPL match.

MATCH CONTEXT:
- Match: ${matchState.team1.name} vs ${matchState.team2.name}
- Score: ${battingTeam.name} ${battingTeam.score}/${battingTeam.wickets} (${battingTeam.overs} ov)
- Overs: ${battingTeam.overs}
- Match phase: ${matchState.matchPhase}
- Batsmen at crease: ${matchState.currentBatsmen.map(b => `${b.name} (SR: ${b.strikeRate})`).join(', ')}
- Current bowler: ${matchState.currentBowler.name} (Economy: ${matchState.currentBowler.economy})
- Run rate: ${matchState.currentRunRate}
${matchState.requiredRunRate ? `- Required run rate: ${matchState.requiredRunRate}` : ''}
- Recent momentum: Last ${matchState.recentOvers.length} overs: ${matchState.recentOvers.join(', ')}

DECISION TYPE: ${decisionType}

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

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const score: GeminiScore = JSON.parse(text);

        // Validate response structure
        if (typeof score.total_score !== 'number' ||
            typeof score.situation_awareness !== 'number' ||
            typeof score.matchup_intelligence !== 'number' ||
            typeof score.risk_reward !== 'number' ||
            typeof score.strategic_creativity !== 'number') {
            throw new Error('Invalid Gemini response structure');
        }

        return score;
    } catch (error) {
        console.error('Gemini scoring error:', error);
        throw error;
    }
}
