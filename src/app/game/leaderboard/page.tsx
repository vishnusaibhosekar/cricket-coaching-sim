'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaderboard } from '@/components/Leaderboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { insforge } from '@/lib/insforge';

interface LeaderboardEntry {
    id: string;
    display_name: string;
    avatar_url: string;
    total_points: number;
    total_decisions: number;
    avg_score: number;
    best_score: number;
}

export default function LeaderboardPage() {
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/leaderboard');
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        // Get current user
        const getCurrentUser = async () => {
            if (insforge) {
                const { data } = await insforge.auth.getCurrentUser();
                if (data?.user) {
                    setUserId(data.user.id);
                }
            }
        };

        fetchLeaderboard();
        getCurrentUser();
        const interval = setInterval(fetchLeaderboard, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/replay')}
                    className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Replay
                </Button>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Leaderboard</h2>
                    <p className="text-zinc-400">
                        Ranked by total points across all decisions
                    </p>
                </div>
            </div>

            {loading ? (
                <Card className="p-8 bg-zinc-900 border-zinc-800 text-center">
                    <p className="text-zinc-400">Loading leaderboard...</p>
                </Card>
            ) : (
                <Leaderboard entries={leaderboard} currentUserId={userId} />
            )}
        </div>
    );
}
