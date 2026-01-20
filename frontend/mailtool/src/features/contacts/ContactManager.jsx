// src/features/contacts/ContactManager.jsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, Users } from 'lucide-react';

// Import sub-components
import FileDropzone from './FileDropzone';
import FieldMapper from './FieldMapper';
import ValidationSummary from './ValidationSummary';
import ContactTable from './ContactTable';

// Import utility
import { validateContacts } from '../../utils/validators';

const ContactManager = ({ onContactsReady }) => {
  // --- State Management ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [rawFile, setRawFile] = useState({ name: '', headers: [], data: [] });
  const [validationResults, setValidationResults] = useState({ valid: [], invalid: [] });
  const [finalContacts, setFinalContacts] = useState([]);

  // --- Handlers ---

  // Step 1: Handle File Read
  const handleFileUpload = (file) => {
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON (Header: 1 gives array of arrays)
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length < 2) {
            alert("File is empty or missing headers");
            setLoading(false);
            return;
        }

        const headers = jsonData[0]; // First row
        const rows = jsonData.slice(1); // Rest of data

        setRawFile({ name: file.name, headers, data: rows });
        setStep(2); // Move to Map
      } catch (error) {
        console.error("Error parsing file", error);
        alert("Failed to parse file.");
      } finally {
        setLoading(false);
      }
    };
    
    reader.readAsBinaryString(file);
  };

  // Step 2: Handle Field Mapping & Trigger Validation
  const handleMappingComplete = (mappedData) => {
    const { valid, invalid } = validateContacts(mappedData);
    setValidationResults({ valid, invalid });
    setStep(3); // Move to Validation Review
  };

  // Step 3: Confirm Import (Discarding invalids)
  const handleValidationConfirm = (cleanContacts) => {
    setFinalContacts(cleanContacts);
    setStep(4); // Move to Final Table
  };

  // Step 4 Helper: Delete a contact from the final list
  const handleDeleteContact = (emailToRemove) => {
    if (window.confirm(`Are you sure you want to remove ${emailToRemove}?`)) {
        setFinalContacts(prev => prev.filter(c => c.email !== emailToRemove));
    }
  };

  // Step 4: Pass contacts to Campaign Wizard (instead of saving to DB)
  const handleProceedToCampaign = () => {
    if (finalContacts.length === 0) {
      alert("No contacts to proceed with!");
      return;
    }
    
    // Pass contacts to parent component (App.jsx will handle navigation)
    if (onContactsReady) {
      onContactsReady(finalContacts);
    }
  };

  // --- UI Helpers ---
  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Upload", icon: Upload },
      { num: 2, label: "Map", icon: FileSpreadsheet },
      { num: 3, label: "Validate", icon: CheckCircle },
      { num: 4, label: "Review", icon: Users },
    ];

    return (
      <div className="flex justify-between items-center mb-8 px-4 md:px-12">
        {steps.map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
              ${step >= s.num ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-300 text-gray-400'}
            `}>
              <s.icon size={18} />
            </div>
            <span className={`hidden md:block ml-2 text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-1 mx-2 md:mx-4 rounded ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Contact Import Wizard</h1>
            {step > 1 && (
                <button 
                    onClick={() => {
                        if(window.confirm("Are you sure you want to cancel? All progress will be lost.")) {
                            setStep(1);
                        }
                    }} 
                    className="text-sm text-gray-500 hover:text-red-500 px-3 py-1 border border-transparent hover:border-red-200 rounded transition-colors"
                >
                    Cancel / Reset
                </button>
            )}
        </div>

        {/* Progress Bar */}
        {renderStepIndicator()}

        {/* Dynamic Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] transition-all duration-300">
            {loading ? (
                <div className="flex flex-col justify-center items-center h-96 text-blue-600 animate-pulse">
                    <Upload size={48} className="mb-4 animate-bounce" />
                    <p>Processing Data...</p>
                </div>
            ) : (
                <>
                    {step === 1 && (
                        <div className="p-8 fade-in">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Step 1: Upload Data Source</h2>
                            <FileDropzone onDrop={handleFileUpload} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-8 fade-in">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">Step 2: Map Columns</h2>
                            <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded border border-blue-100">
                                <strong>File:</strong> {rawFile.name} &bull; <strong>Rows found:</strong> {rawFile.data.length}
                            </p>
                            <FieldMapper 
                                headers={rawFile.headers} 
                                rawData={rawFile.data} 
                                onComplete={handleMappingComplete} 
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="p-8 fade-in">
                            <ValidationSummary 
                                validContacts={validationResults.valid}
                                invalidContacts={validationResults.invalid}
                                onConfirm={handleValidationConfirm}
                                onCancel={() => setStep(1)}
                            />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="p-8 fade-in flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Step 4: Final Review</h2>
                                    <p className="text-sm text-gray-500">Review your contacts before creating campaign.</p>
                                </div>
                                <button 
                                    onClick={handleProceedToCampaign}
                                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-all font-medium"
                                >
                                    <CheckCircle size={18} />
                                    Proceed with {finalContacts.length} Contacts
                                </button>
                            </div>
                            
                            <div className="border rounded-lg overflow-hidden">
                                <ContactTable 
                                    contacts={finalContacts} 
                                    onDelete={handleDeleteContact} 
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContactManager;