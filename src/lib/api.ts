// API configuration and base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// =========================
// ERROR CLASSES (Add these at the top)
// =========================
export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export class ValidationError extends APIError {
    constructor(message: string, public fields?: Record<string, string[]>) {
        super(message, 422, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends APIError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class AuthorizationError extends APIError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export class NotFoundError extends APIError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND_ERROR');
    }
}

export class ServerError extends APIError {
    constructor(message: string = 'Internal server error') {
        super(message, 500, 'SERVER_ERROR');
    }
}

// Helper function to get image URLs (images are served from backend root, not API path)
export const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;

    // If the path already includes the full URL, return as-is
    if (path.startsWith('http')) {
        return path;
    }

    // For images, use the backend root URL (without /api/v1)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${backendUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// API endpoints - Updated for FastAPI backend
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',

    // User endpoints
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,
    USER_ME: '/users/me',

    // Profile endpoints
    PROFILES: '/profiles',
    PROFILE_BY_USER: (userId: number) => `/profiles/user/${userId}`,
    MY_PROFILE: '/profiles/me',
    PROFILE_UPDATE: '/profiles/update',
    PROFILE_SUMMARY: '/profiles/summary',
    PROFILE_COMPLETE: '/profiles/complete',
    PROFILE_VIEW: '/profiles/view',

    // OAuth endpoints
    OAUTH_GOOGLE_URL: '/oauth/google/url',
    OAUTH_LINKEDIN_URL: '/oauth/linkedin/url',
    OAUTH_TIKTOK_URL: '/oauth/tiktok/url',
    OAUTH_ACCOUNTS: '/oauth/accounts',

    // Future endpoints (not implemented yet)
    SCHOLARSHIPS: '/scholarships',
    SCHOLARSHIP_SEARCH: '/scholarships/search',
    SCHOLARSHIP_BY_ID: (id: number) => `/scholarships/${id}`,
    ACTIVE_SCHOLARSHIPS: '/scholarships/active',
    SCHOLARSHIP_STATISTICS: '/scholarships/statistics',
    MY_SCHOLARSHIP_MATCHES: '/scholarships/my-matches',
    USER_SCHOLARSHIP_MATCHES: (userId: number) => `/scholarships/user-matches/${userId}`,
    PLATFORM_STATISTICS: '/statistics/platform',
    REVIEWS: '/reviews',
    MY_REVIEW: '/reviews/my',
    REVIEW_STATISTICS: '/reviews/statistics',
} as const;

// =========================
// IMPROVED API REQUEST FUNCTION
// =========================
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // Parse response body once
        let responseData;
        try {
            responseData = await response.json();
        } catch {
            responseData = {}; // Empty object if no JSON body
        }

        if (!response.ok) {
            // Handle specific error types based on status code
            switch (response.status) {
                case 400:
                    throw new ValidationError(
                        responseData.detail || 'Invalid request data',
                        responseData.errors || {}
                    );

                case 401:
                    // Clear token on authentication error
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('access_token');
                    }

                    // Different messages for different auth scenarios
                    if (endpoint === '/auth/login') {
                        throw new AuthenticationError('Invalid email or password');
                    } else {
                        throw new AuthenticationError('Your session has expired');
                    }

                case 403:
                    throw new AuthorizationError(
                        responseData.detail || 'You do not have permission to access this resource'
                    );

                case 404:
                    throw new NotFoundError(responseData.detail || 'Resource not found');

                case 422:
                    // FastAPI validation errors
                    let validationMessage = 'Please check your input';
                    let fieldErrors = {};

                    if (responseData.detail && Array.isArray(responseData.detail)) {
                        // Parse FastAPI validation errors
                        fieldErrors = responseData.detail.reduce((acc: any, error: any) => {
                            const field = error.loc?.[error.loc.length - 1] || 'general';
                            if (!acc[field]) acc[field] = [];
                            acc[field].push(error.msg);
                            return acc;
                        }, {});

                        validationMessage = Object.values(fieldErrors).flat().join(', ');
                    }

                    throw new ValidationError(validationMessage, fieldErrors);

                case 429:
                    throw new APIError('Too many requests. Please wait and try again.', 429, 'RATE_LIMIT');

                case 500:
                case 502:
                case 503:
                case 504:
                    throw new ServerError('Server error. Please try again later.');

                default:
                    throw new APIError(
                        responseData.detail || responseData.message || `HTTP ${response.status}`,
                        response.status
                    );
            }
        }

        return responseData;
    } catch (error) {
        // Network errors (no response from server)
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new APIError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
        }

        // Re-throw our custom errors
        if (error instanceof APIError) {
            throw error;
        }

        // Unknown errors
        throw new ServerError('An unexpected error occurred');
    }
}

