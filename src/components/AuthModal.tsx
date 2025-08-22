'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { validateEmail, validatePassword, validateUsername } from '@/utils/validation';
import ErrorMessage from './ErrorMessage';
import FieldError from './FieldError';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const { login, register, error: authError, clearError } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: ''
    });

    const { errors, generalError, setFieldError, clearFieldError, setGeneralError, clearAllErrors, handleAPIError } = useErrorHandler();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (errors[field]) {
            clearFieldError(field);
        }
        // Clear both our error handler error and auth context error
        if (generalError) {
            setGeneralError(null);
        }
        if (authError) {
            clearError();
        }

        // Real-time validation
        let error: string | null = null;
        switch (field) {
            case 'email':
                error = validateEmail(value);
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'username':
                if (mode === 'register') error = validateUsername(value);
                break;
        }

        if (error) {
            setFieldError(field, error);
        }
    };

    const validateForm = (): boolean => {
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        let usernameError = null;

        if (mode === 'register') {
            usernameError = validateUsername(formData.username);
        }

        if (emailError) setFieldError('email', emailError);
        if (passwordError) setFieldError('password', passwordError);
        if (usernameError) setFieldError('username', usernameError);

        return !emailError && !passwordError && !usernameError;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearAllErrors();
        clearError(); // Clear auth context errors

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (mode === 'login') {
                // Use AuthContext login function directly
                await login(formData.email, formData.password);
                onClose();
            } else {
                // Use AuthContext register function directly
                await register({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    first_name: formData.firstName || undefined,
                    last_name: formData.lastName || undefined
                });
                // Registration automatically logs the user in, so close modal
                onClose();
            }
        } catch (error) {
            // AuthContext already handles error state, but we can also handle field-specific errors
            handleAPIError(error, {
                'username': 'username',
                'email': 'email',
                'password': 'password'
            });
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        clearAllErrors();
        clearError();
        setFormData({
            email: '',
            password: '',
            username: '',
            firstName: '',
            lastName: ''
        });
    };

    if (!isOpen) return null;

    // Use authError from context if available, otherwise use our generalError
    const displayError = authError || generalError;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={loading}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <ErrorMessage
                        message={displayError}
                        onDismiss={() => {
                            setGeneralError(null);
                            clearError();
                        }}
                    />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                            <FieldError error={errors.email} />
                        </div>

                        {mode === 'register' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Choose a username"
                                        disabled={loading}
                                    />
                                    <FieldError error={errors.username} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="First name"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Last name"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <FieldError error={errors.password} />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                                </>
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={switchMode}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                            disabled={loading}
                        >
                            {mode === 'login'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;