'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';

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
                const { data } = await insforge.auth.getCurrentUser();
                if (!data) {
                    router.push('/');
                } else {
                    setUser(data);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

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
                            <span className="text-zinc-300">
                                Welcome, {user.display_name || user.email}
                            </span>
                        )}
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
