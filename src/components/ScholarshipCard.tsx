import React, { useState } from 'react';
import { Calendar, DollarSign, MapPin, CheckCircle, ExternalLink, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Scholarship } from '@/lib/scholarshipAPI';

interface ScholarshipCardProps {
    scholarship: Scholarship;
    onApply?: (scholarship: Scholarship) => void;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship, onApply }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatAmount = (scholarship: Scholarship) => {
        if (scholarship.amount_exact) {
            return `${parseFloat(scholarship.amount_exact).toLocaleString()}`;
        } else if (scholarship.amount_min && scholarship.amount_max) {
            return `${parseFloat(scholarship.amount_min).toLocaleString()} - ${parseFloat(scholarship.amount_max).toLocaleString()}`;
        } else if (scholarship.amount_min) {
            return `${parseFloat(scholarship.amount_min).toLocaleString()}+`;
        } else if (scholarship.amount_max) {
            return `Up to ${parseFloat(scholarship.amount_max).toLocaleString()}`;
        }
        return 'Amount varies';
    };

    const formatDeadline = (deadline?: string | null) => {
        if (!deadline) return 'No deadline specified';

        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const formattedDate = deadlineDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        if (diffDays < 0) {
            return 'Deadline passed';
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else if (diffDays <= 7) {
            return `Due in ${diffDays} days`;
        }

        return formattedDate;
    };

    const isDeadlineSoon = (deadline?: string | null) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    };

    const isDeadlinePassed = (deadline?: string | null) => {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        return deadlineDate.getTime() < now.getTime();
    };

    // Truncate description for preview
    const PREVIEW_LENGTH = 120;
    const shouldShowReadMore = scholarship.description && scholarship.description.length > PREVIEW_LENGTH;
    const displayDescription = scholarship.description || 'No description available';
    const truncatedDescription = shouldShowReadMore && !isExpanded
        ? displayDescription.substring(0, PREVIEW_LENGTH) + '...'
        : displayDescription;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors duration-200 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                        {scholarship.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {scholarship.provider}
                    </p>
                </div>

                {/* Scholarship Type Badge */}
                {scholarship.scholarship_type && (
                    <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded text-xs font-medium uppercase tracking-wide ml-3 flex-shrink-0">
                        {scholarship.scholarship_type.replace('_', ' ')}
                    </span>
                )}

                {/* Verified Badge */}
                {scholarship.verified && (
                    <div className="ml-2 flex-shrink-0 group relative">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div className="absolute top-6 right-0 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            Verified Scholarship
                        </div>
                    </div>
                )}
            </div>

            {/* Content that can expand */}
            <div className="flex-1 mb-4">
                {/* Description with Read More */}
                <div className="mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {truncatedDescription}
                    </p>

                    {shouldShowReadMore && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
                        >
                            {isExpanded ? (
                                <>
                                    <span>Read Less</span>
                                    <ChevronUp size={14} />
                                </>
                            ) : (
                                <>
                                    <span>Read More</span>
                                    <ChevronDown size={14} />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Amount and Deadline */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-green-400" />
                        <span className="text-green-400 font-semibold">
                            {formatAmount(scholarship)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Calendar size={14} className={isDeadlineSoon(scholarship.deadline) ?
                            "text-orange-400" : "text-gray-400"} />
                        <span className={`text-sm ${isDeadlineSoon(scholarship.deadline) ? "text-orange-400 font-medium" : "text-gray-400"}`}>
                            {formatDeadline(scholarship.deadline)}
                        </span>
                    </div>
                </div>

                {/* Categories */}
                {scholarship.categories && scholarship.categories.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {scholarship.categories.slice(0, 3).map((category, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                                >
                                    {category}
                                </span>
                            ))}
                            {scholarship.categories.length > 3 && (
                                <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                                    +{scholarship.categories.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions - This will always be at the bottom */}
            <div className="mt-auto">
                <div className="mb-3">
                    {scholarship.application_url && !isDeadlinePassed(scholarship.deadline) ? (
                        <a
                            href={scholarship.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onApply?.(scholarship)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
                            title="Apply for this scholarship"
                        >
                            <BookOpen size={16} />
                            Apply Now
                            <ExternalLink size={14} className="ml-1" />
                        </a>
                    ) : (
                        <button
                            disabled
                            className="w-full bg-gray-600 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                            title={
                                !scholarship.application_url
                                    ? 'Application URL not available'
                                    : 'Application deadline has passed'
                            }
                        >
                            <BookOpen size={16} />
                            {!scholarship.application_url
                                ? 'No Application Link'
                                : 'Deadline Passed'}
                        </button>
                    )}
                </div>

                {/* Contact info */}
                {scholarship.contact_email && (
                    <div className="pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-500">
                            Contact: {scholarship.contact_email}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScholarshipCard;