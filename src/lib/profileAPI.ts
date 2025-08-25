// src/lib/profileAPI.ts
import { apiRequest, API_ENDPOINTS } from './api';

// =========================
// PROFILE INTERFACES
// =========================

export interface UserProfile {
    id?: number;
    user_id?: number;

    // Basic Information
    date_of_birth?: string;
    phone_number?: string;
    high_school_name?: string;
    graduation_year?: number;
    gpa?: number;

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
    work_experience?: WorkExperience[];

    // Background & Demographics
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

    // Preferences
    scholarship_types_interested?: string[];
    college_size_preference?: string[];
    college_location_preference?: string[];
    languages_preferred?: string[];
    special_talents?: string[];

    // Profile Status
    profile_completed?: boolean;
    completion_percentage?: number;

    // Timestamps
    created_at?: string;
    updated_at?: string;
    completed_at?: string;
}

export interface WorkExperience {
    company: string;
    position: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    hours_per_week?: number;
}

export interface ProfileSummary {
    profile_completed: boolean;
    completion_percentage: number;
    has_basic_info: boolean;
    has_academic_info: boolean;
    has_personal_info: boolean;
    missing_fields: string[];
}

export interface ProfileCompletionStatus {
    section_name: string;
    is_completed: boolean;
    completion_percentage: number;
    required_fields: string[];
    completed_fields: string[];
    missing_fields: string[];
}

export interface ProfileSection {
    id: string;
    title: string;
    icon: string;
    completed: boolean;
    fields: Record<string, any>;
}

export interface ProfileFieldUpdate {
    field_name: string;
    field_value: any;
}

export interface ProfileValidationResult {
    overall_match_readiness: number;
    critical_missing_fields: string[];
    recommended_fields: string[];
    scholarship_types_ready: string[];
    scholarship_types_limited: string[];
    matching_strengths: string[];
    matching_weaknesses: string[];
    completion_by_category: Record<string, number>;
    optimization_suggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
}

export interface ProfileCoverageReport {
    total_scholarships: number;
    potentially_eligible: number;
    fully_eligible: number;
    coverage_by_type: Record<string, {
        total: number;
        eligible: number;
        fully_eligible: number;
    }>;
    missing_opportunities: string[];
    top_recommendations: string[];
}

// =========================
// PROFILE API FUNCTIONS
// =========================

