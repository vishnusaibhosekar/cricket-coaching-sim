'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllBalls, BallData, getCumulativeScore } from '@/lib/replay-data';
import { ScoreBar } from '@/components/ScoreBar';
import { DecisionCard } from '@/components/DecisionCard';
import { ReplayControls } from '@/components/ReplayControls';
import { ReplayCommentary } from '@/components/ReplayCommentary';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import type { MatchState } from '@/lib/types';

interface CommentaryEntry {
    ball: string;
    commentary: string;
    runs: number;
    isWicket: boolean;
    isBoundary: boolean;
    isSix: boolean;
    milestone?: string;
}

export default function ReplayPage() {
    const router = useRouter();
    const allBalls = getAllBalls();

    const [currentBallIndex, setCurrentBallIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [commentaryHistory, setCommentaryHistory] = useState<CommentaryEntry[]>([]);
    const [showDecision, setShowDecision] = useState(false);
    const [currentScore, setCurrentScore] = useState<any>(null);
    const [replayComplete, setReplayComplete] = useState(false);

    // Get current ball data
    const currentBall = currentBallIndex >= 0 ? allBalls[currentBallIndex] : null;
    const score = currentBallIndex >= 0 ? getCumulativeScore(currentBallIndex) : null;

    // Check if this is a tactical moment (wicket or boundary)
    const isTacticalMoment = useCallback(() => {
        if (!currentBall) return false;
        return currentBall.is_wicket || currentBall.runs >= 4;
    }, [currentBall]);

    // Advance to next ball
    const nextBall = useCallback(() => {
        if (currentBallIndex >= allBalls.length - 1) {
            setIsPlaying(false);
            setReplayComplete(true);
            return;
        }

        const nextIndex = currentBallIndex + 1;
        setCurrentBallIndex(nextIndex);

        const ball = allBalls[nextIndex];
        const score = getCumulativeScore(nextIndex);

        // Add to commentary history
        const entry: CommentaryEntry = {
            ball: ball.ball,
            commentary: ball.commentary,
            runs: ball.runs,
            isWicket: ball.is_wicket,
            isBoundary: ball.runs === 4,
            isSix: ball.runs === 6,
            milestone: ball.is_wicket ? 'WICKET' : ball.runs === 6 ? 'SIX!' : ball.runs === 4 ? 'FOUR!' : undefined,
        };

        setCommentaryHistory(prev => [entry, ...prev].slice(0, 20)); // Keep last 20 balls

        // Show decision card for tactical moments
        if (ball.is_wicket || ball.runs >= 4) {
            setShowDecision(true);
            setIsPlaying(false); // Pause for decision
        }
    }, [currentBallIndex, allBalls]);

    // Auto-play functionality
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            nextBall();
        }, 2000 / playbackSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, nextBall]);

    // Continue after decision
    const handleDecisionSubmit = (decision: any) => {
        console.log('Decision made:', decision);
        setShowDecision(false);
        // Auto-resume after decision
        setTimeout(() => setIsPlaying(true), 500);
    };

    // Controls handlers
    const handlePlayPause = () => setIsPlaying(!isPlaying);

    const handleNextBall = () => {
        setIsPlaying(false);
        nextBall();
    };

    const handlePreviousBall = () => {
        if (currentBallIndex > 0) {
            setCurrentBallIndex(currentBallIndex - 1);
            setCommentaryHistory(prev => prev.slice(1));
        }
    };

    const handleReset = () => {
        setCurrentBallIndex(-1);
        setIsPlaying(false);
        setCommentaryHistory([]);
        setShowDecision(false);
        setReplayComplete(false);
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
    };

    // Calculate current over and ball
    const getCurrentOverBall = () => {
        if (!currentBall) return { over: 0, ball: 0 };
        const parts = currentBall.ball.split('.');
        return {
            over: parseInt(parts[0]),
            ball: parseInt(parts[1]),
        };
    };

    const { over, ball } = getCurrentOverBall();

    // Create mock match state for ScoreBar
    const mockMatchState: MatchState | null = score ? {
        matchId: 'srh-vs-pbks-2026-05-06',
        team1: { name: 'SRH', score: 235, wickets: 4, overs: 20 },
        team2: { name: 'PBKS', score: score.runs, wickets: score.wickets, overs: parseFloat(score.overs) },
        currentInnings: 2,
        currentBatsmen: currentBall ? [
            { name: currentBall.batsman, runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 },
        ] : [],
        currentBowler: currentBall ? { name: currentBall.bowler, overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0 } : { name: '', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0 },
        recentOvers: [],
        bowlingCard: [],
        matchPhase: score.runs > 150 ? 'death' : score.runs > 50 ? 'middle' : 'powerplay',
        currentRunRate: score.runRate,
    } : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/')}
                            className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Match Replay</h1>
                            <p className="text-zinc-400">SRH vs PBKS - IPL 2026, Match 49</p>
                        </div>
                    </div>
                    <Badge className="text-lg bg-purple-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        PBKS Innings
                    </Badge>
                </div>

                {/* Score Bar */}
                {mockMatchState && <ScoreBar matchState={mockMatchState} loading={false} />}

                {/* Replay Controls */}
                <ReplayControls
                    isPlaying={isPlaying}
                    currentBallIndex={currentBallIndex}
                    totalBalls={allBalls.length}
                    currentOver={over}
                    currentBall={ball}
                    onPlayPause={handlePlayPause}
                    onNextBall={handleNextBall}
                    onPreviousBall={handlePreviousBall}
                    onReset={handleReset}
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={handleSpeedChange}
                />

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Commentary */}
                    <div className="lg:col-span-2">
                        {currentBall ? (
                            <ReplayCommentary
                                currentBall={{ ...currentBall, overNumber: over }}
                                commentaryHistory={commentaryHistory}
                            />
                        ) : (
                            <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                                <h3 className="text-2xl font-bold text-white mb-4">Ready to Replay</h3>
                                <p className="text-zinc-400 mb-6">
                                    Press Play to start the ball-by-ball replay of PBKS innings
                                </p>
                                <Button
                                    onClick={() => setIsPlaying(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    Start Replay
                                </Button>
                            </Card>
                        )}
                    </div>

                    {/* Decision Card / Tactical Info */}
                    <div>
                        {showDecision && currentBall && mockMatchState ? (
                            <DecisionCard
                                matchState={mockMatchState}
                                decisionType={currentBall.is_wicket ? 'bowling_change' : 'field_placement'}
                                overNumber={over}
                                onSubmit={handleDecisionSubmit}
                            />
                        ) : replayComplete ? (
                            <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
                                <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                <h3 className="text-2xl font-bold text-white mb-2">Replay Complete!</h3>
                                <p className="text-zinc-400 mb-4">
                                    PBKS scored {score?.runs}/{score?.wickets} in {score?.overs} overs
                                </p>
                                <Button
                                    onClick={handleReset}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    Watch Again
                                </Button>
                            </Card>
                        ) : (
                            <Card className="bg-zinc-900 border-zinc-800 p-6">
                                <h3 className="text-lg font-bold text-white mb-3">Tactical Moments</h3>
                                <p className="text-sm text-zinc-400">
                                    Decision points will appear here when:
                                </p>
                                <ul className="text-sm text-zinc-400 mt-2 space-y-1">
                                    <li>• A wicket falls</li>
                                    <li>• A boundary is hit (4 or 6)</li>
                                    <li>• High-scoring over (15+ runs)</li>
                                </ul>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
