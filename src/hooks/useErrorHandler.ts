import { useState, useCallback } from 'react';

interface FormErrors {
    [key: string]: string;
}

export const useErrorHandler = () => {
    const [errors, setErrors] = useState<FormErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    const setFieldError = useCallback((field: string, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    }, []);

    const clearFieldError = useCallback((field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const clearAllErrors = useCallback(() => {
        setErrors({});
        setGeneralError(null);
    }, []);

    const handleAPIError = useCallback((error: any, fieldMap?: { [key: string]: string }) => {
        // Clear existing errors
        clearAllErrors();

        // Handle different error types
        if (error?.response?.status === 422 && error?.response?.data?.detail) {
            // FastAPI validation errors
            const details = error.response.data.detail;
            if (Array.isArray(details)) {
                details.forEach((detail: any) => {
                    const field = detail.loc?.[detail.loc.length - 1];
                    const mappedField = fieldMap?.[field] || field;
                    if (mappedField) {
                        setFieldError(mappedField, detail.msg);
                    } else {
                        setGeneralError(detail.msg);
                    }
                });
            } else {
                setGeneralError(details);
            }
        } else if (error?.response?.data?.detail) {
            // Standard API errors
            setGeneralError(error.response.data.detail);
        } else if (error?.message) {
            // JavaScript errors
            setGeneralError(error.message);
        } else {
            // Unknown errors
            setGeneralError('An unexpected error occurred. Please try again.');
        }
    }, [clearAllErrors, setFieldError]);

    return {
        errors,
        generalError,
        setFieldError,
        clearFieldError,
        setGeneralError,
        clearAllErrors,
        handleAPIError
    };
};