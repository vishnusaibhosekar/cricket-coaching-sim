'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BallData, UserFieldPlacement, BallDecision, ShotZone } from '@/lib/types';
import { FieldMap } from './FieldMap';
import { scoreFieldPlacement } from '@/lib/field-scoring';

interface BallDecisionCardProps {
    ball: BallData;
    matchPhase: 'powerplay' | 'middle' | 'death';
    requiredRunRate?: number;
    onSubmit: (decision: BallDecision) => void;
    onAutoAdvance?: () => void;
}

export function BallDecisionCard({
    ball,
    matchPhase,
    requiredRunRate,
    onSubmit,
    onAutoAdvance
}: BallDecisionCardProps) {
    const [step, setStep] = useState<'placing' | 'revealing' | 'scored'>('placing');
    const [scoredDecision, setScoredDecision] = useState<BallDecision | null>(null);
    const [countdown, setCountdown] = useState(15); // 15 seconds to place field

    // Auto-advance countdown
    useEffect(() => {
        if (step !== 'placing') return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step]);

    const handleFieldSubmit = (placement: UserFieldPlacement) => {
        // Score the decision immediately
        const decision = scoreFieldPlacement(ball, placement, matchPhase, requiredRunRate);

        setScoredDecision(decision);
        setStep('revealing');

        // Auto-advance after showing score
        setTimeout(() => {
            setStep('scored');
            onSubmit(decision);

            // Auto-advance to next ball after 3 seconds
            if (onAutoAdvance) {
                setTimeout(() => {
                    onAutoAdvance();
                }, 3000);
            }
        }, 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent!';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Average';
        return 'Poor';
    };

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800 space-y-4">
            {/* Ball Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="text-lg">
                        Over {ball.ball}
                    </Badge>
                    {ball.is_wicket && (
                        <Badge className="bg-red-600 text-white">
                            WICKET!
                        </Badge>
                    )}
                    {ball.runs >= 6 && (
                        <Badge className="bg-purple-600 text-white">
                            SIX!
                        </Badge>
                    )}
                    {ball.runs === 4 && (
                        <Badge className="bg-blue-600 text-white">
                            FOUR!
                        </Badge>
                    )}
                </div>
                {step === 'placing' && (
                    <Badge variant="outline" className="text-zinc-400">
                        {countdown}s
                    </Badge>
                )}
            </div>

            {/* Match Context */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-zinc-400">Batsman</p>
                    <p className="text-white font-semibold">{ball.batsman}</p>
                </div>
                <div>
                    <p className="text-zinc-400">Bowler</p>
                    <p className="text-white font-semibold">{ball.bowler}</p>
                </div>
                <div>
                    <p className="text-zinc-400">Phase</p>
                    <p className="text-white font-semibold capitalize">{matchPhase}</p>
                </div>
                {requiredRunRate && (
                    <div>
                        <p className="text-zinc-400">Required Rate</p>
                        <p className="text-white font-semibold">{requiredRunRate}</p>
                    </div>
                )}
            </div>

            {/* Decision Flow */}
            {step === 'placing' && (
                <div className="space-y-4">
                    <p className="text-zinc-300 mb-3">
                        Place your fielders where you think the ball will be played:
                    </p>
                    <FieldMap
                        onSubmit={handleFieldSubmit}
                        maxFielders={9}
                    />
                </div>
            )}

            {step === 'revealing' && scoredDecision && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    {/* Ball Outcome */}
                    <div className="text-center py-4 bg-zinc-800 rounded-lg">
                        <p className="text-2xl font-bold text-white mb-2">
                            {ball.commentary}
                        </p>
                        <Badge className="text-lg bg-red-600">
                            Shot to: {ball.shot_zone.replace('_', ' ')}
                        </Badge>
                    </div>

                    {/* Score Breakdown */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-zinc-400">Your Score</p>
                            <p className={`text-3xl font-bold ${getScoreColor(scoredDecision.score)}`}>
                                {scoredDecision.score}
                            </p>
                        </div>
                        <p className="text-sm text-zinc-500">{getScoreLabel(scoredDecision.score)}</p>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Zone Coverage</span>
                                <span className="text-white">{scoredDecision.score_breakdown.zone_coverage}/40</span>
                            </div>
                            <Progress value={(scoredDecision.score_breakdown.zone_coverage / 40) * 100} />

                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Phase Awareness</span>
                                <span className="text-white">{scoredDecision.score_breakdown.phase_appropriateness}/30</span>
                            </div>
                            <Progress value={(scoredDecision.score_breakdown.phase_appropriateness / 30) * 100} />

                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Batsman Reading</span>
                                <span className="text-white">{scoredDecision.score_breakdown.batsman_awareness}/30</span>
                            </div>
                            <Progress value={(scoredDecision.score_breakdown.batsman_awareness / 30) * 100} />
                        </div>

                        <p className="text-sm text-zinc-300 italic">
                            {scoredDecision.feedback}
                        </p>
                    </div>
                </div>
            )}

            {step === 'scored' && (
                <div className="text-center py-8 animate-in fade-in duration-300">
                    <p className="text-zinc-400">Moving to next ball...</p>
                </div>
            )}
        </Card>
    );
}
