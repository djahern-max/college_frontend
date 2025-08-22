import { useState, useCallback } from 'react';

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    custom?: (value: any) => string | null;
    message?: string;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export interface FormErrors {
    [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
    const [errors, setErrors] = useState<FormErrors>({});

    const validateField = useCallback((field: string, value: any): string | null => {
        const rule = rules[field];
        if (!rule) return null;

        // Required validation
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            return rule.message || `${field} is required`;
        }

        // Skip other validations if field is empty and not required
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return null;
        }

        const stringValue = String(value);

        // Email validation
        if (rule.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(stringValue)) {
                return rule.message || 'Please enter a valid email address';
            }
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(stringValue)) {
            return rule.message || `${field} format is invalid`;
        }

        // Length validations
        if (rule.minLength && stringValue.length < rule.minLength) {
            return rule.message || `${field} must be at least ${rule.minLength} characters`;
        }

        if (rule.maxLength && stringValue.length > rule.maxLength) {
            return rule.message || `${field} must be no more than ${rule.maxLength} characters`;
        }

        // Custom validation
        if (rule.custom) {
            return rule.custom(value);
        }

        return null;
    }, [rules]);

    const validateForm = useCallback((formData: any): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        Object.keys(rules).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [rules, validateField]);

    const validateSingleField = useCallback((field: string, value: any) => {
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));
        return !error;
    }, [validateField]);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const clearFieldError = useCallback((field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    return {
        errors,
        validateForm,
        validateSingleField,
        clearErrors,
        clearFieldError,
        setErrors
    };
};
