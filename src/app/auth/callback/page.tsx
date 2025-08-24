'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { handleOAuthToken, isAuthenticated } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processOAuthCallback = async () => {
            try {
                const token = searchParams.get('token');
                const errorMessage = searchParams.get('message');

                // Handle error case
                if (errorMessage) {
                    setError(getErrorMessage(errorMessage));
                    return;
                }

                // Handle success case
                if (token) {
                    console.log('✅ OAuth token received, processing...');

                    // Use the AuthContext method to handle the token
                    await handleOAuthToken(token);

                    console.log('✅ Authentication complete, redirecting to dashboard...');

                    // Redirect to dashboard
                    router.push('/dashboard');
                } else {
                    setError('No authentication token received');
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError('Authentication failed. Please try again.');
            }
        };

        // Don't run if already authenticated
        if (!isAuthenticated) {
            processOAuthCallback();
        }
    }, [searchParams, handleOAuthToken, router, isAuthenticated]);

    // If already authenticated, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const getErrorMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'invalid_state':
                return 'Authentication session expired. Please try again.';
            case 'oauth_failed':
                return 'Authentication failed. Please try again.';
            default:
                return 'Authentication error occurred. Please try again.';
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
                    <div className="text-red-400 text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-white mb-4">Authentication Failed</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
                <div
                    className="text-5xl mb-4"
                    style={{
                        textShadow: '0 0 3px #60a5fa, 0 0 6px #60a5fa',
                        filter: 'drop-shadow(0 0 2px #60a5fa)'
                    }}
                >
                    🪄🎓
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Completing Sign In</h1>
                <p className="text-gray-400 mb-6">Please wait while we set up your account...</p>
                <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-400" size={32} />
                </div>
            </div>
        </div>
    );
}