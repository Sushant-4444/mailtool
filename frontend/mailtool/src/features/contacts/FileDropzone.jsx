import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';

const FileDropzone = ({ onDrop }) => {
  const handleDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onDrop(acceptedFiles[0]);
    }
  }, [onDrop]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive, 
    isDragReject,
    fileRejections 
  } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1, // Only allow one file at a time
    multiple: false
  });

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            {/* Dynamic Icon based on state */}
            {isDragActive ? (
                <UploadCloud size={48} className="mb-4 text-blue-500 animate-bounce" />
            ) : isDragReject ? (
                <AlertCircle size={48} className="mb-4 text-red-500" />
            ) : (
                <FileSpreadsheet size={48} className="mb-4 text-gray-400" />
            )}
            
            <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-700">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">
                CSV, XLSX, or XLS (MAX. 5MB)
            </p>
        </div>
      </div>

      {/* Error Message for invalid files */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 flex items-center gap-2">
           <AlertCircle size={16} />
           <span>Invalid file type. Please upload a CSV or Excel file.</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;