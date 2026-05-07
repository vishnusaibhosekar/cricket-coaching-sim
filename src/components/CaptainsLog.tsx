'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, XCircle, CheckCircle } from 'lucide-react';

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

    const getScoreBadge = (score: number) => {
        if (score >= 80) {
            return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Excellent</Badge>;
        }
        if (score >= 60) {
            return <Badge className="bg-blue-600"><Target className="h-3 w-3 mr-1" />Good</Badge>;
        }
        return <Badge className="bg-orange-600"><XCircle className="h-3 w-3 mr-1" />Could Improve</Badge>;
    };

    const getSituationIcon = (situation: string) => {
        switch (situation) {
            case 'wicket':
                return '💥';
            case 'boundary':
                return '🔥';
            case 'high_scoring_over':
                return '⚠️';
            case 'milestone':
                return '🏆';
            default:
                return '📊';
        }
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Captain's Log
                </h3>
                {decisions.length > 0 && (
                    <Badge className="text-lg bg-purple-600">
                        Avg: {averageScore}/100
                    </Badge>
                )}
            </div>

            {decisions.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                    <p>No decisions made yet. The match is about to begin!</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {decisions.map((decision, index) => (
                        <div
                            key={index}
                            className="bg-zinc-800/50 rounded-lg p-4 space-y-2 border-l-4 border-blue-500"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                        {getSituationIcon(decision.situation)}
                                    </span>
                                    <span className="text-sm font-semibold text-white">
                                        Over {decision.over}.{decision.ball}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {decision.situation}
                                    </Badge>
                                </div>
                                {getScoreBadge(decision.score)}
                            </div>
                            <div className="text-sm space-y-1">
                                <p className="text-zinc-300">
                                    <span className="text-zinc-500">Your choice:</span>{' '}
                                    <span className="text-white">{decision.userChoice}</span>
                                </p>
                                <p className="text-zinc-400 text-xs">
                                    <span className="text-zinc-500">Cummins:</span>{' '}
                                    {decision.actualDecision}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Overall Performance */}
            {decisions.length > 0 && (
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-700/50 rounded-lg p-4">
                    <div className="text-center">
                        <p className="text-sm text-zinc-400 mb-1">Captaincy Rating</p>
                        <p className="text-3xl font-bold text-white">
                            {totalScore}/100
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            {decisions.length} decision{decisions.length !== 1 ? 's' : ''} made
                        </p>
                    </div>
                </div>
            )}
        </Card>
    );
}
