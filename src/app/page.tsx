'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleStartDemo = () => {
    router.push('/game');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <Card className="max-w-2xl w-full mx-4 p-8 bg-zinc-900 border-zinc-800 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Cricket Coaching Simulator
          </h1>
          <p className="text-xl text-zinc-400">
            IPL 2026 — SRH vs PBKS
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <p className="text-lg text-zinc-300">
            Step into the coach's role. Make tactical decisions during the match:
          </p>
          <ul className="text-left space-y-3 text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Choose bowling changes at key moments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Set field placements based on batsman strengths</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Get scored by Gemini AI on tactical merit (0-100)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Compete on the leaderboard for highest cricket IQ</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={handleStartDemo}
          size="lg"
          className="w-full text-lg py-6"
        >
          Start Demo
        </Button>

        <p className="text-sm text-zinc-500 mt-4">
          Powered by Google Cloud • Built for Agentic Premier League
        </p>
      </Card>
    </div>
  );
}
