'use client';

import { LeaderboardEntry } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-zinc-300">Rank</TableHead>
                        <TableHead className="text-zinc-300">Player</TableHead>
                        <TableHead className="text-zinc-300 text-right">Total Score</TableHead>
                        <TableHead className="text-zinc-300 text-right">Decisions</TableHead>
                        <TableHead className="text-zinc-300 text-right">Avg Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry, index) => {
                        const rank = index + 1;
                        const isCurrentUser = entry.user_id === currentUserId;

                        return (
                            <TableRow
                                key={entry.user_id}
                                className={isCurrentUser ? 'bg-blue-900/20' : ''}
                            >
                                <TableCell>{getRankBadge(rank)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={entry.avatar_url} />
                                            <AvatarFallback>{entry.display_name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold text-white">
                                            {entry.display_name}
                                            {isCurrentUser && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-white">
                                    {entry.total_merit}
                                </TableCell>
                                <TableCell className="text-right text-zinc-300">
                                    {entry.total_decisions}
                                </TableCell>
                                <TableCell className="text-right text-zinc-300">
                                    {entry.avg_merit.toFixed(1)}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
