import { createClient } from '@insforge/sdk';
import { Decision, LeaderboardEntry } from './types';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;

if (!INSFORGE_URL) {
    console.warn('NEXT_PUBLIC_INSFORGE_URL is not configured');
}

// Initialize InsForge client
export const insforge = INSFORGE_URL
    ? createClient({
        baseUrl: INSFORGE_URL,
    })
    : null;

// Submit a decision to InsForge
export async function submitDecision(decision: Decision): Promise<any> {
    if (!insforge) {
        throw new Error('InsForge client not initialized');
    }

    try {
        const { data, error } = await insforge.database
            .from('decisions')
            .insert([decision]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error submitting decision:', error);
        throw error;
    }
}

// Update decision with score
export async function updateDecisionScore(
    decisionId: string,
    meritScore: number,
    meritBreakdown: any
): Promise<any> {
    if (!insforge) {
        throw new Error('InsForge client not initialized');
    }

    try {
        const { data, error } = await insforge.database
            .from('decisions')
            .update({
                merit_score: meritScore,
                merit_breakdown: meritBreakdown,
            })
            .eq('id', decisionId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating decision score:', error);
        throw error;
    }
}

// Get leaderboard data
export async function getLeaderboard(matchId: string): Promise<LeaderboardEntry[]> {
    if (!insforge) {
        throw new Error('InsForge client not initialized');
    }

    try {
        // First, try to get decisions with user data
        let data: any[] = [];
        let error: any = null;

        try {
            const result = await insforge.database
                .from('decisions')
                .select(`
                    id,
                    user_id,
                    merit_score,
                    match_context,
                    created_at
                `)
                .eq('match_id', matchId)
                .not('merit_score', 'is', null)
                .order('created_at', { ascending: false });

            data = result.data || [];
            error = result.error;
        } catch (dbError) {
            console.warn('Database query failed, returning empty leaderboard:', dbError);
            return [];
        }

        if (error) {
            console.warn('Database error:', error);
            return [];
        }

        // If no data, return empty array
        if (!data || data.length === 0) {
            return [];
        }

        // Aggregate leaderboard data by user
        const aggregated = data.reduce((acc: any, row: any) => {
            const userId = row.user_id || 'anonymous';
            if (!acc[userId]) {
                acc[userId] = {
                    user_id: userId,
                    display_name: `User_${userId.substring(0, 8)}`,
                    avatar_url: '',
                    total_decisions: 0,
                    total_merit: 0,
                    best_decision: 0,
                };
            }

            acc[userId].total_decisions += 1;
            acc[userId].total_merit += row.merit_score || 0;
            acc[userId].best_decision = Math.max(acc[userId].best_decision, row.merit_score || 0);

            return acc;
        }, {});

        // Calculate averages and sort
        const leaderboard: LeaderboardEntry[] = Object.values(aggregated).map((entry: any) => ({
            ...entry,
            avg_merit: entry.total_decisions > 0 ? entry.total_merit / entry.total_decisions : 0,
        })).sort((a: any, b: any) => b.total_merit - a.total_merit);

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
}

// Get user session
export async function getUserSession() {
    if (!insforge) {
        return null;
    }

    try {
        const { data } = await insforge.auth.getCurrentUser();
        return data;
    } catch (error) {
        console.error('Error getting user session:', error);
        return null;
    }
}
