// ============ src/components/ErrorMessage.tsx ============
'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
    message?: string | null;
    onDismiss?: () => void;
    className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    onDismiss,
    className = ''
}) => {
    if (!message) return null;

    return (
        <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start gap-2 ${className}`}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="flex-1 text-sm">{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                    aria-label="Dismiss error"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;

