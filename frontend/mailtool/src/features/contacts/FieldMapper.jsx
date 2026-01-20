import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const SYSTEM_FIELDS = [
  { key: 'email', label: 'Email Address (Required)', required: true },
  { key: 'firstName', label: 'First Name', required: false },
  { key: 'lastName', label: 'Last Name', required: false },
  { key: 'company', label: 'Company', required: false },
];

const FieldMapper = ({ headers, rawData, onComplete }) => {
  // State to store which CSV Header maps to which System Field
  // Example: { email: "User_Email_Column", firstName: "F_Name" }
  const [mapping, setMapping] = useState({});
  
  // State for custom fields
  // Example: [{ key: 'rollNumber', label: 'Roll Number', csvHeader: 'Roll_No' }]
  const [customFields, setCustomFields] = useState([]);

  const handleMapChange = (systemKey, csvHeader) => {
    setMapping(prev => ({ ...prev, [systemKey]: csvHeader }));
  };

  const addCustomField = () => {
    setCustomFields(prev => [
      ...prev,
      { key: `custom_${Date.now()}`, label: '', csvHeader: '' }
    ]);
  };

  const updateCustomField = (index, field, value) => {
    setCustomFields(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeCustomField = (index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const processMapping = () => {
    // Transform raw data based on the mapping
    const processed = rawData.map(row => {
      const contact = {};
      
      // For every system field, find the matching CSV column index
      Object.keys(mapping).forEach(sysKey => {
        const csvHeader = mapping[sysKey];
        const columnIndex = headers.indexOf(csvHeader);
        if (columnIndex > -1) {
          contact[sysKey] = row[columnIndex];
        }
      });
      
      // Process custom fields
      const customFieldsData = {};
      customFields.forEach(cf => {
        if (cf.label && cf.csvHeader) {
          const columnIndex = headers.indexOf(cf.csvHeader);
          if (columnIndex > -1) {
            customFieldsData[cf.label] = row[columnIndex];
          }
        }
      });
      
      // Add customFields to contact if any exist
      if (Object.keys(customFieldsData).length > 0) {
        contact.customFields = customFieldsData;
      }
      
      return contact;
    });

    onComplete(processed);
  };

  return (
    <div className="bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4 font-semibold text-gray-800">Map Your Columns</h2>
      
      {/* System Fields */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">Standard Fields</h3>
        <div className="grid gap-4">
          {SYSTEM_FIELDS.map((field) => (
            <div key={field.key} className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-medium">{field.label}</span>
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              
              <select 
                className="border p-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleMapChange(field.key, e.target.value)}
                value={mapping[field.key] || ''}
              >
                <option value="">Do not import</option>
                {headers.map((h, index) => (
                  <option key={index} value={h}>{h}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Fields Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Custom Fields</h3>
          <button
            onClick={addCustomField}
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors"
          >
            <Plus size={16} />
            Add Custom Field
          </button>
        </div>
        
        {customFields.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded">
            <p className="text-sm">No custom fields added yet</p>
            <p className="text-xs mt-1">Click "Add Custom Field" to map additional columns</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customFields.map((cf, index) => (
              <div key={cf.key} className="flex items-center gap-3 p-3 border rounded bg-gray-50">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Field name (e.g., Roll Number)"
                    className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={cf.label}
                    onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <select
                    className="w-full border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={cf.csvHeader}
                    onChange={(e) => updateCustomField(index, 'csvHeader', e.target.value)}
                  >
                    <option value="">Select CSV Column</option>
                    {headers.map((h, idx) => (
                      <option key={idx} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => removeCustomField(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded"
                  title="Remove custom field"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={processMapping}
        disabled={!mapping.email}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {!mapping.email ? 'Please map Email field to continue' : `Import ${rawData.length} Contacts`}
      </button>
    </div>
  );
};

export default FieldMapper;