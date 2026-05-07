// Tactical moments from the actual SRH vs PBKS match
// These are the key decision points where Pat Cummins had to make captaincy choices

export interface TacticalMoment {
    over: number;
    ball: string;
    situation: 'wicket' | 'boundary' | 'high_scoring_over' | 'milestone';
    context: {
        score: string;
        batsman: string;
        batsmanRuns?: number;
        bowler: string;
        bowlerFigures?: string;
        matchPhase: string;
        recentOvers: string;
    };
    options: {
        id: string;
        label: string;
        description: string;
    }[];
    actualDecision: {
        what: string;
        outcome: string;
    };
}

export const tacticalMomentsDB: TacticalMoment[] = [
    {
        over: 1,
        ball: '3',
        situation: 'wicket',
        context: {
            score: '8-1',
            batsman: 'Prabhsimran Singh',
            batsmanRuns: 2,
            bowler: 'Pat Cummins',
            bowlerFigures: '(1.3-0-4-1)',
            matchPhase: 'powerplay',
            recentOvers: 'Start of innings',
        },
        options: [
            {
                id: 'continue_cummins',
                label: 'Continue with Cummins',
                description: 'He\'s got the breakthrough, keep him going to build pressure',
            },
            {
                id: 'bring_spin',
                label: 'Bring in a spinner',
                description: 'Mix it up early, don\'t let batsmen settle',
            },
            {
                id: 'change_ends',
                label: 'Change bowler from other end',
                description: 'Give Cummins a rest, attack from the other end',
            },
        ],
        actualDecision: {
            what: 'Continued with Cummins',
            outcome: 'Cummins struck again in the over - Prabhsimran Singh fell for 7. SRH 2 down early!',
        },
    },
    {
        over: 4,
        ball: '2',
        situation: 'wicket',
        context: {
            score: '37-3',
            batsman: 'New batsman',
            bowler: 'Jaydev Unadkat',
            bowlerFigures: '(2.2-0-18-2)',
            matchPhase: 'powerplay',
            recentOvers: '4, 6, W, 1, 4',
        },
        options: [
            {
                id: 'continue_unadkat',
                label: 'Let Unadkat finish the over',
                description: 'He\'s in great rhythm with 2 wickets already',
            },
            {
                id: 'introduce_cummins',
                label: 'Bring Cummins back',
                description: 'Your best bowler in the powerplay to exploit new batsman',
            },
            {
                id: 'defensive_field',
                label: 'Set defensive field',
                description: 'Protect boundaries, build dot ball pressure',
            },
        ],
        actualDecision: {
            what: 'Continued with Unadkat',
            outcome: 'Unadkat finished with 2/31 in powerplay. Good containment but expensive.',
        },
    },
    {
        over: 7,
        ball: '5',
        situation: 'wicket',
        context: {
            score: '65-4',
            batsman: 'Marcus Stoinis',
            batsmanRuns: 15,
            bowler: 'Pat Cummins',
            bowlerFigures: '(3.5-0-28-2)',
            matchPhase: 'middle',
            recentOvers: '8, 6, 4, W, 1',
        },
        options: [
            {
                id: 'continue_cummins_stoinis',
                label: 'Continue with Cummins',
                description: 'He\'s got Stoinis\' wicket, keep the momentum',
            },
            {
                id: 'bring_bhuvi',
                label: 'Introduce Bhuvneshwar Kumar',
                description: 'Experienced head, good for middle overs containment',
            },
            {
                id: 'attacking_field',
                label: 'Set attacking field',
                description: 'Go for wickets with slips and close catchers',
            },
        ],
        actualDecision: {
            what: 'Brought in Bhuvneshwar Kumar',
            outcome: 'Bhuvneshwar conceded 12 runs in his over but didn\'t get a wicket.',
        },
    },
    {
        over: 12,
        ball: '4',
        situation: 'wicket',
        context: {
            score: '118-5',
            batsman: 'Shashank Singh',
            batsmanRuns: 28,
            bowler: 'Harshal Patel',
            bowlerFigures: '(3.4-0-42-1)',
            matchPhase: 'middle',
            recentOvers: '11, 8, 13, 6, W',
        },
        options: [
            {
                id: 'continue_harshal',
                label: 'Continue with Harshal',
                description: 'He broke the partnership, let him continue',
            },
            {
                id: 'bring_cummins_death',
                label: 'Bring Cummins for double spell',
                description: 'Save your best for the death overs',
            },
            {
                id: 'try_spinner',
                label: 'Try a spinner',
                description: 'Change of pace might disrupt the new batsman',
            },
        ],
        actualDecision: {
            what: 'Continued with Harshal, then brought Cummins back at over 16',
            outcome: 'Connolly was already on 45* and accelerating. The delay in bringing Cummins back proved costly.',
        },
    },
    {
        over: 16,
        ball: '2',
        situation: 'high_scoring_over',
        context: {
            score: '161-6',
            batsman: 'Cooper Connolly',
            batsmanRuns: 63,
            bowler: 'Pat Cummins',
            bowlerFigures: '(7.2-0-68-2)',
            matchPhase: 'death',
            recentOvers: '16, 15, 12, 18, 13',
        },
        options: [
            {
                id: 'bowl_wide_yorker',
                label: 'Bowl wide yorkers',
                description: 'Target the blockhole, limit boundary options',
            },
            {
                id: 'bowl_bouncer',
                label: 'Use bouncers',
                description: 'Target the body, disrupt Connolly\'s rhythm',
            },
            {
                id: 'change_bowler',
                label: 'Take yourself off',
                description: 'You\'re expensive (68 runs), try someone else',
            },
        ],
        actualDecision: {
            what: 'Continued bowling, conceded 16 runs in the over',
            outcome: 'Connolly reached his FIFTY and was in complete control. SRH needed a breakthrough urgently.',
        },
    },
    {
        over: 19,
        ball: '4',
        situation: 'milestone',
        context: {
            score: '198-7',
            batsman: 'Cooper Connolly',
            batsmanRuns: 96,
            bowler: 'Shivang Kumar',
            bowlerFigures: '(3.4-0-45-0)',
            matchPhase: 'death',
            recentOvers: '15, 12, 18, 13, 16',
        },
        options: [
            {
                id: 'bowl_to_milestone',
                label: 'Bowl around the wicket',
                description: 'Make it harder for him to reach his century',
            },
            {
                id: 'set_milestone_field',
                label: 'Set boundary field only',
                description: 'Don\'t let him hit the winning runs with a six',
            },
            {
                id: 'aggressive_plan',
                label: 'Bowl short and aggressive',
                description: 'Try to get him out before he reaches 100',
            },
        ],
        actualDecision: {
            what: 'Connolly hit a FOUR to reach his century!',
            outcome: 'Connolly scored 112* off 55 balls - his maiden IPL century. Standing ovation from the crowd!',
        },
    },
    {
        over: 20,
        ball: '1',
        situation: 'wicket',
        context: {
            score: '202-7',
            batsman: 'Marco Jansen',
            batsmanRuns: 8,
            bowler: 'Shivang Kumar',
            bowlerFigures: '(4.1-0-53-0)',
            matchPhase: 'death',
            recentOvers: 'Last over of the innings',
        },
        options: [
            {
                id: 'yorker_length',
                label: 'Bowl perfect yorkers',
                description: 'Don\'t give him room to hit in the final over',
            },
            {
                id: 'body_short',
                label: 'Bowl short at the body',
                description: 'Make it difficult to free the arms',
            },
            {
                id: 'wide_line',
                label: 'Bowl wide outside off',
                description: 'Force him to reach and miss',
            },
        ],
        actualDecision: {
            what: 'Jansen was CAUGHT on the first ball!',
            outcome: 'Jansen fell for 8. PBKS finished 202/7. Connolly 112* was the star of the innings.',
        },
    },
];
