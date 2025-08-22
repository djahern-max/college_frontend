// Helper functions for form validation
export const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 100) return 'Password must be less than 100 characters';
    return null;
};

export const validateUsername = (username: string): string | null => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 50) return 'Username must be less than 50 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value || value.trim() === '') return `${fieldName} is required`;
    return null;
};

export const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Phone is usually optional
    if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) return 'Please enter a valid phone number';
    return null;
};

export const validateGPA = (gpa: string): string | null => {
    if (!gpa) return null; // GPA might be optional
    const gpaNum = parseFloat(gpa);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
        return 'GPA must be between 0.0 and 4.0';
    }
    return null;
};
