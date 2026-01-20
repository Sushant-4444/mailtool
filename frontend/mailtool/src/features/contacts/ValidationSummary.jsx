// src/features/contacts/ValidationSummary.jsx
import React, { useState } from 'react';

const ValidationSummary = ({ validContacts, invalidContacts, onConfirm, onCancel }) => {
  const [showErrors, setShowErrors] = useState(false);

  // Calculate stats
  const total = validContacts.length + invalidContacts.length;
  const validRate = ((validContacts.length / total) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 shadow rounded max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Import Summary</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded text-center">
          <div className="text-3xl font-bold text-blue-600">{total}</div>
          <div className="text-sm text-gray-600">Total Rows</div>
        </div>
        <div className="bg-green-50 p-4 rounded text-center">
          <div className="text-3xl font-bold text-green-600">{validContacts.length}</div>
          <div className="text-sm text-gray-600">Valid Contacts</div>
        </div>
        <div className="bg-red-50 p-4 rounded text-center">
          <div className="text-3xl font-bold text-red-600">{invalidContacts.length}</div>
          <div className="text-sm text-gray-600">Issues Found</div>
        </div>
      </div>

      {/* Error Details Accordion */}
      {invalidContacts.length > 0 && (
        <div className="mb-6">
          <button 
            onClick={() => setShowErrors(!showErrors)}
            className="text-red-600 text-sm font-medium hover:underline flex items-center"
          >
            {showErrors ? "Hide" : "Show"} Issues ({invalidContacts.length})
          </button>
          
          {showErrors && (
            <div className="mt-2 border rounded max-h-48 overflow-y-auto bg-gray-50">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-500">
                  <tr>
                    <th className="p-2">Row</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {invalidContacts.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{c.rowNum}</td>
                      <td className="p-2 font-mono">{c.email || "N/A"}</td>
                      <td className="p-2 text-red-600">
                        {c.errors.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          onClick={() => onConfirm(validContacts)}
          className={`px-4 py-2 rounded text-white ${
            validContacts.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={validContacts.length === 0}
        >
          Import {validContacts.length} Contacts
        </button>
      </div>
    </div>
  );
};

export default ValidationSummary;