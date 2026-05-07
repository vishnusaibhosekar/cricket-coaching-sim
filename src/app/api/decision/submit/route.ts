import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

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

        // Get current user
        const { data: userData, error: userError } = await insforge.auth.getCurrentUser();

        if (userError || !userData?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const userId = userData.user.id;

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
