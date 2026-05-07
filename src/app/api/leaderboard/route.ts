import { NextResponse } from 'next/server';
import { mockLeaderboard } from '@/lib/mock-data';

// Stage 3: Mock leaderboard endpoint
export async function GET() {
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(mockLeaderboard);
}
