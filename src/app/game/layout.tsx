'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Button } from '@/components/ui/button';

export default function GameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (!insforge) {
                    router.push('/');
                    return;
                }
                const { data, error } = await insforge.auth.getCurrentUser();
                if (error || !data?.user) {
                    router.push('/auth/signin');
                } else {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/auth/signin');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleSignOut = async () => {
        try {
            if (!insforge) {
                router.push('/');
                return;
            }
            await insforge.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Sign out error:', error);
            router.push('/');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <p className="text-zinc-400">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <nav className="border-b border-zinc-800 bg-zinc-900 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">🏏 Cricket Coaching Simulator</h1>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3">
                                {user.avatar_url || user.picture ? (
                                    <img
                                        src={user.avatar_url || user.picture}
                                        alt={user.display_name || user.name || user.email}
                                        className="w-8 h-8 rounded-full border border-zinc-700"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                        {(user.display_name || user.name || user.email || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="text-zinc-300 text-sm">
                                    {user.display_name || user.name || user.email}
                                </span>
                            </div>
                        )}
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="text-sm text-zinc-500 text-center mt-3"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
