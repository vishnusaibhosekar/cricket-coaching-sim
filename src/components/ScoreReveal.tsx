'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
        <Card className="p-5 bg-zinc-900/90 border-zinc-700/50">
            {/* Score Header */}
            <div className="text-center mb-5 pb-4 border-b border-zinc-700/50">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    {decisionType === 'bowling_change' ? 'Bowling Change' : 'Field Placement'}
                </p>
                <p className={`text-5xl font-bold ${getScoreColor(score.total_score)}`}>
                    {animatedScore}
                </p>
                <p className="text-zinc-500 text-sm">out of 100</p>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3 mb-5">
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
                    label="Risk-Reward"
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

            {/* Comparison */}
            <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                    {score.explanation}
                </p>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-zinc-500">
                    <span className="text-zinc-400 font-medium">Captain's call:</span> {score.comparison_to_captain}
                </p>
            </div>

            <Button
                onClick={handleShare}
                className="w-full"
                variant={copied ? "secondary" : "default"}
            >
                {copied ? '✓ Copied!' : 'Share Score'}
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
