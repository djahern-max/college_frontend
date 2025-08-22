// In src/components/Navigation.tsx, update the Sign Up button to navigate to the register page instead of opening modal

'use client';

import React, { useState } from 'react';
import { Search, Star, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavigationProps {
    onOpenReviewModal?: () => void;
    onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

const Navigation: React.FC<NavigationProps> = ({ onOpenReviewModal, onOpenAuthModal }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { isProfileCompleted } = useProfile();
    const router = useRouter();

    const handleLogin = () => {
        // Navigate to login page instead of modal
        router.push('/auth/login');
    };

    const handleRegister = () => {
        // Navigate to register page instead of modal
        router.push('/auth/register');
    };

    const handleLogout = () => {
        logout();
    };

    const handleReviewClick = () => {
        onOpenReviewModal?.();
    };

    // Determine profile link text and destination
    const profileLinkText = isProfileCompleted ? 'View Profile' : 'Build Profile';
    const profileLinkHref = isProfileCompleted ? '/profile/view' : '/profile';

    return (
        <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div
                            className="text-2xl"
                            style={{
                                textShadow: '0 0 3px #60a5fa, 0 0 6px #60a5fa',
                                filter: 'drop-shadow(0 0 2px #60a5fa)'
                            }}
                        >
                            🪄 🎓
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Vwaala
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/search" className="text-gray-300 hover:text-white transition-colors">
                            Search
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link href={profileLinkHref} className="text-gray-300 hover:text-white transition-colors">
                                    {profileLinkText}
                                </Link>
                                <button
                                    onClick={handleReviewClick}
                                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <Star size={16} />
                                    Review
                                </button>
                            </>
                        )}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="text-gray-300">Hi, {user?.first_name || user?.username}</div>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleLogin}
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={handleRegister}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-gray-300 hover:text-white"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-800">
                        <div className="px-4 py-4 space-y-4">
                            <Link
                                href="/search"
                                className="block text-gray-300 hover:text-white"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Search
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link
                                        href={profileLinkHref}
                                        className="block text-gray-300 hover:text-white"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {profileLinkText}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleReviewClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left text-gray-300 hover:text-white"
                                    >
                                        Review
                                    </button>
                                </>
                            )}
                            {isAuthenticated ? (
                                <>
                                    <div className="text-gray-300">Hi, {user?.first_name || user?.username}</div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left text-gray-300 hover:text-white"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            handleLogin();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left text-gray-300 hover:text-white"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRegister();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
                                    >
                                        Register
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
export default Navigation;