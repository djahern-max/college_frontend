'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuthSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing your login...');

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                const token = searchParams.get('token');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    setMessage(`OAuth login failed: ${error}`);
                    setTimeout(() => router.push('/auth/login'), 3000);
                    return;
                }

                if (!token) {
                    setStatus('error');
                    setMessage('No authentication token received');
                    setTimeout(() => router.push('/auth/login'), 3000);
                    return;
                }

                // Store the token
                localStorage.setItem('access_token', token);

                // Update auth context (you might need to modify this based on your auth context)
                setStatus('success');
                setMessage('Login successful! Redirecting to dashboard...');

                // Redirect to dashboard after a brief delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);

            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('error');
                setMessage('An unexpected error occurred during login');
                setTimeout(() => router.push('/auth/login'), 3000);
            }
        };

        handleOAuthCallback();
    }, [searchParams, router, login]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-6">
                    {status === 'loading' && (
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    )}
                    {status === 'error' && (
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    )}
                </div>

                {/* Header */}
                <h1 className="text-2xl font-bold text-white mb-4">
                    {status === 'loading' && 'Processing Login...'}
                    {status === 'success' && 'Login Successful!'}
                    {status === 'error' && 'Login Failed'}
                </h1>

                {/* Message */}
                <p className="text-gray-400 mb-6">
                    {message}
                </p>

                {/* Loading indicator */}
                {status === 'loading' && (
                    <div className="text-blue-400 text-sm">
                        Please wait while we complete your authentication...
                    </div>
                )}

                {/* Success indicator */}
                {status === 'success' && (
                    <div className="text-green-400 text-sm">
                        Welcome to MagicScholar! 🎉
                    </div>
                )}

                {/* Error with manual redirect option */}
                {status === 'error' && (
                    <div className="space-y-4">
                        <div className="text-red-400 text-sm">
                            You will be redirected to the login page shortly.
                        </div>
                        <button
                            onClick={() => router.push('/auth/login')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Go to Login Page
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}