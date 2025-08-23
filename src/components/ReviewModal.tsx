'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { reviewAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [existingReview, setExistingReview] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    const { user } = useAuth();

    // Check if user has existing review
    useEffect(() => {
        if (isOpen && user) {
            checkExistingReview();
        }
    }, [isOpen, user]);

    const checkExistingReview = async () => {
        try {
            const review = await reviewAPI.getMyReview();
            if (review) {
                // User has an existing review
                setExistingReview(review);
                setRating(review.rating);
                setTitle(review.title || '');
                setComment(review.comment || '');
                setIsEditing(true);
            } else {
                // No existing review
                setExistingReview(null);
                setIsEditing(false);
            }
        } catch (error) {
            // Some other error occurred
            console.error('Error checking for existing review:', error);
            setExistingReview(null);
            setIsEditing(false);
        }
    };

    const resetForm = () => {
        setRating(0);
        setHoverRating(0);
        setTitle('');
        setComment('');
        setError(null);
        setSuccess(false);
        setExistingReview(null);
        setIsEditing(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const reviewData = {
                rating,
                title: title.trim() || undefined,
                comment: comment.trim() || undefined,
            };

            if (isEditing) {
                await reviewAPI.updateMyReview(reviewData);
            } else {
                await reviewAPI.createReview(reviewData);
            }

            setSuccess(true);
            onReviewSubmitted?.();

            // Close modal after a brief success message
            setTimeout(() => {
                handleClose();
            }, 2000);

        } catch (error: any) {
            setError(error.message || 'Failed to submit review');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your review?')) {
            return;
        }

        setIsLoading(true);
        try {
            await reviewAPI.deleteMyReview();
            setSuccess(true);
            onReviewSubmitted?.();

            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (error: any) {
            setError(error.message || 'Failed to delete review');
        } finally {
            setIsLoading(false);
        }
    };

    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md relative">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-3xl mb-2">⭐</div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isEditing ? 'Update Your Review' : 'Share Your Experience'}
                    </h2>
                    <p className="text-gray-400">
                        {isEditing
                            ? 'Update your review of MagicScholar.com'
                            : 'Help other students by rating MagicScholar.com'
                        }
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <CheckCircle size={20} className="text-green-400" />
                        <div>
                            <p className="text-green-400 text-sm font-medium">
                                {isEditing ? 'Review Updated!' : 'Review Submitted!'}
                            </p>
                            <p className="text-green-300 text-sm">Thank you for your feedback!</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-400 text-sm font-medium mb-1">Error</p>
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating Stars */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Your Rating *
                            </label>
                            <div className="flex items-center gap-2 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="p-1 transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= (hoverRating || rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-600'
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {(hoverRating || rating) > 0 && (
                                <p className="text-sm text-gray-400">
                                    {ratingLabels[(hoverRating || rating) as keyof typeof ratingLabels]}
                                </p>
                            )}
                        </div>

                        {/* Review Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Review Title (Optional)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Sum up your experience in a few words"
                                maxLength={200}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                            <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Your Review (Optional)
                            </label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell other students about your experience using MagicScholar.com..."
                                    rows={4}
                                    maxLength={1000}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isLoading || rating === 0}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {isEditing ? 'Updating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    isEditing ? 'Update Review' : 'Submit Review'
                                )}
                            </button>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="px-4 py-3 border border-red-600 text-red-400 hover:bg-red-600/10 rounded-lg transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Your review will be visible to other students and help improve our platform
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;