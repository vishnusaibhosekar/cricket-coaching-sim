import { NextRequest, NextResponse } from 'next/server';
import { insforge, updateUserProfileStats } from '@/lib/insforge';

// Score a decision and update user profile stats
export async function POST(request: NextRequest) {
    try {
        const { decisionId, meritScore, meritBreakdown } = await request.json();

        if (!insforge) {
            return NextResponse.json(
                { error: 'InsForge client not initialized' },
                { status: 500 }
            );
        }

        // Update decision with score
        const { error: updateError } = await insforge.database
            .from('decisions')
            .update({
                merit_score: meritScore,
                merit_breakdown: meritBreakdown,
            })
            .eq('id', decisionId);

        if (updateError) {
            console.error('Failed to update decision score:', updateError);
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        // Get the decision to find user_id
        const { data: decision } = await insforge.database
            .from('decisions')
            .select('user_id')
            .eq('id', decisionId)
            .single();

        if (decision?.user_id) {
            // Update user profile stats
            await updateUserProfileStats(decision.user_id, meritScore);
        }

        console.log('Decision scored:', decisionId, 'Score:', meritScore);

        return NextResponse.json({
            success: true,
            message: 'Score saved successfully'
        });
    } catch (error: any) {
        console.error('Scoring error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to score decision' },
            { status: 500 }
        );
    }
}
