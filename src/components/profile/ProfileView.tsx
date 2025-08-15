'use client';

import React, { useState, useEffect } from 'react';
import { User, GraduationCap, Trophy, Heart, Briefcase, Edit, Upload, FileText, Camera, CheckCircle, Calendar, LayoutDashboard } from 'lucide-react';
import { profileAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DocumentsEssaysSection from './DocumentsEssaysSection';

interface ProfileViewData {
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    basic_info: {
        high_school_name?: string;
        graduation_year?: number;
        city?: string;
        state?: string;
        phone?: string;
        date_of_birth?: string;
    };
    academics: {
        gpa?: number;
        sat_score?: number;
        act_score?: number;
        honors_courses: string[];
        academic_awards: string[];
    };
    athletics: {
        sports_played: string[];
        athletic_awards: string[];
    };
    community: {
        volunteer_organizations: string[];
        volunteer_hours?: number;
    };
    activities: {
        extracurricular_activities: string[];
        intended_major?: string;
        career_goals?: string;
    };
    completion: {
        profile_completed: boolean;
        completion_percentage: number;
        created_at?: string;
        updated_at?: string;
    };
    uploads: {
        profile_photo_url?: string;
        personal_statement?: string;
        career_essay?: string;
        athletic_impact_essay?: string;
    };
}

const ProfileView: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [profileData, setProfileData] = useState<ProfileViewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await profileAPI.getProfileView();
                setProfileData(data);
            } catch (err) {
                setError('Failed to load profile');
                console.error('Error loading profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Photo upload started');
        const file = event.target.files?.[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        console.log('File selected:', file.name, file.type, file.size);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('File is too large. Please select an image under 5MB.');
            return;
        }

        try {
            setIsUploadingPhoto(true);
            console.log('Uploading photo...');
            const result = await profileAPI.uploadProfilePhoto(file);
            console.log('Upload result:', result);

            // Update the profile data with the new photo URL
            if (profileData) {
                setProfileData({
                    ...profileData,
                    uploads: {
                        ...profileData.uploads,
                        profile_photo_url: result.photo_url
                    }
                });
            }

            alert('Photo uploaded successfully!');
        } catch (error) {
            console.error('Photo upload failed:', error);
            alert(`Failed to upload photo: ${error}`);
        } finally {
            setIsUploadingPhoto(false);
            // Clear the input
            event.target.value = '';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading profile...</div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-red-400">{error || 'Profile not found'}</div>
            </div>
        );
    }

    // Calculate imageUrl after we know profileData exists
    const imageUrl = getImageUrl(profileData.uploads?.profile_photo_url);

    const sections = [
        {
            id: 'basic',
            title: 'Basic Information',
            icon: User,
            color: 'blue',
            data: profileData.basic_info,
            isEmpty: !Object.values(profileData.basic_info).some(v => v),
            editLink: '/profile/edit#basic'
        },
        {
            id: 'academics',
            title: 'Academic Information',
            icon: GraduationCap,
            color: 'green',
            data: profileData.academics,
            isEmpty: !profileData.academics.gpa && !profileData.academics.sat_score &&
                profileData.academics.honors_courses.length === 0,
            editLink: '/profile/edit#academics'
        },
        {
            id: 'athletics',
            title: 'Sports & Athletics',
            icon: Trophy,
            color: 'orange',
            data: profileData.athletics,
            isEmpty: profileData.athletics.sports_played.length === 0 &&
                profileData.athletics.athletic_awards.length === 0,
            editLink: '/profile/edit#athletics'
        },
        {
            id: 'community',
            title: 'Community Service',
            icon: Heart,
            color: 'pink',
            data: profileData.community,
            isEmpty: profileData.community.volunteer_organizations.length === 0 &&
                !profileData.community.volunteer_hours,
            editLink: '/profile/edit#community'
        },
        {
            id: 'activities',
            title: 'Activities & Future Plans',
            icon: Briefcase,
            color: 'purple',
            data: profileData.activities,
            isEmpty: profileData.activities.extracurricular_activities.length === 0 &&
                !profileData.activities.intended_major,
            editLink: '/profile/edit#activities'
        }
    ];

    const renderSectionContent = (section: any) => {
        if (section.isEmpty) {
            return (
                <div className="text-gray-500 italic py-4">
                    No information added yet
                </div>
            );
        }

        switch (section.id) {
            case 'basic':
                return (
                    <div className="space-y-3">
                        {profileData!.basic_info.high_school_name && (
                            <div>
                                <span className="text-gray-400">High School: </span>
                                <span>{profileData!.basic_info.high_school_name}</span>
                            </div>
                        )}
                        {profileData!.basic_info.graduation_year && (
                            <div>
                                <span className="text-gray-400">Graduation Year: </span>
                                <span>{profileData!.basic_info.graduation_year}</span>
                            </div>
                        )}
                        {(profileData!.basic_info.city || profileData!.basic_info.state) && (
                            <div>
                                <span className="text-gray-400">Location: </span>
                                <span>
                                    {profileData!.basic_info.city}
                                    {profileData!.basic_info.city && profileData!.basic_info.state && ', '}
                                    {profileData!.basic_info.state}
                                </span>
                            </div>
                        )}
                        {profileData!.basic_info.phone && (
                            <div>
                                <span className="text-gray-400">Phone: </span>
                                <span>{profileData!.basic_info.phone}</span>
                            </div>
                        )}
                    </div>
                );

            case 'academics':
                return (
                    <div className="space-y-3">
                        {profileData!.academics.gpa && (
                            <div>
                                <span className="text-gray-400">GPA: </span>
                                <span className="font-semibold">{profileData!.academics.gpa}</span>
                            </div>
                        )}
                        {profileData!.academics.sat_score && (
                            <div>
                                <span className="text-gray-400">SAT Score: </span>
                                <span className="font-semibold">{profileData!.academics.sat_score}</span>
                            </div>
                        )}
                        {profileData!.academics.act_score && (
                            <div>
                                <span className="text-gray-400">ACT Score: </span>
                                <span className="font-semibold">{profileData!.academics.act_score}</span>
                            </div>
                        )}
                        {profileData!.academics.honors_courses.length > 0 && (
                            <div>
                                <span className="text-gray-400 block mb-2">Honors Courses:</span>
                                <div className="flex flex-wrap gap-2">
                                    {profileData!.academics.honors_courses.map((course, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-sm">
                                            {course}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {profileData!.academics.academic_awards.length > 0 && (
                            <div>
                                <span className="text-gray-400 block mb-2">Academic Awards:</span>
                                <div className="flex flex-wrap gap-2">
                                    {profileData!.academics.academic_awards.map((award, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-sm">
                                            {award}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'athletics':
                return (
                    <div className="space-y-3">
                        {profileData!.athletics.sports_played.length > 0 && (
                            <div>
                                <span className="text-gray-400 block mb-2">Sports:</span>
                                <div className="flex flex-wrap gap-2">
                                    {profileData!.athletics.sports_played.map((sport, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-orange-600/20 text-orange-300 rounded text-sm">
                                            {sport}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {profileData!.athletics.athletic_awards.length > 0 && (
                            <div>
                                <span className="text-gray-400 block mb-2">Athletic Awards:</span>
                                <div className="flex flex-wrap gap-2">
                                    {profileData!.athletics.athletic_awards.map((award, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-orange-600/20 text-orange-300 rounded text-sm">
                                            {award}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'community':
                return (
                    <div className="space-y-3">
                        {profileData!.community.volunteer_hours && (
                            <div>
                                <span className="text-gray-400">Volunteer Hours: </span>
                                <span className="font-semibold">{profileData!.community.volunteer_hours}</span>
                            </div>
                        )}
                        {profileData!.community.volunteer_organizations.length > 0 && (
                            <div>
                                <span className="text-gray-400 block mb-2">Organizations:</span>
                                <div className="flex flex-wrap gap-2">
                                    {profileData!.community.volunteer_organizations.map((org, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-pink-600/20 text-pink-300 rounded text-sm">
                                            {org}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'activities':
                return (
                    <div className="space-y-3">
                        {profileData!.activities.intended_major && (
                            <div>
                                <span className="text-gray-400">Intended Major: </span>
                                <span className="font-semibold">{profileData!.activities.intended_major}</span>
                            </div>
                        )}
                        {profileData!.activities.career_goals && (
                            <div>
                                <span className="text-gray-400 block mb-1">Career Goals:</span>
                                <p className="text-gray-300">{profileData!.activities.career_goals}</p>
                            </div>
                        )}
                        {profileData!.activities.extracurricular_activities.length > 0 && (
                            <div>
                                <span className="text-gray-400 block mb-2">Activities:</span>
                                <div className="flex flex-wrap gap-2">
                                    {profileData!.activities.extracurricular_activities.map((activity, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-sm">
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="Profile photo"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Profile photo failed to load:', imageUrl);
                                        }}
                                    />
                                ) : (
                                    <User size={32} className="text-white/70" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {profileData.user.first_name} {profileData.user.last_name}
                                </h1>
                                <p className="text-blue-200">{profileData.user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-green-300">
                                        Profile {profileData.completion.completion_percentage}% Complete
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {/* Dashboard Link - Only visible when authenticated */}
                            {isAuthenticated && (
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </button>
                            )}

                            <label className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors cursor-pointer">
                                <Camera size={16} />
                                {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePhotoUpload}
                                    disabled={isUploadingPhoto}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button
                                onClick={() => router.push('/profile/edit')}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Edit size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Profile Sections */}
                    <div className="lg:col-span-2 space-y-6">
                        {sections.map((section) => {
                            const SectionIcon = section.icon;

                            return (
                                <div key={section.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 bg-${section.color}-600/20 rounded-lg`}>
                                                <SectionIcon size={20} className={`text-${section.color}-400`} />
                                            </div>
                                            <h3 className="text-xl font-semibold">{section.title}</h3>
                                        </div>
                                        <button
                                            onClick={() => router.push(section.editLink)}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>

                                    {renderSectionContent(section)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Documents & Essays Section */}
                        <DocumentsEssaysSection
                            uploads={profileData.uploads}
                            onUploadSuccess={async () => {
                                try {
                                    const data = await profileAPI.getProfileView();
                                    setProfileData(data);
                                } catch (err) {
                                    console.error('Error refreshing profile:', err);
                                }
                            }}
                            disabled={isLoading}
                        />

                        {/* Profile Stats */}
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Profile Statistics</h3>
                            <div className="space-y-4">
                                <div>
                                    <span>Completion</span>
                                    <span>{profileData.completion.completion_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${profileData.completion.completion_percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                    {sections.filter(s => !s.isEmpty).length}
                                </div>
                                <div className="text-xs text-gray-400">Sections Complete</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">
                                    {Object.values(profileData.uploads).filter(Boolean).length}
                                </div>
                                <div className="text-xs text-gray-400">Documents Uploaded</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>

                    <div className="space-y-3">
                        {/* Dashboard Button - Only visible when authenticated */}
                        {isAuthenticated && (
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full flex items-center gap-3 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                            >
                                <LayoutDashboard size={16} />
                                Go to Dashboard
                            </button>
                        )}

                        <button
                            onClick={() => router.push('/profile/edit')}
                            className="w-full flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <Edit size={16} />
                            Edit Profile Builder
                        </button>

                        <button className="w-full flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                            <FileText size={16} />
                            View Scholarship Matches
                        </button>

                        <button className="w-full flex items-center gap-3 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                            <Upload size={16} />
                            Export Profile PDF
                        </button>
                    </div>
                </div>

                {/* Profile Timeline */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        Timeline
                    </h3>

                    <div className="space-y-3 text-sm">
                        {profileData.completion.created_at && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <div>Profile created</div>
                                    <div className="text-gray-400">
                                        {new Date(profileData.completion.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {profileData.completion.updated_at && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <div>Last updated</div>
                                    <div className="text-gray-400">
                                        {new Date(profileData.completion.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {profileData.completion.profile_completed && (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div>
                                    <div>Profile completed</div>
                                    <div className="text-gray-400">Ready for applications</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>


    );
};

export default ProfileView;