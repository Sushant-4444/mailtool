import { useState } from 'react'
import ContactManager from './features/contacts/ContactManager'
import CampaignWizard from './features/campaigns/CampaignWizard'

function App() {
  const [view, setView] = useState('contacts'); // 'contacts' or 'campaign'
  const [importedContacts, setImportedContacts] = useState([]);

  const handleContactsReady = (contacts) => {
    setImportedContacts(contacts);
    setView('campaign');
  };

  const handleBackToContacts = () => {
    if (window.confirm('Go back to import contacts? Current campaign will be lost.')) {
      setView('contacts');
      setImportedContacts([]);
    }
  };

  return (
    <>
      {view === 'contacts' ? (
        <ContactManager onContactsReady={handleContactsReady} />
      ) : (
        <CampaignWizard 
          preloadedContacts={importedContacts}
          onBack={handleBackToContacts}
        />
      )}
    </>
  )
}

export default App
