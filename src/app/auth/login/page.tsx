'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    // Clear error when component mounts
    useEffect(() => {
        clearError();
    }, [clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await login(formData.email, formData.password);
            router.push('/dashboard');
        } catch (error) {
            // Error is handled by AuthContext
            console.error('Login error:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (error) {
            clearError();
        }
    };

    // Don't render if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to Home Button */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div
                            className="text-2xl"
                            style={{
                                textShadow: '0 0 3px #60a5fa, 0 0 6px #60a5fa',
                                filter: 'drop-shadow(0 0 2px #60a5fa)'
                            }}
                        >
                            🎓
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome Back!
                        </h1>
                        <p className="text-gray-400">
                            Sign in to continue your scholarship journey
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 text-sm font-medium mb-1">Login Error</p>
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                    placeholder="Enter your password"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-8 pt-6 border-t border-gray-700">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                href="/auth/register"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        Need help? Contact our{' '}
                        <Link href="/support" className="text-blue-400 hover:text-blue-300">
                            support team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}