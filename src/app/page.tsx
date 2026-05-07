'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleStartPlaying = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Card className="max-w-3xl w-full mx-4 p-8 bg-zinc-900 border-zinc-800">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Cricket Coaching Simulator
          </h1>
          <p className="text-xl text-zinc-400">
            Test Your Cricket IQ — Predict Where the Ball Will Go!
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-8">
          <Button
            onClick={handleStartPlaying}
            size="lg"
            className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            🏏 Sign In to Play — Field Placement Challenge
          </Button>
          <p className="text-sm text-zinc-500 text-center mt-3">
            Sign in with Google to track your progress and compete on the leaderboard
          </p>
        </div>

        {/* How It Works Section */}
        <div className="space-y-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              How to Play
            </h2>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Watch Each Ball
                  </h3>
                  <p className="text-zinc-400">
                    Follow the PBKS innings ball-by-ball from the SRH vs PBKS IPL match. See the match context — score, overs, batsman at crease, and bowler.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Place Your Fielders
                  </h3>
                  <p className="text-zinc-400">
                    Position 9 fielders on the cricket field where you think the batsman will play the shot. Use the batsman's strengths, match phase, and game situation to make smart predictions.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Get Instant Scoring
                  </h3>
                  <p className="text-zinc-400">
                    See where the ball actually went and get scored on how well your field placement covered the shot. Scoring is based on:
                  </p>
                  <ul className="text-sm text-zinc-400 mt-2 space-y-1 ml-4">
                    <li>• <span className="text-zinc-300">Zone Coverage</span> — Did you place fielders in the right area?</li>
                    <li>• <span className="text-zinc-300">Phase Awareness</span> — Did you adapt to powerplay/middle/death overs?</li>
                    <li>• <span className="text-zinc-300">Batsman Reading</span> — Did you predict the batsman's intent?</li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Track Your Performance
                  </h3>
                  <p className="text-zinc-400">
                    Your cumulative score updates after every ball. See your average score per ball, total points, and best ball. Try to beat your score on replay!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-500 text-center">
          Powered by Google Cloud Gemini AI • Built for Agentic Premier League
        </p>
      </Card>
    </div>
  );
}
