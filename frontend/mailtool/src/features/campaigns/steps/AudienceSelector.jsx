import React, { useState, useMemo } from 'react';
import { Search, CheckSquare, Square, Upload, FileSpreadsheet, AlertCircle, Tag } from 'lucide-react';
import * as XLSX from 'xlsx';

const AudienceSelector = ({ selectedContacts, updateAudience, onNext, onBack, preloadedContacts = [] }) => {
  const [contacts, setContacts] = useState(preloadedContacts); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get all available variables (standard + custom fields)
  const availableVariables = useMemo(() => {
    const variables = ['email', 'firstName', 'lastName', 'company'];
    
    // Collect all unique custom field keys
    const customKeys = new Set();
    contacts.forEach(contact => {
      if (contact.customFields) {
        Object.keys(contact.customFields).forEach(key => customKeys.add(key));
      }
    });
    
    return [...variables, ...Array.from(customKeys)];
  }, [contacts]);

  // --- 1. Upload CSV/Excel File ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        if (jsonData.length === 0) {
          setError("File is empty or has no valid data");
          setLoading(false);
          return;
        }

        // Add unique IDs to each contact
        const contactsWithIds = jsonData.map((row, index) => ({
          _id: `temp_${Date.now()}_${index}`,
          firstName: row.firstName || row.first_name || row.FirstName || '',
          lastName: row.lastName || row.last_name || row.LastName || '',
          email: row.email || row.Email || '',
          company: row.company || row.Company || '',
          rollNumber: row.rollNumber || row.roll_number || row.RollNumber || ''
        }));

        setContacts(contactsWithIds);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to read file. Please use CSV or Excel format.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // --- 2. Toggle Logic ---
  const toggleContact = (contact) => {
    // Check if already selected by comparing IDs (MongoDB uses _id)
    const isSelected = selectedContacts.some(c => c._id === contact._id);
    
    if (isSelected) {
      updateAudience(selectedContacts.filter(c => c._id !== contact._id));
    } else {
      updateAudience([...selectedContacts, contact]);
    }
  };

  const toggleAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      updateAudience([]); // Deselect all
    } else {
      updateAudience(filteredContacts); // Select all visible
    }
  };

  // --- 3. Filter Logic ---
  const filteredContacts = contacts.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const name = (c.firstName + " " + c.lastName).toLowerCase();
    const email = c.email.toLowerCase();
    const company = (c.company || "").toLowerCase();
    
    return name.includes(searchLower) || email.includes(searchLower) || company.includes(searchLower);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Select Audience</h2>
        <div className="text-sm text-gray-500">
          Selected: <span className="font-bold text-blue-600">{selectedContacts.length}</span> / {contacts.length} recipients
        </div>
      </div>

      {/* Available Variables Info */}
      {availableVariables.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Tag size={16} className="text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-800 mb-1">Available Variables for Personalization:</p>
              <div className="flex flex-wrap gap-1">
                {availableVariables.map(varName => (
                  <code key={varName} className="text-xs bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-700">
                    {`{{${varName}}}`}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {contacts.length === 0 && !loading && (
        <div className="mb-6">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
            <FileSpreadsheet size={40} className="text-gray-400 mb-3 group-hover:text-blue-500" />
            <p className="text-sm text-gray-600 font-medium">Click to upload contact list</p>
            <p className="text-xs text-gray-400 mt-1">CSV or Excel file (.csv, .xlsx)</p>
            <p className="text-xs text-gray-400 mt-2">Expected columns: firstName, lastName, email, company, rollNumber</p>
            <input 
              type="file" 
              className="hidden" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {/* Toolbar */}
      {contacts.length > 0 && (
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or company..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={toggleAll}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap"
          >
            {filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length ? "Deselect All" : "Select All"}
          </button>
          <label className="p-2 border rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer flex items-center gap-2"
            title="Upload New List">
            <Upload size={20} />
            <input 
              type="file" 
              className="hidden" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {/* List Container */}
      <div className="border rounded-lg overflow-y-auto flex-1 min-h-[300px] bg-white relative">
        
        {/* Loading State */}
        {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-500 text-sm">Loading contacts...</p>
            </div>
        )}

        {/* Error State */}
        {!loading && error && (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
                <AlertCircle size={32} className="mb-2" />
                <p>{error}</p>
                <button onClick={fetchContacts} className="mt-2 text-blue-600 underline text-sm">Try Again</button>
            </div>
        )}

        {/* Empty State */}
        {!loading && !error && contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>No contacts found in database.</p>
                <p className="text-sm">Go to "Dashboard" to import a CSV first.</p>
            </div>
        )}

        {/* Data List */}
        {!loading && !error && filteredContacts.map((contact) => {
           // MongoDB uses _id, so we check against that
           const isSelected = selectedContacts.some(c => c._id === contact._id);
           
           return (
            <div 
              key={contact._id}
              onClick={() => toggleContact(contact)}
              className={`flex items-center p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`mr-4 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                    </span>
                    {contact.customFields && Object.entries(contact.customFields).slice(0, 2).map(([key, value]) => (
                        <span key={key} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500" title={`${key}: ${value}`}>
                            {value}
                        </span>
                    ))}
                </div>
                <div className="text-sm text-gray-500">{contact.email}</div>
              </div>
              
              {contact.company && (
                  <div className="ml-auto text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 max-w-[150px] truncate">
                    {contact.company}
                  </div>
              )}
            </div>
           );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 flex justify-between pt-4 border-t">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 px-4 py-2">
          Back
        </button>
        <button 
          onClick={onNext}
          disabled={selectedContacts.length === 0}
          className={`px-6 py-2 rounded-lg text-white font-medium shadow-md transition-all ${
            selectedContacts.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Next: Design Email ({selectedContacts.length})
        </button>
      </div>
    </div>
  );
};

export default AudienceSelector;