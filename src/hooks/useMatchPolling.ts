import { useState, useEffect, useCallback } from 'react';
import { MatchState, TacticalMoment } from '@/lib/types';

interface UseMatchPollingReturn {
    matchState: MatchState | null;
    loading: boolean;
    error: string | null;
    tacticalMoment: TacticalMoment | null;
}

export function useMatchPolling(pollingInterval: number = 30000): UseMatchPollingReturn {
    const [matchState, setMatchState] = useState<MatchState | null>(null);
    const [previousState, setPreviousState] = useState<MatchState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tacticalMoment, setTacticalMoment] = useState<TacticalMoment | null>(null);

    const fetchMatchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/match/live');

            if (!response.ok) {
                throw new Error('Failed to fetch match data');
            }

            const data = await response.json();

            if (data.error && !data.useMock) {
                throw new Error(data.error);
            }

            // Store previous state for diffing
            setPreviousState(matchState);
            setMatchState(data);
            setError(null);

            // Detect tactical moments
            if (matchState) {
                detectTacticalMoments(matchState, data);
            }
        } catch (err) {
            console.error('Error fetching match data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [matchState]);

    const detectTacticalMoments = useCallback((prev: MatchState, current: MatchState) => {
        const currentInnings = current.currentInnings === 1 ? current.team1 : current.team2;
        const prevInnings = prev.currentInnings === 1 ? prev.team1 : prev.team2;

        // Check for new over
        const currentOver = Math.floor(currentInnings.overs);
        const prevOver = Math.floor(prevInnings.overs);

        if (currentOver > prevOver) {
            setTacticalMoment({
                type: 'new_over',
                overNumber: currentOver,
                message: `Over ${currentOver} starting! Make your bowling change.`,
            });
            return;
        }

        // Check for wicket
        if (currentInnings.wickets > prevInnings.wickets) {
            setTacticalMoment({
                type: 'wicket',
                overNumber: currentOver,
                message: `Wicket! Adjust your field placement.`,
            });
            return;
        }

        // Check for powerplay transition
        if (prevOver < 6 && currentOver >= 6) {
            setTacticalMoment({
                type: 'powerplay_transition',
                overNumber: currentOver,
                message: 'Powerplay over! Field restrictions changed.',
            });
        } else if (prevOver < 16 && currentOver >= 16) {
            setTacticalMoment({
                type: 'powerplay_transition',
                overNumber: currentOver,
                message: 'Death overs begin! Maximum 5 fielders outside the ring.',
            });
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchMatchData();

        // Set up polling interval
        const interval = setInterval(fetchMatchData, pollingInterval);

        // Cleanup
        return () => clearInterval(interval);
    }, [fetchMatchData, pollingInterval]);

    return { matchState, loading, error, tacticalMoment };
}
