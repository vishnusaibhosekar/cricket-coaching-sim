'use client';

import { MatchState } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ScoreBarProps {
    matchState: MatchState | null;
    loading: boolean;
}

export function ScoreBar({ matchState, loading }: ScoreBarProps) {
    if (loading || !matchState) {
        return (
            <Card className="w-full p-4 bg-zinc-900 border-zinc-800">
                <div className="flex items-center justify-center h-16">
                    <p className="text-zinc-400">Loading match data...</p>
                </div>
            </Card>
        );
    }

    // Safe access to team data
    const currentTeam = matchState.currentInnings === 1 ? matchState.team1 : matchState.team2;

    // Check if we have valid team data
    if (!currentTeam || !currentTeam.name) {
        return (
            <Card className="w-full p-4 bg-zinc-900 border-zinc-800">
                <div className="flex items-center justify-center h-16">
                    <p className="text-zinc-400">Waiting for match data...</p>
                </div>
            </Card>
        );
    }

    const phaseColor = {
        powerplay: 'bg-blue-500',
        middle: 'bg-yellow-500',
        death: 'bg-red-500',
    }[matchState.matchPhase] || 'bg-zinc-500';

    return (
        <Card className="w-full p-4 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between">
                {/* Team Score */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">
                        {currentTeam.name} {currentTeam.score || 0}/{currentTeam.wickets || 0}
                    </h2>
                    <p className="text-sm text-zinc-400">
                        ({currentTeam.overs || 0} ov)
                    </p>
                </div>

                {/* Match Info */}
                <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-zinc-300">
                            CRR: {matchState.currentRunRate || '0.00'}
                        </span>
                        {matchState.requiredRunRate && (
                            <span className="text-lg font-semibold text-zinc-300">
                                | RRR: {matchState.requiredRunRate}
                            </span>
                        )}
                    </div>
                    <Badge className={`${phaseColor} text-white`}>
                        {matchState.matchPhase?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                </div>

                {/* Current Players */}
                <div className="flex-1 text-right">
                    <p className="text-sm text-zinc-300">
                        <span className="font-semibold">Batting:</span>{' '}
                        {matchState.currentBatsmen && matchState.currentBatsmen.length > 0
                            ? matchState.currentBatsmen.map(b => b.name).join(', ')
                            : 'N/A'}
                    </p>
                    <p className="text-sm text-zinc-300">
                        <span className="font-semibold">Bowling:</span>{' '}
                        {matchState.currentBowler?.name || 'N/A'}
                    </p>
                </div>
            </div>
        </Card>
    );
}
