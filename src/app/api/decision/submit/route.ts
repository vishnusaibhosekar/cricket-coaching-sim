import { NextRequest, NextResponse } from 'next/server';

// Stage 3: Mock decision submission endpoint
export async function POST(request: NextRequest) {
    try {
        const decision = await request.json();

        console.log('Decision submitted:', decision);

        // In production, this would store in InsForge database
        // For now, just return success
        return NextResponse.json({
            success: true,
            decisionId: 'mock-id-' + Date.now(),
            message: 'Decision submitted successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to submit decision' },
            { status: 500 }
        );
    }
}