export const profileAPI = {
    /**
     * Get current user's profile
     */
    async getMyProfile(): Promise<UserProfile> {
        try {
            return await apiRequest<UserProfile>(API_ENDPOINTS.PROFILES);
        } catch (error: any) {
            // Handle case where profile doesn't exist yet
            if (error.status === 404) {
                return {} as UserProfile;
            }
            throw error;
        }
    },

    /**
     * Get profile by user ID (admin/public access)
     */
    async getProfileByUserId(userId: number): Promise<UserProfile> {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILE_BY_USER(userId));
    },

    /**
     * Create new profile for current user
     */
    async createProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILES, {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    },

    /**
     * Update existing profile
     */
    async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILES, {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    /**
     * Update a single profile field (for auto-save functionality)
     */
    async updateProfileField(fieldName: string, fieldValue: any): Promise<UserProfile> {
        const fieldUpdate: ProfileFieldUpdate = {
            field_name: fieldName,
            field_value: fieldValue
        };

        return apiRequest<UserProfile>(`${API_ENDPOINTS.PROFILES}/field`, {
            method: 'PATCH',
            body: JSON.stringify(fieldUpdate),
        });
    },

    /**
     * Get profile completion summary
     */
    async getProfileSummary(): Promise<ProfileSummary> {
        return apiRequest<ProfileSummary>(API_ENDPOINTS.PROFILE_SUMMARY);
    },

    /**
     * Get detailed completion status for each section
     */
    async getProfileSections(): Promise<Record<string, ProfileCompletionStatus>> {
        return apiRequest<Record<string, ProfileCompletionStatus>>(`${API_ENDPOINTS.PROFILES}/sections`);
    },

    /**
     * Mark profile as completed
     */
    async completeProfile(): Promise<UserProfile> {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILE_COMPLETE, {
            method: 'POST',
        });
    },

    /**
     * Get formatted profile data for ProfileView component
     */
    async getProfileView(): Promise<any> {
        return apiRequest<any>(API_ENDPOINTS.PROFILE_VIEW);
    },

    /**
     * Delete current user's profile
     */
    async deleteProfile(): Promise<{ success: boolean; message: string }> {
        return apiRequest<{ success: boolean; message: string }>(API_ENDPOINTS.PROFILES, {
            method: 'DELETE',
        });
    },

    /**
     * Get profile matching validation and readiness assessment
     */
    async getMatchingValidation(): Promise<ProfileValidationResult> {
        return apiRequest<ProfileValidationResult>(`${API_ENDPOINTS.PROFILES}/matching-validation`);
    },

    /**
     * Get profile coverage report for scholarship eligibility
     */
    async getCoverageReport(): Promise<ProfileCoverageReport> {
        return apiRequest<ProfileCoverageReport>(`${API_ENDPOINTS.PROFILES}/coverage-report`);
    },

    /**
     * Upload profile photo
     */
    async uploadProfilePhoto(file: File): Promise<{ photo_url: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return apiRequest<{ photo_url: string }>(`${API_ENDPOINTS.PROFILES}/photo`, {
            method: 'POST',
            body: formData,
            headers: {}, // Remove Content-Type for FormData
        });
    },

    /**
     * Upload essay/document
     */
    async uploadEssay(essayType: string, file: File): Promise<{ essay_url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('essay_type', essayType);

        return apiRequest<{ essay_url: string }>(`${API_ENDPOINTS.PROFILES}/essay`, {
            method: 'POST',
            body: formData,
            headers: {}, // Remove Content-Type for FormData
        });
    },

    /**
     * Export profile data (for user data export)
     */
    async exportProfile(): Promise<Blob> {
        const response = await apiRequest<Blob>(`${API_ENDPOINTS.PROFILES}/export`, {
            method: 'GET',
        });
        return response;
    },

    /**
     * Import profile data from file
     */
    async importProfile(file: File): Promise<UserProfile> {
        const formData = new FormData();
        formData.append('file', file);

        return apiRequest<UserProfile>(`${API_ENDPOINTS.PROFILES}/import`, {
            method: 'POST',
            body: formData,
            headers: {}, // Remove Content-Type for FormData
        });
    },

    /**
     * Get profile completion tips based on current status
     */
    async getCompletionTips(): Promise<OptimizationSuggestion[]> {
        return apiRequest<OptimizationSuggestion[]>(`${API_ENDPOINTS.PROFILES}/completion-tips`);
    },

    /**
     * Preview how profile changes would affect scholarship matching
     */
    async previewProfileChanges(profileChanges: Partial<UserProfile>): Promise<{
        current_matches: number;
        projected_matches: number;
        match_difference: number;
        new_opportunities: string[];
    }> {
        return apiRequest<{
            current_matches: number;
            projected_matches: number;
            match_difference: number;
            new_opportunities: string[];
        }>(`${API_ENDPOINTS.PROFILES}/preview-changes`, {
            method: 'POST',
            body: JSON.stringify(profileChanges),
        });
    },

    /**
     * Get profile field validation rules
     */
    async getFieldValidationRules(): Promise<Record<string, {
        required: boolean;
        type: string;
        min?: number;
        max?: number;
        options?: string[];
        pattern?: string;
    }>> {
        return apiRequest<Record<string, {
            required: boolean;
            type: string;
            min?: number;
            max?: number;
            options?: string[];
            pattern?: string;
        }>>(`${API_ENDPOINTS.PROFILES}/field-rules`);
    },

    /**
     * Validate specific profile fields
     */
    async validateFields(fields: Record<string, any>): Promise<Record<string, {
        valid: boolean;
        errors: string[];
        suggestions?: string[];
    }>> {
        return apiRequest<Record<string, {
            valid: boolean;
            errors: string[];
            suggestions?: string[];
        }>>(`${API_ENDPOINTS.PROFILES}/validate-fields`, {
            method: 'POST',
            body: JSON.stringify(fields),
        });
    },

    /**
     * Get profile analytics (completion trends, time spent, etc.)
     */
    async getProfileAnalytics(): Promise<{
        completion_history: Array<{ date: string; percentage: number }>;
        time_spent_by_section: Record<string, number>;
        last_active: string;
        total_updates: number;
    }> {
        return apiRequest<{
            completion_history: Array<{ date: string; percentage: number }>;
            time_spent_by_section: Record<string, number>;
            last_active: string;
            total_updates: number;
        }>(`${API_ENDPOINTS.PROFILES}/analytics`);
    },

    /**
     * Share profile (generate shareable link)
     */
    async shareProfile(options: {
        expires_in?: number; // hours
        include_essays?: boolean;
        include_demographics?: boolean;
    } = {}): Promise<{
        share_url: string;
        expires_at: string;
        share_token: string;
    }> {
        return apiRequest<{
            share_url: string;
            expires_at: string;
            share_token: string;
        }>(`${API_ENDPOINTS.PROFILES}/share`, {
            method: 'POST',
            body: JSON.stringify(options),
        });
    },

    /**
     * Get shared profile by token (public access)
     */
    async getSharedProfile(shareToken: string): Promise<Partial<UserProfile>> {
        return apiRequest<Partial<UserProfile>>(`${API_ENDPOINTS.PROFILES}/shared/${shareToken}`);
    },

    /**
     * Revoke profile sharing
     */
    async revokeProfileSharing(): Promise<{ success: boolean }> {
        return apiRequest<{ success: boolean }>(`${API_ENDPOINTS.PROFILES}/revoke-sharing`, {
            method: 'POST',
        });
    },

    /**
     * Bulk update multiple profile fields (for form submissions)
     */
    async bulkUpdateFields(updates: Record<string, any>): Promise<UserProfile> {
        return apiRequest<UserProfile>(`${API_ENDPOINTS.PROFILES}/bulk-update`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    },

    /**
     * Get profile comparison with scholarship requirements
     */
    async compareWithScholarshipRequirements(scholarshipId: number): Promise<{
        eligible: boolean;
        match_score: number;
        matching_criteria: string[];
        missing_criteria: string[];
        recommendations: string[];
    }> {
        return apiRequest<{
            eligible: boolean;
            match_score: number;
            matching_criteria: string[];
            missing_criteria: string[];
            recommendations: string[];
        }>(`${API_ENDPOINTS.PROFILES}/compare-scholarship/${scholarshipId}`);
    },
};

