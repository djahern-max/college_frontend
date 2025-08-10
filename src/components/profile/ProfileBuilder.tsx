'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, User, GraduationCap, Trophy, Heart, Briefcase, Save, SkipForward, HelpCircle, CheckCircle, X } from 'lucide-react';
import { profileAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Types for the profile data structure
interface ProfileData {
    [key: string]: string | number | string[] | { [key: string]: string | number } | undefined;
}

interface QuestionOption {
    value: string | number;
    label: string;
}

interface Question {
    id: string;
    type: 'text' | 'number' | 'select' | 'slider' | 'multi-select' | 'multi-text' | 'date';
    question: string;
    placeholder?: string;
    tip?: string;
    required?: boolean;
    optional?: boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: QuestionOption[];
    dependsOn?: string;
    privacy?: boolean;
}

interface Section {
    id: string;
    title: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    questions: Question[];
}

const ProfileBuilder: React.FC = () => {
    const router = useRouter();
    const [currentSection, setCurrentSection] = useState<number>(0);
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [profileData, setProfileData] = useState<ProfileData>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

    // Define the interview sections and questions based on your DB schema
    const sections: Section[] = [
        {
            id: 'basic',
            title: 'Basic Info',
            icon: User,
            color: 'blue',
            questions: [
                {
                    id: 'high_school_name',
                    type: 'text',
                    question: "Let's start with the basics! What high school do you attend?",
                    placeholder: 'Enter your high school name',
                    tip: "This helps us find local scholarships!",
                    required: true
                },
                {
                    id: 'graduation_year',
                    type: 'select',
                    question: "What year do you graduate?",
                    options: [
                        { value: 2025, label: '2025' },
                        { value: 2026, label: '2026' },
                        { value: 2027, label: '2027' },
                        { value: 2028, label: '2028' },
                        { value: 2029, label: '2029' },
                        { value: 2030, label: '2030' }
                    ],
                    required: true
                },
                {
                    id: 'city',
                    type: 'text',
                    question: "What city do you live in?",
                    placeholder: 'Enter your city',
                    tip: "This helps us find local scholarships in your area!"
                },
                {
                    id: 'state',
                    type: 'text',
                    question: "What state are you in?",
                    placeholder: 'Enter your state',
                    tip: "Many scholarships are state-specific!"
                },
                {
                    id: 'phone',
                    type: 'text',
                    question: "What's your phone number?",
                    placeholder: '(555) 123-4567',
                    optional: true
                },
                {
                    id: 'date_of_birth',
                    type: 'date',
                    question: "What's your date of birth?",
                    optional: true,
                    privacy: true
                }
            ]
        },
        {
            id: 'academic',
            title: 'Academics',
            icon: GraduationCap,
            color: 'green',
            questions: [
                {
                    id: 'gpa',
                    type: 'slider',
                    question: "What's your current GPA?",
                    min: 2.0,
                    max: 4.0,
                    step: 0.1,
                    tip: "Don't worry - you can keep this private! Most students only share GPA with scholarship applications.",
                    privacy: true
                },
                {
                    id: 'sat_score',
                    type: 'number',
                    question: "Have you taken the SAT? If so, what was your score?",
                    placeholder: 'Enter SAT score (400-1600)',
                    min: 400,
                    max: 1600,
                    optional: true,
                    tip: "This is completely optional and can be kept private."
                },
                {
                    id: 'act_score',
                    type: 'number',
                    question: "Have you taken the ACT? If so, what was your score?",
                    placeholder: 'Enter ACT score (1-36)',
                    min: 1,
                    max: 36,
                    optional: true,
                    tip: "This is completely optional and can be kept private."
                },
                {
                    id: 'honors_courses',
                    type: 'multi-text',
                    question: "Are you taking any AP, honors, or advanced courses?",
                    placeholder: 'Add a course (e.g., AP Biology)',
                    tip: "These show academic challenge and can help with scholarships!"
                },
                {
                    id: 'academic_awards',
                    type: 'multi-text',
                    question: "Have you received any academic awards or honors?",
                    placeholder: 'Add an award (e.g., Honor Roll, Academic Excellence)',
                    optional: true
                }
            ]
        },
        {
            id: 'athletics',
            title: 'Sports & Athletics',
            icon: Trophy,
            color: 'orange',
            questions: [
                {
                    id: 'sports_played',
                    type: 'multi-select',
                    question: "Do you play any sports?",
                    options: [
                        { value: 'Volleyball', label: 'Volleyball' },
                        { value: 'Basketball', label: 'Basketball' },
                        { value: 'Soccer', label: 'Soccer' },
                        { value: 'Track & Field', label: 'Track & Field' },
                        { value: 'Cross Country', label: 'Cross Country' },
                        { value: 'Swimming', label: 'Swimming' },
                        { value: 'Tennis', label: 'Tennis' },
                        { value: 'Golf', label: 'Golf' },
                        { value: 'Baseball', label: 'Baseball' },
                        { value: 'Softball', label: 'Softball' },
                        { value: 'Football', label: 'Football' },
                        { value: 'Wrestling', label: 'Wrestling' },
                        { value: 'Gymnastics', label: 'Gymnastics' },
                        { value: 'Lacrosse', label: 'Lacrosse' },
                        { value: 'Field Hockey', label: 'Field Hockey' },
                        { value: 'Other', label: 'Other' }
                    ],
                    tip: "Athletic participation is great for scholarships!"
                },
                {
                    id: 'athletic_awards',
                    type: 'multi-text',
                    question: "Any athletic awards or achievements?",
                    placeholder: 'e.g., All-Conference, Team MVP, State Champions',
                    optional: true,
                    tip: "Include team achievements, individual awards, or special recognitions"
                }
            ]
        },
        {
            id: 'community',
            title: 'Community & Service',
            icon: Heart,
            color: 'pink',
            questions: [
                {
                    id: 'volunteer_organizations',
                    type: 'multi-text',
                    question: "Do you volunteer anywhere or help out in your community?",
                    placeholder: 'e.g., Local food bank, animal shelter',
                    tip: "Community service is great for scholarship applications!"
                },
                {
                    id: 'volunteer_hours',
                    type: 'number',
                    question: "About how many volunteer hours do you have total?",
                    placeholder: 'Approximate total hours',
                    optional: true,
                    tip: "Don't worry about being exact - an estimate is fine!"
                }
            ]
        },
        {
            id: 'activities',
            title: 'Activities & Future',
            icon: Briefcase,
            color: 'purple',
            questions: [
                {
                    id: 'extracurricular_activities',
                    type: 'multi-text',
                    question: "What clubs, activities, or hobbies are you involved in?",
                    placeholder: 'e.g., Drama Club, Debate Team, Music',
                    tip: "Scholarship committees love well-rounded students!"
                },
                {
                    id: 'intended_major',
                    type: 'text',
                    question: "What do you plan to study in college?",
                    placeholder: 'e.g., Computer Science, Pre-Med, Business',
                    tip: "Many scholarships are major-specific!"
                },
                {
                    id: 'career_goals',
                    type: 'text',
                    question: "What are your career goals or dream job?",
                    placeholder: 'Describe your future aspirations...',
                    optional: true,
                    tip: "This helps match you with career-focused scholarships!"
                }
            ]
        }
    ];

    // Load existing profile data on component mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);

                // Try to load from localStorage first (temporary fallback)
                const savedData = localStorage.getItem('profileData');
                if (savedData) {
                    setProfileData(JSON.parse(savedData));
                    setIsInitialLoad(false);
                    setIsLoading(false);
                    return;
                }

                // Try API call
                const profile = await profileAPI.getMyProfile();
                if (profile) {
                    // Extract only the fields we need for the form
                    const formData: ProfileData = {
                        high_school_name: profile.high_school_name || '',
                        graduation_year: profile.graduation_year || '',
                        city: profile.city || '',
                        state: profile.state || '',
                        phone: profile.phone || '',
                        date_of_birth: profile.date_of_birth || '',
                        gpa: profile.gpa || '',
                        sat_score: profile.sat_score || '',
                        act_score: profile.act_score || '',
                        honors_courses: profile.honors_courses || [],
                        academic_awards: profile.academic_awards || [],
                        sports_played: profile.sports_played || [],
                        athletic_awards: profile.athletic_awards || [],
                        volunteer_organizations: profile.volunteer_organizations || [],
                        volunteer_hours: profile.volunteer_hours || '',
                        extracurricular_activities: profile.extracurricular_activities || [],
                        intended_major: profile.intended_major || '',
                        career_goals: profile.career_goals || '',
                    };
                    setProfileData(formData);
                }
            } catch (error) {
                console.log('API not available, working in offline mode');
            } finally {
                setIsLoading(false);
                setIsInitialLoad(false);
            }
        };

        loadProfile();
    }, []);

    // Auto-save functionality
    useEffect(() => {
        if (isInitialLoad || Object.keys(profileData).length === 0) return;

        const autoSave = async () => {
            setIsLoading(true);
            setSaveError(null);

            try {
                // Clean and format data before sending to API
                const cleanedData = Object.entries(profileData).reduce((acc, [key, value]) => {
                    // Skip empty values
                    if (value === '' || value === null || value === undefined) {
                        return acc;
                    }

                    // Handle arrays - only include if not empty
                    if (Array.isArray(value)) {
                        const filteredArray = value.filter(item => item !== '' && item !== null && item !== undefined);
                        if (filteredArray.length > 0) {
                            acc[key] = filteredArray;
                        }
                        return acc;
                    }

                    // Handle numeric fields
                    if (['graduation_year', 'sat_score', 'act_score', 'volunteer_hours'].includes(key)) {
                        const numValue = Number(value);
                        if (!isNaN(numValue)) {
                            acc[key] = numValue;
                        }
                        return acc;
                    }

                    // Handle GPA (decimal)
                    if (key === 'gpa') {
                        const gpaValue = parseFloat(value as string);
                        if (!isNaN(gpaValue)) {
                            acc[key] = gpaValue;
                        }
                        return acc;
                    }

                    // Handle date fields
                    if (key === 'date_of_birth') {
                        // Ensure date is in YYYY-MM-DD format
                        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            acc[key] = value;
                        }
                        return acc;
                    }

                    // Handle string fields - only include if not empty
                    if (typeof value === 'string' && value.trim() !== '') {
                        acc[key] = value.trim();
                    }

                    return acc;
                }, {} as any);

                // Try API save first
                await profileAPI.updateProfile(cleanedData);
                setLastSaved(new Date());
            } catch (error) {
                console.log('API not available, saving locally');
                // Fallback to localStorage
                localStorage.setItem('profileData', JSON.stringify(profileData));
                setLastSaved(new Date());
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(autoSave, 2000);
        return () => clearTimeout(timeoutId);
    }, [profileData, isInitialLoad]);

    const currentSectionData = sections[currentSection];
    const currentQuestionData = currentSectionData.questions[currentQuestion];
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
    const completedQuestions = sections.slice(0, currentSection).reduce((sum, section) => sum + section.questions.length, 0) + currentQuestion;
    const progressPercentage = Math.round((completedQuestions / totalQuestions) * 100);

    const updateProfileData = (key: string, value: string | number | string[]): void => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    const nextQuestion = (): void => {
        if (currentQuestion < currentSectionData.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
            setCurrentQuestion(0);
        }
    };

    const prevQuestion = (): void => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        } else if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
        }
    };

    const skipQuestion = (): void => {
        nextQuestion();
    };

    const renderQuestionInput = () => {
        const question = currentQuestionData;
        const value = profileData[question.id] || '';

        switch (question.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={typeof value === 'string' ? value : ''}
                        onChange={(e) => updateProfileData(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={typeof value === 'number' ? value : ''}
                        onChange={(e) => updateProfileData(question.id, parseInt(e.target.value) || '')}
                        placeholder={question.placeholder}
                        min={question.min}
                        max={question.max}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={typeof value === 'string' ? value : ''}
                        onChange={(e) => updateProfileData(question.id, e.target.value)}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    />
                );

            case 'select':
                return (
                    <select
                        value={typeof value === 'number' ? value : ''}
                        onChange={(e) => updateProfileData(question.id, parseInt(e.target.value))}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                        <option value="">Select an option...</option>
                        {question.options?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'slider':
                const sliderValue = typeof value === 'number' ? value : question.min || 2.0;
                return (
                    <div className="space-y-6 px-6 py-8 bg-gray-700/20 rounded-lg border border-gray-600/50">
                        <div className="px-4">
                            <input
                                type="range"
                                min={question.min}
                                max={question.max}
                                step={question.step}
                                value={sliderValue}
                                onChange={(e) => updateProfileData(question.id, parseFloat(e.target.value))}
                                className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((sliderValue - (question.min || 0)) / ((question.max || 4) - (question.min || 0))) * 100}%, #374151 ${((sliderValue - (question.min || 0)) / ((question.max || 4) - (question.min || 0))) * 100}%, #374151 100%)`
                                }}
                            />
                        </div>
                        <div className="text-center py-2">
                            <span className="text-3xl font-bold text-blue-400">
                                {sliderValue}
                            </span>
                            <span className="text-gray-400 ml-2 text-lg">/ {question.max}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400 px-4">
                            <span>{question.min}</span>
                            <span>{question.max}</span>
                        </div>
                    </div>
                );

            case 'multi-select':
                const selectedItems = Array.isArray(value) ? value : [];
                return (
                    <div className="grid grid-cols-2 gap-3">
                        {question.options?.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    const optionValue = String(option.value);
                                    const newSelection = selectedItems.includes(optionValue)
                                        ? selectedItems.filter(item => item !== optionValue)
                                        : [...selectedItems, optionValue];
                                    updateProfileData(question.id, newSelection);
                                }}
                                className={`p-3 rounded-lg border-2 transition-colors ${selectedItems.includes(String(option.value))
                                    ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                );

            case 'multi-text':
                const items = Array.isArray(value) ? value : [];
                return (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={String(item)}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[index] = e.target.value;
                                        updateProfileData(question.id, newItems);
                                    }}
                                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                />
                                <button
                                    onClick={() => {
                                        const newItems = items.filter((_, i) => i !== index);
                                        updateProfileData(question.id, newItems);
                                    }}
                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateProfileData(question.id, [...items, ''])}
                            className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                        >
                            + Add {question.placeholder?.replace('Add a ', '').replace('Add an ', '') || 'Item'}
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                        <p className="text-yellow-300">
                            Question type "{question.type}" not implemented
                        </p>
                    </div>
                );
        }
    };

    const handleCompleteProfile = async () => {
        try {
            setIsLoading(true);

            // Check if user is authenticated
            const token = localStorage.getItem('access_token');
            if (!token) {
                setSaveError('Please log in to complete your profile.');
                router.push('/login');
                return;
            }

            // First save any pending changes
            const cleanedData = Object.entries(profileData).reduce((acc, [key, value]) => {
                if (value === '' || value === null || value === undefined) return acc;
                if (Array.isArray(value)) {
                    const filteredArray = value.filter(item => item !== '' && item !== null && item !== undefined);
                    if (filteredArray.length > 0) acc[key] = filteredArray;
                    return acc;
                }
                if (['graduation_year', 'sat_score', 'act_score', 'volunteer_hours'].includes(key)) {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) acc[key] = numValue;
                    return acc;
                }
                if (key === 'gpa') {
                    const gpaValue = parseFloat(value as string);
                    if (!isNaN(gpaValue)) acc[key] = gpaValue;
                    return acc;
                }
                if (key === 'date_of_birth') {
                    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        acc[key] = value;
                    }
                    return acc;
                }
                if (typeof value === 'string' && value.trim() !== '') {
                    acc[key] = value.trim();
                }
                return acc;
            }, {} as any);

            // Try to save changes first
            try {
                await profileAPI.updateProfile(cleanedData);
            } catch (updateError) {
                console.error('Failed to save final changes:', updateError);
                // Continue anyway to complete profile
            }

            // Mark profile as completed
            await profileAPI.completeProfile();

            // Clear localStorage
            localStorage.removeItem('profileData');

            // Redirect to profile view
            router.push('/profile/view');

        } catch (error: any) {
            console.error('Failed to complete profile:', error);

            // Handle authentication errors specifically
            if (error.message?.includes('Not authenticated') || error.message?.includes('401') || error.message?.includes('403')) {
                setSaveError('Your session has expired. Please log in again.');
                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setSaveError('Failed to complete profile. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isQuestionAnswered = (question: Question): boolean => {
        const value = profileData[question.id];
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim() !== '';
        if (Array.isArray(value)) return value.length > 0;
        return true;
    };

    const canContinue = !currentQuestionData.required || isQuestionAnswered(currentQuestionData);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Profile Builder</h1>
                        <div className="flex items-center gap-2">
                            {isLoading ? (
                                <Save size={16} className="animate-spin" />
                            ) : lastSaved ? (
                                <CheckCircle size={16} className="text-green-400" />
                            ) : null}
                            {lastSaved && (
                                <span className="text-sm opacity-90">
                                    Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                            {saveError && (
                                <span className="text-sm text-red-300">
                                    {saveError}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                            <span>{currentSectionData.title}</span>
                            <span>{progressPercentage}% Complete</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                            <div
                                className="bg-white h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Section Navigation */}
                    <div className="flex gap-2 mt-10 mb-10 pb-10 overflow-x-auto">
                        {sections.map((section, index) => {
                            const SectionIcon = section.icon;
                            const isActive = index === currentSection;
                            const isCompleted = index < currentSection;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setCurrentSection(index);
                                        setCurrentQuestion(0);
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${isActive
                                        ? 'bg-white text-blue-600'
                                        : isCompleted
                                            ? 'bg-white/20 text-white'
                                            : 'bg-white/10 text-white/70 hover:bg-white/15'
                                        }`}
                                >
                                    <SectionIcon size={16} />
                                    {section.title}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Question Content */}
                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {currentQuestionData.question}
                        </h2>

                        {currentQuestionData.tip && (
                            <div className="flex items-start gap-3 p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg mb-6">
                                <HelpCircle size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-blue-300">{currentQuestionData.tip}</p>
                            </div>
                        )}

                        {currentQuestionData.privacy && (
                            <div className="flex items-start gap-3 p-4 bg-green-600/10 border border-green-500/20 rounded-lg mb-6">
                                <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <p className="text-green-300">This information can be kept private and will only be shared with your permission.</p>
                            </div>
                        )}
                    </div>

                    {/* Question Input */}
                    <div className="mb-8">
                        {renderQuestionInput()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={prevQuestion}
                            disabled={currentSection === 0 && currentQuestion === 0}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-600 disabled:hover:text-gray-300"
                        >
                            <ChevronLeft size={20} />
                            Back
                        </button>

                        <div className="flex-1 flex gap-3">
                            {!currentQuestionData.required && (
                                <button
                                    onClick={skipQuestion}
                                    className="flex items-center gap-2 px-6 py-3 text-gray-300 border border-gray-600 hover:border-gray-500 hover:text-white rounded-lg transition-colors"
                                >
                                    <SkipForward size={20} />
                                    Skip for now
                                </button>
                            )}

                            <button
                                onClick={currentSection === sections.length - 1 && currentQuestion === currentSectionData.questions.length - 1
                                    ? handleCompleteProfile
                                    : nextQuestion}
                                disabled={!canContinue}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                            >
                                {currentSection === sections.length - 1 && currentQuestion === currentSectionData.questions.length - 1
                                    ? 'Complete Profile'
                                    : 'Continue'
                                }
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Help Option */}
                    <div className="mt-6 text-center">
                        <button className="text-blue-400 hover:text-blue-300 underline transition-colors">
                            Need help with this section? Get professional assistance →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileBuilder;