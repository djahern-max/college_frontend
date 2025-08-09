'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, Users, BookOpen, TrendingUp, ChevronRight, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { platformAPI, PlatformStatistics } from '@/lib/api';
import AuthModal from './AuthModal';
import ReviewModal from './ReviewModal';

// Mock university ad data
const universityAds = [
    {
        id: 1,
        name: "Stanford University",
        logo: "🎓",
        tagline: "Innovate. Impact. Stanford.",
        color: "from-red-600 to-red-700",
        scholarship: "$75,000 Merit Scholarship",
        deadline: "March 15, 2024"
    },
    {
        id: 2,
        name: "MIT",
        logo: "🔬",
        tagline: "Mind and Hand",
        color: "from-gray-800 to-gray-900",
        scholarship: "$65,000 Need-Based Aid",
        deadline: "January 1, 2024"
    },
    {
        id: 3,
        name: "UC Berkeley",
        logo: "🐻",
        tagline: "Fiat Lux - Let There Be Light",
        color: "from-blue-600 to-blue-700",
        scholarship: "$50,000 California Resident Grant",
        deadline: "November 30, 2023"
    },
    {
        id: 4,
        name: "Harvard University",
        logo: "🏛️",
        tagline: "Veritas",
        color: "from-red-800 to-red-900",
        scholarship: "$80,000 Full Scholarship",
        deadline: "January 1, 2024"
    }
];

interface University {
    id: number;
    name: string;
    logo: string;
    tagline: string;
    color: string;
    scholarship: string;
    deadline: string;
}

interface UniversityAdCardProps {
    university: University;
    index: number;
}

