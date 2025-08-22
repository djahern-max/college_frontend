export interface APIError {
    message: string;
    code?: string;
    field?: string;
    statusCode?: number;
}

export interface ValidationErrors {
    [key: string]: string[];
}

export class APIException extends Error {
    public statusCode: number;
    public code?: string;
    public field?: string;
    public validationErrors?: ValidationErrors;

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string,
        field?: string,
        validationErrors?: ValidationErrors
    ) {
        super(message);
        this.name = 'APIException';
        this.statusCode = statusCode;
        this.code = code;
        this.field = field;
        this.validationErrors = validationErrors;
    }
}

export const parseAPIError = (error: any): APIError => {
    // Handle network errors
    if (!error.response) {
        return {
            message: 'Network error. Please check your connection and try again.',
            statusCode: 0
        };
    }

    const { status, data } = error.response;

    // Handle FastAPI validation errors (422)
    if (status === 422 && data?.detail) {
        if (Array.isArray(data.detail)) {
            // Handle pydantic validation errors
            const validationError = data.detail[0];
            const field = validationError.loc?.[validationError.loc.length - 1];
            return {
                message: validationError.msg || 'Validation error',
                code: validationError.type,
                field: field,
                statusCode: status
            };
        }
    }

    // Handle standard API errors
    if (data?.detail) {
        return {
            message: typeof data.detail === 'string' ? data.detail : 'An error occurred',
            statusCode: status
        };
    }

    // Handle generic HTTP errors
    const statusMessages: { [key: number]: string } = {
        400: 'Bad request. Please check your input.',
        401: 'Authentication required. Please log in.',
        403: 'Access denied. You don\'t have permission to perform this action.',
        404: 'Resource not found.',
        409: 'Conflict. The resource already exists or is in use.',
        429: 'Too many requests. Please try again later.',
        500: 'Server error. Please try again later.',
        502: 'Server temporarily unavailable. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.'
    };

    return {
        message: statusMessages[status] || 'An unexpected error occurred',
        statusCode: status
    };
};