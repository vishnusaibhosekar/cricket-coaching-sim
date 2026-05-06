'use client';

import { useState } from 'react';
import { MatchState, BowlingChoice, FieldPlacementChoice } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FieldMap } from './FieldMap';
import { ScoreReveal } from './ScoreReveal';

interface DecisionCardProps {
    matchState: MatchState;
    decisionType: 'bowling_change' | 'field_placement';
    overNumber: number;
    onSubmit: (decision: any) => void;
}

export function DecisionCard({ matchState, decisionType, overNumber, onSubmit }: DecisionCardProps) {
    const [selectedBowler, setSelectedBowler] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState<any>(null);

    const currentTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;

    const handleBowlingSubmit = () => {
        if (!selectedBowler) return;

        const decision: BowlingChoice = {
            bowlerName: selectedBowler,
        };

        onSubmit(decision);
        setSubmitted(true);
    };

    const handleFieldSubmit = (zones: Array<{ zone: string; fielders: number }>) => {
        const decision: FieldPlacementChoice = {
            zones,
        };

        onSubmit(decision);
        setSubmitted(true);
    };

    if (score) {
        return <ScoreReveal score={score} decisionType={decisionType} />;
    }

    if (submitted) {
        return (
            <Card className="p-8 bg-zinc-900 border-zinc-800 text-center">
                <div className="animate-pulse">
                    <h3 className="text-2xl font-bold text-white mb-4">Decision Submitted!</h3>
                    <p className="text-zinc-400">Waiting for captain's actual decision...</p>
                    <p className="text-sm text-zinc-500 mt-2">Gemini AI will score your tactical merit</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                    {decisionType === 'bowling_change' ? 'BOWLING CHANGE' : 'FIELD PLACEMENT'}
                </h3>
                <p className="text-zinc-400">
                    Over {overNumber + 1} | {currentTeam.name} {currentTeam.score}/{currentTeam.wickets} ({currentTeam.overs} ov)
                </p>
            </div>

            {/* Batsmen Info */}
            <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                <h4 className="text-sm font-semibold text-zinc-300 mb-2">Batsmen at Crease</h4>
                <div className="grid grid-cols-2 gap-3">
                    {matchState.currentBatsmen.map((batsman, idx) => (
                        <div key={idx} className="p-3 bg-zinc-700 rounded">
                            <p className="font-semibold text-white">{batsman.name}</p>
                            <p className="text-sm text-zinc-300">
                                {batsman.runs}({batsman.balls}) | SR: {batsman.strikeRate}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decision Input */}
            {decisionType === 'bowling_change' ? (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold text-zinc-300 mb-3">Select Bowler</h4>
                    <RadioGroup value={selectedBowler} onValueChange={setSelectedBowler}>
                        {matchState.bowlingCard.map((bowler, idx) => (
                            <div key={idx} className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg mb-2">
                                <RadioGroupItem value={bowler.name} id={bowler.name} />
                                <label htmlFor={bowler.name} className="flex-1 cursor-pointer">
                                    <p className="font-semibold text-white">{bowler.name}</p>
                                    <p className="text-sm text-zinc-400">
                                        {bowler.overs} ov | {bowler.wickets} wickets | Econ: {bowler.economy}
                                    </p>
                                </label>
                            </div>
                        ))}
                    </RadioGroup>
                    <Button
                        onClick={handleBowlingSubmit}
                        disabled={!selectedBowler}
                        className="w-full mt-4"
                    >
                        Submit Bowling Change
                    </Button>
                </div>
            ) : (
                <FieldMap
                    matchPhase={matchState.matchPhase}
                    onSubmit={handleFieldSubmit}
                />
            )}
        </Card>
    );
}
