// src/utils/validators.js

// Standard email regex (RFC 5322)
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export const validateContacts = (contacts) => {
  const valid = [];
  const invalid = [];
  const seenEmails = new Set();

  contacts.forEach((contact, index) => {
    const errors = [];
    const email = contact.email ? contact.email.trim().toLowerCase() : '';

    // Check 1: Missing Email
    if (!email) {
      errors.push("Missing email address");
    } 
    // Check 2: Syntax
    else if (!EMAIL_REGEX.test(email)) {
      errors.push("Invalid email format");
    }
    // Check 3: Duplicates (Internal to this file)
    else if (seenEmails.has(email)) {
      errors.push("Duplicate email in file");
    }

    if (errors.length > 0) {
      // Add to invalid bucket with reasons
      invalid.push({ ...contact, rowNum: index + 1, errors });
    } else {
      // Add to valid bucket
      seenEmails.add(email);
      valid.push({ ...contact, email }); // Save clean email
    }
  });

  return { valid, invalid };
};