// =========================
// ALL YOUR EXISTING INTERFACES AND CODE BELOW THIS LINE
// (Keep everything else exactly the same)
// =========================

// Profile API types - Updated for FastAPI backend
export interface UserProfile {
    id?: number;
    user_id?: number;

    // Basic Information
    date_of_birth?: string;
    phone_number?: string;
    high_school_name?: string;
    graduation_year?: number;
    gpa?: number;

    // Test Scores
    sat_score?: number;
    act_score?: number;

    // Academic Interests
    intended_major?: string;
    academic_interests?: string[];
    career_goals?: string[];

    // Activities & Experience
    extracurricular_activities?: string[];
    volunteer_experience?: string[];
    volunteer_hours?: number;
    work_experience?: any[];

    // Background & Demographics
    ethnicity?: string[];
    first_generation_college?: boolean;
    household_income_range?: string;

    // Location
    state?: string;
    city?: string;
    zip_code?: string;

    // College Plans
    preferred_college_size?: string;
    preferred_college_location?: string;
    college_application_status?: string;

    // Essays & Personal Statements
    personal_statement?: string;
    leadership_experience?: string;
    challenges_overcome?: string;

    // Scholarship Preferences
    scholarship_types_interested?: string[];
    application_deadline_preference?: string;

    // Additional Information
    languages_spoken?: string[];
    special_talents?: string[];
    additional_info?: string;

    // Profile Status
    profile_completed?: boolean;
    completion_percentage?: number;

    // Timestamps
    created_at?: string;
    updated_at?: string;
    completed_at?: string;
}

export interface ProfileSummary {
    profile_completed: boolean;
    completion_percentage: number;
    has_basic_info: boolean;
    has_academic_info: boolean;
    has_personal_info: boolean;
    missing_fields: string[];
}

// Keep existing scholarship types for future use
export interface ScholarshipMatch {
    id: number;
    title: string;
    provider: string;
    description?: string;
    amount_min?: string;
    amount_max?: string;
    amount_exact?: string;
    deadline?: string;
    scholarship_type: string;
    categories?: string[];
    verified: boolean;
    renewable: boolean;
    application_url?: string;
    contact_email?: string;
    created_at: string;
}

export interface ScholarshipMatchResponse {
    matches: ScholarshipMatch[];
    total_matches: number;
    average_match_score: number;
    user_id: number;
}

// Auth-specific API functions - Updated for FastAPI
export const authAPI = {
    async login(email: string, password: string) {
        // FastAPI uses OAuth2PasswordRequestForm which expects FormData
        const formData = new FormData();
        formData.append('username', email); // OAuth2 uses 'username' field for email
        formData.append('password', password);

        return apiRequest<{
            access_token: string;
            token_type: string;
            expires_in: number;
            user: {
                id: number;
                email: string;
                username: string;
                first_name?: string;
                last_name?: string;
                is_active: boolean;
                created_at: string;
            };
        }>(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {}, // Remove Content-Type for FormData
            body: formData,
        });
    },
    async register(userData: {
        email: string;
        username: string;
        password: string;
        first_name?: string;
        last_name?: string;
    }) {
        return apiRequest<{
            id: number;
            email: string;
            username: string;
            first_name?: string;
            last_name?: string;
            is_active: boolean;
            created_at: string;
        }>(API_ENDPOINTS.USERS, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    async logout() {
        return apiRequest(API_ENDPOINTS.LOGOUT, {
            method: 'POST',
        });
    },

    async getCurrentUser() {
        return apiRequest<{
            id: number;
            email: string;
            username: string;
            first_name?: string;
            last_name?: string;
            is_active: boolean;
            created_at: string;
        }>(API_ENDPOINTS.ME);
    },

    async refreshToken() {
        return apiRequest<{
            access_token: string;
            token_type: string;
            expires_in: number;
        }>(API_ENDPOINTS.REFRESH, {
            method: 'POST',
        });
    },
};

// Profile API functions - Updated for FastAPI
export const profileAPI = {
    async getMyProfile() {
        try {
            return await apiRequest<UserProfile>(API_ENDPOINTS.MY_PROFILE);
        } catch (error: any) {
            // If profile doesn't exist (404), return null
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                return null;
            }
            throw error;
        }
    },

    async getProfileSummary() {
        try {
            return await apiRequest<ProfileSummary>(API_ENDPOINTS.PROFILE_SUMMARY);
        } catch (error: any) {
            // If profile doesn't exist, return a default summary
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                return {
                    profile_completed: false,
                    completion_percentage: 0,
                    has_basic_info: false,
                    has_academic_info: false,
                    has_personal_info: false,
                    missing_fields: ['high_school_name', 'graduation_year', 'gpa', 'intended_major']
                };
            }
            throw error;
        }
    },

    async createProfile(profileData: Partial<UserProfile>) {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILES, {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    },

    async updateProfile(profileData: Partial<UserProfile>) {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILE_UPDATE, {
            method: 'PATCH',
            body: JSON.stringify(profileData),
        });
    },

    async getProfileByUserId(userId: number) {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILE_BY_USER(userId));
    },

    // For the Profile Builder auto-save functionality
    async saveProfileField(fieldName: string, value: any) {
        return this.updateProfile({ [fieldName]: value });
    },

    async completeProfile() {
        return apiRequest<UserProfile>(API_ENDPOINTS.PROFILE_COMPLETE, {
            method: 'POST',
        });
    },

    async getProfileView() {
        return apiRequest<any>(API_ENDPOINTS.PROFILE_VIEW);
    },

    // Note: File uploads not implemented in backend yet
    async uploadProfilePhoto(file: File) {
        throw new Error('Profile photo upload not implemented yet');
    },

    async uploadEssay(essayType: string, file: File) {
        throw new Error('Essay upload not implemented yet');
    },
};

