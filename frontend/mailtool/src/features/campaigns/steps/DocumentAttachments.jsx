import React, { useState } from 'react';
import { Upload, File, Trash2, Link2, ArrowRight } from 'lucide-react';

const DocumentAttachments = ({ onSave, onBack, availableVariables = [] }) => {
  const [documents, setDocuments] = useState([]);
  
  // Use first available variable or 'email' as default
  const defaultField = availableVariables.length > 0 ? availableVariables[0] : 'email';
  const [mappingField, setMappingField] = useState(defaultField);

  const handleFolderUpload = (e) => {
    const files = Array.from(e.target.files);
    const validDocs = files.filter(f => 
      f.type === 'application/pdf' || 
      f.name.endsWith('.pdf') ||
      f.name.endsWith('.docx') ||
      f.name.endsWith('.jpg') ||
      f.name.endsWith('.png')
    );

    // Convert files to base64 for storage
    const promises = validDocs.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            data: e.target.result, // Base64
            type: file.type,
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(docs => {
      setDocuments(prev => [...prev, ...docs]);
    });
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (documents.length === 0) {
      onSave(null); // No documents attached
      return;
    }

    onSave({
      documents,
      mappingField
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Attachments</h2>
        <p className="text-gray-600">Upload personalized documents and map them to contacts</p>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          1. Upload Documents
        </label>
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
          <Upload size={32} className="text-gray-400 mb-2 group-hover:text-blue-500" />
          <p className="text-sm text-gray-600 font-medium">Click to upload documents</p>
          <p className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG, PNG supported</p>
          <input 
            type="file" 
            className="hidden" 
            multiple
            webkitdirectory="true"
            directory="true"
            onChange={handleFolderUpload}
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: You can also select multiple files at once
        </p>
      </div>

      {/* Mapping Field Selection */}
      {documents.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            2. Match Documents by Field
          </label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Link2 size={20} className="text-blue-600" />
              <p className="text-sm text-gray-700">
                The tool will match document filenames to contact data
              </p>
            </div>
            <select
              value={mappingField}
              onChange={(e) => setMappingField(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableVariables.length > 0 ? (
                availableVariables.map(field => (
                  <option key={field} value={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </option>
                ))
              ) : (
                // Fallback options if no variables provided
                <>
                  <option value="email">Email</option>
                  <option value="firstName">First Name</option>
                  <option value="lastName">Last Name</option>
                </>
              )}
            </select>
            <p className="text-xs text-gray-600 mt-2">
              Example: If you select "{mappingField}" and upload <code className="bg-white px-1 rounded">John.pdf</code>, 
              it will be sent to the contact with {mappingField} = "John"
            </p>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            3. Uploaded Documents ({documents.length})
          </label>
          <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {documents.map((doc, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File size={20} className="text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="ml-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t mt-auto">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => onSave(null)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Skip Attachments
          </button>
          <button
            onClick={handleSave}
            disabled={documents.length === 0}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
              documents.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save & Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentAttachments;
