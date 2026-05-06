'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GeminiScore } from '@/lib/types';

interface ScoreRevealProps {
    score: GeminiScore;
    decisionType: 'bowling_change' | 'field_placement';
}

export function ScoreReveal({ score, decisionType }: ScoreRevealProps) {
    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getProgressBarColor = (score: number) => {
        if (score >= 75) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="text-center mb-6">
                <Badge className="mb-4 bg-blue-500">
                    {decisionType === 'bowling_change' ? 'Bowling Change' : 'Field Placement'}
                </Badge>
                <h3 className="text-4xl font-bold text-white mb-2">
                    Tactical Score
                </h3>
                <p className={`text-6xl font-bold ${getScoreColor(score.total_score)}`}>
                    {score.total_score}/100
                </p>
            </div>

            <div className="space-y-4 mb-6">
                <ScoreDimension
                    label="Situation Awareness"
                    score={score.situation_awareness}
                    maxScore={25}
                    color={getProgressBarColor(score.situation_awareness * 4)}
                />
                <ScoreDimension
                    label="Matchup Intelligence"
                    score={score.matchup_intelligence}
                    maxScore={25}
                    color={getProgressBarColor(score.matchup_intelligence * 4)}
                />
                <ScoreDimension
                    label="Risk-Reward Calibration"
                    score={score.risk_reward}
                    maxScore={25}
                    color={getProgressBarColor(score.risk_reward * 4)}
                />
                <ScoreDimension
                    label="Strategic Creativity"
                    score={score.strategic_creativity}
                    maxScore={25}
                    color={getProgressBarColor(score.strategic_creativity * 4)}
                />
            </div>

            <div className="p-4 bg-zinc-800 rounded-lg mb-4">
                <p className="text-zinc-300">{score.explanation}</p>
            </div>

            <div className="p-4 bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-400">
                    <span className="font-semibold">Captain's Choice:</span> {score.comparison_to_captain}
                </p>
            </div>
        </Card>
    );
}

function ScoreDimension({ label, score, maxScore, color }: { label: string; score: number; maxScore: number; color: string }) {
    const percentage = (score / maxScore) * 100;

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-zinc-300">{label}</span>
                <span className="text-sm font-semibold text-white">{score}/{maxScore}</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
