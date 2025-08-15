// Updated DocumentsEssaysSection.tsx - Condensed Version

'use client';

import React, { useState } from 'react';
import { FileText, Download, Eye, ExternalLink, Upload, Edit3, CheckCircle } from 'lucide-react';
import { profileAPI } from '@/lib/api';

interface DocumentsEssaysSectionProps {
  uploads: {
    personal_statement?: string;
    career_essay?: string;
    athletic_impact_essay?: string;
  };
  onUploadSuccess?: () => void;
  disabled?: boolean;
}

const DocumentsEssaysSection: React.FC<DocumentsEssaysSectionProps> = ({
  uploads,
  onUploadSuccess,
  disabled = false
}) => {
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  // Format essay type for display
  const getDisplayName = (type: string) => {
    switch (type) {
      case 'personal_statement':
        return 'Personal Statement';
      case 'career_essay':
        return 'Career Essay';
      case 'athletic_impact_essay':
        return 'Athletic Impact Essay';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Check if content is a file path or direct text content
  const isFilePath = (content: string) => {
    return content.startsWith('/uploads/') || content.startsWith('http');
  };

  // Get file name from path
  const getFileName = (path: string) => {
    return path.split('/').pop() || 'Document';
  };

  // Handle file upload
  const handleFileUpload = async (essayType: string, file: File) => {
    setUploadingStates(prev => ({ ...prev, [essayType]: true }));

    try {
      await profileAPI.uploadEssay(essayType, file);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingStates(prev => ({ ...prev, [essayType]: false }));
    }
  };

  // Handle viewing uploaded content
  const handleViewContent = (essayType: string, content: string) => {
    if (isFilePath(content)) {
      const backendBaseUrl = "http://localhost:8000";
      const fullUrl = `${backendBaseUrl}${content}`;
      window.open(fullUrl, "_blank");
    }
  };

  const essayTypes: Array<'personal_statement' | 'career_essay' | 'athletic_impact_essay'> = [
    'personal_statement',
    'career_essay',
    'athletic_impact_essay'
  ];

  const completedCount = Object.values({
    personal_statement: uploads.personal_statement,
    career_essay: uploads.career_essay,
    athletic_impact_essay: uploads.athletic_impact_essay
  }).filter(Boolean).length;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText size={20} />
          Documents & Essays
        </h3>
        <div className="text-sm text-gray-400">
          {completedCount} of {essayTypes.length} completed
        </div>
      </div>

      {/* Single instruction text at top */}
      <div className="text-sm text-gray-400 mb-4 p-3 bg-gray-700/50 rounded-lg">
        Upload files (PDF, TXT, DOC, DOCX) or use the text editor to write directly
      </div>

      {/* Compact essay list */}
      <div className="space-y-3">
        {essayTypes.map((essayType) => {
          const content = uploads[essayType];
          const isUploading = uploadingStates[essayType];
          const hasContent = !!content;

          return (
            <div key={essayType} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              {/* Essay name and status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {hasContent && (
                    <CheckCircle size={16} className="text-green-400" />
                  )}
                  <span className="text-sm font-medium">{getDisplayName(essayType)}</span>
                </div>

                {/* Content info */}
                {hasContent && (
                  <span className="text-xs text-gray-400">
                    {isFilePath(content)
                      ? getFileName(content)
                      : `${content.length} chars`
                    }
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Loading indicator */}
                {isUploading && (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}

                {/* View button if content exists */}
                {hasContent && !isUploading && (
                  <button
                    onClick={() => handleViewContent(essayType, content)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="View content"
                  >
                    {isFilePath(content) ? <ExternalLink size={16} /> : <Eye size={16} />}
                  </button>
                )}

                {/* Upload button */}
                <label className="cursor-pointer" title="Upload file">
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(essayType, file);
                        e.target.value = ''; // Clear input
                      }
                    }}
                    className="hidden"
                    disabled={disabled || isUploading}
                  />
                  <Upload
                    size={16}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  />
                </label>

                {/* Text editor button */}
                <button
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Write text"
                  disabled={disabled || isUploading}
                >
                  <Edit3 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Essay completion</span>
          <span className="text-gray-300">{completedCount}/{essayTypes.length}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / essayTypes.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentsEssaysSection;