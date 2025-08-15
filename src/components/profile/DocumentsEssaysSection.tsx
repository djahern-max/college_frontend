'use client';

import React, { useState } from 'react';
import { FileText, Download, Eye, ExternalLink, Copy, FileDown } from 'lucide-react';
import EssayUpload from './EssayUpload';

interface DocumentsEssaysSectionProps {
  uploads: {
    personal_statement?: string;
    career_essay?: string;
    athletic_impact_essay?: string;
  };
  onUploadSuccess?: () => void; // Callback to refresh profile data
  disabled?: boolean;
}

const DocumentsEssaysSection: React.FC<DocumentsEssaysSectionProps> = ({
  uploads,
  onUploadSuccess,
  disabled = false
}) => {
  console.log("=== DEBUGGING UPLOADS DATA ===");
  console.log("Raw uploads object:", uploads);
  console.log("Personal statement:", uploads.personal_statement);
  console.log("Career essay:", uploads.career_essay);
  console.log("Athletic impact essay:", uploads.athletic_impact_essay);
  console.log("=== END DEBUG ===");

  const [previewContent, setPreviewContent] = useState<{ type: string; content: string } | null>(null);
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handle successful upload
  const handleUploadSuccess = (essayType: string, content: string) => {
    console.log(`${essayType} uploaded successfully:`, content);

    // Call parent callback to refresh data
    if (onUploadSuccess) {
      onUploadSuccess();
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

  // Handle viewing uploaded content
  const handleViewContent = (essayType: string, content: string) => {
    console.log("handleViewContent called with:", { essayType, content });
    console.log("isFilePath result:", isFilePath(content));
    if (isFilePath(content)) {
      // Construct the correct backend URL for file access
      const backendBaseUrl = "http://localhost:8000";
      const fullUrl = `${backendBaseUrl}${content}`;
      console.log("Opening file at:", fullUrl);
      window.open(fullUrl, "_blank");
    } else {
      // If it's direct text content, show in preview modal
      setPreviewContent({ type: essayType, content });
    }
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewContent(null);
    setExportStatus(null);
  };

  // Export functions
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setExportStatus({ type: 'success', message: 'Copied to clipboard!' });
      setTimeout(() => setExportStatus(null), 2000);
    } catch (err) {
      setExportStatus({ type: 'error', message: 'Failed to copy to clipboard' });
      setTimeout(() => setExportStatus(null), 2000);
    }
  };

  const downloadAsText = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus({ type: 'success', message: 'Downloaded as text file!' });
      setTimeout(() => setExportStatus(null), 2000);
    } catch (err) {
      setExportStatus({ type: 'error', message: 'Failed to download file' });
      setTimeout(() => setExportStatus(null), 2000);
    }
  };

  const downloadAsPDF = (content: string, filename: string) => {
    try {
      // Create a simple HTML structure for PDF conversion
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            h1 { color: #333; margin-bottom: 20px; }
            p { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h1>${filename.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
          <div>${content.replace(/\n/g, '</p><p>')}</div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus({ type: 'success', message: 'Downloaded as HTML file! (Open in browser and print to PDF)' });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (err) {
      setExportStatus({ type: 'error', message: 'Failed to download file' });
      setTimeout(() => setExportStatus(null), 2000);
    }
  };

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

  const essayTypes: Array<'personal_statement' | 'career_essay' | 'athletic_impact_essay'> = [
    'personal_statement',
    'career_essay',
    'athletic_impact_essay'
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText size={20} />
          Documents & Essays
        </h3>

        {/* Only count essays, not profile photo */}
        <div className="text-sm text-gray-400">
          {Object.values({ personal_statement: uploads.personal_statement, career_essay: uploads.career_essay, athletic_impact_essay: uploads.athletic_impact_essay }).filter(Boolean).length} of {essayTypes.length} completed
        </div>
      </div>

      {/* Upload Components */}
      <div className="space-y-4">
        {essayTypes.map((essayType) => (
          <div key={essayType} className="space-y-2">
            <EssayUpload
              essayType={essayType}
              currentContent={uploads[essayType]}
              onUploadSuccess={handleUploadSuccess}
              disabled={disabled}
            />

            {/* Show uploaded content info */}
            {uploads[essayType] && (
              <div className="flex items-center gap-2 text-xs text-gray-400 ml-3">
                <FileText size={12} />
                <span>
                  {isFilePath(uploads[essayType]!)
                    ? `File: ${getFileName(uploads[essayType]!)}`
                    : `Text content (${uploads[essayType]!.length} characters)`
                  }
                </span>

                {/* View button */}
                <button
                  onClick={() => handleViewContent(essayType, uploads[essayType]!)}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {isFilePath(uploads[essayType]!) ? (
                    <>
                      <ExternalLink size={12} />
                      Open
                    </>
                  ) : (
                    <>
                      <Eye size={12} />
                      View
                    </>
                  )}
                </button>

                {/* Export button for text content */}
                {!isFilePath(uploads[essayType]!) && (
                  <button
                    onClick={() => downloadAsText(uploads[essayType]!, essayType)}
                    className="text-green-400 hover:text-green-300 flex items-center gap-1"
                    title="Export as text file"
                  >
                    <Download size={12} />
                    Export
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Essay completion</span>
          <span className="text-gray-300">
            {Object.values({ personal_statement: uploads.personal_statement, career_essay: uploads.career_essay, athletic_impact_essay: uploads.athletic_impact_essay }).filter(Boolean).length}/{essayTypes.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(Object.values({ personal_statement: uploads.personal_statement, career_essay: uploads.career_essay, athletic_impact_essay: uploads.athletic_impact_essay }).filter(Boolean).length / essayTypes.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Preview Modal with Export Options */}
      {previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl max-h-[80vh] w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h4 className="text-lg font-semibold">
                {getDisplayName(previewContent.type)}
              </h4>
              <div className="flex items-center gap-2">
                {/* Export buttons */}
                <button
                  onClick={() => copyToClipboard(previewContent.content)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                  Copy
                </button>
                <button
                  onClick={() => downloadAsText(previewContent.content, previewContent.type)}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                  title="Download as text file"
                >
                  <FileDown size={14} />
                  TXT
                </button>
                <button
                  onClick={() => downloadAsPDF(previewContent.content, previewContent.type)}
                  className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
                  title="Download as HTML (for PDF conversion)"
                >
                  <FileDown size={14} />
                  HTML
                </button>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Export Status */}
            {exportStatus && (
              <div className={`px-4 py-2 text-sm ${exportStatus.type === 'success'
                  ? 'bg-green-900/20 text-green-400 border-b border-green-800'
                  : 'bg-red-900/20 text-red-400 border-b border-red-800'
                }`}>
                {exportStatus.message}
              </div>
            )}

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-160px)]">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
                  {previewContent.content}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <span className="text-xs text-gray-500">
                {previewContent.content.length} characters • {previewContent.content.split(/\s+/).length} words
              </span>
              <button
                onClick={closePreview}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsEssaysSection;