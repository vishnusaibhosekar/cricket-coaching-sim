import { NextRequest, NextResponse } from 'next/server';
import { fetchContent } from '@/lib/tinyfish';
import { parseCricbuzzScorecard } from '@/lib/cricbuzz-parser';

export async function GET(request: NextRequest) {
    try {
        const cricbuzzUrl = process.env.CRICBUZZ_SCORECARD_URL;
        const matchId = process.env.NEXT_PUBLIC_MATCH_ID || 'srh-vs-pbks-2026-05-06';

        if (!cricbuzzUrl || cricbuzzUrl.includes('placeholder')) {
            return NextResponse.json(
                {
                    error: 'Match URL not configured. Update CRICBUZZ_SCORECARD_URL in .env.local',
                    useMock: true
                },
                { status: 200 }
            );
        }

        // Fetch live data from Cricbuzz via TinyFish
        const markdown = await fetchContent(cricbuzzUrl);

        // Parse the markdown into structured data
        const matchState = parseCricbuzzScorecard(markdown, matchId);

        return NextResponse.json(matchState, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error('Error fetching live match data:', error);

        // Return error state
        return NextResponse.json(
            {
                error: 'Failed to fetch live match data',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
