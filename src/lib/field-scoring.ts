import { BallData, UserFieldPlacement, ShotZone, BallDecision } from '@/lib/types';

/**
 * Score a field placement decision against the actual ball outcome
 * 
 * Scoring Dimensions (100 points total):
 * 1. Zone Coverage (40 pts): Did you place a fielder where the ball was actually played?
 * 2. Phase Appropriateness (30 pts): Is your field setup appropriate for the match phase?
 * 3. Batsman Awareness (30 pts): Did you exploit known weaknesses of the batsman?
 */
export function scoreFieldPlacement(
    ball: BallData,
    userPlacement: UserFieldPlacement,
    matchPhase: 'powerplay' | 'middle' | 'death',
    requiredRunRate?: number
): BallDecision {
    // Dimension 1: Zone Coverage (40 points)
    const zoneScore = calculateZoneCoverage(ball, userPlacement);

    // Dimension 2: Phase Appropriateness (30 points)
    const phaseScore = calculatePhaseAppropriateness(userPlacement, matchPhase, requiredRunRate, ball.runs);

    // Dimension 3: Batsman Awareness (30 points)
    const batsmanScore = calculateBatsmanAwareness(ball, userPlacement, matchPhase);

    // Total score
    const totalScore = zoneScore + phaseScore + batsmanScore;

    // Generate feedback
    const feedback = generateFeedback(ball, userPlacement, zoneScore, phaseScore, batsmanScore);

    return {
        ball,
        user_placement: userPlacement,
        score: totalScore,
        score_breakdown: {
            zone_coverage: zoneScore,
            phase_appropriateness: phaseScore,
            batsman_awareness: batsmanScore,
        },
        feedback,
    };
}

/**
 * Calculate zone coverage score (0-40 points)
 * Primary scoring: Did you cover the actual shot zone?
 */
function calculateZoneCoverage(ball: BallData, placement: UserFieldPlacement): number {
    const actualZone = ball.shot_zone;
    const hasFielderAtZone = (placement.zones[actualZone] || 0) > 0;

    let score = 0;

    if (hasFielderAtZone) {
        // User placed fielder at the correct zone - excellent!
        if (ball.is_wicket) {
            score = 40; // Would've taken the catch!
        } else if (ball.runs >= 6) {
            score = 35; // Would've stopped/saved the six!
        } else if (ball.runs === 4) {
            score = 30; // Would've stopped the four!
        } else if (ball.runs > 0) {
            score = 20; // Good positioning, limited runs
        } else {
            score = 15; // Correct zone for a dot ball
        }
    } else {
        // User missed the zone where the ball was played
        const deepZone = actualZone.startsWith('deep_') || actualZone.startsWith('long_');

        if (ball.is_wicket) {
            score = 5; // Missed a wicket opportunity
        } else if (ball.runs >= 6 && deepZone) {
            score = 0; // Conceded a six to deep zone - worst miss
        } else if (ball.runs >= 6) {
            score = 5; // Conceded six to regular zone
        } else if (ball.runs === 4 && deepZone) {
            score = 10; // Conceded four to deep zone
        } else if (ball.runs === 4) {
            score = 15; // Conceded four
        } else if (ball.runs > 0) {
            score = 20; // Minor leak
        } else {
            score = 25; // Good despite miss (dot ball)
        }
    }

    return Math.min(40, Math.max(0, score));
}

/**
 * Calculate phase appropriateness (0-30 points)
 * Is the field setup appropriate for the match phase and situation?
 */
function calculatePhaseAppropriateness(
    placement: UserFieldPlacement,
    phase: 'powerplay' | 'middle' | 'death',
    requiredRunRate?: number,
    ballRuns?: number
): number {
    const deepFielders = Object.entries(placement.zones)
        .filter(([zone, count]) =>
            (zone.startsWith('deep_') || zone.startsWith('long_')) && count > 0
        )
        .reduce((sum, [, count]) => sum + count, 0);

    const innerFielders = 9 - deepFielders;

    let score = 15; // Base score

    // Powerplay: Should be attacking (max 2 fielders outside circle per T20 rules)
    if (phase === 'powerplay') {
        if (deepFielders <= 2) {
            score += 15; // Correct powerplay field
        } else {
            score -= 10; // Too defensive for powerplay
        }
    }

    // Middle overs: Balanced field
    if (phase === 'middle') {
        if (deepFielders >= 3 && deepFielders <= 5) {
            score += 10; // Good balance
        }

        // If run rate is high, should be more defensive
        if (requiredRunRate && requiredRunRate > 10 && deepFielders >= 4) {
            score += 10; // Correct defensive setup
        } else if (requiredRunRate && requiredRunRate < 7 && deepFielders <= 3) {
            score += 10; // Correct attacking setup
        }
    }

    // Death overs: Can be defensive (protecting total) or attacking (taking wickets)
    if (phase === 'death') {
        if (requiredRunRate && requiredRunRate > 12) {
            // Batting team needs runs, bowling team should be defensive
            if (deepFielders >= 5) {
                score += 15; // Correct defensive death field
            }
        } else if (requiredRunRate && requiredRunRate < 8) {
            // Batting team under pressure, bowling team can attack
            if (deepFielders <= 3 && innerFielders >= 6) {
                score += 15; // Correct attacking death field
            }
        } else {
            // Neutral situation, balanced field acceptable
            score += 5;
        }
    }

    // Bonus: If ball was hit for boundary/six and you had deep fielders in that region
    if (ballRuns && ballRuns >= 4) {
        const wasBoundaryToDeep = ballRuns >= 6 ||
            (ballRuns === 4 && placement.zones[Object.keys(placement.zones).find(z =>
                z.startsWith('deep_') || z.startsWith('long_')
            ) as ShotZone] > 0);

        if (wasBoundaryToDeep) {
            score += 5; // Good depth for boundaries
        }
    }

    return Math.min(30, Math.max(0, score));
}

