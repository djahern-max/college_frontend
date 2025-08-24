// ============ NEW src/app/auth/register/page.tsx ============
'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { validateEmail, validatePassword, validateUsername } from '@/utils/validation';
import ErrorMessage from '@/components/ErrorMessage';
import FieldError from '@/components/FieldError';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
    const router = useRouter();

    // Our enhanced error handling
    const { errors, generalError, setFieldError, clearFieldError, setGeneralError, clearAllErrors, handleAPIError } = useErrorHandler();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    // Clear errors when component mounts
    useEffect(() => {
        clearError();
        clearAllErrors();
    }, [clearError, clearAllErrors]);

    const validateForm = (): boolean => {
        const emailError = validateEmail(formData.email);
        const usernameError = validateUsername(formData.username);
        const passwordError = validatePassword(formData.password);

        let confirmPasswordError = null;
        if (!formData.confirmPassword) {
            confirmPasswordError = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            confirmPasswordError = 'Passwords do not match';
        }

        if (emailError) setFieldError('email', emailError);
        if (usernameError) setFieldError('username', usernameError);
        if (passwordError) setFieldError('password', passwordError);
        if (confirmPasswordError) setFieldError('confirmPassword', confirmPasswordError);

        return !emailError && !usernameError && !passwordError && !confirmPasswordError;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAllErrors();
        clearError();

        if (!validateForm()) {
            return;
        }

        try {
            await register({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                first_name: formData.firstName || undefined,
                last_name: formData.lastName || undefined,
            });

            // Register function in AuthContext automatically logs the user in
            router.push('/dashboard');
        } catch (error) {
            // Use our error handler for API errors
            handleAPIError(error, {
                'email': 'email',
                'username': 'username',
                'password': 'password'
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear field errors when user starts typing
        if (errors[name]) {
            clearFieldError(name);
        }

        // Clear general errors
        if (generalError) {
            setGeneralError(null);
        }
        if (authError) {
            clearError();
        }

        // Real-time validation
        let error: string | null = null;
        switch (name) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'username':
                error = validateUsername(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'confirmPassword':
                if (value && formData.password && value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;
        }

        if (error) {
            setFieldError(name, error);
        }
    };

    // Don't render if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    // Use authError from context if available, otherwise use our generalError
    const displayError = authError || generalError;

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
                            className="text-5xl mb-4"
                            style={{
                                textShadow: '0 0 3px #60a5fa, 0 0 6px #60a5fa',
                                filter: 'drop-shadow(0 0 2px #60a5fa)'
                            }}
                        >
                            🪄🎓
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Join MagicScholar
                        </h1>
                        <p className="text-gray-400">
                            Create your account and start finding scholarships
                        </p>
                    </div>

                    {/* Enhanced Error Display */}
                    <ErrorMessage
                        message={displayError}
                        onDismiss={() => {
                            setGeneralError(null);
                            clearError();
                        }}
                    />

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                                        }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <FieldError error={errors.email} />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm ${errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                                        }`}
                                    placeholder="Choose a username"
                                />
                            </div>
                            <FieldError error={errors.username} />
                        </div>

                        {/* First and Last Name */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
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
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm"
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                                        }`}
                                    placeholder="Create a password"
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
                            <FieldError error={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors text-sm ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-blue-500'
                                        }`}
                                    placeholder="Confirm your password"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <FieldError error={errors.confirmPassword} />
                        </div>

                        {/* Terms and Privacy */}
                        <div className="text-sm text-gray-400">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                                Privacy Policy
                            </Link>
                            .
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
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

                    {/* Footer */}
                    <div className="text-center mt-8 pt-6 border-t border-gray-700">
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