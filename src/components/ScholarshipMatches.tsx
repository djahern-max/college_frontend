// src/components/ScholarshipMatches.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Award,
    ExternalLink,
    Calendar,
    DollarSign,
    Star,
    CheckCircle,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import {
    scholarshipMatchingAPI,
    ScholarshipMatch,
    formatScholarshipAmount,
    formatDeadline,
    getScholarshipTypeBadgeColor
} from '@/lib/api';

interface ScholarshipMatchesProps {
    maxMatches?: number;
    showHeader?: boolean;
    showViewAllButton?: boolean;
}

const ScholarshipMatches: React.FC<ScholarshipMatchesProps> = ({
    maxMatches = 10,
    showHeader = true,
    showViewAllButton = true
}) => {
    const router = useRouter();
    const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [averageScore, setAverageScore] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);

    useEffect(() => {
        fetchMatches();
    }, [maxMatches]);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const response = await scholarshipMatchingAPI.getMyMatches(maxMatches);
            setMatches(response.matches);
            setAverageScore(response.average_match_score);
            setTotalMatches(response.total_matches);
            setError(null);
        } catch (err) {
            console.error('Error fetching scholarship matches:', err);
            setError('Failed to load scholarship matches');
        } finally {
            setLoading(false);
        }
    };

    const handleScholarshipClick = (scholarshipId: number) => {
        router.push(`/scholarships/${scholarshipId}`);
    };

    const getMatchScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getDeadlineUrgency = (deadline?: string): 'urgent' | 'moderate' | 'normal' => {
        if (!deadline) return 'normal';

        const date = new Date(deadline);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) return 'urgent';
        if (diffDays <= 30) return 'moderate';
        return 'normal';
    };

    if (loading) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                {showHeader && (
                    <h2 className="text-xl font-semibold text-white mb-4">Scholarship Matches</h2>
                )}
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                {showHeader && (
                    <h2 className="text-xl font-semibold text-white mb-4">Scholarship Matches</h2>
                )}
                <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                    <p>{error}</p>
                    <button
                        onClick={fetchMatches}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                {showHeader && (
                    <h2 className="text-xl font-semibold text-white mb-4">Scholarship Matches</h2>
                )}
                <div className="text-center py-8 text-gray-400">
                    <Award className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p>No scholarship matches found.</p>
                    <p className="text-sm mt-2">Complete your profile to get better matches!</p>
                    <button
                        onClick={() => router.push('/profile/edit')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            {showHeader && (
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Scholarship Matches</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm text-gray-400">
                                    {totalMatches} matches found
                                </span>
                            </div>
                            {averageScore > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className={`text-sm font-medium ${getMatchScoreColor(averageScore)}`}>
                                        {averageScore}% avg match
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {showViewAllButton && totalMatches > maxMatches && (
                        <button
                            onClick={() => router.push('/scholarships')}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                        >
                            View All <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-4">
                {matches.map((scholarship) => {
                    const urgency = getDeadlineUrgency(scholarship.deadline);

                    return (
                        <div
                            key={scholarship.id}
                            onClick={() => handleScholarshipClick(scholarship.id)}
                            className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                        {scholarship.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {scholarship.provider}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    {scholarship.verified && (
                                        <div title="Verified">
                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                        </div>
                                    )}
                                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-green-400">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{formatScholarshipAmount(
                                        scholarship.amount_min,
                                        scholarship.amount_max,
                                        scholarship.amount_exact
                                    )}</span>
                                </div>

                                {scholarship.deadline && (
                                    <div className={`flex items-center gap-1 ${urgency === 'urgent' ? 'text-red-400' :
                                            urgency === 'moderate' ? 'text-yellow-400' :
                                                'text-gray-400'
                                        }`}>
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDeadline(scholarship.deadline)}</span>
                                    </div>
                                )}

                                {scholarship.renewable && (
                                    <span className="text-blue-400 text-xs">
                                        Renewable
                                    </span>
                                )}
                            </div>

                            {scholarship.scholarship_type && (
                                <div className="mt-3">
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getScholarshipTypeBadgeColor(scholarship.scholarship_type)
                                        }`}>
                                        {scholarship.scholarship_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                </div>
                            )}

                            {scholarship.description && (
                                <p className="text-gray-300 text-sm mt-3 line-clamp-2">
                                    {scholarship.description}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {showViewAllButton && totalMatches > matches.length && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/scholarships')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm transition-colors"
                    >
                        View All {totalMatches} Matches
                    </button>
                </div>
            )}
        </div>
    );
};

export default ScholarshipMatches;