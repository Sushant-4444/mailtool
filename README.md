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

🔒 **Privacy-First**
- Self-hosted (your server, your data)
- No third-party access
- Open source & transparent

---

## 🚀 Quick Start (3 Steps)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Gmail account with App Password (or any SMTP credentials)

**That's it! No database setup required.**

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/mailtool.git
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

### Architecture

```
mailtool/
├── frontend/          # React + Vite UI
├── backend/           # Node.js + Express API (stateless)
├── docker-compose.yml # Service orchestration
└── .env              # Your configuration
```

**🎯 Zero Database Required** - All data is session-based for privacy

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
- View success/failure counts
- See detailed error messages for failed emails
- Copy failed addresses for retry

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

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_USER` | Your email address | Required |
| `EMAIL_PASS` | App password or SMTP password | Required |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `MONGODB_URI` | Database connection | Auto-configured |
| `PORT` | Backend server port | `5000` |

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build -d

# Remove all data (including database)
docker-compose down -v
```

### Non-Docker Setup

<details>
<summary>Manual installation without Docker</summary>

**Prerequisites:**
- Node.js 18+
- MongoDB installed locally

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

**MongoDB:**
```bash
# Start MongoDB (if not running)
mongod --dbpath /path/to/data
```

</details>

---

## 🛡️ Security Best Practices

### For Self-Hosting

1. **Use App Passwords** - Never use your main email password
2. **Firewall Rules** - Restrict MongoDB access (port 27017)
3. **HTTPS** - Use reverse proxy (nginx/Traefik) for production
4. **Regular Updates** - Pull latest code regularly
5. **Backup Data** - MongoDB data in `docker volume`

### Email Limits

**Gmail Free Account:**
- 500 emails/day
- 100 emails per message (BCC)

**Gmail Workspace:**
- 2,000 emails/day

**Recommendation:** Add 1-2 second delays between emails (already implemented)

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

- Database: Docker volume `mongodb_data`
- Contacts: Session-based (not permanently stored)
- All data stays on YOUR server

</details>

<details>
<summary><strong>Can I customize the interface?</strong></summary>

Yes! Fork the repo and modify as needed. It's open source.

</details>

---

## 🐛 Troubleshooting

### Emails not sending

1. Check `.env` credentials are correct
2. Verify App Password (not regular password)
3. Check logs: `docker-compose logs backend`
4. Ensure SMTP port is not blocked by firewall

### Services won't start

```bash
# Check if ports are already in use
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :27017 # MongoDB

# View detailed logs
docker-compose logs
```

### Database issues

```bash
# Reset database
docker-compose down -v
docker-compose up -d
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
