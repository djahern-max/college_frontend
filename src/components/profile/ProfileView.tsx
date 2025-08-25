// ProfileView Component - Displays completed profile information
import React, { useState, useEffect } from 'react';
import {
    Edit,
    User,
    GraduationCap,
    Target,
    Users,
    FileText,
    Settings,
    MapPin,
    Calendar,
    Phone,
    Mail,
    Award,
    BookOpen,
    Heart,
    Globe,
    TrendingUp,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface ProfileData {
    // Basic Information
    date_of_birth?: string;
    phone_number?: string;
    high_school_name?: string;
    graduation_year?: number;
    gpa?: number;
    state?: string;
    city?: string;
    zip_code?: string;

    // Academic Information
    sat_score?: number;
    act_score?: number;
    intended_major?: string;
    academic_interests?: string[];
    career_goals?: string[];

    // Activities & Experience
    extracurricular_activities?: string[];
    volunteer_experience?: string[];
    volunteer_hours?: number;
    special_talents?: string[];
    languages_preferred?: string[];

    // Background & Demographics
    ethnicity?: string[];
    first_generation_college?: boolean;
    household_income_range?: string;

    // Essays & Statements
    personal_statement?: string;
    leadership_essay?: string;
    community_service_essay?: string;

    // Preferences
    scholarship_types_interested?: string[];
    college_size_preference?: string[];
    college_location_preference?: string[];
}

interface CompletionStatus {
    section_name: string;
    is_completed: boolean;
    completion_percentage: number;
    required_fields: string[];
    completed_fields: string[];
    missing_fields: string[];
}

interface ProfileViewProps {
    editable?: boolean;
    onEdit?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ editable = true, onEdit }) => {
    const [profileData, setProfileData] = useState<ProfileData>({});
    const [completionStatus, setCompletionStatus] = useState<Record<string, CompletionStatus>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    setError('Please log in to view your profile');
                    return;
                }

                // Load profile data
                const profileResponse = await fetch('/api/v1/profiles/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (profileResponse.ok) {
                    const profile = await profileResponse.json();
                    setProfileData(profile);
                }

                // Load completion status
                const statusResponse = await fetch('/api/v1/profiles/sections', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (statusResponse.ok) {
                    const status = await statusResponse.json();
                    setCompletionStatus(status);
                }

            } catch (err) {
                setError('Failed to load profile data');
                console.error('Profile loading error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, []);

    const formatTestScore = (score: number | undefined, maxScore: number, testName: string) => {
        if (!score) return null;
        const percentage = Math.round((score / maxScore) * 100);
        return `${score}/${maxScore} (${percentage}th percentile)`;
    };

    const formatList = (items: string[] | undefined, emptyText: string = 'None specified') => {
        if (!items || items.length === 0) return emptyText;
        return items.join(', ');
    };

    const calculateOverallCompletion = () => {
        const sections = Object.values(completionStatus);
        if (sections.length === 0) return 0;

        const totalPercentage = sections.reduce((sum, section) => sum + section.completion_percentage, 0);
        return Math.round(totalPercentage / sections.length);
    };

    const getSectionIcon = (sectionId: string) => {
        switch (sectionId) {
            case 'basic_info': return User;
            case 'academic_info': return GraduationCap;
            case 'activities_experience': return Target;
            case 'background_demographics': return Users;
            case 'essays_statements': return FileText;
            case 'preferences': return Settings;
            default: return User;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading your profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center">
                <div className="text-red-400 text-xl">{error}</div>
            </div>
        );
    }

    const overallCompletion = calculateOverallCompletion();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
                            <p className="text-gray-300">Manage your information for scholarship matching</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">{overallCompletion}%</div>
                                <div className="text-sm text-gray-400">Complete</div>
                            </div>

                            {editable && (
                                <button
                                    onClick={onEdit}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Edit size={20} />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Completion Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {Object.entries(completionStatus).map(([sectionId, status]) => {
                        const Icon = getSectionIcon(sectionId);
                        return (
                            <div
                                key={sectionId}
                                className={`p-4 rounded-lg border ${status.is_completed
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-yellow-500/10 border-yellow-500/30'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon size={16} />
                                    {status.is_completed ? (
                                        <CheckCircle size={16} className="text-green-400" />
                                    ) : (
                                        <AlertCircle size={16} className="text-yellow-400" />
                                    )}
                                </div>
                                <div className="text-sm font-medium mb-1">{status.section_name}</div>
                                <div className="text-xs text-gray-400">
                                    {Math.round(status.completion_percentage)}% complete
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Profile Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Information */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-semibold">Basic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-400 w-24">Born:</span>
                                <span>{profileData.date_of_birth || 'Not specified'}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-400 w-24">Phone:</span>
                                <span>{profileData.phone_number || 'Not specified'}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <GraduationCap size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-400 w-24">High School:</span>
                                <span>{profileData.high_school_name || 'Not specified'}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-400 w-24">Graduation:</span>
                                <span>{profileData.graduation_year || 'Not specified'}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Award size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-400 w-24">GPA:</span>
                                <span className={profileData.gpa ? 'font-semibold text-green-400' : ''}>
                                    {profileData.gpa ? `${profileData.gpa}/4.0` : 'Not specified'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-400 w-24">Location:</span>
                                <span>
                                    {[profileData.city, profileData.state, profileData.zip_code]
                                        .filter(Boolean)
                                        .join(', ') || 'Not specified'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <BookOpen className="w-6 h-6 text-green-400" />
                            <h2 className="text-xl font-semibold">Academic Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Test Scores:</span>
                                <div className="space-y-1">
                                    {profileData.sat_score && (
                                        <div className="text-sm">
                                            SAT: <span className="font-semibold text-blue-400">
                                                {formatTestScore(profileData.sat_score, 1600, 'SAT')}
                                            </span>
                                        </div>
                                    )}
                                    {profileData.act_score && (
                                        <div className="text-sm">
                                            ACT: <span className="font-semibold text-blue-400">
                                                {formatTestScore(profileData.act_score, 36, 'ACT')}
                                            </span>
                                        </div>
                                    )}
                                    {!profileData.sat_score && !profileData.act_score && (
                                        <span className="text-gray-400">Not specified</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Intended Major:</span>
                                <span className="font-semibold text-purple-400">
                                    {profileData.intended_major || 'Not specified'}
                                </span>
                            </div>

                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Academic Interests:</span>
                                <span>{formatList(profileData.academic_interests)}</span>
                            </div>

                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Career Goals:</span>
                                <span>{formatList(profileData.career_goals)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activities & Experience */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-6 h-6 text-orange-400" />
                            <h2 className="text-xl font-semibold">Activities & Experience</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Extracurricular Activities:</span>
                                <span>{formatList(profileData.extracurricular_activities)}</span>
                            </div>

                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Volunteer Experience:</span>
                                <span>{formatList(profileData.volunteer_experience)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Heart size={16} className="text-red-400" />
                                <span className="text-sm text-gray-400">Volunteer Hours:</span>
                                <span className="font-semibold text-red-400">
                                    {profileData.volunteer_hours || 'Not specified'}
                                </span>
                            </div>

                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Special Talents:</span>
                                <span>{formatList(profileData.special_talents)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Globe size={16} className="text-blue-400" />
                                <span className="text-sm text-gray-400">Languages:</span>
                                <span>{formatList(profileData.languages_preferred)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Background & Demographics */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-6 h-6 text-purple-400" />
                            <h2 className="text-xl font-semibold">Background & Demographics</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Ethnicity:</span>
                                <span>{formatList(profileData.ethnicity, 'Prefer not to say')}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <TrendingUp size={16} className="text-green-400" />
                                <span className="text-sm text-gray-400">First Generation College:</span>
                                <span className={profileData.first_generation_college ? 'text-green-400 font-semibold' : ''}>
                                    {profileData.first_generation_college === true ? 'Yes' :
                                        profileData.first_generation_college === false ? 'No' : 'Not specified'}
                                </span>
                            </div>

                            <div>
                                <span className="text-sm text-gray-400 block mb-1">Household Income Range:</span>
                                <span>{profileData.household_income_range || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Essays & Statements */}
                {(profileData.personal_statement || profileData.leadership_essay || profileData.community_service_essay) && (
                    <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-xl font-semibold">Essays & Statements</h2>
                        </div>

                        <div className="space-y-6">
                            {profileData.personal_statement && (
                                <div>
                                    <h3 className="font-semibold text-yellow-300 mb-2">Personal Statement</h3>
                                    <div className="bg-gray-700/50 rounded-lg p-4 text-sm leading-relaxed">
                                        {profileData.personal_statement}
                                    </div>
                                </div>
                            )}

                            {profileData.leadership_essay && (
                                <div>
                                    <h3 className="font-semibold text-yellow-300 mb-2">Leadership Experience</h3>
                                    <div className="bg-gray-700/50 rounded-lg p-4 text-sm leading-relaxed">
                                        {profileData.leadership_essay}
                                    </div>
                                </div>
                            )}

                            {profileData.community_service_essay && (
                                <div>
                                    <h3 className="font-semibold text-yellow-300 mb-2">Community Service</h3>
                                    <div className="bg-gray-700/50 rounded-lg p-4 text-sm leading-relaxed">
                                        {profileData.community_service_essay}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Preferences */}
                <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-6 h-6 text-gray-400" />
                        <h2 className="text-xl font-semibold">Scholarship Preferences</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <span className="text-sm text-gray-400 block mb-2">Scholarship Types Interested:</span>
                            <div className="flex flex-wrap gap-2">
                                {profileData.scholarship_types_interested?.map((type) => (
                                    <span key={type} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
                                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </span>
                                )) || <span className="text-gray-400">Not specified</span>}
                            </div>
                        </div>

                        <div>
                            <span className="text-sm text-gray-400 block mb-2">College Size Preference:</span>
                            <span>{formatList(profileData.college_size_preference)}</span>
                        </div>

                        <div>
                            <span className="text-sm text-gray-400 block mb-2">College Location Preference:</span>
                            <span>{formatList(profileData.college_location_preference)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-center gap-4">
                    {editable && (
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Edit size={20} />
                            Edit Profile
                        </button>
                    )}

                    <button
                        onClick={() => window.location.href = '/scholarships'}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Award size={20} />
                        Find Scholarships
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;