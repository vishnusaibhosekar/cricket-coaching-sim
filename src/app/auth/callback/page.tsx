'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { insforge, syncUserProfile } from '@/lib/insforge';
import { Card } from '@/components/ui/card';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // InsForge SDK handles OAuth code exchange automatically in browser mode
                // Just need to check if user is authenticated
                if (!insforge) {
                    setErrorMessage('Authentication service is not configured');
                    setStatus('error');
                    return;
                }

                // Wait a moment for SDK to process the OAuth code from URL
                await new Promise(resolve => setTimeout(resolve, 500));

                const { data, error } = await insforge.auth.getCurrentUser();

                if (error || !data?.user) {
                    setErrorMessage('Authentication failed. Please try again.');
                    setStatus('error');
                    return;
                }

                // Sync user profile (create if doesn't exist)
                await syncUserProfile(data.user);

                setStatus('success');

                // Redirect to replay after short delay
                setTimeout(() => {
                    router.push('/replay');
                }, 1000);
            } catch (error) {
                console.error('Auth callback error:', error);
                setErrorMessage('Something went wrong during authentication');
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
                        <p className="text-zinc-400 mb-4">{errorMessage || 'Something went wrong. Please try again.'}</p>
                        <button
                            onClick={() => router.push('/auth/signin')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Back to Sign In
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
