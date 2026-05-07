'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BallData } from '@/lib/replay-data';

interface CommentaryEntry {
    ball: string;
    commentary: string;
    runs: number;
    isWicket: boolean;
    isBoundary: boolean;
    isSix: boolean;
    milestone?: string;
}

interface ReplayCommentaryProps {
    currentBall: BallData & { overNumber: number };
    commentaryHistory: CommentaryEntry[];
}

export function ReplayCommentary({ currentBall, commentaryHistory }: ReplayCommentaryProps) {
    const getBallBadge = (ball: CommentaryEntry) => {
        if (ball.isWicket) {
            return <Badge className="bg-red-600">W</Badge>;
        }
        if (ball.isSix) {
            return <Badge className="bg-green-600">6</Badge>;
        }
        if (ball.isBoundary) {
            return <Badge className="bg-blue-600">4</Badge>;
        }
        if (ball.runs === 0) {
            return <Badge variant="outline" className="text-zinc-500">0</Badge>;
        }
        return <Badge variant="secondary">{ball.runs}</Badge>;
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800 p-6">
            {/* Current Ball - Large Display */}
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                    <Badge className="text-lg bg-blue-600">
                        Over {currentBall.overNumber}.{currentBall.ball.split('.')[1]}
                    </Badge>
                    {currentBall.is_wicket && (
                        <Badge className="text-lg bg-red-600 animate-pulse">WICKET!</Badge>
                    )}
                    {currentBall.runs === 6 && (
                        <Badge className="text-lg bg-green-600 animate-pulse">SIX!</Badge>
                    )}
                    {currentBall.runs === 4 && (
                        <Badge className="text-lg bg-blue-600 animate-pulse">FOUR!</Badge>
                    )}
                </div>
                <p className="text-xl text-white font-medium leading-relaxed">
                    {currentBall.commentary}
                </p>
                <div className="mt-3 text-sm text-zinc-400">
                    <span className="font-semibold">{currentBall.bowler}</span> to{' '}
                    <span className="font-semibold">{currentBall.batsman}</span>
                </div>
            </div>

            {/* Commentary History */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                    Recent Balls
                </h3>
                {commentaryHistory.map((entry, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${entry.isWicket
                                ? 'bg-red-900/20 border border-red-800/30'
                                : entry.isSix
                                    ? 'bg-green-900/20 border border-green-800/30'
                                    : entry.isBoundary
                                        ? 'bg-blue-900/20 border border-blue-800/30'
                                        : 'bg-zinc-800/50'
                            }`}
                    >
                        <div className="flex-shrink-0">{getBallBadge(entry)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{entry.commentary}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                                Ball {entry.ball}
                            </p>
                        </div>
                        {entry.milestone && (
                            <Badge className="bg-yellow-600 text-xs flex-shrink-0">
                                {entry.milestone}
                            </Badge>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
