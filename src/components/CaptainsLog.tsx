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
        <Card className="bg-zinc-900/80 border-zinc-700/50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Captain's Log
                </h3>
                {decisions.length > 0 && (
                    <div className="bg-purple-600/20 px-4 py-2 rounded-full border border-purple-500/30">
                        <span className="text-purple-300 text-sm">Avg: </span>
                        <span className="text-white font-bold">{averageScore}</span>
                    </div>
                )}
            </div>

            {decisions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm">
                    No decisions recorded yet
                </div>
            ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {[...decisions].reverse().map((decision, index) => (
                        <div
                            key={index}
                            className={`rounded-lg p-4 border ${getScoreBg(decision.score)}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-zinc-300">
                                    Over {decision.over}.{decision.ball}
                                </span>
                                <span className={`text-lg font-bold ${getScoreColor(decision.score)}`}>
                                    {decision.score} pts
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
                                {decision.situation}
                            </p>
                            <div className="pt-2 border-t border-zinc-700/50 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-zinc-500">
                                        <span className="text-zinc-400 font-medium">Your pick:</span>
                                    </p>
                                    <p className="text-sm text-zinc-300 mt-1">{decision.userChoice}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">
                                        <span className="text-zinc-400 font-medium">Actual:</span>
                                    </p>
                                    <p className="text-sm text-zinc-300 mt-1">{decision.actualDecision}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Overall Performance */}
            {decisions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-zinc-700/50">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Score</p>
                            <p className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
                                {totalScore}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Balls Faced</p>
                            <p className="text-3xl font-bold text-white">{decisions.length}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide">Average</p>
                            <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                                {averageScore}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
