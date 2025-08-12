'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { profileAPI, ProfileSummary } from '@/lib/api';
import { useAuth } from './AuthContext';

interface ProfileContextType {
    profileSummary: ProfileSummary | null;
    isProfileCompleted: boolean;
    isLoading: boolean;
    error: string | null;
    refreshProfileStatus: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, user } = useAuth();

    const isProfileCompleted = profileSummary?.profile_completed === true;

    const refreshProfileStatus = async () => {
        if (!isAuthenticated || !user) {
            setProfileSummary(null);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const summary = await profileAPI.getProfileSummary();
            setProfileSummary(summary);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load profile status';
            setError(errorMessage);
            console.error('Failed to load profile status:', err);

            // If we get a profile not found error, treat it as no profile exists
            if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                setProfileSummary(null);
                setError(null); // Don't show error for missing profile
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Load profile status when user authentication status changes
    useEffect(() => {
        if (isAuthenticated && user) {
            refreshProfileStatus();
        } else {
            setProfileSummary(null);
            setError(null);
        }
    }, [isAuthenticated, user]);

    const value: ProfileContextType = {
        profileSummary,
        isProfileCompleted,
        isLoading,
        error,
        refreshProfileStatus,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

// Custom hook to use profile context
export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}