// OAuth API functions - New for FastAPI backend
export const oauthAPI = {
    async getGoogleAuthUrl() {
        return apiRequest<{ url: string; state: string }>(API_ENDPOINTS.OAUTH_GOOGLE_URL);
    },

    async getLinkedInAuthUrl() {
        return apiRequest<{ url: string; state: string }>(API_ENDPOINTS.OAUTH_LINKEDIN_URL);
    },

    async getTikTokAuthUrl() {
        return apiRequest<{ url: string; state: string }>(API_ENDPOINTS.OAUTH_TIKTOK_URL);
    },

    async getConnectedAccounts() {
        return apiRequest<{ oauth_accounts: any[] }>(API_ENDPOINTS.OAUTH_ACCOUNTS);
    },
};

// Scholarship matching API functions - Placeholder for future implementation
export const scholarshipMatchingAPI = {
    async getMyMatches(limit: number = 10): Promise<ScholarshipMatchResponse> {
        throw new Error('Scholarship matching not implemented yet');
    },

    async getUserMatches(userId: number, limit: number = 10): Promise<ScholarshipMatchResponse> {
        throw new Error('Scholarship matching not implemented yet');
    },
};

// Platform statistics API - Placeholder for future implementation
export const platformAPI = {
    async getStatistics() {
        throw new Error('Platform statistics not implemented yet');
    },
};

// Review API - Placeholder for future implementation
export const reviewAPI = {
    async createReview(reviewData: { rating: number; title?: string; comment?: string; }) {
        throw new Error('Reviews not implemented yet');
    },

    async getMyReview() {
        return null; // Return null for now
    },

    async updateMyReview(reviewData: { rating?: number; title?: string; comment?: string; }) {
        throw new Error('Reviews not implemented yet');
    },

    async deleteMyReview() {
        throw new Error('Reviews not implemented yet');
    },

    async getAllReviews(skip = 0, limit = 100) {
        return []; // Return empty array for now
    },
};

// Keep all your existing helper functions
export const formatScholarshipAmount = (
    amountMin?: string | null,
    amountMax?: string | null,
    amountExact?: string | null
): string => {
    if (amountExact) {
        return `$${parseFloat(amountExact).toLocaleString()}`;
    }

    if (amountMin && amountMax) {
        const min = parseFloat(amountMin);
        const max = parseFloat(amountMax);
        if (min === max) {
            return `$${min.toLocaleString()}`;
        }
        return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }

    if (amountMin) {
        return `$${parseFloat(amountMin).toLocaleString()}+`;
    }

    if (amountMax) {
        return `Up to $${parseFloat(amountMax).toLocaleString()}`;
    }

    return 'Amount varies';
};

export const formatDeadline = (deadline?: string | null): string => {
    if (!deadline) return 'No deadline specified';

    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'Deadline passed';
    } else if (diffDays === 0) {
        return 'Due today';
    } else if (diffDays === 1) {
        return 'Due tomorrow';
    } else if (diffDays <= 30) {
        return `Due in ${diffDays} days`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

export const getScholarshipTypeBadgeColor = (scholarshipType: string): string => {
    const colors: Record<string, string> = {
        'athletic': 'bg-green-100 text-green-800 border-green-200',
        'merit': 'bg-blue-100 text-blue-800 border-blue-200',
        'need_based': 'bg-purple-100 text-purple-800 border-purple-200',
        'minority': 'bg-pink-100 text-pink-800 border-pink-200',
        'field_specific': 'bg-orange-100 text-orange-800 border-orange-200',
        'geographic': 'bg-teal-100 text-teal-800 border-teal-200',
        'first_generation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'community_service': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'other': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return colors[scholarshipType] || colors['other'];
};

// Re-export UserProfile type as UserProfileSummary for backwards compatibility
export type UserProfileSummary = ProfileSummary;