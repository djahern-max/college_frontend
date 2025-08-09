'use client';

import React, { useState } from 'react';
import Navigation from './Navigation';
import AuthModal from './AuthModal';
import ReviewModal from './ReviewModal';
import { platformAPI } from '@/lib/api';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    const handleOpenAuthModal = (mode: 'login' | 'register') => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    };

    const handleOpenReviewModal = () => {
        setReviewModalOpen(true);
    };

    const handleReviewSubmitted = async () => {
        // You can add any global refresh logic here if needed
        // For now, individual pages will handle their own refreshes
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navigation
                onOpenAuthModal={handleOpenAuthModal}
                onOpenReviewModal={handleOpenReviewModal}
            />

            <main>{children}</main>

            {/* Global Modals */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authModalMode}
            />

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </div>
    );
};

export default Layout;