/**
 * Calculate batsman awareness (0-30 points)
 * Simplified: Does field placement make sense for the shot type?
 */
function calculateBatsmanAwareness(
    ball: BallData,
    placement: UserFieldPlacement,
    phase: 'powerplay' | 'middle' | 'death'
): number {
    let score = 15; // Base score

    // For pull/hook shots, should have protection on leg side
    if (ball.shot_type === 'pull' || ball.shot_type === 'hook') {
        const hasLegSideProtection =
            (placement.zones['square_leg'] || 0) > 0 ||
            (placement.zones['midwicket'] || 0) > 0 ||
            (placement.zones['deep_square_leg'] || 0) > 0 ||
            (placement.zones['deep_midwicket'] || 0) > 0 ||
            (placement.zones['fine_leg'] || 0) > 0;

        if (hasLegSideProtection) {
            score += 10;
        }
    }

    // For cut shots, should have point/cover region covered
    if (ball.shot_type === 'cut') {
        const hasPointCoverage =
            (placement.zones['point'] || 0) > 0 ||
            (placement.zones['deep_point'] || 0) > 0 ||
            (placement.zones['cover'] || 0) > 0;

        if (hasPointCoverage) {
            score += 10;
        }
    }

    // For drives, should have cover/mid-off coverage
    if (ball.shot_type === 'drive' || ball.shot_type === 'lofted_drive') {
        const hasCoverCoverage =
            (placement.zones['cover'] || 0) > 0 ||
            (placement.zones['deep_cover'] || 0) > 0 ||
            (placement.zones['mid_off'] || 0) > 0 ||
            (placement.zones['long_off'] || 0) > 0;

        if (hasCoverCoverage) {
            score += 10;
        }
    }

    // For edges, slip/gully should be in place
    if (ball.shot_type === 'edge' && phase === 'powerplay') {
        const hasSlip = (placement.zones['slip_gully'] || 0) > 0;
        if (hasSlip) {
            score += 15; // Excellent - caught the edge!
        }
    }

    // Death overs: attacking field should have catching positions
    if (phase === 'death' && ball.runs >= 4) {
        const hasDeepCatchingPositions =
            Object.entries(placement.zones)
                .filter(([zone, count]) =>
                    (zone.startsWith('deep_') || zone.startsWith('long_')) && count > 0
                )
                .length >= 4;

        if (hasDeepCatchingPositions) {
            score += 5; // Good catching positions for boundaries
        }
    }

    return Math.min(30, Math.max(0, score));
}

/**
 * Generate human-readable feedback for the decision
 */
function generateFeedback(
    ball: BallData,
    placement: UserFieldPlacement,
    zoneScore: number,
    phaseScore: number,
    batsmanScore: number
): string {
    const parts: string[] = [];

    // Zone coverage feedback
    if (zoneScore >= 30) {
        parts.push(`Excellent! You placed a fielder at ${ball.shot_zone.replace('_', ' ')} where the ball was played.`);
        if (ball.runs >= 6) {
            parts.push('Would have stopped the six!');
        } else if (ball.is_wicket) {
            parts.push('Perfect positioning for the catch!');
        }
    } else if (zoneScore < 15) {
        parts.push(`Missed the danger zone - ball went to ${ball.shot_zone.replace('_', ' ')} unguarded.`);
    }

    // Phase appropriateness feedback
    if (phaseScore >= 25) {
        parts.push('Field setup perfectly matched the match phase.');
    } else if (phaseScore < 15) {
        parts.push('Field was too attacking/defensive for this situation.');
    }

    // Batsman awareness feedback
    if (batsmanScore >= 25) {
        parts.push('Great awareness of the batsman\'s shot tendencies.');
    }

    return parts.join(' ') || 'Average field placement.';
}

/**
 * Calculate cumulative score across multiple ball decisions
 */
export function calculateCumulativeScore(decisions: BallDecision[]) {
    const totalScore = decisions.reduce((sum, d) => sum + d.score, 0);
    const ballsFaced = decisions.length;
    const avgScore = ballsFaced > 0 ? totalScore / ballsFaced : 0;
    const bestBall = decisions.length > 0 ? Math.max(...decisions.map(d => d.score)) : 0;

    return {
        total_score: totalScore,
        balls_faced: ballsFaced,
        avg_score_per_ball: Math.round(avgScore * 100) / 100,
        best_ball: bestBall,
        decisions,
    };
}
