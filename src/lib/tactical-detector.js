/**
 * Tactical Moment Detector
 * 
 * Detects tactical moments by comparing match states
 */

/**
 * Detects tactical moments between two match states
 * @param {object} previousState - Previous MatchState
 * @param {object} currentState - Current MatchState
 * @returns {Array} Array of tactical moment objects
 */
function detectTacticalMoments(previousState, currentState) {
    const moments = [];

    // 1. Detect new over
    const prevOver = Math.floor(previousState.team1.overs || previousState.team2.overs);
    const currOver = Math.floor(currentState.team1.overs || currentState.team2.overs);

    if (currOver > prevOver) {
        moments.push({
            type: 'new_over',
            over: currOver,
            message: `Over ${currOver} starting`
        });
    }

    // 2. Detect wicket
    const prevWickets = previousState.team1.wickets + previousState.team2.wickets;
    const currWickets = currentState.team1.wickets + currentState.team2.wickets;

    if (currWickets > prevWickets) {
        moments.push({
            type: 'wicket',
            wicketsLost: currWickets - prevWickets,
            message: `Wicket! ${currWickets - prevWickets} wicket(s) fallen`
        });
    }

    // 3. Detect powerplay transition
    if (prevOver < 6 && currOver >= 6) {
        moments.push({
            type: 'powerplay_end',
            message: 'Powerplay ended (overs 1-6 complete)'
        });
    }

    if (prevOver < 16 && currOver >= 16) {
        moments.push({
            type: 'death_overs_start',
            message: 'Death overs begin (overs 16-20)'
        });
    }

    // 4. Detect match phase change
    if (previousState.matchPhase !== currentState.matchPhase) {
        moments.push({
            type: 'phase_change',
            from: previousState.matchPhase,
            to: currentState.matchPhase,
            message: `Phase changed: ${previousState.matchPhase} → ${currentState.matchPhase}`
        });
    }

    return moments;
}

/**
 * Determines what type of decision prompt to show based on tactical moments
 * @param {Array} moments - Array of tactical moments
 * @returns {string|null} Decision type: 'bowling_change', 'field_placement', or null
 */
function getDecisionType(moments) {
    if (moments.length === 0) return null;

    // Priority order for decision types
    const hasWicket = moments.some(m => m.type === 'wicket');
    const hasNewOver = moments.some(m => m.type === 'new_over');
    const hasPhaseChange = moments.some(m => m.type === 'phase_change');

    // Wicket triggers field placement for new batsman
    if (hasWicket) return 'field_placement';

    // New over or phase change triggers bowling change + field placement
    if (hasNewOver || hasPhaseChange) return 'bowling_change';

    return null;
}

module.exports = {
    detectTacticalMoments,
    getDecisionType,
};
