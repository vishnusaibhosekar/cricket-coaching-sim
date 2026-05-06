'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Card } from '@/components/ui/card';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // InsForge handles OAuth callback automatically
                // Just need to check if user is authenticated
                if (!insforge) {
                    setStatus('error');
                    return;
                }

                const { data } = await insforge.auth.getCurrentUser();

                if (data) {
                    setStatus('success');
                    // Redirect to game after short delay
                    setTimeout(() => {
                        router.push('/game');
                    }, 1000);
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                setStatus('error');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Card className="max-w-md w-full mx-4 p-8 bg-zinc-900 border-zinc-800 text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-white mb-2">Completing Sign In</h2>
                        <p className="text-zinc-400">Please wait...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-400 text-6xl mb-4">✓</div>
                        <h2 className="text-xl font-bold text-white mb-2">Sign In Successful!</h2>
                        <p className="text-zinc-400">Redirecting to game...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-red-400 text-6xl mb-4">✗</div>
                        <h2 className="text-xl font-bold text-white mb-2">Sign In Failed</h2>
                        <p className="text-zinc-400 mb-4">Something went wrong. Please try again.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Back to Home
                        </button>
                    </>
                )}
            </Card>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-black">
                <p className="text-zinc-400">Loading...</p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
