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
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
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

// Sync user profile after OAuth sign-in
export async function syncUserProfile(user: any): Promise<void> {
    if (!insforge || !user) {
        return;
    }

    try {
        const userId = user.id || user.user?.id;
        if (!userId) {
            console.warn('No user ID found for profile sync');
            return;
        }

        // Check if profile already exists
        const { data: existingProfile } = await insforge.database
            .from('user_profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

        // If profile doesn't exist, create it
        if (!existingProfile) {
            const displayName = user.name || user.display_name || user.email || 'Anonymous';
            const avatarUrl = user.avatar_url || user.picture || '';

            await insforge.database
                .from('user_profiles')
                .insert([{
                    id: userId,
                    display_name: displayName,
                    avatar_url: avatarUrl,
                    total_points: 0,
                    total_decisions: 0,
                    avg_score: 0,
                    best_score: 0,
                }]);

            console.log('User profile created for:', userId);
        }
    } catch (error) {
        console.error('Error syncing user profile:', error);
    }
}

// Update user profile stats after scoring a decision
export async function updateUserProfileStats(
    userId: string,
    meritScore: number
): Promise<void> {
    if (!insforge || !userId) {
        return;
    }

    try {
        // Get current profile
        const { data: profile } = await insforge.database
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (!profile) {
            console.warn('No profile found for user:', userId);
            return;
        }

        // Calculate new stats
        const newTotalDecisions = profile.total_decisions + 1;
        const newTotalPoints = profile.total_points + meritScore;
        const newAvgScore = newTotalPoints / newTotalDecisions;
        const newBestScore = Math.max(profile.best_score, meritScore);

        // Update profile
        await insforge.database
            .from('user_profiles')
            .update({
                total_decisions: newTotalDecisions,
                total_points: newTotalPoints,
                avg_score: newAvgScore,
                best_score: newBestScore,
            })
            .eq('id', userId);

        console.log('User profile updated for:', userId, {
            totalDecisions: newTotalDecisions,
            totalPoints: newTotalPoints,
            avgScore: newAvgScore,
            bestScore: newBestScore,
        });
    } catch (error) {
        console.error('Error updating user profile stats:', error);
    }
}
