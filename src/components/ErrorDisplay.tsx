'use client';

import React from 'react';
import { AlertCircle, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface ErrorDisplayProps {
    error?: string | null;
    type?: 'error' | 'success' | 'warning' | 'info';
    onDismiss?: () => void;
    className?: string;
    showIcon?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    type = 'error',
    onDismiss,
    className = '',
    showIcon = true
}) => {
    if (!error) return null;

    const baseClasses = 'p-3 rounded-md border text-sm flex items-start gap-2 mb-4';

    const typeStyles = {
        error: 'bg-red-50 border-red-200 text-red-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const icons = {
        error: AlertCircle,
        success: CheckCircle,
        warning: AlertTriangle,
        info: Info
    };

    const Icon = icons[type];

    return (
        <div className={`${baseClasses} ${typeStyles[type]} ${className}`}>
            {showIcon && <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span className="flex-1">{error}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default ErrorDisplay;