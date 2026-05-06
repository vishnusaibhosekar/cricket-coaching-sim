import { NextRequest, NextResponse } from 'next/server';
import { scoreDecision } from '@/lib/gemini';
import { updateDecisionScore } from '@/lib/insforge';
import { MatchState, DecisionType, BowlingChoice, FieldPlacementChoice } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { decisionId, matchState, decisionType, userChoice, actualChoice } = body;

        if (!decisionId || !matchState || !decisionType || !userChoice || !actualChoice) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Score the decision using Gemini
        const geminiScore = await scoreDecision(
            matchState,
            decisionType as DecisionType,
            userChoice as BowlingChoice | FieldPlacementChoice,
            actualChoice as BowlingChoice | FieldPlacementChoice
        );

        // Update the decision with the score
        await updateDecisionScore(
            decisionId,
            geminiScore.total_score,
            geminiScore
        );

        return NextResponse.json({ success: true, score: geminiScore });
    } catch (error) {
        console.error('Error in decision scoring:', error);
        return NextResponse.json(
            { error: 'Failed to score decision', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
