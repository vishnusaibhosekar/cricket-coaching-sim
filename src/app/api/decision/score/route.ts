import { NextRequest, NextResponse } from 'next/server';
import { mockGeminiScore } from '@/lib/mock-data';

// Stage 3: Mock Gemini scoring endpoint
export async function POST(request: NextRequest) {
    try {
        const { decision, matchContext } = await request.json();

        // Simulate Gemini API delay (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Scoring decision:', decision);
        console.log('Match context:', matchContext);

        // Return mock Gemini score
        return NextResponse.json(mockGeminiScore);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to score decision' },
            { status: 500 }
        );
    }
}
