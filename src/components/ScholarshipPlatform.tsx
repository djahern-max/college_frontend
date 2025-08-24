'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { platformAPI } from '@/lib/api';
import ScholarshipBanner from './ScholarshipBanner'; // Fixed import (default export, no curly braces)

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
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                            <span className="block">THE ONE PLACE</span>
                            <span className="block">TO FIND</span>
                            <span className="block bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                SCHOLARSHIPS
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
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
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 px-4">
                            <button
                                onClick={handleStartSearching}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                Start Searching <Search size={20} />
                            </button>
                            <button className="w-full sm:w-auto border border-gray-600 hover:border-gray-500 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-gray-800">
                                View Success Stories
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-12 px-4">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search scholarships..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-20 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm sm:text-base"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
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

                        {/* Full-Width Scholarship Banner */}
                        <div className="mb-20">
                            <ScholarshipBanner />
                        </div>
                    </div>
                </div>åß
            </section>
        </>
    );
};

export default ScholarshipPlatform;