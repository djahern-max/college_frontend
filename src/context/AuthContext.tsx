'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        email: string;
        username: string;
        password: string;
        first_name?: string;
        last_name?: string;
    }) => Promise<void>;
    handleOAuthToken: (token: string) => Promise<User>; // Added this
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!user;

    // Check if user is already logged in on app load
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    // Token might be expired, remove it
                    localStorage.removeItem('access_token');
                    console.error('Failed to get current user:', error);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await authAPI.login(email, password);

            // Store token in localStorage
            localStorage.setItem('access_token', response.access_token);

            // Set user data
            setUser(response.user);

        } catch (error) {
            console.error('Login failed:', error);

            // Handle APIError objects and convert to string
            if (error instanceof Error) {
                setError(error.message); // This extracts the message from APIError
            } else {
                setError('Login failed. Please try again.');
            }

            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: {
        email: string;
        username: string;
        password: string;
        first_name?: string;
        last_name?: string;
    }) => {
        try {
            setIsLoading(true);
            setError(null);

            // First register the user
            const newUser = await authAPI.register(userData);

            // Then automatically log them in
            await login(userData.email, userData.password);

        } catch (error) {
            let errorMessage = 'Registration failed. Please try again.';

            if (error instanceof Error) {
                // Handle specific error messages from the API
                if (error.message.toLowerCase().includes('email already registered')) {
                    errorMessage = 'This email is already registered. Please use a different email or try logging in.';
                } else if (error.message.toLowerCase().includes('username already taken')) {
                    errorMessage = 'This username is already taken. Please choose a different username.';
                } else if (error.message.includes('400')) {
                    if (error.message.includes('email')) {
                        errorMessage = 'Please enter a valid email address.';
                    } else if (error.message.includes('password')) {
                        errorMessage = 'Password must be at least 6 characters long.';
                    } else if (error.message.includes('username')) {
                        errorMessage = 'Username is required and must be unique.';
                    } else {
                        errorMessage = 'Please check your information and try again.';
                    }
                } else if (error.message.includes('422')) {
                    errorMessage = 'Please check that all required fields are filled out correctly.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Server error. Please try again in a few moments.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Handle OAuth token from callback
    const handleOAuthToken = async (token: string): Promise<User> => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🔐 Processing OAuth token...');

            // Store token in localStorage
            localStorage.setItem('access_token', token);

            // Fetch user data with the new token
            const userData = await authAPI.getCurrentUser();
            setUser(userData);

            console.log('✅ OAuth authentication successful:', userData.email);

            return userData;
        } catch (error) {
            console.error('❌ OAuth token validation failed:', error);
            localStorage.removeItem('access_token');
            setError('Authentication failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Remove token from localStorage
        localStorage.removeItem('access_token');

        // Clear user state
        setUser(null);
        setError(null);

        // Call logout endpoint (fire and forget)
        authAPI.logout().catch(console.error);
    };

    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        handleOAuthToken, // Added this to the value object
        logout,
        error,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}