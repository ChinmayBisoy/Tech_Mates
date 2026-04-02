import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

const DocumentUploader = ({ documentTypes, onUpload, existingDocuments = [] }) => {
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !file) return;

    setUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onUpload(selectedType, file.name);
      setFile(null);
      setSelectedType('');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Documents */}
      {existingDocuments.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            Uploaded Documents
          </h4>
          <div className="space-y-2">
            {existingDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`
                  border rounded p-3 flex items-center justify-between
                  ${getStatusColor(doc.status)}
                `}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(doc.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {documentTypes.find((dt) => dt.id === doc.type)?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {doc.fileName} • Uploaded {doc.uploadedAt}
                    </p>
                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Reason: {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-white/50 dark:bg-black/20">
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Form */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Type *
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={uploading}
              className={`
                w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <option value="">Select a document type</option>
              {documentTypes
                .filter((dt) => {
                  const uploaded = existingDocuments.find((d) => d.type === dt.id);
                  return !uploaded || uploaded.status === 'rejected';
                })
                .map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name} {dt.required ? '*' : '(Optional)'}
                  </option>
                ))}
            </select>
            {selectedType && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {documentTypes.find((dt) => dt.id === selectedType)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Upload
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading || !selectedType}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <label
                htmlFor="file-upload"
                className={`
                  flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed
                  cursor-pointer transition-colors
                  ${
                    file
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }
                  ${uploading || !selectedType ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file ? file.name : 'Click to upload or drag'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    PDF, DOC, JPG, PNG (Max 10MB)
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || !selectedType || uploading}
            className={`
              w-full py-2 px-4 rounded-lg font-medium transition-all
              ${
                file && selectedType && !uploading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploader;
