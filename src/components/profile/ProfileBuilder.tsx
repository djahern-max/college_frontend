'use client';

// ProfileBuilder Component - Fixed with proper validation and API calls
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, User, GraduationCap, Target, Users, FileText, Settings, SkipForward, CheckCircle } from 'lucide-react';
import { profileAPI } from '@/lib/profileAPI';

interface ProfileData {
    // Basic Information (matching scholarship requirements)
    date_of_birth?: string;
    phone_number?: string;
    high_school_name?: string;
    graduation_year?: number;
    gpa?: number;

    // Academic Information (critical for matching)
    sat_score?: number;
    act_score?: number;
    intended_major?: string;
    academic_interests?: string[];
    career_goals?: string[];

    // Activities & Experience (for activity-based scholarships)
    extracurricular_activities?: string[];
    volunteer_experience?: string[];
    volunteer_hours?: number;
    work_experience?: any[];

    // Background & Demographics (for demographic-specific scholarships)
    ethnicity?: string[];
    first_generation_college?: boolean;
    household_income_range?: string;
    state?: string;
    city?: string;
    zip_code?: string;

    // Essays & Statements
    personal_statement?: string;
    leadership_essay?: string;
    community_service_essay?: string;

    // Preferences (for matching optimization)
    scholarship_types_interested?: string[];
    college_size_preference?: string[];
    college_location_preference?: string[];
    languages_preferred?: string[];
    special_talents?: string[];
}

interface Question {
    id: keyof ProfileData;
    title: string;
    subtitle?: string;
    type: 'text' | 'number' | 'textarea' | 'select' | 'multi-select' | 'multi-text' | 'boolean' | 'income-range';
    placeholder?: string;
    options?: { value: string; label: string }[];
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        pattern?: string;
    };
    helpText?: string;
}

interface Section {
    id: string;
    title: string;
    icon: React.ComponentType<any>;
    description: string;
    questions: Question[];
}

