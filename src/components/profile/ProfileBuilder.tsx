import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, User, GraduationCap, Trophy, Heart, Briefcase, Award, Camera, Save, SkipForward, HelpCircle } from 'lucide-react';

// Mock API functions - replace with real API calls
const saveProfileData = async (data) => {
    console.log('Saving profile data:', data);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
};

const ProfileBuilder = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [profileData, setProfileData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Define the interview sections and questions
    const sections = [
        {
            id: 'basic',
            title: 'Basic Info',
            icon: User,
            color: 'blue',
            questions: [
                {
                    id: 'first_name',
                    type: 'text',
                    question: "Let's start with the basics! What's your first name?",
                    placeholder: 'Enter your first name',
                    required: true
                },
                {
                    id: 'last_name',
                    type: 'text',
                    question: "And your last name?",
                    placeholder: 'Enter your last name',
                    required: true
                },
                {
                    id: 'high_school_name',
                    type: 'text',
                    question: "What high school do you attend?",
                    placeholder: 'Enter your high school name',
                    tip: "This helps us find local scholarships!"
                },
                {
                    id: 'graduation_year',
                    type: 'select',
                    question: "What year do you graduate?",
                    options: [
                        { value: 2025, label: '2025' },
                        { value: 2026, label: '2026' },
                        { value: 2027, label: '2027' },
                        { value: 2028, label: '2028' }
                    ]
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
                    id: 'honors_courses',
                    type: 'multi-text',
                    question: "Are you taking any AP, honors, or advanced courses?",
                    placeholder: 'Add a course (e.g., AP Biology)',
                    tip: "These show academic challenge and can help with scholarships!"
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
                        'Volleyball', 'Basketball', 'Soccer', 'Track & Field', 'Cross Country',
                        'Swimming', 'Tennis', 'Golf', 'Baseball', 'Softball', 'Football',
                        'Wrestling', 'Gymnastics', 'Lacrosse', 'Field Hockey', 'Other'
                    ],
                    tip: "Athletic participation is great for scholarships like Fisher Cats!"
                },
                {
                    id: 'athletic_positions',
                    type: 'dynamic-text',
                    question: "What positions do you play?",
                    dependsOn: 'sports_played',
                    placeholder: 'e.g., Setter, Outside Hitter',
                    tip: "Tell us about your role on each team"
                },
                {
                    id: 'team_captain',
                    type: 'multi-select',
                    question: "Have you been a team captain or leader?",
                    dependsOn: 'sports_played',
                    options: [], // Will be populated based on sports
                    tip: "Leadership roles are highly valued by scholarship committees!"
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
                    tip: "Community service is required for Fisher Cats scholarship!"
                },
                {
                    id: 'volunteer_hours',
                    type: 'number',
                    question: "About how many volunteer hours do you have total?",
                    placeholder: 'Approximate total hours',
                    optional: true,
                    tip: "Don't worry about being exact - an estimate is fine!"
                },
                {
                    id: 'leadership_positions',
                    type: 'multi-text',
                    question: "Any leadership roles in school or community?",
                    placeholder: 'e.g., Student Council, Club President',
                    optional: true
                }
            ]
        },
        {
            id: 'work',
            title: 'Work & Activities',
            icon: Briefcase,
            color: 'purple',
            questions: [
                {
                    id: 'work_experience',
                    type: 'work-experience',
                    question: "Do you have any jobs or work experience?",
                    tip: "Jobs like lifeguarding show responsibility and work ethic!"
                },
                {
                    id: 'extracurricular_activities',
                    type: 'multi-text',
                    question: "What clubs, activities, or hobbies are you involved in?",
                    placeholder: 'e.g., Drama Club, Debate Team, Music',
                    tip: "Scholarship committees love well-rounded students!"
                }
            ]
        }
    ];

    // Auto-save functionality
    useEffect(() => {
        const autoSave = async () => {
            if (Object.keys(profileData).length > 0) {
                setIsLoading(true);
                try {
                    await saveProfileData(profileData);
                    setLastSaved(new Date());
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(autoSave, 2000);
        return () => clearTimeout(timeoutId);
    }, [profileData]);

    const currentSectionData = sections[currentSection];
    const currentQuestionData = currentSectionData.questions[currentQuestion];
    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
    const completedQuestions = sections.slice(0, currentSection).reduce((sum, section) => sum + section.questions.length, 0) + currentQuestion;
    const progressPercentage = Math.round((completedQuestions / totalQuestions) * 100);

    const updateProfileData = (key, value) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    const nextQuestion = () => {
        if (currentQuestion < currentSectionData.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
            setCurrentQuestion(0);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        } else if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
            setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
        }
    };

    const skipQuestion = () => {
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
                        value={value}
                        onChange={(e) => updateProfileData(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => updateProfileData(question.id, parseInt(e.target.value) || '')}
                        placeholder={question.placeholder}
                        min={question.min}
                        max={question.max}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    />
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => updateProfileData(question.id, parseInt(e.target.value))}
                        className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                        <option value="">Select an option...</option>
                        {question.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'slider':
                return (
                    <div className="space-y-4">
                        <input
                            type="range"
                            min={question.min}
                            max={question.max}
                            step={question.step}
                            value={value || question.min}
                            onChange={(e) => updateProfileData(question.id, parseFloat(e.target.value))}
                            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value || question.min) - question.min) / (question.max - question.min) * 100}%, #374151 ${((value || question.min) - question.min) / (question.max - question.min) * 100}%, #374151 100%)`
                            }}
                        />
                        <div className="text-center">
                            <span className="text-2xl font-bold text-blue-400">
                                {value || question.min}
                            </span>
                            <span className="text-gray-400 ml-2">/ {question.max}</span>
                        </div>
                    </div>
                );

            case 'multi-select':
                const selectedItems = value || [];
                return (
                    <div className="grid grid-cols-2 gap-3">
                        {question.options.map(option => (
                            <button
                                key={option}
                                onClick={() => {
                                    const newSelection = selectedItems.includes(option)
                                        ? selectedItems.filter(item => item !== option)
                                        : [...selectedItems, option];
                                    updateProfileData(question.id, newSelection);
                                }}
                                className={`p-3 rounded-lg border-2 transition-colors ${selectedItems.includes(option)
                                        ? 'border-blue-500 bg-blue-600/20 text-blue-300'
                                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );

            case 'multi-text':
                const items = value || [];
                return (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={item}
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
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => updateProfileData(question.id, [...items, ''])}
                            className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
                        >
                            + Add {question.placeholder?.replace('Add a ', '') || 'Item'}
                        </button>
                    </div>
                );

            default:
                return <div>Question type not implemented</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Profile Builder</h1>
                        <div className="flex items-center gap-2">
                            <Save size={16} className={isLoading ? 'animate-spin' : ''} />
                            {lastSaved && (
                                <span className="text-sm opacity-90">
                                    Saved {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
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
                    <div className="flex gap-2 mt-4 overflow-x-auto">
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
                                onClick={nextQuestion}
                                disabled={currentQuestionData.required && !profileData[currentQuestionData.id]}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                            >
                                Continue
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