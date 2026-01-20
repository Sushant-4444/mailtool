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
 * Helper: Process a single email send
 */
const sendSingleEmail = async (contact, campaignData) => {
  const { subject, htmlContent, senderName, certificateConfig, documentAttachments } = campaignData;
  
  try {
    // 1. Personalize the Email Body & Subject (Mail Merge)
    let personalizedHtml = replaceVariables(htmlContent, contact);
    personalizedHtml = wrapInEmailTemplate(personalizedHtml);
    const personalizedSubject = replaceVariables(subject, contact);

    console.log(`📧 Sending to ${contact.email}...`);

    // 2. Handle Attachments (Certificates)
    const attachments = [];

    // Check if the user enabled the certificate step and provided a template
    if (certificateConfig && certificateConfig.bgImage) {
      console.log(`🎨 Generating certificate for: ${contact.email}`);
      
      // Generate the unique image buffer for THIS specific contact
      const certBuffer = await generateCertificate(certificateConfig, contact);
      
      if (certBuffer) {
        attachments.push({
          filename: `Certificate_${contact.firstName || 'User'}.png`,
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
      
      let contactValue = contact[mappingField];
      if (!contactValue && contact.customFields && contact.customFields[mappingField]) {
        contactValue = contact.customFields[mappingField];
      }
      
      if (contactValue) {
        const matchingDocs = documents.filter(doc => {
          const filenameWithoutExt = doc.name.replace(/\.[^/.]+$/, "");
          return filenameWithoutExt === String(contactValue);
        });
        
        if (matchingDocs.length > 0) {
          matchingDocs.forEach(doc => {
            const base64Data = doc.data.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            
            attachments.push({
              filename: doc.name,
              content: buffer,
              contentType: doc.type
            });
            
            console.log(`📎 Attached document: ${doc.name} for ${contact.email}`);
          });
        }
      }
    }

    // 3. Send the Email
    const info = await transporter.sendMail({
      from: `"${senderName}" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: personalizedSubject,
      html: personalizedHtml,
      text: personalizedHtml.replace(/<[^>]*>/g, ''),
      attachments: attachments 
    });

    console.log(`✅ Sent to: ${contact.email} | MessageID: ${info.messageId}`);
    return { success: true, email: contact.email, messageId: info.messageId };
    
  } catch (error) {
    console.error(`❌ Failed to send to: ${contact.email} - ${error.message}`);
    return { success: false, email: contact.email, error: error.message };
  }
};

/**
 * Helper: Process emails in batches with parallelization
 */
const processBatch = async (batch, campaignData, batchDelay = 100) => {
  // Send all emails in the batch in parallel
  const results = await Promise.all(
    batch.map(contact => sendSingleEmail(contact, campaignData))
  );
  
  // Add a small delay between batches to respect rate limits
  if (batchDelay > 0) {
    await delay(batchDelay);
  }
  
  return results;
};

/**
 * Main Function: Process and Send the Campaign with Parallel Batch Processing
 */
const sendCampaign = async (campaignData) => {
  const { audience } = campaignData;
  
  // Configurable batch size - how many emails to send in parallel
  // Default: 10 emails at a time (configurable via env)
  const BATCH_SIZE = parseInt(process.env.EMAIL_BATCH_SIZE || '10');
  const BATCH_DELAY = parseInt(process.env.EMAIL_BATCH_DELAY || '100'); // milliseconds between batches
  
  const results = { success: 0, failed: 0, errors: [] };

  console.log(`🚀 Starting Campaign Blast: ${audience.length} recipients...`);
  console.log(`⚡ Batch processing: ${BATCH_SIZE} emails at a time`);

  // Split audience into batches
  const batches = [];
  for (let i = 0; i < audience.length; i += BATCH_SIZE) {
    batches.push(audience.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Total batches: ${batches.length}`);

  // Process batches sequentially, but emails within each batch in parallel
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} emails)...`);
    
    const batchResults = await processBatch(batch, campaignData, BATCH_DELAY);
    
    // Aggregate results
    batchResults.forEach(result => {
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ email: result.email, error: result.error });
      }
    });
    
    console.log(`✅ Batch ${i + 1} complete: ${batchResults.filter(r => r.success).length} sent, ${batchResults.filter(r => !r.success).length} failed`);
  }

  console.log(`🏁 Campaign Finished. Success: ${results.success}, Failed: ${results.failed}`);
  return results;
};

module.exports = { sendCampaign };