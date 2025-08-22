'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
    htmlFor?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    required = false,
    children,
    className = '',
    htmlFor
}) => {
    return (
        <div className={`mb-4 ${className}`}>
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {error && (
                <div className="mt-1 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default FormField;
