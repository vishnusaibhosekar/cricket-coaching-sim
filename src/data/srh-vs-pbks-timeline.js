/**
 * SRH vs PBKS - Match 49, IPL 2026
 * Real match data extracted from scorecard
 * 
 * This file contains key tactical moments for replay mode
 */

const matchTimeline = {
    matchId: 'srh-vs-pbks-2026-05-06',
    teams: {
        team1: { name: 'SRH', fullName: 'Sunrisers Hyderabad' },
        team2: { name: 'PBKS', fullName: 'Punjab Kings' }
    },
    result: 'SRH won by 33 runs',
    finalScore: {
        SRH: { score: 235, wickets: 4, overs: 20 },
        PBKS: { score: 202, wickets: 7, overs: 20 }
    },

    // Key moments extracted from scorecard
    tacticalMoments: [
        {
            over: 3.3,
            event: 'wicket',
            score: 54,
            wickets: 1,
            batsmanOut: 'Abhishek Sharma',
            batsmanScore: '35(13)',
            phase: 'powerplay',
            description: 'Abhishek Sharma c Shreyas Iyer b Lockie Ferguson 35(13)',
            decisionType: 'field_placement',
            context: {
                batsmenAtCrease: ['Travis Head 18*(8)'],
                runRate: '16.36',
                momentum: 'Explosive start by Abhishek'
            }
        },
        {
            over: 6,
            event: 'powerplay_end',
            score: 79,
            wickets: 1,
            phase: 'powerplay',
            description: 'Powerplay ends - SRH 79/1',
            decisionType: 'bowling_change',
            powerplayRuns: 79,
            context: {
                batsmenAtCrease: ['Travis Head', 'Ishan Kishan'],
                runRate: '13.17',
                momentum: 'Aggressive powerplay'
            }
        },
        {
            over: 6.4,
            event: 'wicket',
            score: 84,
            wickets: 2,
            batsmanOut: 'Travis Head',
            batsmanScore: '38(19)',
            phase: 'middle',
            description: 'Travis Head c Marco Jansen b Yuzvendra Chahal 38(19)',
            decisionType: 'field_placement',
            context: {
                batsmenAtCrease: ['Ishan Kishan'],
                runRate: '13.13',
                momentum: 'Head dismissed after quick fire knock'
            }
        },
        {
            over: 10,
            event: 'milestone',
            score: 120,
            wickets: 2,
            phase: 'middle',
            description: '10 overs - SRH 120/2',
            decisionType: 'bowling_change',
            context: {
                batsmenAtCrease: ['Ishan Kishan', 'Heinrich Klaasen'],
                runRate: '12.00',
                momentum: 'Kishan-Klaasen partnership building'
            }
        },
        {
            over: 14.4,
            event: 'wicket',
            score: 172,
            wickets: 3,
            batsmanOut: 'Ishan Kishan',
            batsmanScore: '55(32)',
            phase: 'middle',
            description: 'Ishan Kishan c Suryansh Shedge b Arshdeep Singh 55(32)',
            decisionType: 'field_placement',
            context: {
                batsmenAtCrease: ['Heinrich Klaasen 60*(35)', 'Nitish Reddy'],
                runRate: '11.94',
                momentum: 'Kishan departs after solid fifty'
            }
        },
        {
            over: 15,
            event: 'milestone',
            score: 175,
            wickets: 3,
            phase: 'middle',
            description: '15 overs - SRH 175/3',
            decisionType: 'bowling_change',
            context: {
                batsmenAtCrease: ['Heinrich Klaasen', 'Nitish Reddy'],
                runRate: '11.67',
                momentum: 'Setting up for death overs assault'
            }
        },
        {
            over: 16,
            event: 'death_overs_start',
            score: 180,
            wickets: 3,
            phase: 'death',
            description: 'Death overs begin - SRH 180/3',
            decisionType: 'bowling_change',
            context: {
                batsmenAtCrease: ['Heinrich Klaasen 65*(40)', 'Nitish Reddy 25*(10)'],
                runRate: '11.25',
                momentum: 'Klaasen looking dangerous'
            }
        },
        {
            over: 19.6,
            event: 'wicket',
            score: 235,
            wickets: 4,
            batsmanOut: 'Heinrich Klaasen',
            batsmanScore: '69(43)',
            phase: 'death',
            description: 'Heinrich Klaasen c Marco Jansen b Vijaykumar Vyshak 69(43)',
            decisionType: 'field_placement',
            context: {
                batsmenAtCrease: ['Nitish Reddy 29*(13)'],
                runRate: '11.75',
                momentum: 'Klaasen departs after match-winning knock'
            }
        }
    ],

    // Bowling figures for decision options
    bowlingOptions: {
        PBKS: [
            { name: 'Arshdeep Singh', overs: 4, runs: 43, wickets: 1, economy: 10.80 },
            { name: 'Marco Jansen', overs: 4, runs: 61, wickets: 0, economy: 15.20 },
            { name: 'Lockie Ferguson', overs: 4, runs: 41, wickets: 1, economy: 10.20 },
            { name: 'Yuzvendra Chahal', overs: 4, runs: 32, wickets: 1, economy: 8.00 },
            { name: 'Vijaykumar Vyshak', overs: 4, runs: 54, wickets: 1, economy: 13.50 }
        ]
    }
};

module.exports = matchTimeline;
