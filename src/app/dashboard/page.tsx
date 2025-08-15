'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profileAPI, getImageUrl, scholarshipMatchingAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import ScholarshipMatches from '@/components/ScholarshipMatches';
import {
    User,
    Award,
    Target,
    TrendingUp,
    Calendar,
    CheckCircle,
    AlertCircle,
    Plus,
    BookOpen,
    Trophy,
    Heart,
    Briefcase,
    Search,
    Edit,
    ArrowRight
} from 'lucide-react';

interface ProfileSummary {
    id: number;
    user_id: number;
    profile_completed: boolean;
    completion_percentage: number;
    profile_visibility: string;
    high_school_name?: string;
    graduation_year?: number;
    sports_played?: string[];
    updated_at?: string;
}

interface UserProfile {
    profile_photo_url?: string;
    // Add other profile fields as needed
}

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [matchesCount, setMatchesCount] = useState(0);
    const [potentialAwards, setPotentialAwards] = useState(0);
    const router = useRouter();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
            return;
        }
    }, [isAuthenticated, isLoading, router]);

    // Load profile summary and profile data
    useEffect(() => {
        const loadProfileData = async () => {
            if (!user) return;

            try {
                // Load both summary and full profile data
                const [summary, profile] = await Promise.all([
                    profileAPI.getProfileSummary().catch(() => null),
                    profileAPI.getMyProfile().catch(() => null)
                ]);

                setProfileSummary(summary);
                setUserProfile(profile);

                // Load scholarship matches to get count and potential awards
                if (summary?.profile_completed) {
                    try {
                        const matchesResponse = await scholarshipMatchingAPI.getMyMatches(50);
                        setMatchesCount(matchesResponse.total_matches);

                        // Calculate potential awards from matches
                        const totalPotential = matchesResponse.matches.reduce((sum, scholarship) => {
                            const amount = scholarship.amount_exact
                                ? parseFloat(scholarship.amount_exact)
                                : scholarship.amount_max
                                    ? parseFloat(scholarship.amount_max)
                                    : scholarship.amount_min
                                        ? parseFloat(scholarship.amount_min)
                                        : 0;
                            return sum + amount;
                        }, 0);
                        setPotentialAwards(totalPotential);
                    } catch (error) {
                        console.error('Failed to load scholarship matches:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to load profile data:', error);
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfileData();
    }, [user]);

    // Show loading state
    if (isLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated || !user) {
        return null;
    }

    const firstName = user.first_name || user.username;
    const profileCompletion = profileSummary?.completion_percentage || 0;
    const isProfileComplete = profileSummary?.profile_completed || false;

    // Get profile image URL
    const profileImageUrl = getImageUrl(userProfile?.profile_photo_url);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl}
                                        alt="Profile photo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Profile photo failed to load:', profileImageUrl);
                                            // Hide the image and show the fallback icon
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <User size={24} className="text-white/70" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {firstName}'s Dashboard
                                </h1>
                                <p className="text-blue-200 mt-1">
                                    Welcome back! Here's your scholarship journey progress.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-blue-200">
                            <User className="h-4 w-4" />
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Profile Progress Section */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Profile Completion Card */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white">Profile Progress</h2>
                                {isProfileComplete ? (
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-yellow-400" />
                                )}
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span>Profile Completion</span>
                                    <span>{profileCompletion}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${profileCompletion}%` }}
                                    ></div>
                                </div>
                            </div>

                            {!isProfileComplete && (
                                <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-blue-300 text-sm mb-3">
                                        Complete your profile to unlock more scholarship opportunities!
                                    </p>
                                    <button
                                        onClick={() => router.push('/profile/edit')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Complete Profile
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex items-center">
                                    <Award className="h-8 w-8 text-yellow-400 mr-3" />
                                    <div>
                                        <p className="text-2xl font-bold text-white">0</p>
                                        <p className="text-gray-400 text-sm">Scholarships Applied</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex items-center">
                                    <Target className="h-8 w-8 text-green-400 mr-3" />
                                    <div>
                                        <p className="text-2xl font-bold text-white">{matchesCount}</p>
                                        <p className="text-gray-400 text-sm">Matches Found</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex items-center">
                                    <TrendingUp className="h-8 w-8 text-blue-400 mr-3" />
                                    <div>
                                        <p className="text-2xl font-bold text-white">
                                            ${potentialAwards.toLocaleString()}
                                        </p>
                                        <p className="text-gray-400 text-sm">Potential Awards</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {profileSummary ? (
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <div>
                                            <p className="text-white">Profile created</p>
                                            <p className="text-gray-400 text-sm">
                                                Completion: {profileCompletion}%
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <User className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                                        <p>No activity yet. Complete your profile to get started!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scholarship Matches - Replace the static section with dynamic component */}
                        {isProfileComplete && matchesCount > 0 ? (
                            <ScholarshipMatches
                                maxMatches={5}
                                showHeader={true}
                                showViewAllButton={true}
                            />
                        ) : (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-white">Scholarship Opportunities</h2>
                                    <button
                                        onClick={() => router.push('/search')}
                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                                    >
                                        View All <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="text-center py-8 text-gray-400">
                                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                                    <p>Complete your profile to see personalized scholarship matches!</p>
                                    <button
                                        onClick={() => router.push('/search')}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                                    >
                                        Browse Scholarships
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Quick Actions */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/search')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Award className="h-4 w-4" />
                                    <span>Find Scholarships</span>
                                </button>

                                <button
                                    onClick={() => router.push('/profile/view')}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                                >
                                    <User className="h-4 w-4" />
                                    <span>View Profile</span>
                                </button>

                                <button
                                    onClick={() => router.push('/profile/edit')}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        </div>

                        {/* Profile Summary */}
                        {profileSummary && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Profile Summary</h3>
                                <div className="space-y-3 text-sm">
                                    {profileSummary.high_school_name && (
                                        <div className="flex items-center space-x-2">
                                            <BookOpen className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-300">{profileSummary.high_school_name}</span>
                                        </div>
                                    )}

                                    {profileSummary.graduation_year && (
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-300">Class of {profileSummary.graduation_year}</span>
                                        </div>
                                    )}

                                    {profileSummary.sports_played && profileSummary.sports_played.length > 0 && (
                                        <div className="flex items-start space-x-2">
                                            <Trophy className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-gray-400">Sports:</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {profileSummary.sports_played.map((sport, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-orange-600/20 text-orange-300 rounded text-xs">
                                                            {sport}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show match info if available */}
                                    {matchesCount > 0 && (
                                        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-700">
                                            <Target className="h-4 w-4 text-green-400" />
                                            <span className="text-green-300">
                                                {matchesCount} scholarship matches found!
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Progress Breakdown */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Progress Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm text-gray-300">Basic Info</span>
                                    </div>
                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Academics</span>
                                    </div>
                                    {profileCompletion > 40 ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <div className="w-4 h-4 border-2 border-gray-600 rounded-full"></div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-orange-400" />
                                        <span className="text-sm text-gray-300">Athletics</span>
                                    </div>
                                    {profileCompletion > 60 ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <div className="w-4 h-4 border-2 border-gray-600 rounded-full"></div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-pink-400" />
                                        <span className="text-sm text-gray-300">Community</span>
                                    </div>
                                    {profileCompletion > 80 ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <div className="w-4 h-4 border-2 border-gray-600 rounded-full"></div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-purple-400" />
                                        <span className="text-sm text-gray-300">Activities</span>
                                    </div>
                                    {profileCompletion === 100 ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <div className="w-4 h-4 border-2 border-gray-600 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
                            <div className="space-y-3">
                                {!isProfileComplete && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <span className="text-gray-300 text-sm">Complete your profile</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${matchesCount > 0 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                    <span className={`text-sm ${matchesCount > 0 ? 'text-green-300' : 'text-gray-400'}`}>
                                        {matchesCount > 0 ? `Found ${matchesCount} scholarship matches` : 'Search for scholarships'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span className="text-gray-400 text-sm">Submit your first application</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span className="text-gray-400 text-sm">Track application deadlines</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}