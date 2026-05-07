'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllBalls, BallData, getCumulativeScore } from '@/lib/replay-data';
import { ScoreBar } from '@/components/ScoreBar';
import { BallDecisionCard } from '@/components/BallDecisionCard';
import { ReplayControls } from '@/components/ReplayControls';
import { ReplayCommentary } from '@/components/ReplayCommentary';
import { CaptainsLog } from '@/components/CaptainsLog';
import { tacticalMomentsDB } from '@/lib/tactical-moments';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target } from 'lucide-react';
import type { MatchState, BallDecision, CumulativeScore as CumulativeScoreType } from '@/lib/types';
import { calculateCumulativeScore } from '@/lib/field-scoring';

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
    const [replayComplete, setReplayComplete] = useState(false);
    const [ballDecisions, setBallDecisions] = useState<BallDecision[]>([]);
    const [cumulativeScore, setCumulativeScore] = useState<CumulativeScoreType | null>(null);

    // Get current ball data
    const currentBall = currentBallIndex >= 0 ? allBalls[currentBallIndex] : null;
    const score = currentBallIndex >= 0 ? getCumulativeScore(currentBallIndex) : null;

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

        // Show decision card for every ball in field placement mode
        setShowDecision(true);
        setIsPlaying(false); // Pause for decision
    }, [currentBallIndex, allBalls]);

    // Auto-play functionality (skip decisions in auto-play)
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            nextBall();
        }, 2000 / playbackSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, nextBall]);

    // Handle decision submission
    const handleDecisionSubmit = (decision: BallDecision) => {
        const newDecisions = [...ballDecisions, decision];
        setBallDecisions(newDecisions);

        // Update cumulative score
        const updatedCumulative = calculateCumulativeScore(newDecisions);
        setCumulativeScore(updatedCumulative);

        console.log('Decision scored:', decision.score);
        console.log('Cumulative:', updatedCumulative);
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
        setBallDecisions([]);
        setCumulativeScore(null);
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

    // Determine match phase
    const getMatchPhase = (): 'powerplay' | 'middle' | 'death' => {
        if (!score) return 'powerplay';
        const oversBowled = parseFloat(score.overs);
        if (oversBowled <= 6) return 'powerplay';
        if (oversBowled <= 15) return 'middle';
        return 'death';
    };

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
        matchPhase: getMatchPhase(),
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
                            <h1 className="text-3xl font-bold text-white">Field Placement Simulator</h1>
                            <p className="text-zinc-400">Predict where the ball will be played - Ball by Ball</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {cumulativeScore && (
                            <Badge className="text-lg bg-blue-600">
                                <Target className="h-4 w-4 mr-2" />
                                Score: {cumulativeScore.total_score}
                            </Badge>
                        )}
                        <Badge className="text-lg bg-purple-600">
                            <Trophy className="h-4 w-4 mr-2" />
                            PBKS Innings
                        </Badge>
                    </div>
                </div>

                {/* Score Bar */}
                {mockMatchState && <ScoreBar matchState={mockMatchState} loading={false} />}

                {/* Cumulative Score Display */}
                {cumulativeScore && (
                    <Card className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-zinc-400">Total Score</p>
                                <p className="text-3xl font-bold text-white">{cumulativeScore.total_score}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-400">Balls Faced</p>
                                <p className="text-3xl font-bold text-white">{cumulativeScore.balls_faced}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-400">Avg Score</p>
                                <p className="text-3xl font-bold text-white">{cumulativeScore.avg_score_per_ball}</p>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-400">Best Ball</p>
                                <p className="text-3xl font-bold text-white">{cumulativeScore.best_ball}</p>
                            </div>
                        </div>
                    </Card>
                )}

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
                <div className="space-y-6">
                    {/* Commentary / Decision Card */}
                    <div>
                        {showDecision && currentBall ? (
                            <BallDecisionCard
                                key={`ball-${currentBallIndex}-${getMatchPhase()}`}
                                ball={{
                                    ...currentBall,
                                    over: over,
                                }}
                                matchPhase={getMatchPhase()}
                                requiredRunRate={mockMatchState?.requiredRunRate}
                                onSubmit={handleDecisionSubmit}
                                onAutoAdvance={() => {
                                    setShowDecision(false);
                                    setTimeout(() => nextBall(), 500);
                                }}
                            />
                        ) : currentBall ? (
                            <ReplayCommentary
                                currentBall={{ ...currentBall, overNumber: over }}
                                commentaryHistory={commentaryHistory}
                            />
                        ) : (
                            <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
                                <Target className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                                <h3 className="text-2xl font-bold text-white mb-4">Field Placement Simulator</h3>
                                <p className="text-zinc-400 mb-6">
                                    Place fielders for every ball. Get scored on how well you predict where the batsman will play the shot.
                                </p>
                                <div className="space-y-4 text-left max-w-md mx-auto mb-6">
                                    <div className="flex items-start gap-3">
                                        <span className="text-green-400 text-xl">✓</span>
                                        <p className="text-zinc-300">Place 9 fielders on the cricket field</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-green-400 text-xl">✓</span>
                                        <p className="text-zinc-300">Predict where the ball will be played</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-green-400 text-xl">✓</span>
                                        <p className="text-zinc-300">Get instant scoring on zone coverage, phase awareness & batsman reading</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsPlaying(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                    size="lg"
                                >
                                    Start Simulation
                                </Button>
                            </Card>
                        )}
                    </div>

                    {/* Captain's Log - Full Width */}
                    <div>
                        {replayComplete ? (
                            <Card className="bg-zinc-900 border-zinc-800 p-6 text-center space-y-4">
                                <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
                                <h3 className="text-2xl font-bold text-white">Simulation Complete!</h3>
                                {cumulativeScore && (
                                    <div className="space-y-2">
                                        <p className="text-4xl font-bold text-blue-400">{cumulativeScore.total_score}</p>
                                        <p className="text-zinc-400">Total Points from {cumulativeScore.balls_faced} balls</p>
                                        <p className="text-sm text-zinc-500">
                                            Average: {cumulativeScore.avg_score_per_ball} per ball
                                        </p>
                                    </div>
                                )}
                                <Button
                                    onClick={handleReset}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    Play Again
                                </Button>
                            </Card>
                        ) : (
                            <CaptainsLog
                                decisions={ballDecisions.map(d => ({
                                    over: parseInt(d.ball.ball.split('.')[0]),
                                    ball: d.ball.ball.split('.')[1],
                                    situation: d.ball.commentary,
                                    userChoice: `${d.score} pts`,
                                    score: d.score,
                                    actualDecision: `Shot to ${d.ball.shot_zone}`,
                                }))}
                                totalScore={cumulativeScore?.avg_score_per_ball || 0}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
