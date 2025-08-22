'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
    error?: string;
    className?: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
    if (!error) return null;

    return (
        <div className={`flex items-center gap-1 text-red-600 text-sm mt-1 ${className}`}>
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{error}</span>
        </div>
    );
};

export default FieldError;
