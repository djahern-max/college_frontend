export class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export class ValidationError extends APIError {
    constructor(message: string, public fields?: Record<string, string[]>) {
        super(message, 422, 'VALIDATION_ERROR');
    }
}

export class AuthenticationError extends APIError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class AuthorizationError extends APIError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export class NotFoundError extends APIError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND_ERROR');
    }
}

export class ServerError extends APIError {
    constructor(message: string = 'Internal server error') {
        super(message, 500, 'SERVER_ERROR');
    }
}

