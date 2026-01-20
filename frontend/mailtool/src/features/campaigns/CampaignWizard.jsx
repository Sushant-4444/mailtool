import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Users, PenTool, FileBadge, Send, CheckCircle, FileText, AlertCircle, X, Loader2, Clock } from 'lucide-react';

// Import sub-components
import CampaignSetup from './steps/CampaignSetup';
import AudienceSelector from './steps/AudienceSelector';
import EmailEditor from './steps/EmailEditor';
import CertificateBuilder from './steps/CertificateBuilder';
import DocumentAttachments from './steps/DocumentAttachments';

const CampaignWizard = ({ preloadedContacts = [], onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [campaignResults, setCampaignResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  
  // The "Mega State" for the campaign
  const [campaignData, setCampaignData] = useState({
    name: "",           
    subject: "",        
    senderName: "",     
    audience: [],       
    htmlContent: "",    
    certificateConfig: null, // Stores { bgImage, fields } from the builder
    documentAttachments: null // Stores { documents, mappingField }
  });

  const updateField = (field, value) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate available variables from audience
  const availableVariables = useMemo(() => {
    const variables = ['email', 'firstName', 'lastName', 'company'];
    
    // Collect all unique custom field keys from audience
    const customKeys = new Set();
    campaignData.audience.forEach(contact => {
      if (contact.customFields) {
        Object.keys(contact.customFields).forEach(key => customKeys.add(key));
      }
    });
    
    return [...variables, ...Array.from(customKeys)];
  }, [campaignData.audience]);

  // Poll job status
  useEffect(() => {
    if (!jobId || !isProcessing) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/campaigns/status/${jobId}`);
        const data = await response.json();
        
        setJobStatus(data);

        // Job completed or failed
        if (data.state === 'completed') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          setCampaignResults(data.result);
          setShowResultsModal(true);
          setJobId(null);
        } else if (data.state === 'failed') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          alert(`Campaign failed: ${data.failedReason || 'Unknown error'}`);
          setJobId(null);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, isProcessing]);

 const handleLaunchCampaign = async () => {
    if(!window.confirm(`Ready to send to ${campaignData.audience.length} people?`)) return;

    console.log("Sending Data:", campaignData);
    setIsProcessing(true);
    setJobStatus(null);

    try {
        const response = await fetch('http://localhost:5000/api/campaigns/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignData)
        });

        const data = await response.json();
        
        if (response.ok) {
            // Campaign queued successfully - start polling
            setJobId(data.jobId);
            setJobStatus({ state: 'queued', jobId: data.jobId });
        } else {
            setIsProcessing(false);
            alert("Error: " + data.message);
        }

    } catch (error) {
        setIsProcessing(false);
        alert("Network Error: " + error.message);
    }
};

  // Step Definitions
  const steps = [
    { num: 1, label: "Setup", icon: Settings },
    { num: 2, label: "Audience", icon: Users },
    { num: 3, label: "Design", icon: PenTool },
    { num: 4, label: "Certificate", icon: FileBadge },
    { num: 5, label: "Documents", icon: FileText },
    { num: 6, label: "Review", icon: Send },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header & Progress Bar --- */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create New Campaign</h1>
          <div className="flex mt-6 border-b border-gray-200 overflow-x-auto pb-2">
            {steps.map((s) => (
              <div 
                key={s.num}
                className={`flex items-center pb-3 mr-8 border-b-2 transition-colors whitespace-nowrap px-2 ${
                  currentStep === s.num 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-400'
                }`}
              >
                <s.icon size={18} className="mr-2" />
                <span className="font-medium">{s.label}</span>
                {currentStep > s.num && (
                    <CheckCircle size={14} className="ml-2 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Dynamic Step Content --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
          
          {/* STEP 1: SETUP */}
          {currentStep === 1 && (
            <div className="p-8">
                <CampaignSetup 
                    data={campaignData} 
                    update={updateField} 
                    onNext={nextStep} 
                />
            </div>
          )}

          {/* STEP 2: AUDIENCE */}
          {currentStep === 2 && (
            <div className="p-8 h-full">
                <AudienceSelector 
                    selectedContacts={campaignData.audience}
                    updateAudience={(list) => updateField('audience', list)}
                    onNext={nextStep}
                    onBack={prevStep}
                    preloadedContacts={preloadedContacts}
                />
            </div>
          )}

          {/* STEP 3: EMAIL DESIGN */}
          {currentStep === 3 && (
            <div className="p-8 h-full flex flex-col flex-1">
               <EmailEditor 
                 initialContent={campaignData.htmlContent}
                 onUpdate={(html) => updateField('htmlContent', html)}
                 onNext={nextStep}
                 onBack={prevStep}
                 availableVariables={availableVariables}
               />
            </div>
          )}

          {/* STEP 4: CERTIFICATE BUILDER */}
          {currentStep === 4 && (
            <div className="p-6 h-full flex flex-col flex-1">
                <div className="mb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Personalized Certificate</h2>
                        <p className="text-sm text-gray-500">Create a dynamic certificate or skip this step.</p>
                    </div>
                    {/* Skip Button */}
                    <button onClick={nextStep} className="text-gray-400 hover:text-gray-600 underline text-sm">
                        Skip Certificate
                    </button>
                </div>
                
                <CertificateBuilder 
                    onSave={(config) => {
                        updateField('certificateConfig', config);
                        alert("Certificate Template Saved!");
                        nextStep();
                    }}
                    onBack={prevStep}
                    availableVariables={availableVariables}
                />
            </div>
          )}

          {/* STEP 5: DOCUMENT ATTACHMENTS */}
          {currentStep === 5 && (
            <div className="p-8 h-full flex flex-col flex-1">
                <DocumentAttachments 
                    onSave={(config) => {
                        updateField('documentAttachments', config);
                        if (config) {
                            alert(`${config.documents.length} documents saved!`);
                        }
                        nextStep();
                    }}
                    onBack={prevStep}
                    availableVariables={availableVariables}
                />
            </div>
          )}

          {/* STEP 6: FINAL REVIEW */}
          {currentStep === 6 && (
            <div className="p-8 max-w-3xl mx-auto w-full">
               <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Review & Launch</h2>
               
               <div className="grid grid-cols-2 gap-6 mb-8">
                   {/* Summary Card */}
                   <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Campaign Name</span>
                            <span className="font-medium text-right">{campaignData.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subject</span>
                            <span className="font-medium text-right">{campaignData.subject}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Audience</span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                {campaignData.audience.length} Recipients
                            </span>
                        </div>
                   </div>

                   {/* Attachment Status */}
                   <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-3">Attachments</h3>
                        <div className="space-y-2">
                            {/* Certificate */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileBadge size={18} className={campaignData.certificateConfig ? "text-green-600" : "text-gray-300"} />
                                    <span className="text-sm">Certificate</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${campaignData.certificateConfig ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                                    {campaignData.certificateConfig ? "Enabled" : "Skipped"}
                                </span>
                            </div>
                            
                            {/* Documents */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className={campaignData.documentAttachments ? "text-green-600" : "text-gray-300"} />
                                    <span className="text-sm">Documents</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${campaignData.documentAttachments ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                                    {campaignData.documentAttachments ? `${campaignData.documentAttachments.documents.length} files` : "None"}
                                </span>
                            </div>
                        </div>
                   </div>
               </div>

               {/* Preview Section */}
               <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Body Preview</h3>
                    <div className="border rounded-lg p-6 bg-white prose prose-sm max-w-none shadow-inner min-h-[150px]">
                        <div dangerouslySetInnerHTML={{ __html: campaignData.htmlContent || "<em class='text-gray-400'>No content...</em>" }} />
                    </div>
               </div>

               {/* Action Footer */}
               <div className="flex justify-between pt-6 border-t mt-auto">
                   <button 
                       onClick={prevStep} 
                       className="text-gray-500 hover:text-gray-800 px-4 py-2"
                       disabled={isProcessing}
                   >
                       Back to Edit
                   </button>
                   <button 
                       onClick={handleLaunchCampaign}
                       disabled={isProcessing}
                       className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                   >
                       {isProcessing ? (
                           <>
                               <Loader2 size={20} className="animate-spin" />
                               Processing...
                           </>
                       ) : (
                           <>
                               <Send size={20} />
                               Launch Campaign
                           </>
                       )}
                   </button>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* Processing Modal */}
      {isProcessing && jobStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {jobStatus.state === 'queued' && 'Campaign Queued'}
                {jobStatus.state === 'waiting' && 'Waiting to Start'}
                {jobStatus.state === 'active' && 'Sending Emails'}
                {jobStatus.state === 'delayed' && 'Scheduled'}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {jobStatus.state === 'queued' && 'Your campaign is queued and will start shortly...'}
                {jobStatus.state === 'waiting' && 'Preparing to send emails...'}
                {jobStatus.state === 'active' && `Sending to ${campaignData.audience.length} recipients...`}
                {jobStatus.state === 'delayed' && 'Campaign scheduled for later...'}
              </p>

              {jobStatus.progress !== undefined && jobStatus.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{jobStatus.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${jobStatus.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock size={16} />
                  <span>Job ID: {jobId}</span>
                </div>
                <p className="text-xs text-gray-500">
                  This may take a few seconds to a few minutes depending on audience size.
                  You can close this and check status later.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && campaignResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Campaign Results</h2>
                <p className="text-sm text-gray-500 mt-1">Campaign completed successfully</p>
              </div>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Statistics */}
            <div className="p-6 grid grid-cols-2 gap-4 border-b bg-gray-50">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-sm font-medium text-gray-600">Successful</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{campaignResults.success}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-red-600" size={20} />
                  <span className="text-sm font-medium text-gray-600">Failed</span>
                </div>
                <p className="text-3xl font-bold text-red-600">{campaignResults.failed}</p>
              </div>
            </div>

            {/* Failed Emails List */}
            {campaignResults.errors && campaignResults.errors.length > 0 && (
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" />
                  Failed Emails ({campaignResults.errors.length})
                </h3>
                <div className="space-y-2">
                  {campaignResults.errors.map((err, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{err.email}</p>
                          <p className="text-sm text-red-600 mt-1">{err.error}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Failures Message */}
            {(!campaignResults.errors || campaignResults.errors.length === 0) && (
              <div className="p-6 flex-1 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-800">All emails sent successfully! 🎉</p>
                  <p className="text-sm text-gray-500 mt-1">No failures to report</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowResultsModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              {campaignResults.errors && campaignResults.errors.length > 0 && (
                <button
                  onClick={() => {
                    const failedEmails = campaignResults.errors.map(e => e.email).join('\n');
                    navigator.clipboard.writeText(failedEmails);
                    alert('Failed email addresses copied to clipboard!');
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Copy Failed Emails
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignWizard;