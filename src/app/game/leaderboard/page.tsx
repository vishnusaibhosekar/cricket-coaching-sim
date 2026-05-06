'use client';

import { useState, useEffect } from 'react';
import { Leaderboard } from '@/components/Leaderboard';
import { LeaderboardEntry } from '@/lib/types';
import { Card } from '@/components/ui/card';

export default function LeaderboardPage() {
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

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Leaderboard</h2>
                <p className="text-zinc-400">
                    Ranked by total tactical merit score across all decisions
                </p>
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
