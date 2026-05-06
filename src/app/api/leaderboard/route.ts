import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/insforge';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get('matchId') || process.env.NEXT_PUBLIC_MATCH_ID || 'srh-vs-pbks-2026-05-06';

        // Get leaderboard data
        const leaderboard = await getLeaderboard(matchId);

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
