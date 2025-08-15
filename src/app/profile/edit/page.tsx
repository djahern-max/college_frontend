'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Save, ArrowLeft, BookOpen, Plus, Trash2, Briefcase, Users } from 'lucide-react';
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
        router.push('/profile');
    };

    const handleArrayInputChange = (field: keyof EditableProfile, value: string) => {
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setProfileData(prev => ({
            ...prev,
            [field]: array
        }));
    };

    // Athletic Positions helpers
    const addAthleticPosition = () => {
        const positions = profileData.athletic_positions || {};
        setProfileData(prev => ({
            ...prev,
            athletic_positions: { ...positions, '': '' }
        }));
    };

    const updateAthleticPosition = (oldSport: string, newSport: string, position: string) => {
        const positions = { ...(profileData.athletic_positions || {}) };
        if (oldSport !== newSport && oldSport in positions) {
            delete positions[oldSport];
        }
        if (newSport.trim() && position.trim()) {
            positions[newSport.trim()] = position.trim();
        }
        setProfileData(prev => ({
            ...prev,
            athletic_positions: positions
        }));
    };

    const removeAthleticPosition = (sport: string) => {
        const positions = { ...(profileData.athletic_positions || {}) };
        delete positions[sport];
        setProfileData(prev => ({
            ...prev,
            athletic_positions: positions
        }));
    };

    // Years Participated helpers
    const addYearsParticipated = () => {
        const years = profileData.years_participated || {};
        setProfileData(prev => ({
            ...prev,
            years_participated: { ...years, '': 1 }
        }));
    };

    const updateYearsParticipated = (oldSport: string, newSport: string, years: number) => {
        const yearsData = { ...(profileData.years_participated || {}) };
        if (oldSport !== newSport && oldSport in yearsData) {
            delete yearsData[oldSport];
        }
        if (newSport.trim() && years > 0) {
            yearsData[newSport.trim()] = years;
        }
        setProfileData(prev => ({
            ...prev,
            years_participated: yearsData
        }));
    };

    const removeYearsParticipated = (sport: string) => {
        const years = { ...(profileData.years_participated || {}) };
        delete years[sport];
        setProfileData(prev => ({
            ...prev,
            years_participated: years
        }));
    };

    // Work Experience helpers
    const addWorkExperience = () => {
        const work = profileData.work_experience || [];
        setProfileData(prev => ({
            ...prev,
            work_experience: [...work, {
                company: '',
                position: '',
                start_date: '',
                end_date: '',
                description: ''
            }]
        }));
    };

    const updateWorkExperience = (index: number, field: string, value: string) => {
        const work = [...(profileData.work_experience || [])];
        work[index] = { ...work[index], [field]: value };
        setProfileData(prev => ({
            ...prev,
            work_experience: work
        }));
    };

    const removeWorkExperience = (index: number) => {
        const work = [...(profileData.work_experience || [])];
        work.splice(index, 1);
        setProfileData(prev => ({
            ...prev,
            work_experience: work
        }));
    };

    // References helpers
    const addReference = () => {
        const refs = profileData.references || [];
        setProfileData(prev => ({
            ...prev,
            references: [...refs, {
                name: '',
                title: '',
                organization: '',
                email: '',
                phone: '',
                relationship: ''
            }]
        }));
    };

    const updateReference = (index: number, field: string, value: string) => {
        const refs = [...(profileData.references || [])];
        refs[index] = { ...refs[index], [field]: value };
        setProfileData(prev => ({
            ...prev,
            references: refs
        }));
    };

    const removeReference = (index: number) => {
        const refs = [...(profileData.references || [])];
        refs.splice(index, 1);
        setProfileData(prev => ({
            ...prev,
            references: refs
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

        // Clean up empty objects and arrays
        Object.keys(cleanedData).forEach(key => {
            const value = cleanedData[key as keyof EditableProfile];

            // Handle arrays - remove if empty
            if (Array.isArray(value) && value.length === 0) {
                delete cleanedData[key as keyof EditableProfile];
            }

            // Handle objects - remove if empty
            if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
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
            console.log('Sending data to API:', cleanedData);

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
            console.log('Sending data to API:', cleanedData);

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

                    {/* Athletic Information - REDESIGNED */}
                    <div id="athletics" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6">Athletic Information</h3>

                        <div className="space-y-6">
                            {/* Basic Sports */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Sports Played (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.sports_played?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('sports_played', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Volleyball, Basketball, Track"
                                />
                            </div>

                            {/* Athletic Awards */}
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

                            {/* Team Captain Roles */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Team Captain Roles (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.team_captain?.join(', ') || ''}
                                    onChange={(e) => handleArrayInputChange('team_captain', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Volleyball Senior Year, Track Captain 2024"
                                />
                            </div>

                            {/* Advanced Athletic Details - Structured Forms */}
                            <details className="bg-gray-700/50 rounded-lg">
                                <summary className="cursor-pointer p-4 text-sm font-medium text-gray-300 hover:text-white">
                                    ⬇️ Advanced Athletic Details (Optional)
                                </summary>
                                <div className="p-4 space-y-6 border-t border-gray-600">

                                    {/* Athletic Positions */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-medium text-gray-300">
                                                Athletic Positions
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addAthleticPosition}
                                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                                            >
                                                <Plus size={12} />
                                                Add Position
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(profileData.athletic_positions || {}).map(([sport, position], index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={sport}
                                                        onChange={(e) => updateAthleticPosition(sport, e.target.value, position)}
                                                        placeholder="Sport"
                                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={position}
                                                        onChange={(e) => updateAthleticPosition(sport, sport, e.target.value)}
                                                        placeholder="Position"
                                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAthleticPosition(sport)}
                                                        className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-xs"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {Object.keys(profileData.athletic_positions || {}).length === 0 && (
                                                <p className="text-sm text-gray-400 italic">No athletic positions added yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Years Participated */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-medium text-gray-300">
                                                Years Participated
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addYearsParticipated}
                                                className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                                            >
                                                <Plus size={12} />
                                                Add Years
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(profileData.years_participated || {}).map(([sport, years], index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={sport}
                                                        onChange={(e) => updateYearsParticipated(sport, e.target.value, Number(years))}
                                                        placeholder="Sport"
                                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={years}
                                                        onChange={(e) => updateYearsParticipated(sport, sport, parseInt(e.target.value) || 0)}
                                                        placeholder="Years"
                                                        min="1"
                                                        max="10"
                                                        className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeYearsParticipated(sport)}
                                                        className="px-2 py-2 bg-red-600 hover:bg-red-700 rounded text-xs"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            {Object.keys(profileData.years_participated || {}).length === 0 && (
                                                <p className="text-sm text-gray-400 italic">No years participated added yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </details>
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

                    {/* Work Experience - REDESIGNED */}
                    <div id="work" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-indigo-400" />
                            Work Experience
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">Add your work experience and jobs</p>
                                <button
                                    type="button"
                                    onClick={addWorkExperience}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                >
                                    <Plus size={16} />
                                    Add Work Experience
                                </button>
                            </div>

                            {(profileData.work_experience || []).map((work, index) => (
                                <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-300">Work Experience #{index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeWorkExperience(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Company</label>
                                            <input
                                                type="text"
                                                value={work.company || ''}
                                                onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                                                placeholder="Company name"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Position</label>
                                            <input
                                                type="text"
                                                value={work.position || ''}
                                                onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                                                placeholder="Job title"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                                            <input
                                                type="month"
                                                value={work.start_date || ''}
                                                onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">End Date</label>
                                            <input
                                                type="month"
                                                value={work.end_date || ''}
                                                onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-400 mb-1">Description</label>
                                            <textarea
                                                value={work.description || ''}
                                                onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                                                placeholder="Describe your responsibilities and achievements"
                                                rows={2}
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(profileData.work_experience || []).length === 0 && (
                                <p className="text-gray-400 italic text-center py-8">No work experience added yet. Click "Add Work Experience" to get started.</p>
                            )}
                        </div>
                    </div>

                    {/* References - REDESIGNED */}
                    <div id="references" className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Users size={20} className="text-purple-400" />
                            References
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">Add teachers, coaches, or mentors who can recommend you</p>
                                <button
                                    type="button"
                                    onClick={addReference}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                >
                                    <Plus size={16} />
                                    Add Reference
                                </button>
                            </div>

                            {(profileData.references || []).map((ref, index) => (
                                <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-300">Reference #{index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeReference(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={ref.name || ''}
                                                onChange={(e) => updateReference(index, 'name', e.target.value)}
                                                placeholder="Full name"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={ref.title || ''}
                                                onChange={(e) => updateReference(index, 'title', e.target.value)}
                                                placeholder="Job title"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Organization</label>
                                            <input
                                                type="text"
                                                value={ref.organization || ''}
                                                onChange={(e) => updateReference(index, 'organization', e.target.value)}
                                                placeholder="School or organization"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={ref.email || ''}
                                                onChange={(e) => updateReference(index, 'email', e.target.value)}
                                                placeholder="Email address"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={ref.phone || ''}
                                                onChange={(e) => updateReference(index, 'phone', e.target.value)}
                                                placeholder="Phone number"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Relationship</label>
                                            <input
                                                type="text"
                                                value={ref.relationship || ''}
                                                onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                                                placeholder="e.g., Math teacher for 2 years"
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(profileData.references || []).length === 0 && (
                                <p className="text-gray-400 italic text-center py-8">No references added yet. Click "Add Reference" to get started.</p>
                            )}
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