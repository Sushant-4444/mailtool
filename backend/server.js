// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Allow frontend requests
app.use(express.json({ limit: '50mb' })); // Allow large payloads (for bulk CSV uploads)

const campaignRoutes = require('./routes/campaignRoutes');

app.use('/api/campaigns', campaignRoutes);

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MailTool API is Running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  };
  res.json(health);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 MailTool Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📧 Email: ${process.env.EMAIL_USER ? 'Configured ✅' : 'Not configured ⚠️'}`);
});