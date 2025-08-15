// API configuration and base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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

// API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',

    // User endpoints
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,

    // Profile endpoints
    PROFILES: '/profiles',
    PROFILE_BY_USER: (userId: number) => `/profiles/user/${userId}`,
    MY_PROFILE: '/profiles/me',
    PROFILE_UPDATE: '/profiles/update',
    PROFILE_SUMMARY: '/profiles/summary',

    // Scholarship endpoints
    SCHOLARSHIPS: '/scholarships',
    SCHOLARSHIP_SEARCH: '/scholarships/search',
    SCHOLARSHIP_BY_ID: (id: number) => `/scholarships/${id}`,
    ACTIVE_SCHOLARSHIPS: '/scholarships/active',
    SCHOLARSHIP_STATISTICS: '/scholarships/statistics',

    // Scholarship matching endpoints
    MY_SCHOLARSHIP_MATCHES: '/scholarships/my-matches',
    USER_SCHOLARSHIP_MATCHES: (userId: number) => `/scholarships/user-matches/${userId}`,

    // Platform statistics
    PLATFORM_STATISTICS: '/statistics/platform',

    // Review endpoints
    REVIEWS: '/reviews',
    MY_REVIEW: '/reviews/my',
    REVIEW_STATISTICS: '/reviews/statistics',
} as const;

// Helper function to make API requests
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // Debug logging
    console.log('API Request:', {
        url,
        method: options.method || 'GET',
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });

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

        // Debug response
        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
        });

        // Handle different response types
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Enhanced error handling for auth issues
            if (response.status === 401) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                }
                throw new Error('Not authenticated');
            }

            if (response.status === 403) {
                throw new Error('Not authenticated');
            }

            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Handle empty responses (like 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Profile API types
export interface UserProfile {
    id: number;
    user_id: number;
    profile_visibility: string;
    allow_scholarship_matching: boolean;

    // Personal Information
    middle_name?: string;
    phone?: string;
    date_of_birth?: string;
    profile_photo_url?: string;

    // Address Information
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;

    // Academic Information
    high_school_name?: string;
    graduation_year?: number;
    gpa?: number;
    class_rank?: number;
    class_size?: number;
    sat_score?: number;
    act_score?: number;

    // Athletic Information
    sports_played?: string[];
    athletic_positions?: { [key: string]: string };
    years_participated?: { [key: string]: number };
    team_captain?: string[];
    athletic_awards?: string[];

    // Community Service & Activities
    volunteer_hours?: number;
    volunteer_organizations?: string[];
    leadership_positions?: string[];
    extracurricular_activities?: string[];
    work_experience?: any[];

    // Academic Achievements
    honors_courses?: string[];
    academic_awards?: string[];

    // College Plans
    intended_major?: string;
    college_preferences?: string[];
    career_goals?: string;

    // Essays/Personal Statements
    personal_statement?: string;
    career_essay?: string;
    athletic_impact_essay?: string;

    // References
    references?: any[];

    // Privacy Settings
    field_privacy_settings?: { [key: string]: string };

    // Profile Completion
    profile_completed: boolean;
    completion_percentage: number;

    // Timestamps
    created_at: string;
    updated_at?: string;
}

export interface ProfileSummary {
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

// Scholarship matching types
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

// Auth-specific API functions
export const authAPI = {
    async login(email: string, password: string) {
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
            body: JSON.stringify({ email, password }),
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

// Profile API functions
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
                return null;
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

    // FIXED: Use correct endpoint paths
    async completeProfile() {
        return apiRequest<UserProfile>('/profiles/complete', {
            method: 'POST',
        });
    },

    async getProfileView() {
        return apiRequest<any>('/profiles/view');
    },

    // FIXED: Proper FormData handling
    async uploadProfilePhoto(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        // Get token manually for FormData requests
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        return fetch(`${API_BASE_URL}/profiles/upload/photo`, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData - let browser set it with boundary
                ...(token && { Authorization: `Bearer ${token}` })
            }
        }).then(async response => {
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },

    async uploadEssay(essayType: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        // Get token manually for FormData requests
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        return fetch(`${API_BASE_URL}/profiles/upload/essay?essay_type=${essayType}`, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData - let browser set it with boundary
                ...(token && { Authorization: `Bearer ${token}` })
            }
        }).then(async response => {
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },
};

// Scholarship matching API functions
export const scholarshipMatchingAPI = {
    /**
     * Get scholarship matches for the current user
     */
    async getMyMatches(limit: number = 10): Promise<ScholarshipMatchResponse> {
        const endpoint = `${API_ENDPOINTS.MY_SCHOLARSHIP_MATCHES}?limit=${limit}`;
        return apiRequest<ScholarshipMatchResponse>(endpoint);
    },

    /**
     * Get scholarship matches for a specific user (admin only)
     */
    async getUserMatches(userId: number, limit: number = 10): Promise<ScholarshipMatchResponse> {
        const endpoint = `${API_ENDPOINTS.USER_SCHOLARSHIP_MATCHES(userId)}?limit=${limit}`;
        return apiRequest<ScholarshipMatchResponse>(endpoint);
    },
};

// Platform statistics API
export const platformAPI = {
    async getStatistics() {
        return apiRequest<{
            total_users: number;
            total_scholarships: number;
            total_reviews: number;
            average_rating: number;
            rating_display: string;
            total_scholarship_amount: number;
            formatted_scholarship_amount: string;
        }>(API_ENDPOINTS.PLATFORM_STATISTICS);
    },
};

// Review API
export const reviewAPI = {
    async createReview(reviewData: {
        rating: number;
        title?: string;
        comment?: string;
    }) {
        return apiRequest<{
            id: number;
            user_id: number;
            rating: number;
            title?: string;
            comment?: string;
            created_at: string;
            user_name?: string;
        }>(API_ENDPOINTS.REVIEWS, {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    },

    async getMyReview() {
        try {
            return await apiRequest<{
                id: number;
                user_id: number;
                rating: number;
                title?: string;
                comment?: string;
                created_at: string;
                user_name?: string;
            }>(API_ENDPOINTS.MY_REVIEW);
        } catch (error: any) {
            // If it's a 404, return null instead of throwing
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                return null;
            }
            // Re-throw other errors
            throw error;
        }
    },

    async updateMyReview(reviewData: {
        rating?: number;
        title?: string;
        comment?: string;
    }) {
        return apiRequest<{
            id: number;
            user_id: number;
            rating: number;
            title?: string;
            comment?: string;
            created_at: string;
            updated_at?: string;
            user_name?: string;
        }>(API_ENDPOINTS.MY_REVIEW, {
            method: 'PUT',
            body: JSON.stringify(reviewData),
        });
    },

    async deleteMyReview() {
        return apiRequest(API_ENDPOINTS.MY_REVIEW, {
            method: 'DELETE',
        });
    },

    async getAllReviews(skip = 0, limit = 100) {
        return apiRequest<Array<{
            id: number;
            user_id: number;
            rating: number;
            title?: string;
            comment?: string;
            created_at: string;
            user_name?: string;
        }>>(`${API_ENDPOINTS.REVIEWS}?skip=${skip}&limit=${limit}`);
    },
};

// Scholarship helper functions
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