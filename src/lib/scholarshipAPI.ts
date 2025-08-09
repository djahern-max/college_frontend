import { apiRequest, API_ENDPOINTS } from './api';

export interface Scholarship {
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

export interface ScholarshipSearchParams {
    query?: string;
    provider?: string;
    scholarship_type?: string;
    categories?: string;
    min_amount?: number;
    max_amount?: number;
    deadline_after?: string;
    deadline_before?: string;
    verified_only?: boolean;
    renewable_only?: boolean;
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface SearchResponse {
    scholarships: Scholarship[];
    total_count: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export const scholarshipAPI = {
    async searchScholarships(params: ScholarshipSearchParams): Promise<SearchResponse> {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value.toString());
            }
        });

        const endpoint = `${API_ENDPOINTS.SCHOLARSHIP_SEARCH}?${searchParams.toString()}`;
        return apiRequest<SearchResponse>(endpoint);
    },

    async getActiveScholarships(skip = 0, limit = 50): Promise<Scholarship[]> {
        const endpoint = `${API_ENDPOINTS.ACTIVE_SCHOLARSHIPS}?skip=${skip}&limit=${limit}`;
        return apiRequest<Scholarship[]>(endpoint);
    },

    async getScholarshipById(id: number): Promise<Scholarship> {
        return apiRequest<Scholarship>(API_ENDPOINTS.SCHOLARSHIP_BY_ID(id));
    },

    async getScholarshipStatistics() {
        return apiRequest(API_ENDPOINTS.SCHOLARSHIP_STATISTICS);
    },

    async recordApplication(scholarshipId: number) {
        return apiRequest(`/scholarships/${scholarshipId}/apply`, {
            method: 'POST',
        });
    },
};