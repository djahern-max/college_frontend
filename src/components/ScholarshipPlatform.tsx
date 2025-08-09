'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, BookOpen, TrendingUp, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { platformAPI } from '@/lib/api';
import { scholarshipAPI } from '@/lib/scholarshipAPI';

// Define the platform statistics interface locally
interface PlatformStats {
    total_users: number;
    total_scholarships: number;
    total_reviews: number;
    average_rating: number;
    rating_display: string;
    total_scholarship_amount: number;
    formatted_scholarship_amount: string;
    students_helped: number;
}

// Scholarship Banner Component
const ScholarshipBanner: React.FC = () => {
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScholarships = async () => {
            try {
                const response = await scholarshipAPI.getActiveScholarships(0, 20);
                setScholarships(response || []);
            } catch (error) {
                console.error('Failed to fetch scholarships for banner:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchScholarships();
    }, []);

    // Auto-rotate scholarships
    useEffect(() => {
        if (scholarships.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % scholarships.length);
            }, 4000); // Change every 4 seconds
            return () => clearInterval(interval);
        }
    }, [scholarships.length]);

    const formatAmount = (scholarship: any) => {
        if (scholarship.amount_exact) {
            return `${parseFloat(scholarship.amount_exact).toLocaleString()}`;
        } else if (scholarship.amount_min && scholarship.amount_max) {
            return `${parseFloat(scholarship.amount_min).toLocaleString()} - ${parseFloat(scholarship.amount_max).toLocaleString()}`;
        } else if (scholarship.amount_min) {
            return `${parseFloat(scholarship.amount_min).toLocaleString()}+`;
        } else if (scholarship.amount_max) {
            return `Up to ${parseFloat(scholarship.amount_max).toLocaleString()}`;
        }
        return 'Amount varies';
    };

    const formatDeadline = (deadline?: string) => {
        if (!deadline) return 'No deadline';
        const date = new Date(deadline);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-gray-800/30 rounded-2xl p-8 animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
        );
    }

    if (scholarships.length === 0) {
        return (
            <div className="bg-gray-800/30 rounded-2xl p-8 text-center">
                <p className="text-gray-400">No scholarships available at the moment.</p>
            </div>
        );
    }

    const currentScholarship = scholarships[currentIndex];

    return (
        <div className="relative bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-gray-700 overflow-hidden">
            {/* Background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 animate-pulse"></div>

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-block bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
                            Featured Scholarship
                        </div>

                        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                            {currentScholarship.title}
                        </h3>

                        <p className="text-gray-300 text-lg mb-4">
                            {currentScholarship.provider}
                        </p>

                        {currentScholarship.description && (
                            <p className="text-gray-400 mb-6 line-clamp-2">
                                {currentScholarship.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-green-400" />
                                <span className="text-green-400 font-semibold">
                                    {formatAmount(currentScholarship)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-orange-400" />
                                <span className="text-orange-400">
                                    Deadline: {formatDeadline(currentScholarship.deadline)}
                                </span>
                            </div>

                            <div className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full">
                                {currentScholarship.scholarship_type?.replace('_', ' ').toUpperCase() || 'SCHOLARSHIP'}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
                            <ExternalLink size={18} />
                            View Details
                        </button>

                        {/* Progress indicators */}
                        <div className="flex gap-2">
                            {scholarships.slice(0, 10).map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex % 10 ? 'bg-blue-400 w-8' : 'bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>

                        <p className="text-gray-500 text-sm">
                            Showing {currentIndex + 1} of {scholarships.length} scholarships
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScholarshipPlatform: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [platformStats, setPlatformStats] = useState<PlatformStats>({
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

    const router = useRouter();

    // Fetch platform statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStatsLoading(true);
                const stats = await platformAPI.getStatistics();
                setPlatformStats(stats as PlatformStats);
            } catch (error) {
                console.error('Failed to fetch platform statistics:', error);
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
        <>
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
                        <ScholarshipBanner />
                    </div>
                </div>
            </section>


        </>
    );
};

export default ScholarshipPlatform;