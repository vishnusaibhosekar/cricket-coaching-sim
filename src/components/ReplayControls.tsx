'use client';

import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface ReplayControlsProps {
    isPlaying: boolean;
    currentBallIndex: number;
    totalBalls: number;
    currentOver: number;
    currentBall: number;
    onPlayPause: () => void;
    onNextBall: () => void;
    onPreviousBall: () => void;
    onReset: () => void;
    playbackSpeed: number;
    onSpeedChange: (speed: number) => void;
}

export function ReplayControls({
    isPlaying,
    currentBallIndex,
    totalBalls,
    currentOver,
    currentBall,
    onPlayPause,
    onNextBall,
    onPreviousBall,
    onReset,
    playbackSpeed,
    onSpeedChange,
}: ReplayControlsProps) {
    const progress = ((currentBallIndex + 1) / totalBalls) * 100;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            {/* Playback Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onReset}
                        className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-zinc-400">
                    <span>
                        Over {currentOver}.{currentBall}
                    </span>
                    <span>
                        Ball {currentBallIndex + 1} of {totalBalls}
                    </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
