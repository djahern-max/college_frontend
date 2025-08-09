'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { scholarshipAPI } from '@/lib/scholarshipAPI';

interface Scholarship {
    id: number;
    title: string;
    provider: string;
    description?: string;
    amount_min?: string;
    amount_max?: string;
    amount_exact?: string;
    deadline?: string;
    scholarship_type?: string;
    application_url?: string;
}

const ScholarshipBanner: React.FC = () => {
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
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

    const formatAmount = (scholarship: Scholarship) => {
        if (scholarship.amount_exact) {
            return `$${parseFloat(scholarship.amount_exact).toLocaleString()}`;
        } else if (scholarship.amount_min && scholarship.amount_max) {
            return `$${parseFloat(scholarship.amount_min).toLocaleString()} - $${parseFloat(scholarship.amount_max).toLocaleString()}`;
        } else if (scholarship.amount_min) {
            return `$${parseFloat(scholarship.amount_min).toLocaleString()}+`;
        } else if (scholarship.amount_max) {
            return `Up to $${parseFloat(scholarship.amount_max).toLocaleString()}`;
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
                        {currentScholarship.application_url ? (
                            <a
                                href={currentScholarship.application_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                                title="Apply for this scholarship"
                            >
                                <ExternalLink size={18} />
                                Apply Now
                            </a>
                        ) : (
                            <button
                                disabled
                                className="bg-gray-600 text-gray-400 px-8 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center gap-2"
                                title="Application URL not available"
                            >
                                <ExternalLink size={18} />
                                No URL Available
                            </button>
                        )}

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

export default ScholarshipBanner;