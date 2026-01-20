const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the transporter
// For development, we will use Gmail. 
// Note: You need an "App Password" from Google, not your login password.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g. sushant@iiitd.ac.in
    pass: process.env.EMAIL_PASS  // The 16-digit App Password
  },
  // Ensure HTML emails are sent properly
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email Server Error:', error);
  } else {
    console.log('✅ Email Server Ready to Send');
  }
});

module.exports = transporter;