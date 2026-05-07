import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

// Get leaderboard data from InsForge
export async function GET() {
    try {
        if (!insforge) {
            return NextResponse.json(
                { error: 'InsForge client not initialized' },
                { status: 500 }
            );
        }

        // Query user_profiles ordered by total_points DESC
        const { data, error } = await insforge.database
            .from('user_profiles')
            .select('*')
            .order('total_points', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Leaderboard query error:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        console.log('Leaderboard data:', data);
        return NextResponse.json(data || []);
    } catch (error: any) {
        console.error('Leaderboard API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
