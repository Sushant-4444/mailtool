# 📧 MailTool - Self-Hosted Email Campaign Platform

<div align="center">

![MailTool Banner](https://img.shields.io/badge/MailTool-Self%20Hosted-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Send personalized bulk emails with certificates and attachments - all running on YOUR server**

[Features](#-features) • [Quick Start](#-quick-start-3-steps) • [Documentation](#-documentation) • [Support](#-support)

</div>

---

## 🌟 Features

✨ **Personalized Campaigns**
- Rich text & HTML/CSS email editor
- Variable insertion ({{firstName}}, {{company}}, etc.)
- Custom fields support

🎓 **Certificate Generation**
- Visual drag-and-drop certificate builder
- Dynamic text placement on templates
- Automatic PDF generation & attachment

📎 **Smart Attachments**
- Bulk document upload
- Auto-mapping to recipients (by name, ID, etc.)
- Multiple file formats (PDF, DOCX, images)

📊 **Contact Management**
- CSV/Excel import with field mapping
- Session-based (no permanent storage)
- Validation and preview

⚡ **High-Performance Async Processing**
- Redis-powered job queue (BullMQ)
- Parallel batch email sending (10x-100x faster)
- No HTTP timeouts for large campaigns
- Real-time job status tracking
- Automatic retry on failures

🔒 **Privacy-First**
- Self-hosted (your server, your data)
- No third-party access
- Open source & transparent

---

## 🚀 Quick Start (3 Steps)

### Prerequisites

**Don't have Docker?** Follow the installation guide below:

<details>
<summary>📦 Install Docker (Click to expand)</summary>

#### Windows
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Run installer and restart computer
3. Verify: Open PowerShell and run `docker --version`

#### Mac
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop) (Intel or Apple Silicon)
2. Install and launch Docker from Applications
3. Verify: Open Terminal and run `docker --version`

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

Verify:
```bash
docker --version
docker compose version
```

**Troubleshooting:** If Docker daemon not running, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

</details>

**What you need:**
- Docker & Docker Compose (see above)
- Gmail account with App Password (or any SMTP credentials)

**That's it! Redis and job queue are auto-configured in Docker.**

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/Sushant-4444/mailtool.git
cd mailtool

# Run setup script (Linux/Mac)
./setup.sh

# Or manually:
cp .env.example .env
```

### Step 2: Configure Email

Edit `.env` file with your credentials:

```env
# Gmail Configuration (Recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here  # Get from: https://myaccount.google.com/apppasswords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

<details>
<summary>📖 How to get Gmail App Password</summary>

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and your device
4. Copy the 16-digit password
5. Paste it as `EMAIL_PASS` in `.env`

**Why App Password?** 
- More secure than your actual password
- Can be revoked independently
- Recommended by Google for third-party apps

</details>

<details>
<summary>📧 Other Email Providers</summary>

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**Custom SMTP:**
```env
EMAIL_HOST=your-smtp-host.com
EMAIL_PORT=587  # or 465 for SSL
```

</details>

### Step 3: Launch

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access the app:** http://localhost:3000

---

## 📖 Documentation

- 🚀 [Quick Start Guide](QUICKSTART.md) - Get running in 5 minutes
- 🏗️ [Deployment Guide](DEPLOYMENT.md) - Production setup
- ⚡ [Performance & Scalability](PERFORMANCE.md) - Job queue, parallel processing, tuning
- 🔧 [Troubleshooting](TROUBLESHOOTING.md) - Common issues & solutions
- 🔒 [Security Guide](SECURITY.md) - Best practices
- 🤝 [Contributing](CONTRIBUTING.md) - How to contribute

### Architecture

```
mailtool/
├── frontend/          # React + Vite UI
├── backend/           # Node.js + Express API
│   ├── services/
│   │   ├── emailService.js    # Parallel batch email sending
│   │   ├── jobQueue.js        # BullMQ job processing
│   │   └── certificateGenerator.js
│   └── routes/
├── redis/             # Job queue storage (via Docker)
├── docker-compose.yml # Service orchestration
└── .env              # Your configuration
```

**🎯 Stateless Contact Storage** - All contact data is session-based for privacy  
**⚡ Redis Job Queue** - Handles async campaign processing without HTTP timeouts

### Usage Guide

#### 1️⃣ Import Contacts
- Upload CSV/Excel file
- Map columns to fields (Email, Name, etc.)
- Add custom fields (Roll Number, Student ID, etc.)
- Validate and review

#### 2️⃣ Create Campaign
1. **Setup:** Name, subject, sender name
2. **Audience:** Select recipients
3. **Design:** Compose email (Visual or HTML/CSS)
4. **Certificate:** (Optional) Add personalized certificates
5. **Documents:** (Optional) Attach files mapped to recipients
6. **Review & Send**

#### 3️⃣ Track Results
- Campaign queued instantly (no HTTP timeout)
- Poll job status in real-time
- View success/failure counts
- See detailed error messages for failed emails
- Automatic retry on transient failures (3 attempts)

### Custom Fields

MailTool supports unlimited custom fields:

**Example CSV:**
```csv
email,firstName,lastName,studentID,course
john@example.com,John,Doe,12345,Computer Science
jane@example.com,Jane,Smith,12346,Mathematics
```

**Use in emails:**
```
Hi {{firstName}},

Your Student ID is {{studentID}}
Course: {{course}}
```

---

## 🔧 Configuration

### Environment Variables

**Email Configuration:**

| Variable | Description | Default |
|----------|-------------|---------|  
| `EMAIL_USER` | Your email address | Required |
| `EMAIL_PASS` | App password or SMTP password | Required |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |

**Server Configuration:**

| Variable | Description | Default |
|----------|-------------|---------|  
| `PORT` | Backend server port | `5000` |
| `REDIS_HOST` | Redis hostname | `redis` |
| `REDIS_PORT` | Redis port | `6379` |

**Performance Tuning:**

| Variable | Description | Default |
|----------|-------------|---------|  
| `EMAIL_BATCH_SIZE` | Emails sent in parallel per batch | `8` |
| `EMAIL_BATCH_DELAY` | Delay between batches (ms) | `600` |
| `WORKER_CONCURRENCY` | Simultaneous campaigns | `2` |
| `WORKER_MAX_JOBS` | Max jobs per second | `3` |

```bash
# Start all services (backend + frontend + redis)
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f redis

# Rebuild after code changes
docker-compose up --build -d

# Remove all data (including Redis job queue)
docker-compose down -v

# Check service health
docker-compose ps
```

### Non-Docker Setup

<details>
<summary>Manual installation without Docker</summary>

**Prerequisites:**
- Node.js 18+

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend/mailtool
npm install
npm run dev
```

</details>

---

## 🛡️ Security Best Practices

### For Self-Hosting

1. **Use App Passwords** - Never use your main email password
2. **HTTPS** - Use reverse proxy (nginx/Traefik) for production
3. **Regular Updates** - Pull latest code regularly
4. **Firewall Rules** - Restrict access to backend port (5000)

### Email Limits & Performance

**Gmail Personal Account:**
- 500 emails/day (24-hour rolling period)
- **Settings optimized:** 8 emails/batch, 600ms delay = ~18 emails/min
- **Time for 500 emails:** ~30-40 seconds ⚡

**Gmail Workspace:**
- 2,000 emails/day
- **Can increase to:** 20 emails/batch, 200ms delay for faster sending

**Dedicated SMTP (SendGrid/Mailgun):**
- Unlimited (based on plan)
- **Can increase to:** 50-100 emails/batch, 50ms delay
- **Time for 10,000 emails:** ~30-60 seconds ⚡

**How it works:** Parallel batch processing with configurable delays prevents rate limiting while maximizing speed.

---

## 🤝 Contributing

This is an open-source project! Contributions welcome:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

**TL;DR:** Free to use, modify, and distribute. No warranty provided.

---

## ❓ FAQ

<details>
<summary><strong>Is this really free?</strong></summary>

Yes! 100% free and open source. You only pay for:
- Your own server/hosting (or run locally for free)
- Your email provider (Gmail is free for personal use)

</details>

<details>
<summary><strong>Can I use this for commercial purposes?</strong></summary>

Yes, under MIT license you can use it for any purpose including commercial.

</details>

<details>
<summary><strong>What if I don't have Docker?</strong></summary>

You can run manually (see Non-Docker Setup), but Docker is recommended for easier setup.

</details>

<details>
<summary><strong>How do I update to the latest version?</strong></summary>

```bash
git pull origin main
docker-compose up --build -d
```

</details>

<details>
<summary><strong>Where is my data stored?</strong></summary>

- Contacts: Session-based (in-memory, not permanently stored)
- All data stays on YOUR server
- No database required - fully stateless architecture

</details>

<details>
<summary><strong>Can I customize the interface?</strong></summary>

Yes! Fork the repo and modify as needed. It's open source.

</details>

---

## 🐛 Troubleshooting

### Common Issues

**Docker won't start?**
- Check Docker Desktop is running
- Ensure ports 3000, 5000, and 6379 are free

**Build failing?**
- Increase Docker memory to 4GB+
- Check you have 5GB+ free disk space

**Redis connection error?**
- Check Redis container is running: `docker-compose ps`
- Restart services: `docker-compose restart`

**Emails not sending?**
- Verify App Password (not regular password)
- Check `.env` file has correct credentials
- View job queue status: `GET /api/campaigns/jobs`

**Campaign stuck in queue?**
- Check backend logs: `docker-compose logs backend`
- Verify Redis is healthy: `docker-compose ps redis`

**See full guide:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Get Logs

```bash
# View all logs
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

---

## 💡 Support

- 📖 [Full Documentation](docs/)
- 🐛 [Report Issues](https://github.com/yourusername/mailtool/issues)
- 💬 [Discussions](https://github.com/yourusername/mailtool/discussions)
- ⭐ Star this repo if it helps you!

---

<div align="center">

**Built with ❤️ for the open-source community**

[Report Bug](https://github.com/yourusername/mailtool/issues) · [Request Feature](https://github.com/yourusername/mailtool/issues)

</div>
