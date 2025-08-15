'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, X, AlertCircle, Edit3 } from 'lucide-react';
import { profileAPI } from '@/lib/api';

interface EssayUploadProps {
  essayType: 'personal_statement' | 'career_essay' | 'athletic_impact_essay';
  currentContent?: string;
  onUploadSuccess?: (essayType: string, content: string) => void;
  disabled?: boolean;
}

interface UploadStatus {
  type: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
}

const EssayUpload: React.FC<EssayUploadProps> = ({
  essayType,
  currentContent,
  onUploadSuccess,
  disabled = false
}) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: 'idle' });
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textContent, setTextContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a valid file (PDF, TXT, DOC, or DOCX)'
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadStatus({
        type: 'error',
        message: 'File is too large. Please select a file under 5MB.'
      });
      return;
    }

    try {
      setUploadStatus({ type: 'uploading', message: 'Uploading...' });
      
      const result = await profileAPI.uploadEssay(essayType, file);
      
      setUploadStatus({
        type: 'success',
        message: `${getDisplayName(essayType)} uploaded successfully!`
      });

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(essayType, file.name);
      }

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ type: 'idle' });
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      });
    }
  };

  // Handle text submission
  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      setUploadStatus({
        type: 'error',
        message: 'Please enter some text before saving.'
      });
      return;
    }

    try {
      setUploadStatus({ type: 'uploading', message: 'Saving...' });

      // Create a text file from the content
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new window.File([blob], `${essayType}.txt`, { type: 'text/plain' });

      const result = await profileAPI.uploadEssay(essayType, file);

      setUploadStatus({
        type: 'success',
        message: `${getDisplayName(essayType)} saved successfully!`
      });

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(essayType, textContent);
      }

      // Close text editor and clear content
      setShowTextEditor(false);
      setTextContent('');

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ type: 'idle' });
      }, 3000);

    } catch (error) {
      console.error('Save error:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Save failed. Please try again.'
      });
    }
  };

  // Handle clicking the upload area
  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Clear error message
  const clearStatus = () => {
    setUploadStatus({ type: 'idle' });
  };

  const hasContent = !!currentContent;
  const isLoading = uploadStatus.type === 'uploading';

  return (
    <div className="space-y-3">
      {/* Main Upload Area */}
      <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
        <span className="text-sm font-medium">{getDisplayName(essayType)}</span>
        
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          {hasContent && uploadStatus.type === 'idle' && (
            <CheckCircle size={16} className="text-green-400" />
          )}
          
          {isLoading && (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}

          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            disabled={disabled || isLoading}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Upload file"
          >
            <Upload size={16} />
          </button>

          {/* Text Editor Button */}
          <button
            onClick={() => setShowTextEditor(!showTextEditor)}
            disabled={disabled || isLoading}
            className="text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Write/paste text"
          >
            <Edit3 size={16} />
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
        disabled={disabled}
      />

      {/* Text Editor */}
      {showTextEditor && (
        <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">
              Write or paste your {getDisplayName(essayType).toLowerCase()}
            </h4>
            <button
              onClick={() => {
                setShowTextEditor(false);
                setTextContent('');
                clearStatus();
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder={`Enter your ${getDisplayName(essayType).toLowerCase()} here...`}
            rows={8}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-vertical"
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {textContent.length} characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowTextEditor(false);
                  setTextContent('');
                  clearStatus();
                }}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSubmit}
                disabled={isLoading || !textContent.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus.type !== 'idle' && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          uploadStatus.type === 'success' 
            ? 'bg-green-900/20 border border-green-800 text-green-400'
            : uploadStatus.type === 'error'
            ? 'bg-red-900/20 border border-red-800 text-red-400'
            : 'bg-blue-900/20 border border-blue-800 text-blue-400'
        }`}>
          {uploadStatus.type === 'success' && <CheckCircle size={16} />}
          {uploadStatus.type === 'error' && <AlertCircle size={16} />}
          {uploadStatus.type === 'uploading' && (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          
          <span>{uploadStatus.message}</span>
          
          {uploadStatus.type === 'error' && (
            <button
              onClick={clearStatus}
              className="ml-auto text-current hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Help Text */}
      {uploadStatus.type === 'idle' && !showTextEditor && (
        <p className="text-xs text-gray-500">
          Upload a file (PDF, TXT, DOC, DOCX) or use the text editor to write directly
        </p>
      )}
    </div>
  );
};

export default EssayUpload;
