// API configuration and base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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

    // Scholarship endpoints
    SCHOLARSHIPS: '/scholarships',
    SCHOLARSHIP_SEARCH: '/scholarships/search',
    SCHOLARSHIP_BY_ID: (id: number) => `/scholarships/${id}`,
    ACTIVE_SCHOLARSHIPS: '/scholarships/active',
    SCHOLARSHIP_STATISTICS: '/scholarships/statistics',

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

        // Handle different response types
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
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