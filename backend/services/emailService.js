const transporter = require('../config/emailConfig');
const { generateCertificate } = require('./certificateGenerator');

/**
 * Helper: Replaces {{key}} with value from contact object
 * Example: "Hello {{firstName}}" -> "Hello Sushant"
 * Also checks customFields for variable replacement
 */
const replaceVariables = (template, contact) => {
  if (!template) return "";
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    const cleanKey = key.trim();
    
    // First check standard fields
    if (contact[cleanKey] !== undefined) {
      return contact[cleanKey];
    }
    
    // Then check customFields
    if (contact.customFields && contact.customFields[cleanKey] !== undefined) {
      return contact.customFields[cleanKey];
    }
    
    // Return the original {{tag}} if not found
    return match;
  });
};

/**
 * Helper: Wraps HTML content in a proper email template
 */
const wrapInEmailTemplate = (htmlContent) => {
  // If content already has <html> or <body> tags, return as-is
  if (htmlContent.includes('<html') || htmlContent.includes('<body')) {
    return htmlContent;
  }
  
  // Otherwise wrap in proper email structure
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    p { margin: 10px 0; }
    h1, h2, h3 { color: #2c3e50; }
    a { color: #3498db; text-decoration: none; }
    ul, ol { margin: 10px 0; padding-left: 20px; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `.trim();
};

/**
 * Helper: Adds a delay to prevent getting blocked by SMTP providers
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Main Function: Process and Send the Campaign
 */
const sendCampaign = async (campaignData) => {
  const { subject, htmlContent, senderName, audience, certificateConfig, documentAttachments } = campaignData;
  
  const results = { success: 0, failed: 0, errors: [] };

  console.log(`🚀 Starting Campaign Blast: ${audience.length} recipients...`);

  // Loop through every contact in the audience
  for (const contact of audience) {
    try {
      // 1. Personalize the Email Body & Subject (Mail Merge)
      let personalizedHtml = replaceVariables(htmlContent, contact);
      personalizedHtml = wrapInEmailTemplate(personalizedHtml); // Wrap in proper email template
      const personalizedSubject = replaceVariables(subject, contact);

      console.log(`📧 Sending to ${contact.email}...`);
      console.log(`HTML Preview: ${personalizedHtml.substring(0, 200)}...`); // Debug log

      // 2. Handle Attachments (Certificates)
      const attachments = [];

      // Check if the user enabled the certificate step and provided a template
      if (certificateConfig && certificateConfig.bgImage) {
        
        console.log(`🎨 Generating certificate for: ${contact.email}`);
        
        // Generate the unique image buffer for THIS specific contact
        const certBuffer = await generateCertificate(certificateConfig, contact);
        
        if (certBuffer) {
            // Add to Nodemailer attachments array
            attachments.push({
                filename: `Certificate_${contact.firstName || 'User'}.png`, // e.g. Certificate_Sushant.png
                content: certBuffer,
                contentType: 'image/png'
            });
        } else {
            console.warn(`⚠️ Failed to generate certificate for ${contact.email}, sending without it.`);
        }
      }

      // Handle Document Attachments
      if (documentAttachments && documentAttachments.documents && documentAttachments.documents.length > 0) {
        const { documents, mappingField } = documentAttachments;
        
        // Get the value from contact to match against filename
        // Check standard fields first, then custom fields
        let contactValue = contact[mappingField];
        if (!contactValue && contact.customFields && contact.customFields[mappingField]) {
          contactValue = contact.customFields[mappingField];
        }
        
        if (contactValue) {
          // Find matching document(s)
          // Remove extension from filename for matching
          const matchingDocs = documents.filter(doc => {
            const filenameWithoutExt = doc.name.replace(/\.[^/.]+$/, ""); // Remove extension
            return filenameWithoutExt === String(contactValue);
          });
          
          if (matchingDocs.length > 0) {
            matchingDocs.forEach(doc => {
              // Convert base64 data URL to buffer
              const base64Data = doc.data.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              
              attachments.push({
                filename: doc.name,
                content: buffer,
                contentType: doc.type
              });
              
              console.log(`📎 Attached document: ${doc.name} for ${contact.email}`);
            });
          } else {
            console.warn(`⚠️ No matching document found for ${contact.email} (${mappingField}: ${contactValue})`);
          }
        }
      }

      // 3. Send the Email
      const info = await transporter.sendMail({
        from: `"${senderName}" <${process.env.EMAIL_USER}>`, // Sender Name <email@gmail.com>
        to: contact.email,
        subject: personalizedSubject,
        html: personalizedHtml,
        text: personalizedHtml.replace(/<[^>]*>/g, ''), // Plain text fallback (strip HTML tags)
        attachments: attachments 
      });

      console.log(`✅ Sent to: ${contact.email} | MessageID: ${info.messageId}`);
      results.success++;

      // 4. Rate Limiting (Delay)
      // Wait 1 second between emails to play nice with Gmail/Outlook limits
      await delay(1000); 

    } catch (error) {
      console.error(`❌ Failed to send to: ${contact.email} - ${error.message}`);
      results.failed++;
      results.errors.push({ email: contact.email, error: error.message });
    }
  }

  console.log(`🏁 Campaign Finished. Success: ${results.success}, Failed: ${results.failed}`);
  return results;
};

module.exports = { sendCampaign };