import { NextRequest, NextResponse } from 'next/server';
import { submitDecision } from '@/lib/insforge';
import { Decision } from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const decision: Decision = await request.json();

        // Validate required fields
        if (!decision.match_id || !decision.over_number || !decision.decision_type || !decision.user_choice) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Submit decision to InsForge
        const result = await submitDecision(decision);

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in decision submit:', error);
        return NextResponse.json(
            { error: 'Failed to submit decision', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
