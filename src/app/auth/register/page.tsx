'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { oauthAPI } from '@/lib/api';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        first_name: '',
        last_name: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        match: true,
        showError: false
    });

    const { register, login, isLoading, error, clearError, isAuthenticated } = useAuth();
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

    // Validate password match
    useEffect(() => {
        if (formData.confirmPassword) {
            const match = formData.password === formData.confirmPassword;
            setPasswordValidation({
                match,
                showError: !match && formData.confirmPassword.length > 0
            });
        } else {
            setPasswordValidation({ match: true, showError: false });
        }
    }, [formData.password, formData.confirmPassword]);

    const handleOAuthLogin = async (provider: 'google' | 'linkedin' | 'tiktok') => {
        try {
            console.log(`Starting OAuth flow for ${provider}`);

            let authResponse;

            switch (provider) {
                case 'google':
                    authResponse = await oauthAPI.getGoogleAuthUrl();
                    break;
                case 'linkedin':
                    authResponse = await oauthAPI.getLinkedInAuthUrl();
                    break;
                case 'tiktok':
                    authResponse = await oauthAPI.getTikTokAuthUrl();
                    break;
                default:
                    throw new Error('Invalid OAuth provider');
            }

            console.log(`Redirecting to ${provider} OAuth:`, authResponse.url);

            // Redirect to OAuth provider
            window.location.href = authResponse.url;

        } catch (error) {
            console.error(`${provider} OAuth error:`, error);

            // Show user-friendly error message
            if (error instanceof Error) {
                if (error.message.includes('not configured')) {
                    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured yet. Please try email registration or contact support.`);
                } else {
                    alert(`Failed to connect with ${provider}. Please try again or use email registration.`);
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setPasswordValidation({ match: false, showError: true });
            return;
        }

        try {
            // Register the user
            await register({
                email: formData.email,
                password: formData.password,
                username: formData.username,
                first_name: formData.first_name || undefined,
                last_name: formData.last_name || undefined,
            });

            // Auto-login after successful registration
            await login(formData.email, formData.password);

            // Redirect to dashboard or profile builder
            router.push('/dashboard');
        } catch (error) {
            // Error is handled by AuthContext
            console.error('Registration error:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (error) {
            clearError();
        }

        // Clear password validation error when user types in password fields
        if ((name === 'password' || name === 'confirmPassword') && passwordValidation.showError) {
            setPasswordValidation(prev => ({ ...prev, showError: false }));
        }
    };

    // Check if form is valid
    const isFormValid = () => {
        return formData.email &&
            formData.password &&
            formData.confirmPassword &&
            formData.username &&
            passwordValidation.match &&
            formData.password.length >= 6;
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
                            className="text-5xl mb-4"  // Changed from text-2xl to text-5xl
                            style={{
                                textShadow: '0 0 3px #60a5fa, 0 0 6px #60a5fa',
                                filter: 'drop-shadow(0 0 2px #60a5fa)'
                            }}
                        >
                            🎓
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Join CampusConnect
                        </h1>
                        <p className="text-gray-400">
                            Connect your account to get started with personalized scholarships
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 text-sm font-medium mb-1">Registration Error</p>
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* OAuth Buttons - Primary Focus */}
                    <div className="space-y-3 mb-8">
                        {/* Google OAuth */}
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            disabled={isLoading}
                            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-medium py-3.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 border border-gray-200 shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* LinkedIn OAuth */}
                        <button
                            onClick={() => handleOAuthLogin('linkedin')}
                            disabled={isLoading}
                            className="w-full bg-[#0077B5] hover:bg-[#005582] disabled:bg-[#0077B5]/50 text-white font-medium py-3.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            Continue with LinkedIn
                        </button>

                        {/* TikTok OAuth */}
                        <button
                            onClick={() => handleOAuthLogin('tiktok')}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#FF0050] to-[#00F2EA] hover:from-[#E6004A] hover:to-[#00D9D2] disabled:opacity-50 text-white font-medium py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                            </svg>
                            Continue with TikTok
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gray-600"></div>
                        <span className="text-gray-400 text-sm font-medium">or</span>
                        <div className="flex-1 h-px bg-gray-600"></div>
                    </div>

                    {/* Manual Registration Toggle */}
                    <button
                        onClick={() => setShowManualForm(!showManualForm)}
                        className="w-full text-gray-300 hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 py-2 mb-4"
                    >
                        <span className="text-sm">Create account with email</span>
                        {showManualForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* Manual Registration Form - Collapsible */}
                    {showManualForm && (
                        <div className="space-y-5 border-t border-gray-700 pt-6">
                            {/* Password mismatch error */}
                            {passwordValidation.showError && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 text-sm font-medium mb-1">Password Mismatch</p>
                                        <p className="text-red-300 text-sm">The passwords you entered don't match. Please try again.</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Username <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                                            placeholder="Choose a unique username"
                                        />
                                    </div>
                                </div>

                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                                            placeholder="First name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-9 pr-10 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                                            placeholder="Create a secure password"
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Confirm Password <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full pl-9 pr-10 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors text-sm ${passwordValidation.showError
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                : formData.confirmPassword && passwordValidation.match
                                                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                                                    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
                                                }`}
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && passwordValidation.match && (
                                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Passwords match
                                        </p>
                                    )}
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !isFormValid()}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-6"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Terms and Privacy */}
                    <div className="bg-gray-700/30 rounded-lg p-4 mt-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-300">
                                By continuing, you agree to our{' '}
                                <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 pt-6 border-t border-gray-700">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link
                                href="/auth/login"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        Questions about registration? Check our{' '}
                        <Link href="/faq" className="text-blue-400 hover:text-blue-300">
                            FAQ
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}