const ProfileBuilder: React.FC = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [profileData, setProfileData] = useState<ProfileData>({});
    const [isLoading, setIsLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Define sections with questions that match scholarship criteria
    const sections: Section[] = [
        {
            id: 'basic_info',
            title: 'Basic Information',
            icon: User,
            description: 'Tell us about yourself and your academic background',
            questions: [
                {
                    id: 'date_of_birth',
                    title: 'What is your date of birth?',
                    type: 'text',
                    placeholder: 'YYYY-MM-DD',
                    validation: { required: true },
                    helpText: 'This helps determine age-specific scholarship eligibility'
                },
                {
                    id: 'phone_number',
                    title: 'What is your phone number?',
                    type: 'text',
                    placeholder: '(555) 123-4567',
                    helpText: 'We\'ll only use this for scholarship application communications'
                },
                {
                    id: 'high_school_name',
                    title: 'What high school do you attend or did you graduate from?',
                    type: 'text',
                    placeholder: 'Lincoln High School',
                    validation: { required: true },
                    helpText: 'Some scholarships are specific to certain high schools'
                },
                {
                    id: 'graduation_year',
                    title: 'What is your graduation year?',
                    type: 'number',
                    placeholder: '2025',
                    validation: { required: true, min: 2020, max: 2030 },
                    helpText: 'This determines eligibility for current student vs. recent graduate scholarships'
                },
                {
                    id: 'gpa',
                    title: 'What is your current GPA?',
                    subtitle: 'On a 4.0 scale',
                    type: 'number',
                    placeholder: '3.5',
                    validation: { required: true, min: 0, max: 4.0 },
                    helpText: 'Most scholarships have GPA requirements - this is crucial for matching'
                },
                {
                    id: 'state',
                    title: 'Which state do you live in?',
                    type: 'select',
                    validation: { required: true },
                    helpText: 'Many scholarships are limited to residents of specific states',
                    options: [
                        { value: 'AL', label: 'Alabama' },
                        { value: 'AK', label: 'Alaska' },
                        { value: 'AZ', label: 'Arizona' },
                        { value: 'AR', label: 'Arkansas' },
                        { value: 'CA', label: 'California' },
                        { value: 'CO', label: 'Colorado' },
                        { value: 'CT', label: 'Connecticut' },
                        { value: 'DE', label: 'Delaware' },
                        { value: 'FL', label: 'Florida' },
                        { value: 'GA', label: 'Georgia' },
                        { value: 'HI', label: 'Hawaii' },
                        { value: 'ID', label: 'Idaho' },
                        { value: 'IL', label: 'Illinois' },
                        { value: 'IN', label: 'Indiana' },
                        { value: 'IA', label: 'Iowa' },
                        { value: 'KS', label: 'Kansas' },
                        { value: 'KY', label: 'Kentucky' },
                        { value: 'LA', label: 'Louisiana' },
                        { value: 'ME', label: 'Maine' },
                        { value: 'MD', label: 'Maryland' },
                        { value: 'MA', label: 'Massachusetts' },
                        { value: 'MI', label: 'Michigan' },
                        { value: 'MN', label: 'Minnesota' },
                        { value: 'MS', label: 'Mississippi' },
                        { value: 'MO', label: 'Missouri' },
                        { value: 'MT', label: 'Montana' },
                        { value: 'NE', label: 'Nebraska' },
                        { value: 'NV', label: 'Nevada' },
                        { value: 'NH', label: 'New Hampshire' },
                        { value: 'NJ', label: 'New Jersey' },
                        { value: 'NM', label: 'New Mexico' },
                        { value: 'NY', label: 'New York' },
                        { value: 'NC', label: 'North Carolina' },
                        { value: 'ND', label: 'North Dakota' },
                        { value: 'OH', label: 'Ohio' },
                        { value: 'OK', label: 'Oklahoma' },
                        { value: 'OR', label: 'Oregon' },
                        { value: 'PA', label: 'Pennsylvania' },
                        { value: 'RI', label: 'Rhode Island' },
                        { value: 'SC', label: 'South Carolina' },
                        { value: 'SD', label: 'South Dakota' },
                        { value: 'TN', label: 'Tennessee' },
                        { value: 'TX', label: 'Texas' },
                        { value: 'UT', label: 'Utah' },
                        { value: 'VT', label: 'Vermont' },
                        { value: 'VA', label: 'Virginia' },
                        { value: 'WA', label: 'Washington' },
                        { value: 'WV', label: 'West Virginia' },
                        { value: 'WI', label: 'Wisconsin' },
                        { value: 'WY', label: 'Wyoming' }
                    ]
                },
                {
                    id: 'city',
                    title: 'What city do you live in?',
                    type: 'text',
                    placeholder: 'Your city',
                    helpText: 'Some local scholarships are city-specific'
                },
                {
                    id: 'zip_code',
                    title: 'What is your zip code?',
                    type: 'text',
                    placeholder: '12345',
                    helpText: 'Helps identify local and regional scholarship opportunities'
                }
            ]
        },
        {
            id: 'academic_info',
            title: 'Academic Information',
            icon: GraduationCap,
            description: 'Your test scores, major, and academic interests',
            questions: [
                {
                    id: 'sat_score',
                    title: 'What is your SAT score?',
                    subtitle: 'Total score out of 1600 (leave blank if you haven\'t taken it)',
                    type: 'number',
                    placeholder: '1200',
                    validation: { min: 400, max: 1600 },
                    helpText: 'Many scholarships require minimum SAT scores'
                },
                {
                    id: 'act_score',
                    title: 'What is your ACT score?',
                    subtitle: 'Composite score out of 36 (leave blank if you haven\'t taken it)',
                    type: 'number',
                    placeholder: '28',
                    validation: { min: 1, max: 36 },
                    helpText: 'Alternative to SAT for scholarship eligibility'
                },
                {
                    id: 'intended_major',
                    title: 'What is your intended major or field of study?',
                    type: 'select',
                    validation: { required: true },
                    helpText: 'This is crucial - many scholarships are major-specific',
                    options: [
                        { value: 'Computer Science', label: 'Computer Science' },
                        { value: 'Engineering', label: 'Engineering' },
                        { value: 'Mathematics', label: 'Mathematics' },
                        { value: 'Biology', label: 'Biology' },
                        { value: 'Chemistry', label: 'Chemistry' },
                        { value: 'Physics', label: 'Physics' },
                        { value: 'Business', label: 'Business' },
                        { value: 'Economics', label: 'Economics' },
                        { value: 'Psychology', label: 'Psychology' },
                        { value: 'English', label: 'English' },
                        { value: 'History', label: 'History' },
                        { value: 'Art', label: 'Art' },
                        { value: 'Music', label: 'Music' },
                        { value: 'Education', label: 'Education' },
                        { value: 'Pre-Med', label: 'Pre-Med' },
                        { value: 'Nursing', label: 'Nursing' },
                        { value: 'Social Work', label: 'Social Work' },
                        { value: 'Communications', label: 'Communications' },
                        { value: 'Political Science', label: 'Political Science' },
                        { value: 'International Relations', label: 'International Relations' },
                        { value: 'Environmental Science', label: 'Environmental Science' },
                        { value: 'Other', label: 'Other' }
                    ]
                },
                {
                    id: 'academic_interests',
                    title: 'What are your academic interests?',
                    subtitle: 'Select all that apply',
                    type: 'multi-select',
                    helpText: 'Used to match with scholarships targeting specific academic areas',
                    options: [
                        { value: 'STEM', label: 'STEM (Science, Technology, Engineering, Math)' },
                        { value: 'Research', label: 'Research' },
                        { value: 'Innovation', label: 'Innovation & Entrepreneurship' },
                        { value: 'Healthcare', label: 'Healthcare & Medicine' },
                        { value: 'Education', label: 'Education & Teaching' },
                        { value: 'Arts', label: 'Arts & Creative Fields' },
                        { value: 'Social Sciences', label: 'Social Sciences' },
                        { value: 'Business', label: 'Business & Finance' },
                        { value: 'Law', label: 'Law & Legal Studies' },
                        { value: 'Public Service', label: 'Public Service & Policy' },
                        { value: 'Environmental', label: 'Environmental Studies' },
                        { value: 'International', label: 'International Studies' },
                        { value: 'Technology', label: 'Technology & Computer Science' },
                        { value: 'Communications', label: 'Media & Communications' }
                    ]
                },
                {
                    id: 'career_goals',
                    title: 'What are your career goals?',
                    subtitle: 'Add your career aspirations',
                    type: 'multi-text',
                    placeholder: 'Add a career goal',
                    helpText: 'Scholarships often target students with specific career aspirations'
                }
            ]
        },
        {
            id: 'activities_experience',
            title: 'Activities & Experience',
            icon: Target,
            description: 'Your extracurriculars, volunteer work, and experience',
            questions: [
                {
                    id: 'extracurricular_activities',
                    title: 'What extracurricular activities are you involved in?',
                    type: 'multi-text',
                    placeholder: 'Add an activity',
                    helpText: 'Leadership roles, sports, clubs, etc. Many scholarships value specific activities'
                },
                {
                    id: 'volunteer_experience',
                    title: 'What volunteer experience do you have?',
                    type: 'multi-text',
                    placeholder: 'Add volunteer experience',
                    helpText: 'Community service is highly valued by scholarship committees'
                },
                {
                    id: 'volunteer_hours',
                    title: 'How many total volunteer hours do you have?',
                    type: 'number',
                    placeholder: '50',
                    helpText: 'Some scholarships require minimum volunteer hours'
                },
                {
                    id: 'special_talents',
                    title: 'What special talents or skills do you have?',
                    type: 'multi-text',
                    placeholder: 'Add a talent or skill',
                    helpText: 'Music, art, athletics, languages, etc.'
                },
                {
                    id: 'languages_preferred',
                    title: 'What languages do you speak?',
                    type: 'multi-text',
                    placeholder: 'Add a language',
                    helpText: 'Bilingual students may qualify for language-specific scholarships'
                }
            ]
        },
        {
            id: 'background_demographics',
            title: 'Background & Demographics',
            icon: Users,
            description: 'Information for demographic-specific scholarships',
            questions: [
                {
                    id: 'ethnicity',
                    title: 'What is your ethnic background?',
                    subtitle: 'Select all that apply (optional but helps with diversity scholarships)',
                    type: 'multi-select',
                    helpText: 'Many scholarships specifically support underrepresented minorities',
                    options: [
                        { value: 'African American', label: 'African American/Black' },
                        { value: 'Asian American', label: 'Asian American' },
                        { value: 'Hispanic/Latino', label: 'Hispanic/Latino' },
                        { value: 'Native American', label: 'Native American/Alaska Native' },
                        { value: 'Pacific Islander', label: 'Native Hawaiian/Pacific Islander' },
                        { value: 'White', label: 'White/Caucasian' },
                        { value: 'Multiracial', label: 'Multiracial' },
                        { value: 'Other', label: 'Other' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' }
                    ]
                },
                {
                    id: 'first_generation_college',
                    title: 'Are you a first-generation college student?',
                    subtitle: 'Neither parent completed a 4-year college degree',
                    type: 'boolean',
                    helpText: 'Many scholarships specifically support first-generation college students'
                },
                {
                    id: 'household_income_range',
                    title: 'What is your household income range?',
                    type: 'income-range',
                    validation: { required: true },
                    helpText: 'Used to determine need-based scholarship eligibility',
                    options: [
                        { value: 'Under $25,000', label: 'Under $25,000' },
                        { value: '$25,000 - $50,000', label: '$25,000 - $50,000' },
                        { value: '$50,000 - $75,000', label: '$50,000 - $75,000' },
                        { value: '$75,000 - $100,000', label: '$75,000 - $100,000' },
                        { value: '$100,000 - $150,000', label: '$100,000 - $150,000' },
                        { value: '$150,000 - $200,000', label: '$150,000 - $200,000' },
                        { value: 'Over $200,000', label: 'Over $200,000' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' }
                    ]
                }
            ]
        },
        {
            id: 'essays_statements',
            title: 'Essays & Statements',
            icon: FileText,
            description: 'Personal statements and essays for applications',
            questions: [
                {
                    id: 'personal_statement',
                    title: 'Personal Statement',
                    subtitle: 'Tell us about yourself, your goals, and what makes you unique',
                    type: 'textarea',
                    placeholder: 'Write about your background, goals, challenges overcome, and what makes you unique...',
                    validation: { required: true },
                    helpText: 'This will be used for scholarships requiring personal statements'
                },
                {
                    id: 'leadership_essay',
                    title: 'Leadership Experience Essay',
                    subtitle: 'Describe your leadership experience and impact (optional)',
                    type: 'textarea',
                    placeholder: 'Describe a time when you demonstrated leadership and the impact you made...',
                    helpText: 'For scholarships that value leadership experience'
                },
                {
                    id: 'community_service_essay',
                    title: 'Community Service Essay',
                    subtitle: 'Describe your community service and its impact on you (optional)',
                    type: 'textarea',
                    placeholder: 'Describe your community service experience and what you learned...',
                    helpText: 'For scholarships focused on community involvement'
                }
            ]
        },
        {
            id: 'preferences',
            title: 'Scholarship Preferences',
            icon: Settings,
            description: 'Your preferences for scholarship matching',
            questions: [
                {
                    id: 'scholarship_types_interested',
                    title: 'What types of scholarships interest you most?',
                    type: 'multi-select',
                    validation: { required: true },
                    helpText: 'Helps prioritize scholarship matches',
                    options: [
                        { value: 'academic', label: 'Academic Merit' },
                        { value: 'need_based', label: 'Need-Based' },
                        { value: 'stem', label: 'STEM Fields' },
                        { value: 'arts', label: 'Arts & Creative' },
                        { value: 'athletics', label: 'Athletic' },
                        { value: 'community_service', label: 'Community Service' },
                        { value: 'leadership', label: 'Leadership' },
                        { value: 'diversity', label: 'Diversity & Inclusion' },
                        { value: 'first_generation', label: 'First Generation' },
                        { value: 'local', label: 'Local/Regional' },
                        { value: 'corporate', label: 'Corporate Sponsored' },
                        { value: 'religious', label: 'Faith-Based' },
                        { value: 'military', label: 'Military/Veterans' }
                    ]
                },
                {
                    id: 'college_size_preference',
                    title: 'What size college do you prefer?',
                    type: 'multi-select',
                    helpText: 'Some scholarships are specific to college size',
                    options: [
                        { value: 'small', label: 'Small (Under 3,000 students)' },
                        { value: 'medium', label: 'Medium (3,000-10,000 students)' },
                        { value: 'large', label: 'Large (Over 10,000 students)' },
                        { value: 'no_preference', label: 'No Preference' }
                    ]
                },
                {
                    id: 'college_location_preference',
                    title: 'Where would you like to attend college?',
                    type: 'multi-select',
                    helpText: 'Location-specific scholarships',
                    options: [
                        { value: 'in_state', label: 'In-State' },
                        { value: 'out_of_state', label: 'Out-of-State' },
                        { value: 'urban', label: 'Urban Areas' },
                        { value: 'suburban', label: 'Suburban Areas' },
                        { value: 'rural', label: 'Rural Areas' },
                        { value: 'no_preference', label: 'No Preference' }
                    ]
                }
            ]
        }
    ];

    // Auto-save functionality
    useEffect(() => {
        if (isInitialLoad) return;

        const autoSave = async () => {
            if (Object.keys(profileData).length === 0) return;

            try {
                setSaveStatus('saving');

                // Clean the data before sending
                const cleanedData = cleanProfileData(profileData);
                await profileAPI.updateProfile(cleanedData);

                setSaveStatus('saved');
                setLastSaved(new Date());
                setSaveError(null);
            } catch (error: any) {
                console.error('Auto-save failed:', error);
                setSaveStatus('error');
                setSaveError(error.message || 'Failed to save');
            }
        };

        const timeoutId = setTimeout(autoSave, 2000);
        return () => clearTimeout(timeoutId);
    }, [profileData, isInitialLoad]);

    // Load existing profile data
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await profileAPI.getMyProfile();
                if (data && Object.keys(data).length > 0) {
                    setProfileData(data);
                }
            } catch (error: any) {
                console.error('Failed to load profile:', error);
                // Don't show error for missing profile (404), just start fresh
                if (error.status !== 404) {
                    setSaveError('Failed to load existing profile data');
                }
            } finally {
                setIsInitialLoad(false);
            }
        };

        loadProfile();
    }, []);

    /**
     * Clean profile data to ensure proper types for API
     */
    const cleanProfileData = (data: ProfileData): ProfileData => {
        const cleaned = { ...data };

        // Ensure array fields are arrays
        const arrayFields: (keyof ProfileData)[] = [
            'academic_interests',
            'career_goals',
            'extracurricular_activities',
            'volunteer_experience',
            'ethnicity',
            'scholarship_types_interested',
            'college_size_preference',
            'college_location_preference',
            'languages_preferred',
            'special_talents'
        ];

        arrayFields.forEach(field => {
            if (cleaned[field] && !Array.isArray(cleaned[field])) {
                // Convert string to array if needed
                if (typeof cleaned[field] === 'string') {
                    cleaned[field] = [cleaned[field] as string] as any;
                } else {
                    delete cleaned[field];
                }
            }
            // Filter out empty strings from arrays
            if (Array.isArray(cleaned[field])) {
                cleaned[field] = (cleaned[field] as string[]).filter(item =>
                    item && typeof item === 'string' && item.trim() !== ''
                ) as any;

                // Remove empty arrays
                if ((cleaned[field] as string[]).length === 0) {
                    delete cleaned[field];
                }
            }
        });

        // Clean number fields
        if (cleaned.gpa !== undefined) {
            const gpaNum = Number(cleaned.gpa);
            if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
                delete cleaned.gpa;
            } else {
                cleaned.gpa = gpaNum;
            }
        }

        if (cleaned.sat_score !== undefined) {
            const satNum = Number(cleaned.sat_score);
            if (isNaN(satNum) || satNum < 400 || satNum > 1600) {
                delete cleaned.sat_score;
            } else {
                cleaned.sat_score = satNum;
            }
        }

        if (cleaned.act_score !== undefined) {
            const actNum = Number(cleaned.act_score);
            if (isNaN(actNum) || actNum < 1 || actNum > 36) {
                delete cleaned.act_score;
            } else {
                cleaned.act_score = actNum;
            }
        }

        if (cleaned.graduation_year !== undefined) {
            const yearNum = Number(cleaned.graduation_year);
            if (isNaN(yearNum)) {
                delete cleaned.graduation_year;
            } else {
                cleaned.graduation_year = yearNum;
            }
        }

        if (cleaned.volunteer_hours !== undefined) {
            const hoursNum = Number(cleaned.volunteer_hours);
            if (isNaN(hoursNum) || hoursNum < 0) {
                delete cleaned.volunteer_hours;
            } else {
                cleaned.volunteer_hours = hoursNum;
            }
        }

        // Clean string fields (remove empty strings)
        const stringFields: (keyof ProfileData)[] = [
            'date_of_birth',
            'phone_number',
            'high_school_name',
            'intended_major',
            'state',
            'city',
            'zip_code',
            'household_income_range',
            'personal_statement',
            'leadership_essay',
            'community_service_essay'
        ];

        stringFields.forEach(field => {
            if (cleaned[field] !== undefined) {
                const value = String(cleaned[field]).trim();
                if (value === '') {
                    delete cleaned[field];
                } else {
                    (cleaned[field] as any) = value;
                }
            }
        });

        // Remove any undefined or null values
        Object.keys(cleaned).forEach(key => {
            const value = cleaned[key as keyof ProfileData];
            if (value === undefined || value === null) {
                delete cleaned[key as keyof ProfileData];
            }
        });

        return cleaned;
    };

    const currentSectionData = sections[currentSection];
    const currentQuestionData = currentSectionData.questions[currentQuestion];
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
    const completedQuestions = sections.slice(0, currentSection).reduce((sum, section) => sum + section.questions.length, 0) + currentQuestion;
    const progressPercentage = Math.round((completedQuestions / totalQuestions) * 100);

    const updateProfileData = (key: keyof ProfileData, value: any): void => {
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

    const isQuestionAnswered = (question: Question): boolean => {
        const value = profileData[question.id];
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value.trim() !== '';
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'boolean') return true;
        if (typeof value === 'number') return !isNaN(value);
        return true;
    };

    const canContinue = !currentQuestionData.validation?.required || isQuestionAnswered(currentQuestionData);

    const handleCompleteProfile = async () => {
        try {
            setIsLoading(true);
            setSaveError(null);

            // Clean and validate data before completing
            const cleanedData = cleanProfileData(profileData);

            // First update the profile with final data
            await profileAPI.updateProfile(cleanedData);

            // Then mark it as completed
            await profileAPI.completeProfile();

            // Redirect to dashboard or show success message
            window.location.href = '/dashboard';

        } catch (error: any) {
            console.error('Error completing profile:', error);

            // Handle specific error types
            if (error.status === 401) {
                setSaveError('Authentication expired. Please log in again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else if (error.status === 422) {
                setSaveError('Please check your information and try again. Some fields may have invalid data.');
            } else {
                setSaveError(error.message || 'Failed to complete profile. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
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
                        onChange={(e) => {
                            const numValue = e.target.value ? parseFloat(e.target.value) : undefined;
                            updateProfileData(question.id, numValue);
                        }}
                        placeholder={question.placeholder}
                        min={question.validation?.min}
                        max={question.validation?.max}
                        step={question.id === 'gpa' ? 0.1 : 1}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={typeof value === 'string' ? value : ''}
                        onChange={(e) => updateProfileData(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        rows={6}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-vertical"
                    />
                );

            case 'select':
            case 'income-range':
                return (
                    <select
                        value={typeof value === 'string' ? value : ''}
                        onChange={(e) => updateProfileData(question.id, e.target.value || undefined)}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                        <option value="">Select an option...</option>
                        {question.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'boolean':
                const boolValue = value as boolean;
                return (
                    <div className="flex gap-4">
                        <button
                            onClick={() => updateProfileData(question.id, true)}
                            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${boolValue === true
                                    ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                                }`}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => updateProfileData(question.id, false)}
                            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${boolValue === false
                                    ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                                }`}
                        >
                            No
                        </button>
                    </div>
                );

            case 'multi-select':
                const selectedValues = Array.isArray(value) ? value : [];
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {question.options?.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    const newValues = selectedValues.includes(option.value)
                                        ? selectedValues.filter(v => v !== option.value)
                                        : [...selectedValues, option.value];
                                    updateProfileData(question.id, newValues.length > 0 ? newValues : undefined);
                                }}
                                className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedValues.includes(option.value)
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
                const items = Array.isArray(value) ? value.filter(item => item && item.trim() !== '') : [];
                return (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={String(item)}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        if (e.target.value.trim() === '') {
                                            newItems.splice(index, 1);
                                        } else {
                                            newItems[index] = e.target.value;
                                        }
                                        updateProfileData(question.id, newItems.length > 0 ? newItems : undefined);
                                    }}
                                    className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                />
                                <button
                                    onClick={() => {
                                        const newItems = items.filter((_, i) => i !== index);
                                        updateProfileData(question.id, newItems.length > 0 ? newItems : undefined);
                                    }}
                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newItems = [...items, ''];
                                updateProfileData(question.id, newItems);
                            }}
                            className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                        >
                            + {question.placeholder || 'Add Item'}
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

    const isLastQuestion = currentSection === sections.length - 1 && currentQuestion === currentSectionData.questions.length - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 h-2">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {/* Header */}
            <div className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <currentSectionData.icon className="w-6 h-6 text-blue-400" />
                            <span className="text-lg font-semibold">{currentSectionData.title}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                            Question {completedQuestions + 1} of {totalQuestions}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Save Status */}
                        <div className="flex items-center gap-2 text-sm">
                            <Save size={16} />
                            <span className={`${saveStatus === 'saved' ? 'text-green-400' :
                                    saveStatus === 'saving' ? 'text-yellow-400' :
                                        saveStatus === 'error' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                {saveStatus === 'saved' ? 'Saved' :
                                    saveStatus === 'saving' ? 'Saving...' :
                                        saveStatus === 'error' ? 'Error' : 'Draft'}
                            </span>
                        </div>

                        <div className="text-sm font-medium text-blue-400">
                            {progressPercentage}% Complete
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Section Navigation */}
                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {sections.map((section, index) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setCurrentSection(index);
                                    setCurrentQuestion(0);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${index === currentSection
                                        ? 'bg-blue-600 text-white'
                                        : index < currentSection
                                            ? 'bg-green-600/20 text-green-300 border border-green-600/30'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                <section.icon size={16} />
                                {section.title}
                                {index < currentSection && <CheckCircle size={16} className="text-green-400" />}
                            </button>
                        ))}
                    </div>

                    <p className="text-gray-400 text-center">{currentSectionData.description}</p>
                </div>

                {/* Error Message */}
                {saveError && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-300">{saveError}</p>
                    </div>
                )}

                {/* Question Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">{currentQuestionData.title}</h2>
                        {currentQuestionData.subtitle && (
                            <p className="text-lg text-gray-300 mb-2">{currentQuestionData.subtitle}</p>
                        )}
                        {currentQuestionData.helpText && (
                            <div className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                                💡 {currentQuestionData.helpText}
                            </div>
                        )}
                    </div>

                    {/* Question Input */}
                    <div className="mb-8">
                        {renderQuestionInput()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={prevQuestion}
                            disabled={currentSection === 0 && currentQuestion === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>

                        <div className="flex gap-3">
                            {!currentQuestionData.validation?.required && (
                                <button
                                    onClick={skipQuestion}
                                    className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
                                >
                                    <SkipForward size={16} />
                                    Skip
                                </button>
                            )}

                            {isLastQuestion ? (
                                <button
                                    onClick={handleCompleteProfile}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Save size={20} className="animate-spin" />
                                            Completing...
                                        </>
                                    ) : (
                                        <>
                                            Complete Profile
                                            <CheckCircle size={20} />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={nextQuestion}
                                    disabled={!canContinue}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                >
                                    Next
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center">
                    <div className="flex gap-2">
                        {sections.map((section, sIndex) => (
                            <div key={section.id} className="flex gap-1">
                                {section.questions.map((_, qIndex) => {
                                    const isActive = sIndex === currentSection && qIndex === currentQuestion;
                                    const isCompleted = sIndex < currentSection || (sIndex === currentSection && qIndex < currentQuestion);

                                    return (
                                        <div
                                            key={qIndex}
                                            className={`w-3 h-3 rounded-full transition-colors ${isActive
                                                    ? 'bg-blue-500'
                                                    : isCompleted
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-600'
                                                }`}
                                        />
                                    );
                                })}
                                {sIndex < sections.length - 1 && <div className="w-4" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileBuilder;