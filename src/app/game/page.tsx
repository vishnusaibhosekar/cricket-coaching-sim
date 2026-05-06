'use client';

import { useState, useEffect } from 'react';
import { useMatchPolling } from '@/hooks/useMatchPolling';
import { ScoreBar } from '@/components/ScoreBar';
import { DecisionCard } from '@/components/DecisionCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/lib/types';

export default function GamePage() {
    const { matchState, loading, error, tacticalMoment } = useMatchPolling(30000);
    const [activeDecision, setActiveDecision] = useState<'bowling_change' | 'field_placement' | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userId, setUserId] = useState<string>('');

    // Fetch leaderboard
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
            }
        };

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    // Handle tactical moment
    useEffect(() => {
        if (tacticalMoment) {
            if (tacticalMoment.type === 'new_over' || tacticalMoment.type === 'wicket') {
                setActiveDecision('bowling_change');
            } else if (tacticalMoment.type === 'powerplay_transition') {
                setActiveDecision('field_placement');
            }
        }
    }, [tacticalMoment]);

    const handleDecisionSubmit = async (decision: any) => {
        if (!matchState) return;

        try {
            const currentTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;

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

            const response = await fetch('/api/decision/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(decisionData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Decision submitted:', result);

                // In a real scenario, we'd wait for the captain's decision and then score
                // For now, we'll simulate the scoring flow
                setTimeout(() => {
                    // This would normally be triggered automatically when captain's decision is revealed
                    console.log('Waiting for scoring...');
                }, 5000);
            }
        } catch (error) {
            console.error('Failed to submit decision:', error);
        }
    };

    if (error) {
        return (
            <div className="space-y-6">
                <Card className="p-6 bg-red-900/20 border-red-800">
                    <p className="text-red-400">Error: {error}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Tactical Moment Alert */}
            {tacticalMoment && (
                <Card className="p-4 bg-blue-900/20 border-blue-800">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-500">ALERT</Badge>
                        <p className="text-white font-semibold">{tacticalMoment.message}</p>
                    </div>
                </Card>
            )}

            {/* Score Bar */}
            <ScoreBar matchState={matchState} loading={loading} />

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
                            {activeDecision && matchState ? (
                                <DecisionCard
                                    matchState={matchState}
                                    decisionType={activeDecision}
                                    overNumber={Math.floor(matchState.currentInnings === 1 ? matchState.team1.overs : matchState.team2.overs)}
                                    onSubmit={handleDecisionSubmit}
                                />
                            ) : (
                                <Card className="p-8 bg-zinc-900 border-zinc-800 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-4">Waiting for Next Tactical Moment</h3>
                                    <p className="text-zinc-400">
                                        A decision prompt will appear when:
                                    </p>
                                    <ul className="text-left mt-4 space-y-2 text-zinc-400">
                                        <li>• A new over starts</li>
                                        <li>• A wicket falls</li>
                                        <li>• Powerplay transitions occur</li>
                                    </ul>
                                </Card>
                            )}
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
                    <Leaderboard entries={leaderboard} currentUserId={userId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
