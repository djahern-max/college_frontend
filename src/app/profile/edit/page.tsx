'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Save, ArrowLeft, Upload, BookOpen } from 'lucide-react';
import { profileAPI, UserProfile } from '@/lib/api';


interface EditableProfile extends Partial<UserProfile> {
    // This interface now extends UserProfile, so it includes all the same fields
    // but makes them all optional for editing purposes
}

const EditProfilePage: React.FC = () => {
    const router = useRouter();
    const [profileData, setProfileData] = useState<EditableProfile>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isInitialSetup, setIsInitialSetup] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await profileAPI.getMyProfile();
                if (data) {
                    setProfileData(data);
                    // Check if this is initial setup (profile exists but is mostly empty)
                    const hasBasicInfo = data.high_school_name || data.graduation_year || data.gpa;
                    setIsInitialSetup(!hasBasicInfo);
                } else {
                    // No profile exists yet, definitely initial setup
                    setIsInitialSetup(true);
                }
            } catch (err) {
                setError('Failed to load profile');
                console.error('Error loading profile:', err);
                // If profile doesn't exist, it's initial setup
                setIsInitialSetup(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();

        // Handle section navigation from URL hash
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Add a subtle highlight effect
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
                    }, 2000);
                }
            }, 100);
        }
    }, []);

    const handleInputChange = (field: keyof EditableProfile, value: any) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBackNavigation = () => {
        // Always go back to the profile builder/interview mode
        router.push('/profile');
    };

    const handleArrayInputChange = (field: keyof EditableProfile, value: string) => {
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setProfileData(prev => ({
            ...prev,
            [field]: array
        }));
    };

    // Clean and prepare data for API
    const prepareDataForAPI = (data: EditableProfile) => {
        const cleanedData = { ...data };

        // Remove read-only fields that the API doesn't accept
        const readOnlyFields = [
            'id',
            'user_id',
            'created_at',
            'updated_at',
            'profile_completed',
            'completion_percentage'
        ];

        readOnlyFields.forEach(field => {
            delete cleanedData[field as keyof EditableProfile];
        });

        // Remove empty arrays and convert to undefined if empty
        Object.keys(cleanedData).forEach(key => {
            const value = cleanedData[key as keyof EditableProfile];

            // Handle arrays - remove if empty
            if (Array.isArray(value) && value.length === 0) {
                delete cleanedData[key as keyof EditableProfile];
            }

            // Handle empty strings - convert to undefined
            if (value === '') {
                cleanedData[key as keyof EditableProfile] = undefined;
            }

            // Handle numeric fields that might be NaN
            if (key === 'graduation_year' || key === 'gpa' || key === 'sat_score' ||
                key === 'act_score' || key === 'class_rank' || key === 'class_size' ||
                key === 'volunteer_hours') {
                if (isNaN(Number(value)) || value === '') {
                    delete cleanedData[key as keyof EditableProfile];
                }
            }
        });

        return cleanedData;
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);

            const cleanedData = prepareDataForAPI(profileData);
            console.log('Sending data to API:', cleanedData); // Debug log

            await profileAPI.updateProfile(cleanedData);
            setSuccessMessage('Profile updated successfully!');

            // Auto-hide success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error('Error saving profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndReturn = async () => {
        try {
            setIsSaving(true);
            setError(null);

            const cleanedData = prepareDataForAPI(profileData);
            console.log('Sending data to API:', cleanedData); // Debug log

            await profileAPI.updateProfile(cleanedData);

            // Navigate to profile view (not the builder)
            router.push('/profile/view');

        } catch (err) {
            setError('Failed to save profile. Please try again.');
            console.error('Error saving profile:', err);
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackNavigation}
                                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={16} />
                                {isInitialSetup ? 'Back to Setup' : 'Interview Mode'}
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg transition-colors"
                            >
                                <Save size={16} />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleSaveAndReturn}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors"
                            >
                                <Save size={16} />
                                Save & Return
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className="bg-green-600 text-white p-3 text-center">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-600 text-white p-3 text-center">
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-6">
                <div className="space-y-8">

                    {/* Basic Information */}
                    <div id="basic" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <User size={20} className="text-blue-400" />
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    value={profileData.middle_name || ''}
                                    onChange={(e) => handleInputChange('middle_name', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter middle name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={profileData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={profileData.date_of_birth || ''}
                                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Profile Visibility
                                </label>
                                <select
                                    value={profileData.profile_visibility || 'private'}
                                    onChange={(e) => handleInputChange('profile_visibility', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="private">Private</option>
                                    <option value="public">Public</option>
                                    <option value="friends">Friends Only</option>
                                    <option value="scholarship_only">Scholarship Matching Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={profileData.allow_scholarship_matching ?? true}
                                    onChange={(e) => handleInputChange('allow_scholarship_matching', e.target.checked)}
                                    className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-300">Allow scholarship matching</span>
                            </label>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div id="address" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6">Address Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    value={profileData.street_address || ''}
                                    onChange={(e) => handleInputChange('street_address', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter street address"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={profileData.city || ''}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter city"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={profileData.state || ''}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter state"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    ZIP Code
                                </label>
                                <input
                                    type="text"
                                    value={profileData.zip_code || ''}
                                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter ZIP code"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={profileData.country || 'United States'}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter country"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div id="academics" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-green-400" />
                            Academic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    High School Name
                                </label>
                                <input
                                    type="text"
                                    value={profileData.high_school_name || ''}
                                    onChange={(e) => handleInputChange('high_school_name', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter high school name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Graduation Year
                                </label>
                                <input
                                    type="number"
                                    value={profileData.graduation_year || ''}
                                    onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value) || undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter graduation year"
                                    min="2020"
                                    max="2030"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    GPA
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={profileData.gpa || ''}
                                    onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value) || undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter GPA"
                                    min="0"
                                    max="4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    SAT Score
                                </label>
                                <input
                                    type="number"
                                    value={profileData.sat_score || ''}
                                    onChange={(e) => handleInputChange('sat_score', parseInt(e.target.value) || undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter SAT score"
                                    min="400"
                                    max="1600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    ACT Score
                                </label>
                                <input
                                    type="number"
                                    value={profileData.act_score || ''}
                                    onChange={(e) => handleInputChange('act_score', parseInt(e.target.value) || undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter ACT score"
                                    min="1"
                                    max="36"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Class Rank
                                </label>
                                <input
                                    type="number"
                                    value={profileData.class_rank || ''}
                                    onChange={(e) => handleInputChange('class_rank', parseInt(e.target.value) || undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter class rank"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Class Size
                                </label>
                                <input
                                    type="number"
                                    value={profileData.class_size || ''}
                                    onChange={(e) => handleInputChange('class_size', parseInt(e.target.value) || undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter total class size"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Honors Courses (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.honors_courses?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('honors_courses', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., AP Math, Honors English, AP Science"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Academic Awards (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.academic_awards?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('academic_awards', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Honor Roll, National Merit Scholar"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Athletic Information */}
                    <div id="athletics" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6">Athletic Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Sports Played (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.sports_played?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('sports_played', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Basketball, Soccer, Track"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Athletic Awards (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.athletic_awards?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('athletic_awards', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., MVP, All-State, Team Captain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Activities & Future Plans */}
                    <div id="activities" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6">Activities & Future Plans</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Volunteer Hours
                                </label>
                                <input
                                    type="number"
                                    value={profileData.volunteer_hours || ''}
                                    onChange={(e) => handleInputChange('volunteer_hours', parseInt(e.target.value) || undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Total volunteer hours"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Volunteer Organizations (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.volunteer_organizations?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('volunteer_organizations', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Red Cross, Local Food Bank"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Extracurricular Activities (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.extracurricular_activities?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('extracurricular_activities', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Student Council, Drama Club, Debate Team"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Leadership Positions (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.leadership_positions?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('leadership_positions', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Class President, Club Captain"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Intended Major
                                </label>
                                <input
                                    type="text"
                                    value={profileData.intended_major || ''}
                                    onChange={(e) => handleInputChange('intended_major', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter intended major"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    College Preferences (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.college_preferences?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('college_preferences', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Harvard, MIT, Stanford"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Career Goals
                                </label>
                                <textarea
                                    value={profileData.career_goals || ''}
                                    onChange={(e) => handleInputChange('career_goals', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Describe your career goals and aspirations"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            onClick={() => router.push('/profile/view')}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded-lg transition-colors"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;