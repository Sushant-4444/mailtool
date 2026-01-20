// src/features/campaigns/steps/CampaignSetup.jsx

import React from 'react';

const CampaignSetup = ({ data, update, onNext }) => {
  
  const isFormValid = data.name && data.subject && data.senderName;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Campaign Details</h2>
      
      <div className="space-y-6">
        {/* Internal Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. Internship Announcement 2026"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Only you will see this name.</p>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. Invitation: Web Dev Workshop"
            value={data.subject}
            onChange={(e) => update('subject', e.target.value)}
          />
        </div>

        {/* Sender Info Group */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Sushant"
              value={data.senderName}
              onChange={(e) => update('senderName', e.target.value)}
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
             {/* Often this is fixed/disabled based on your SMTP settings */}
             <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              value="sushant@iiitd.ac.in" // Hardcoded for now, or dynamic from user profile
              disabled
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isFormValid 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next: Audience Selection
        </button>
      </div>
    </div>
  );
};

export default CampaignSetup;