'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GeminiScore } from '@/lib/types';
import { toast } from 'sonner';

interface ScoreRevealProps {
    score: GeminiScore;
    decisionType: 'bowling_change' | 'field_placement';
}

export function ScoreReveal({ score, decisionType }: ScoreRevealProps) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const [copied, setCopied] = useState(false);

    // Stage 4: Animate score counting up
    useEffect(() => {
        const duration = 1500; // 1.5 seconds
        const steps = 30;
        const increment = score.total_score / steps;
        const stepDuration = duration / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= score.total_score) {
                setAnimatedScore(score.total_score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [score.total_score]);

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

    // Stage 4: Share button functionality
    const handleShare = async () => {
        const shareText = `I scored ${score.total_score}/100 on Cricket Coaching Simulator! 🏏\n\nSituation Awareness: ${score.situation_awareness}/25\nMatchup Intelligence: ${score.matchup_intelligence}/25\nRisk-Reward: ${score.risk_reward}/25\nStrategic Creativity: ${score.strategic_creativity}/25\n\nCan you beat my tactical IQ? #GoogleCloud #GoogleCloudAPL #BuildWithAI`;

        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            toast.success('Score copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
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
                <p className={`text-6xl font-bold ${getScoreColor(score.total_score)} transition-all duration-300`}>
                    {animatedScore}/100
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

            <div className="p-4 bg-zinc-800 rounded-lg mb-4">
                <p className="text-sm text-zinc-400">
                    <span className="font-semibold">Captain's Choice:</span> {score.comparison_to_captain}
                </p>
            </div>

            {/* Stage 4: Share button */}
            <Button
                onClick={handleShare}
                className="w-full mt-4"
                variant={copied ? "secondary" : "default"}
            >
                {copied ? '✓ Copied!' : 'Share Your Score'}
            </Button>
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
