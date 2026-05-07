import { NextRequest, NextResponse } from 'next/server';
import { mockMatchState } from '@/lib/mock-data';

// Stage 3: Mock API endpoint that returns mock data instead of calling TinyFish
export async function GET(request: NextRequest) {
    // Simulate a small delay for realism
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(mockMatchState, {
        headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
    });
}