// =========================
// PROFILE UTILITIES
// =========================

export const profileUtils = {
    /**
     * Calculate overall profile completion percentage
     */
    calculateCompletionPercentage(profile: UserProfile): number {
        const criticalFields = [
            'high_school_name', 'graduation_year', 'gpa', 'intended_major',
            'academic_interests', 'personal_statement'
        ];

        const optionalFields = [
            'sat_score', 'act_score', 'extracurricular_activities', 'volunteer_experience',
            'ethnicity', 'first_generation_college', 'household_income_range'
        ];

        let criticalCompleted = 0;
        let optionalCompleted = 0;

        criticalFields.forEach(field => {
            const value = profile[field as keyof UserProfile];
            if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim())) {
                criticalCompleted++;
            }
        });

        optionalFields.forEach(field => {
            const value = profile[field as keyof UserProfile];
            if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim())) {
                optionalCompleted++;
            }
        });

        // Weight critical fields more heavily
        const criticalWeight = 0.7;
        const optionalWeight = 0.3;

        const criticalScore = (criticalCompleted / criticalFields.length) * criticalWeight;
        const optionalScore = (optionalCompleted / optionalFields.length) * optionalWeight;

        return Math.round((criticalScore + optionalScore) * 100);
    },

    /**
     * Get missing critical fields
     */
    getMissingCriticalFields(profile: UserProfile): string[] {
        const criticalFields = [
            'high_school_name', 'graduation_year', 'gpa', 'intended_major',
            'academic_interests', 'personal_statement'
        ];

        return criticalFields.filter(field => {
            const value = profile[field as keyof UserProfile];
            return !value || (Array.isArray(value) && value.length === 0) || !String(value).trim();
        });
    },

    /**
     * Validate profile field
     */
    validateField(fieldName: string, value: any): { valid: boolean; error?: string } {
        switch (fieldName) {
            case 'gpa':
                if (typeof value !== 'number' || value < 0 || value > 4.0) {
                    return { valid: false, error: 'GPA must be between 0.0 and 4.0' };
                }
                break;
            case 'sat_score':
                if (value && (typeof value !== 'number' || value < 400 || value > 1600)) {
                    return { valid: false, error: 'SAT score must be between 400 and 1600' };
                }
                break;
            case 'act_score':
                if (value && (typeof value !== 'number' || value < 1 || value > 36)) {
                    return { valid: false, error: 'ACT score must be between 1 and 36' };
                }
                break;
            case 'graduation_year':
                const currentYear = new Date().getFullYear();
                if (typeof value !== 'number' || value < currentYear - 5 || value > currentYear + 10) {
                    return { valid: false, error: `Graduation year must be between ${currentYear - 5} and ${currentYear + 10}` };
                }
                break;
            case 'phone_number':
                if (value && !/^\(\d{3}\)\s\d{3}-\d{4}$/.test(value)) {
                    return { valid: false, error: 'Phone number must be in format (555) 123-4567' };
                }
                break;
            case 'date_of_birth':
                if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return { valid: false, error: 'Date of birth must be in YYYY-MM-DD format' };
                }
                break;
        }

        return { valid: true };
    },

    /**
     * Format profile field for display
     */
    formatFieldForDisplay(fieldName: string, value: any): string {
        if (!value) return 'Not specified';

        switch (fieldName) {
            case 'gpa':
                return `${value}/4.0`;
            case 'sat_score':
                return `${value}/1600`;
            case 'act_score':
                return `${value}/36`;
            case 'graduation_year':
                return `Class of ${value}`;
            case 'volunteer_hours':
                return `${value} hours`;
            case 'household_income_range':
                return value;
            case 'first_generation_college':
                return value ? 'Yes' : 'No';
            default:
                if (Array.isArray(value)) {
                    return value.join(', ');
                }
                return String(value);
        }
    },

    /**
     * Get profile section progress
     */
    getSectionProgress(profile: UserProfile): Record<string, number> {
        const sections = {
            basic_info: ['high_school_name', 'graduation_year', 'gpa', 'state'],
            academic_info: ['intended_major', 'academic_interests', 'sat_score', 'act_score'],
            activities: ['extracurricular_activities', 'volunteer_experience'],
            demographics: ['ethnicity', 'first_generation_college', 'household_income_range'],
            essays: ['personal_statement'],
            preferences: ['scholarship_types_interested']
        };

        const progress: Record<string, number> = {};

        Object.entries(sections).forEach(([sectionName, fields]) => {
            let completed = 0;
            fields.forEach(field => {
                const value = profile[field as keyof UserProfile];
                // For academic_info, either SAT or ACT counts as completion
                if (field === 'sat_score' && profile.act_score) return;
                if (field === 'act_score' && profile.sat_score) return;

                if (value && (Array.isArray(value) ? value.length > 0 : String(value).trim())) {
                    completed++;
                }
            });

            progress[sectionName] = Math.round((completed / fields.length) * 100);
        });

        return progress;
    },
};