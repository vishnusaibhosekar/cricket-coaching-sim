'use client';

import { useState, useEffect } from 'react';
import { mockMatchState, mockMatchStates, mockLeaderboard, mockGeminiScores } from '@/lib/mock-data';
import { ScoreBar } from '@/components/ScoreBar';
import { DecisionCard } from '@/components/DecisionCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry, GeminiScore, MatchState } from '@/lib/types';

// Stage 5: Demo mode sequence
const DEMO_SEQUENCE = [
    { stateIndex: 0, decisionType: 'bowling_change' as const, label: 'Powerplay End' },
    { stateIndex: 1, decisionType: 'field_placement' as const, label: 'Middle Overs' },
    { stateIndex: 2, decisionType: 'bowling_change' as const, label: 'Death Overs' },
    { stateIndex: 3, decisionType: 'field_placement' as const, label: 'Wicket Situation' }
];

export default function GamePage() {
    // Stage 5: Demo mode state
    const [demoMode, setDemoMode] = useState(false);
    const [demoStep, setDemoStep] = useState(0);
    const [matchState, setMatchState] = useState<MatchState>(mockMatchState);
    const [activeDecision, setActiveDecision] = useState<'bowling_change' | 'field_placement'>('bowling_change');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [currentScore, setCurrentScore] = useState<GeminiScore | null>(null);
    const [totalScore, setTotalScore] = useState(0);
    const [decisionCount, setDecisionCount] = useState(0);

    // Fetch leaderboard on mount
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/leaderboard');
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
                // Fallback to mock data
                setLeaderboard(mockLeaderboard);
            }
        };

        fetchLeaderboard();
    }, []);

    // Stage 3: Complete flow - submit decision and get score
    const handleDecisionSubmit = async (decision: any) => {
        try {
            const currentTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;

            // Step 1: Submit decision
            const decisionData = {
                match_id: process.env.NEXT_PUBLIC_MATCH_ID || 'srh-vs-pbks-2026-05-06',
                over_number: Math.floor(currentTeam.overs),
                decision_type: activeDecision,
                user_choice: decision,
                match_context: {
                    score: `${currentTeam.name} ${currentTeam.score}/${currentTeam.wickets}`,
                    overs: currentTeam.overs,
                    batsmen: matchState.currentBatsmen,
                    phase: matchState.matchPhase,
                    runRate: matchState.currentRunRate,
                },
            };

            const submitResponse = await fetch('/api/decision/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decisionData),
            });

            if (!submitResponse.ok) {
                throw new Error('Failed to submit decision');
            }

            console.log('Decision submitted successfully');

            // Step 2: Get score (simulates waiting for captain's decision + Gemini scoring)
            const scoreResponse = await fetch('/api/decision/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decision: decisionData,
                    matchContext: decisionData.match_context
                }),
            });

            if (scoreResponse.ok) {
                const score = await scoreResponse.json();
                setCurrentScore(score);
                // Stage 5: Track cumulative score
                setTotalScore(prev => prev + score.total_score);
                setDecisionCount(prev => prev + 1);
                console.log('Score received:', score);
            }
        } catch (error) {
            console.error('Failed to process decision:', error);
            // Fallback: show mock score anyway for demo
            const fallbackScore = mockGeminiScores[demoStep] || mockGeminiScores[0];
            setCurrentScore(fallbackScore);
            setTotalScore(prev => prev + fallbackScore.total_score);
            setDecisionCount(prev => prev + 1);
        }
    };

    // Stage 5: Demo mode controls
    const startDemoMode = () => {
        setDemoMode(true);
        setDemoStep(0);
        setMatchState(mockMatchStates[0]);
        setActiveDecision(DEMO_SEQUENCE[0].decisionType);
        setTotalScore(0);
        setDecisionCount(0);
        setCurrentScore(null);
    };

    const nextDecision = () => {
        const nextStep = demoStep + 1;
        if (nextStep < DEMO_SEQUENCE.length) {
            setDemoStep(nextStep);
            setMatchState(mockMatchStates[nextStep]);
            setActiveDecision(DEMO_SEQUENCE[nextStep].decisionType);
            setCurrentScore(null);
        } else {
            // Demo complete
            setDemoMode(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stage 5: Demo Mode Banner */}
            {demoMode && (
                <Card className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-purple-500">DEMO MODE</Badge>
                            <p className="text-white font-semibold">
                                {DEMO_SEQUENCE[demoStep].label} - Decision {demoStep + 1} of {DEMO_SEQUENCE.length}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-zinc-400">Total Score</p>
                            <p className="text-2xl font-bold text-white">{totalScore}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Stage 5: Demo Mode Controls */}
            {!demoMode && (
                <Card className="p-6 bg-zinc-900 border-zinc-800 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Cricket Coaching Simulator</h2>
                    <p className="text-zinc-400 mb-6">Make tactical decisions like an IPL captain and get scored by AI</p>
                    <Button onClick={startDemoMode} size="lg" className="text-lg px-8">
                        Start Demo Mode
                    </Button>
                    <p className="text-sm text-zinc-500 mt-4">
                        Experience 4 tactical moments from SRH vs PBKS match
                    </p>
                </Card>
            )}

            {/* Score Bar */}
            <ScoreBar matchState={matchState} loading={false} />

            {/* Main Content */}
            <Tabs defaultValue="game" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="game">Game Board</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>

                <TabsContent value="game" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Decision Card */}
                        <div className="lg:col-span-2">
                            {demoMode && currentScore ? (
                                <div className="space-y-4">
                                    <DecisionCard
                                        key={`decision-${demoStep}`}
                                        matchState={matchState}
                                        decisionType={activeDecision}
                                        overNumber={Math.floor(matchState.currentInnings === 1 ? matchState.team1.overs : matchState.team2.overs)}
                                        onSubmit={handleDecisionSubmit}
                                        initialScore={currentScore}
                                    />
                                    <Button onClick={nextDecision} className="w-full" size="lg">
                                        {demoStep < DEMO_SEQUENCE.length - 1 ? 'Next Decision →' : 'Finish Demo'}
                                    </Button>
                                </div>
                            ) : demoMode && activeDecision && matchState ? (
                                <DecisionCard
                                    key={`decision-${demoStep}`}
                                    matchState={matchState}
                                    decisionType={activeDecision}
                                    overNumber={Math.floor(matchState.currentInnings === 1 ? matchState.team1.overs : matchState.team2.overs)}
                                    onSubmit={handleDecisionSubmit}
                                />
                            ) : !demoMode ? (
                                <Card className="p-8 bg-zinc-900 border-zinc-800 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
                                    <p className="text-zinc-400">Click "Start Demo Mode" above to begin</p>
                                </Card>
                            ) : null}
                        </div>

                        {/* Match Info Sidebar */}
                        <div className="space-y-4">
                            {matchState && (
                                <>
                                    <Card className="p-4 bg-zinc-900 border-zinc-800">
                                        <h4 className="font-semibold text-white mb-3">Match Context</h4>
                                        <div className="space-y-2 text-sm text-zinc-300">
                                            <p>Phase: <span className="font-semibold">{matchState.matchPhase}</span></p>
                                            <p>Run Rate: <span className="font-semibold">{matchState.currentRunRate}</span></p>
                                            {matchState.requiredRunRate && (
                                                <p>Required Rate: <span className="font-semibold">{matchState.requiredRunRate}</span></p>
                                            )}
                                        </div>
                                    </Card>

                                    <Card className="p-4 bg-zinc-900 border-zinc-800">
                                        <h4 className="font-semibold text-white mb-3">How Scoring Works</h4>
                                        <p className="text-sm text-zinc-400">
                                            Gemini AI evaluates your decisions on 4 dimensions (0-100 total):
                                        </p>
                                        <ul className="text-xs text-zinc-500 mt-2 space-y-1">
                                            <li>• Situation Awareness (25 pts)</li>
                                            <li>• Matchup Intelligence (25 pts)</li>
                                            <li>• Risk-Reward Calibration (25 pts)</li>
                                            <li>• Strategic Creativity (25 pts)</li>
                                        </ul>
                                    </Card>
                                </>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="leaderboard" className="mt-6">
                    <Leaderboard entries={leaderboard} currentUserId="1" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
