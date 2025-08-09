'use client';

import React from 'react';
import { Calendar, DollarSign, MapPin, CheckCircle, ExternalLink, BookOpen, Users } from 'lucide-react';
import { Scholarship } from '@/lib/scholarshipAPI';

interface ScholarshipCardProps {
    scholarship: Scholarship;
    onApply?: (scholarship: Scholarship) => void;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ scholarship, onApply }) => {
    const formatAmount = (scholarship: Scholarship) => {
        if (scholarship.amount_exact) {
            return `$${parseFloat(scholarship.amount_exact).toLocaleString()}`;
        } else if (scholarship.amount_min && scholarship.amount_max) {
            return `$${parseFloat(scholarship.amount_min).toLocaleString()} - $${parseFloat(scholarship.amount_max).toLocaleString()}`;
        } else if (scholarship.amount_min) {
            return `$${parseFloat(scholarship.amount_min).toLocaleString()}+`;
        } else if (scholarship.amount_max) {
            return `Up to $${parseFloat(scholarship.amount_max).toLocaleString()}`;
        }
        return 'Amount varies';
    };

    const formatDeadline = (deadline?: string) => {
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
        } else if (diffDays <= 7) {
            return `Due in ${diffDays} days`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    const getTypeColor = (type: string) => {
        const colors = {
            MERIT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            NEED_BASED: 'bg-green-500/10 text-green-400 border-green-500/20',
            ATHLETIC: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            MINORITY: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            FIELD_SPECIFIC: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            GEOGRAPHIC: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            OTHER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            // Legacy lowercase support
            merit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            need_based: 'bg-green-500/10 text-green-400 border-green-500/20',
            athletic: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            minority: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            field_specific: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            geographic: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        return colors[type as keyof typeof colors] || colors.OTHER;
    };

    const isDeadlineSoon = (deadline?: string) => {
        if (!deadline) return false;
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    };

    const isDeadlinePassed = (deadline?: string) => {
        if (!deadline) return false;
        const date = new Date(deadline);
        const now = new Date();
        return date < now;
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-xl group h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {scholarship.title}
                        </h3>
                        {scholarship.verified && (
                            <div title="Verified scholarship">
                                <CheckCircle size={18} className="text-green-400" />
                            </div>
                        )}
                    </div>
                    <p className="text-gray-300 font-medium">{scholarship.provider}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(scholarship.scholarship_type)}`}>
                        {scholarship.scholarship_type.replace('_', ' ').toUpperCase()}
                    </span>
                    {scholarship.renewable && (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                            Renewable
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="flex-grow">
                {scholarship.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {scholarship.description}
                    </p>
                )}

                {/* Key Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-400" />
                        <span className="text-white font-semibold">{formatAmount(scholarship)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar size={16} className={isDeadlineSoon(scholarship.deadline) ? "text-orange-400" : "text-gray-400"} />
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

            {/* Actions - ONLY ONE BUTTON */}
            <div className="mt-auto">
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
                            ? 'No Application URL'
                            : 'Deadline Passed'
                        }
                    </button>
                )}

                {/* Contact info */}
                {scholarship.contact_email && (
                    <div className="pt-3 border-t border-gray-700 mt-3">
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