const UniversityAdCard: React.FC<UniversityAdCardProps> = ({ university, index }) => {
    return (
        <div
            className={`relative bg-gradient-to-br ${university.color} rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl cursor-pointer group`}
            style={{
                animationDelay: `${index * 0.2}s`,
            }}
        >
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{university.logo}</div>
                    <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
                        Featured
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{university.name}</h3>
                <p className="text-white/80 text-sm mb-4">{university.tagline}</p>

                <div className="space-y-2">
                    <div className="bg-white/20 rounded-lg p-3">
                        <p className="font-semibold text-sm">{university.scholarship}</p>
                        <p className="text-white/70 text-xs">Deadline: {university.deadline}</p>
                    </div>
                </div>

                <button className="mt-4 w-full bg-white text-gray-900 rounded-lg py-2 px-4 font-medium hover:bg-white/90 transition-colors duration-200 flex items-center justify-center gap-2">
                    Learn More <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

const ScholarshipPlatform: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [platformStats, setPlatformStats] = useState<PlatformStatistics>({
        total_users: 0,
        total_scholarships: 0,
        total_reviews: 0,
        average_rating: 0.0,
        rating_display: 'Loading...',
        total_scholarship_amount: 0,
        formatted_scholarship_amount: '$0+',
        students_helped: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);

    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const router = useRouter();

    // Fetch platform statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStatsLoading(true);
                const stats = await platformAPI.getStatistics();
                setPlatformStats(stats);
            } catch (error) {
                console.error('Failed to fetch platform statistics:', error);
                // On error, show meaningful error state instead of fake data
                setPlatformStats({
                    total_users: 0,
                    total_scholarships: 0,
                    total_reviews: 0,
                    average_rating: 0.0,
                    rating_display: 'Unable to load reviews',
                    total_scholarship_amount: 0,
                    formatted_scholarship_amount: 'Unable to load',
                    students_helped: 0
                });
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Refetch stats when review is submitted
    const handleReviewSubmitted = async () => {
        try {
            setStatsLoading(true);
            const stats = await platformAPI.getStatistics();
            setPlatformStats(stats);
        } catch (error) {
            console.error('Failed to refresh platform statistics:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Rotate featured university ads
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % universityAds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = () => {
        setAuthModalMode('login');
        setAuthModalOpen(true);
    };

    const handleRegister = () => {
        setAuthModalMode('register');
        setAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
    };

    const handleStartSearching = () => {
        router.push('/search');
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/search');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">🎓</div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                CampusConnect
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#" className="text-gray-300 hover:text-white transition-colors">Search</a>
                            <a href="#" className="text-gray-300 hover:text-white transition-colors">Categories</a>
                            <a href="#" className="text-gray-300 hover:text-white transition-colors">Resources</a>
                            {isAuthenticated && (
                                <button
                                    onClick={() => setReviewModalOpen(true)}
                                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <Star size={16} />
                                    Review
                                </button>
                            )}
                            <a href="#" className="text-gray-300 hover:text-white transition-colors">For Universities</a>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <User size={16} />
                                        <span>Hi, {user?.first_name || user?.username}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
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
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-800 border-b border-gray-700">
                    <div className="px-4 py-4 space-y-3">
                        <a href="#" className="block text-gray-300 hover:text-white">Search</a>
                        <a href="#" className="block text-gray-300 hover:text-white">Categories</a>
                        <a href="#" className="block text-gray-300 hover:text-white">Resources</a>
                        {isAuthenticated && (
                            <button
                                onClick={() => setReviewModalOpen(true)}
                                className="block w-full text-left text-gray-300 hover:text-white flex items-center gap-2"
                            >
                                <Star size={16} />
                                Leave a Review
                            </button>
                        )}
                        <a href="#" className="block text-gray-300 hover:text-white">For Universities</a>
                        <hr className="border-gray-700" />
                        {isAuthenticated ? (
                            <>
                                <div className="text-gray-300">Hi, {user?.first_name || user?.username}</div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left text-gray-300 hover:text-white"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleLogin}
                                    className="block w-full text-left text-gray-300 hover:text-white"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={handleRegister}
                                    className="block w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                            THE ONE PLACE TO FIND
                            <span className="block bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                SCHOLARSHIPS
                            </span>
                        </h1>

                        <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Discover, apply, and win scholarships from thousands of universities and organizations.
                            Your education funding journey starts here.
                        </p>

                        {/* Star Rating */}
                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={20}
                                        fill={i < Math.floor(platformStats.average_rating) ? "currentColor" : "none"}
                                        className={i < Math.floor(platformStats.average_rating) ? "text-yellow-400" : "text-gray-500"}
                                    />
                                ))}
                            </div>
                            <span className="text-gray-400">{platformStats.rating_display}</span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <button
                                onClick={handleStartSearching}
                                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                            >
                                Start Searching <Search size={20} />
                            </button>
                            <button className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:bg-gray-800">
                                View Success Stories
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-16">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search scholarships by major, university, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="text-center">
                            <div className="text-4xl lg:text-5xl font-bold text-blue-400 mb-2">
                                {statsLoading ? (
                                    <div className="animate-pulse">Loading...</div>
                                ) : (
                                    platformStats.formatted_scholarship_amount
                                )}
                            </div>
                            <div className="text-gray-400">Available in Scholarships</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl lg:text-5xl font-bold text-purple-400 mb-2">
                                {statsLoading ? (
                                    <div className="animate-pulse">Loading...</div>
                                ) : (
                                    `${platformStats.total_scholarships.toLocaleString()}${platformStats.total_scholarships > 0 ? '+' : ''}`
                                )}
                            </div>
                            <div className="text-gray-400">Active Opportunities</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl lg:text-5xl font-bold text-pink-400 mb-2">
                                {statsLoading ? (
                                    <div className="animate-pulse">Loading...</div>
                                ) : (
                                    platformStats.students_helped.toLocaleString()
                                )}
                            </div>
                            <div className="text-gray-400">Students Helped</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured University Ads Section */}
            <section className="py-20 bg-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            Featured Universities & Scholarships
                        </h2>
                        <p className="text-xl text-gray-400">
                            Discover exclusive opportunities from top institutions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {universityAds.map((university, index) => (
                            <UniversityAdCard key={university.id} university={university} index={index} />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                            View All Partner Universities
                        </button>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-gray-400">Three simple steps to find your perfect scholarship</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center group">
                            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                                <Search size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">1. Search & Filter</h3>
                            <p className="text-gray-400">Use our advanced filters to find scholarships that match your profile, major, and goals.</p>
                        </div>

                        <div className="text-center group">
                            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">2. Apply Directly</h3>
                            <p className="text-gray-400">Submit applications through our streamlined process or get redirected to official portals.</p>
                        </div>

                        <div className="text-center group">
                            <div className="bg-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-4">3. Track & Win</h3>
                            <p className="text-gray-400">Monitor your application status and celebrate your scholarship wins with our community.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Review CTA Section */}
            {isAuthenticated && (
                <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
                            <div className="text-4xl mb-4">⭐</div>
                            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                                Share Your CampusConnect Experience
                            </h2>
                            <p className="text-gray-300 text-lg mb-6">
                                Help other students discover scholarships by sharing your experience with our platform
                            </p>
                            <button
                                onClick={() => setReviewModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
                            >
                                <Star size={20} />
                                Leave a Review
                            </button>
                            {platformStats.total_reviews > 0 && (
                                <p className="text-gray-400 text-sm mt-4">
                                    Join {platformStats.total_reviews.toLocaleString()} other students who have shared their experience
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authModalMode}
            />

            {/* Review Modal */}
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </div>
    );
};

export default ScholarshipPlatform;