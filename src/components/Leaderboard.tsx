'use client';

import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
    id: string;
    display_name: string;
    avatar_url: string;
    total_points: number;
    total_decisions: number;
    avg_score: number;
    best_score: number;
}

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Badge className="bg-yellow-500">🥇 1st</Badge>;
        if (rank === 2) return <Badge className="bg-gray-400">🥈 2nd</Badge>;
        if (rank === 3) return <Badge className="bg-orange-600">🥉 3rd</Badge>;
        return <Badge variant="secondary">#{rank}</Badge>;
    };

    if (entries.length === 0) {
        return (
            <Card className="p-8 bg-zinc-900 border-zinc-800 text-center">
                <p className="text-zinc-400">No decisions scored yet. Make your first decision!</p>
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-2xl font-bold text-white">Leaderboard</h3>
                <p className="text-sm text-zinc-400 mt-1">Ranked by total points</p>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-zinc-300">Rank</TableHead>
                        <TableHead className="text-zinc-300">Player</TableHead>
                        <TableHead className="text-zinc-300 text-right">Total Points</TableHead>
                        <TableHead className="text-zinc-300 text-right">Avg Score</TableHead>
                        <TableHead className="text-zinc-300 text-right">Best Score</TableHead>
                        <TableHead className="text-zinc-300 text-right">Decisions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry, index) => {
                        const rank = index + 1;
                        const isCurrentUser = entry.id === currentUserId;

                        return (
                            <TableRow
                                key={entry.id}
                                className={isCurrentUser ? 'bg-blue-900/20' : ''}
                            >
                                <TableCell>{getRankBadge(rank)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={entry.avatar_url} />
                                            <AvatarFallback>
                                                {entry.display_name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold text-white">
                                            {entry.display_name || 'Anonymous'}
                                            {isCurrentUser && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-white">
                                    {entry.total_points}
                                </TableCell>
                                <TableCell className="text-right text-zinc-300">
                                    {entry.avg_score.toFixed(1)}
                                </TableCell>
                                <TableCell className="text-right text-zinc-300">
                                    {entry.best_score}
                                </TableCell>
                                <TableCell className="text-right text-zinc-300">
                                    {entry.total_decisions}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
