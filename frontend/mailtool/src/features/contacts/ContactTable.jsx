import React, { useState, useMemo } from 'react';
import { Trash2, Search, User, Building, Mail } from 'lucide-react';

const ContactTable = ({ contacts, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get all unique custom field keys
  const customFieldKeys = useMemo(() => {
    const keysSet = new Set();
    contacts.forEach(contact => {
      if (contact.customFields) {
        Object.keys(contact.customFields).forEach(key => keysSet.add(key));
      }
    });
    return Array.from(keysSet);
  }, [contacts]);

  // Filter Logic
  const filteredContacts = contacts.filter((contact) =>
    Object.values(contact).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full">
      {/* Header & Search */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-700">
          Contact List <span className="text-gray-400 font-normal">({contacts.length})</span>
        </h3>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search contacts..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-grow">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <User size={48} className="mb-2 opacity-50" />
            <p>No contacts found matching "{searchTerm}"</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 font-medium uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 border-b">
                    <div className="flex items-center gap-2"><Mail size={14}/> Email</div>
                </th>
                <th className="p-4 border-b">
                    <div className="flex items-center gap-2"><User size={14}/> Name</div>
                </th>
                <th className="p-4 border-b">
                    <div className="flex items-center gap-2"><Building size={14}/> Company</div>
                </th>
                {customFieldKeys.map(key => (
                  <th key={key} className="p-4 border-b">
                    {key}
                  </th>
                ))}
                <th className="p-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentContacts.map((contact, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{contact.email}</td>
                  <td className="p-4">
                    {contact.firstName || contact.lastName 
                      ? `${contact.firstName || ''} ${contact.lastName || ''}` 
                      : <span className="text-gray-400 italic">--</span>}
                  </td>
                  <td className="p-4">
                    {contact.company || <span className="text-gray-400 italic">--</span>}
                  </td>
                  {customFieldKeys.map(key => (
                    <td key={key} className="p-4">
                      {contact.customFields?.[key] || <span className="text-gray-400 italic">--</span>}
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(contact.email)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title="Remove from list"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-lg">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100 text-sm"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactTable;