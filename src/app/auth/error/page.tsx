'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const message = searchParams.get('message') || 'unknown';

    const getErrorDetails = (errorCode: string) => {
        switch (errorCode) {
            case 'invalid_state':
                return {
                    title: 'Authentication Session Expired',
                    description: 'Your authentication session has expired. This can happen if you took too long to complete the sign-in process.',
                    action: 'Please try signing in again.'
                };
            case 'oauth_failed':
                return {
                    title: 'Authentication Failed',
                    description: 'We encountered an error while trying to sign you in with Google. This could be due to a temporary issue with our authentication service.',
                    action: 'Please try again in a few moments.'
                };
            default:
                return {
                    title: 'Authentication Error',
                    description: 'An unexpected error occurred during the sign-in process.',
                    action: 'Please try again or contact support if the problem persists.'
                };
        }
    };

    const errorDetails = getErrorDetails(message);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/20 rounded-full p-4">
                        <AlertTriangle className="text-red-400" size={48} />
                    </div>
                </div>

                {/* Error Content */}
                <h1 className="text-2xl font-bold text-white mb-4">
                    {errorDetails.title}
                </h1>

                <p className="text-gray-400 mb-2">
                    {errorDetails.description}
                </p>

                <p className="text-gray-500 text-sm mb-8">
                    {errorDetails.action}
                </p>

                {/* Debug Info (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-gray-700 rounded-lg p-3 mb-6 text-left">
                        <p className="text-gray-400 text-xs mb-1">Debug Info:</p>
                        <p className="text-gray-300 text-xs font-mono">Error Code: {message}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Sign In Again
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                {/* Support Link */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <p className="text-gray-500 text-sm">
                        Still having trouble?{' '}
                        <button
                            onClick={() => router.push('/support')}
                            className="text-blue-400 hover:text-blue-300 underline"
                        >
                            Contact Support
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}