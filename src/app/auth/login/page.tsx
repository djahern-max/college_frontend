'use client';

import React from 'react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="text-center">
                {/* Main favicon elements for screenshot */}
                <div className="mb-8">
                    <div className="text-8xl mb-4">🪄🎓</div>
                </div>

                {/* Different sizes for reference */}
                <div className="space-y-6">
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm text-gray-500 w-12">16px:</span>
                        <div className="text-base">🪄🎓</div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm text-gray-500 w-12">32px:</span>
                        <div className="text-2xl">🪄🎓</div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm text-gray-500 w-12">64px:</span>
                        <div className="text-4xl">🪄🎓</div>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <span className="text-sm text-gray-500 w-12">128px:</span>
                        <div className="text-8xl">🪄🎓</div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-12 text-gray-600 text-sm max-w-md">
                    <p>Screenshot any size above, then use Canva to remove the white background and create your favicon!</p>
                </div>
            </div>
        </div>
    );
}