import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfileStats, insforge } from '@/lib/insforge';

// Submit a decision and update user profile stats
export async function POST(request: NextRequest) {
    try {
        const decision = await request.json();

        if (!insforge) {
            return NextResponse.json(
                { error: 'InsForge client not initialized' },
                { status: 500 }
            );
        }

        // Extract user_id from decision data
        const userId = decision.user_id;
        if (!userId) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            );
        }

        // Remove user_id from decision to avoid duplicate column
        delete decision.user_id;

        console.log('Submitting decision for user:', userId);

        // Add user_id to decision
        const decisionWithUser = {
            ...decision,
            user_id: userId,
        };

        // Insert decision into database
        const { data: decisionData, error: decisionError } = await insforge.database
            .from('decisions')
            .insert([decisionWithUser])
            .select()
            .single();

        if (decisionError) {
            console.error('Decision insert error:', decisionError);
            return NextResponse.json(
                { error: decisionError.message },
                { status: 500 }
            );
        }

        console.log('Decision submitted:', decisionData);

        // If merit_score is provided, update user profile stats immediately
        if (decision.merit_score !== undefined && decision.merit_score !== null) {
            await updateUserProfileStats(userId, decision.merit_score);
            console.log('User profile stats updated with score:', decision.merit_score);
        }

        return NextResponse.json({
            success: true,
            decisionId: decisionData.id,
            message: 'Decision submitted successfully'
        });
    } catch (error: any) {
        console.error('Decision submission error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit decision' },
            { status: 500 }
        );
    }
}
