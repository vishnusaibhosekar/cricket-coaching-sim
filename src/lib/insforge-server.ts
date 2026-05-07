import { createClient } from '@insforge/sdk';
import { cookies } from 'next/headers';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;

// Create server-mode client for API routes
export function createInsForgeServerClient(accessToken?: string) {
    if (!INSFORGE_URL) {
        return null;
    }
    return createClient({
        baseUrl: INSFORGE_URL,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
        isServerMode: true,
        edgeFunctionToken: accessToken,
    });
}

// Get current user from server-side (API routes)
export async function getCurrentUserFromCookies() {
    try {
        const cookieStore = await cookies();

        // Debug: Log all cookies to see what's available
        console.log('All cookies:', cookieStore.getAll().map(c => c.name));

        const accessToken = cookieStore.get('insforge_access_token')?.value;

        if (!accessToken) {
            console.log('No access token found in cookies');
            return null;
        }

        const serverClient = createInsForgeServerClient(accessToken);
        if (!serverClient) {
            return null;
        }

        const { data, error } = await serverClient.auth.getCurrentUser();

        if (error || !data?.user) {
            console.log('getCurrentUserFromCookies error:', error);
            return null;
        }

        return data.user;
    } catch (error) {
        console.error('getCurrentUserFromCookies exception:', error);
        return null;
    }
}
