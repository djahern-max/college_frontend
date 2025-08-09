'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { scholarshipAPI, Scholarship, ScholarshipSearchParams } from '@/lib/scholarshipAPI';
import ScholarshipCard from './ScholarshipCard';
import { useAuth } from '@/context/AuthContext';

const ScholarshipSearch: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuth();

    // State
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search form state
    const [searchForm, setSearchForm] = useState<ScholarshipSearchParams>({
        query: searchParams.get('q') || '',
        scholarship_type: '',
        min_amount: undefined,
        max_amount: undefined,
        verified_only: false,
        renewable_only: false,
        skip: 0,
        limit: 12,
        sort_by: 'created_at',
        sort_order: 'desc',
    });

    // Scholarship types for filter
    const scholarshipTypes = [
        { value: '', label: 'All Types' },
        { value: 'merit', label: 'Merit-Based' },
        { value: 'need_based', label: 'Need-Based' },
        { value: 'athletic', label: 'Athletic' },
        { value: 'minority', label: 'Minority' },
        { value: 'field_specific', label: 'Field-Specific' },
        { value: 'geographic', label: 'Geographic' },
        { value: 'other', label: 'Other' },
    ];

    // Search function
    const performSearch = async (params: ScholarshipSearchParams) => {
        setLoading(true);
        setError(null);

        try {
            const response = await scholarshipAPI.searchScholarships(params);
            setScholarships(response.scholarships);
            setTotalCount(response.total_count);
            setCurrentPage(response.page);
        } catch (error) {
            console.error('Search failed:', error);
            setError('Failed to search scholarships. Please try again.');
            setScholarships([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Initial search on component mount
    useEffect(() => {
        performSearch(searchForm);
    }, []);

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const newParams = { ...searchForm, skip: 0 };
        setSearchForm(newParams);
        performSearch(newParams);
    };

    // Handle filter changes
    const handleFilterChange = (key: keyof ScholarshipSearchParams, value: any) => {
        const newParams = { ...searchForm, [key]: value, skip: 0 };
        setSearchForm(newParams);
        performSearch(newParams);
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        const skip = (page - 1) * (searchForm.limit || 12);
        const newParams = { ...searchForm, skip };
        setSearchForm(newParams);
        performSearch(newParams);
    };

    // Handle apply to scholarship
    const handleApplyToScholarship = async (scholarship: Scholarship) => {
        if (!isAuthenticated) {
            alert('Please log in to apply for scholarships');
            return;
        }

        try {
            await scholarshipAPI.recordApplication(scholarship.id);
            alert('Application recorded! Good luck!');

            // Open application URL if available
            if (scholarship.application_url) {
                window.open(scholarship.application_url, '_blank');
            }
        } catch (error) {
            console.error('Failed to record application:', error);
            alert('Failed to record application. Please try again.');
        }
    };

    const totalPages = Math.ceil(totalCount / (searchForm.limit || 12));

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                                Back to Home
                            </button>
                            <h1 className="text-3xl font-bold">Find Scholarships</h1>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <SlidersHorizontal size={18} />
                            Filters
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search scholarships by title, provider, or keyword..."
                                value={searchForm.query || ''}
                                onChange={(e) => setSearchForm({ ...searchForm, query: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-gray-800 border-b border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                <select
                                    value={searchForm.scholarship_type || ''}
                                    onChange={(e) => handleFilterChange('scholarship_type', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                >
                                    {scholarshipTypes.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount</label>
                                <input
                                    type="number"
                                    placeholder="$0"
                                    value={searchForm.min_amount || ''}
                                    onChange={(e) => handleFilterChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount</label>
                                <input
                                    type="number"
                                    placeholder="No limit"
                                    value={searchForm.max_amount || ''}
                                    onChange={(e) => handleFilterChange('max_amount', e.target.value ? Number(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={searchForm.verified_only || false}
                                        onChange={(e) => handleFilterChange('verified_only', e.target.checked)}
                                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                                    />
                                    <span className="text-sm text-gray-300">Verified only</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={searchForm.renewable_only || false}
                                        onChange={(e) => handleFilterChange('renewable_only', e.target.checked)}
                                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                                    />
                                    <span className="text-sm text-gray-300">Renewable only</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {loading ? 'Searching...' : `${totalCount.toLocaleString()} scholarships found`}
                        </h2>
                        {searchForm.query && (
                            <p className="text-gray-400">Results for "{searchForm.query}"</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={`${searchForm.sort_by}_${searchForm.sort_order}`}
                            onChange={(e) => {
                                const [sort_by, sort_order] = e.target.value.split('_');
                                handleFilterChange('sort_by', sort_by);
                                handleFilterChange('sort_order', sort_order);
                            }}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="created_at_desc">Newest First</option>
                            <option value="created_at_asc">Oldest First</option>
                            <option value="title_asc">Title A-Z</option>
                            <option value="title_desc">Title Z-A</option>
                        </select>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Scholarships Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-blue-400" />
                    </div>
                ) : scholarships.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {scholarships.map((scholarship) => (
                                <ScholarshipCard
                                    key={scholarship.id}
                                    scholarship={scholarship}
                                    onApply={handleApplyToScholarship}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 hover:bg-gray-600'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : !loading && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold mb-2">No scholarships found</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your search criteria or filters</p>
                        <button
                            onClick={() => {
                                setSearchForm({
                                    query: '',
                                    scholarship_type: '',
                                    min_amount: undefined,
                                    max_amount: undefined,
                                    verified_only: false,
                                    renewable_only: false,
                                    skip: 0,
                                    limit: 12,
                                    sort_by: 'created_at',
                                    sort_order: 'desc',
                                });
                                performSearch({
                                    skip: 0,
                                    limit: 12,
                                    sort_by: 'created_at',
                                    sort_order: 'desc',
                                });
                            }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScholarshipSearch;