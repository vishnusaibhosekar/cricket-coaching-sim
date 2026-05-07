'use client';

import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface DecisionLog {
    over: number;
    ball: string;
    situation: string;
    userChoice: string;
    score: number;
    actualDecision: string;
}

interface CaptainsLogProps {
    decisions: DecisionLog[];
    totalScore: number;
}

export function CaptainsLog({ decisions, totalScore }: CaptainsLogProps) {
    const averageScore = decisions.length > 0
        ? Math.round(decisions.reduce((sum, d) => sum + d.score, 0) / decisions.length)
        : 0;

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 75) return 'bg-green-500/20 border-green-500/30';
        if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    return (
        <Card className="bg-zinc-900/80 border-zinc-700/50 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Captain's Log
                </h3>
                {decisions.length > 0 && (
                    <div className="bg-purple-600/20 px-3 py-1 rounded-full border border-purple-500/30">
                        <span className="text-purple-300 text-sm">Avg: </span>
                        <span className="text-white font-bold">{averageScore}</span>
                    </div>
                )}
            </div>

            {decisions.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-sm">
                    No decisions recorded yet
                </div>
            ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {decisions.map((decision, index) => (
                        <div
                            key={index}
                            className={`rounded-lg p-4 border ${getScoreBg(decision.score)}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-zinc-300">
                                    Over {decision.over}.{decision.ball}
                                </span>
                                <span className={`text-lg font-bold ${getScoreColor(decision.score)}`}>
                                    {decision.score}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-2">
                                {decision.situation}
                            </p>
                            <div className="mt-2 pt-2 border-t border-zinc-700/50">
                                <p className="text-xs text-zinc-500">
                                    <span className="text-zinc-400">Your pick:</span> {decision.userChoice}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    <span className="text-zinc-400">Actual:</span> {decision.actualDecision}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Overall Performance */}
            {decisions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Score</p>
                            <p className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                                {totalScore}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500">{decisions.length} decisions</p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
