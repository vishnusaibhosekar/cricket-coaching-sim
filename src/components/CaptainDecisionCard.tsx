'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trophy, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CaptainDecisionProps {
    overNumber: number;
    ballNumber: string;
    situation: 'wicket' | 'boundary' | 'high_scoring_over' | 'milestone';
    context: {
        score: string;
        batsman: string;
        batsmanRuns?: number;
        bowler: string;
        bowlerFigures?: string;
        matchPhase: string;
        recentOvers: string;
    };
    options: {
        id: string;
        label: string;
        description: string;
    }[];
    actualDecision: {
        what: string;
        outcome: string;
    };
    onSubmit: (decision: { choice: string; score: number }) => void;
}

export function CaptainDecisionCard({
    overNumber,
    ballNumber,
    situation,
    context,
    options,
    actualDecision,
    onSubmit,
}: CaptainDecisionProps) {
    const [selectedOption, setSelectedOption] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [userScore, setUserScore] = useState<number | null>(null);

    const getSituationBadge = () => {
        switch (situation) {
            case 'wicket':
                return <Badge className="bg-red-600 text-lg">💥 WICKET!</Badge>;
            case 'boundary':
                return <Badge className="bg-green-600 text-lg">🔥 BOUNDARY!</Badge>;
            case 'high_scoring_over':
                return <Badge className="bg-orange-600 text-lg">⚠️ HIGH SCORING OVER</Badge>;
            case 'milestone':
                return <Badge className="bg-yellow-600 text-lg">🏆 MILESTONE</Badge>;
        }
    };

    const getSituationPrompt = () => {
        switch (situation) {
            case 'wicket':
                return 'Breakthrough! How do you capitalize?';
            case 'boundary':
                return 'Batsman is dominating. What\'s your plan?';
            case 'high_scoring_over':
                return 'Runs flowing fast. Time to change strategy?';
            case 'milestone':
                return 'Batsman reaching milestone. Do you play defensively?';
        }
    };

    const handleSubmit = () => {
        if (!selectedOption) return;

        // Score based on how close to actual decision
        const actualId = options[0]?.id; // First option is typically the actual
        const isCorrect = selectedOption === actualId;
        const score = isCorrect ? 95 : Math.floor(Math.random() * 30) + 50; // 50-80 for different choices

        setUserScore(score);
        setRevealed(true);
    };

    const handleContinue = () => {
        onSubmit({
            choice: selectedOption,
            score: userScore || 0,
        });
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800 p-6 space-y-4">
            {/* Situation Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    {getSituationBadge()}
                    <Badge variant="outline" className="text-zinc-400">
                        Over {overNumber}.{ballNumber}
                    </Badge>
                </div>
                <h3 className="text-xl font-bold text-white">{getSituationPrompt()}</h3>
            </div>

            {/* Match Context */}
            <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                    Captain's Context
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span className="text-zinc-500">Score:</span>
                        <span className="text-white ml-2 font-semibold">{context.score}</span>
                    </div>
                    <div>
                        <span className="text-zinc-500">Phase:</span>
                        <span className="text-white ml-2 capitalize">{context.matchPhase}</span>
                    </div>
                    <div>
                        <span className="text-zinc-500">At Crease:</span>
                        <span className="text-white ml-2 font-semibold">{context.batsman}</span>
                        {context.batsmanRuns && (
                            <span className="text-blue-400 ml-1">({context.batsmanRuns}*)</span>
                        )}
                    </div>
                    <div>
                        <span className="text-zinc-500">Bowling:</span>
                        <span className="text-white ml-2 font-semibold">{context.bowler}</span>
                        {context.bowlerFigures && (
                            <span className="text-blue-400 ml-1">{context.bowlerFigures}</span>
                        )}
                    </div>
                </div>
                {context.recentOvers && (
                    <div className="mt-2 pt-2 border-t border-zinc-700">
                        <span className="text-zinc-500 text-sm">Recent overs: </span>
                        <span className="text-zinc-300 text-sm font-mono">{context.recentOvers}</span>
                    </div>
                )}
            </div>

            {/* Decision Options */}
            {!revealed ? (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-zinc-400">Your Decision, Captain:</h4>
                    <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                        {options.map((option) => (
                            <label
                                key={option.id}
                                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedOption === option.id
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                                    }`}
                            >
                                <RadioGroupItem value={option.id} className="mt-1" />
                                <div>
                                    <p className="font-semibold text-white">{option.label}</p>
                                    <p className="text-sm text-zinc-400">{option.description}</p>
                                </div>
                            </label>
                        ))}
                    </RadioGroup>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        Submit Decision
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Score Reveal */}
                    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/50 rounded-lg p-6 text-center">
                        <div className="text-5xl font-bold text-white mb-2">{userScore}/100</div>
                        <p className="text-zinc-300">
                            {userScore! >= 80
                                ? 'Excellent tactical awareness!'
                                : userScore! >= 60
                                    ? 'Solid decision, room for refinement'
                                    : 'Interesting choice, but could be better'}
                        </p>
                    </div>

                    {/* What Cummins Actually Did */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <h4 className="font-semibold text-white">Pat Cummins' Actual Decision:</h4>
                        </div>
                        <p className="text-lg text-blue-400 font-semibold">{actualDecision.what}</p>
                        <p className="text-sm text-zinc-400">{actualDecision.outcome}</p>
                    </div>

                    {/* Analysis */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Tactical Analysis
                        </h4>
                        <p className="text-sm text-zinc-300">
                            {userScore! >= 80
                                ? 'You read the match situation perfectly! This is exactly the kind of proactive captaincy that wins matches.'
                                : 'Consider the match context more carefully - batsman form, bowling figures, and required run rate should influence your decision.'}
                        </p>
                    </div>

                    <Button
                        onClick={handleContinue}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                        Continue Replay →
                    </Button>
                </div>
            )}
        </Card>
    );
}
