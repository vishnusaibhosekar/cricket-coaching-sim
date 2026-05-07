'use client';

import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function SignInPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        if (!insforge) {
            setError('Authentication service is not configured');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await insforge.auth.signInWithOAuth({
                provider: 'google',
                redirectTo: `${window.location.origin}/auth/callback`,
            });
            // SDK handles redirect automatically
        } catch (err: any) {
            console.error('Google sign-in error:', err);
            setError(err.message || 'Failed to sign in with Google');
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <Card className="max-w-md w-full mx-4 p-8 bg-zinc-900 border-zinc-800">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-zinc-400">
                        Sign in to track your progress and compete on the leaderboard
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Google Sign In Button */}
                <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    size="lg"
                    className="w-full py-6 text-lg bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-900"></div>
                            <span>Redirecting...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span>Continue with Google</span>
                        </div>
                    )}
                </Button>

                {/* Info Section */}
                <div className="mt-8 space-y-4">
                    <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                        <h3 className="text-sm font-semibold text-blue-400 mb-2">
                            Why sign in?
                        </h3>
                        <ul className="text-xs text-zinc-400 space-y-1">
                            <li>• Track your decisions across sessions</li>
                            <li>• Compete on the global leaderboard</li>
                            <li>• Monitor your improvement over time</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleBackToHome}
                        variant="outline"
                        className="text-sm text-zinc-500 text-center mt-3 w-full"
                    >
                        Back to Home
                    </Button>
                </div>
            </Card>
        </div>
    );
}
