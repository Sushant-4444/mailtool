# Quick Start Guide

## Installation (3 Minutes)

### 1. Install Docker

**Windows/Mac:**
- Download from [docker.com](https://www.docker.com/get-started)
- Run installer
- Restart computer

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and back in for group changes to take effect.

### 2. Get Gmail App Password

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" (if not enabled)
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select:
   - App: **Mail**
   - Device: **Other (Custom name)** → Enter "MailTool"
5. Click **Generate**
6. Copy the 16-digit password (example: `abcd efgh ijkl mnop`)

### 3. Setup MailTool

```bash
# Clone the repository
git clone https://github.com/yourusername/mailtool.git
cd mailtool

# Run setup (Linux/Mac)
./setup.sh

# Or Windows (PowerShell)
copy .env.example .env
# Then edit .env manually
```

### 4. Edit Configuration

Open `.env` file and update:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

(Use your actual email and the app password from step 2)

### 5. Launch

```bash
docker-compose up -d
```

Wait 30-60 seconds, then open: **http://localhost:3000**

---

## First Campaign

### Step 1: Prepare Your Contact List

Create a CSV file (e.g., `contacts.csv`):

```csv
email,firstName,lastName,company
john@example.com,John,Doe,Acme Corp
jane@example.com,Jane,Smith,Tech Inc
```

### Step 2: Import Contacts

1. Click "Import Contacts"
2. Upload your CSV file
3. Map columns (Email → email, First Name → firstName, etc.)
4. Click "Proceed to Campaign"

### Step 3: Create Campaign

1. **Setup:**
   - Campaign Name: "Test Campaign"
   - Subject: "Hello {{firstName}}"
   - Sender Name: "Your Name"

2. **Audience:**
   - Select contacts to email
   - Click "Next"

3. **Design Email:**
   - Type your message
   - Use {{firstName}}, {{company}}, etc. for personalization
   - Click "Next"

4. **Skip Certificate** (optional feature)

5. **Skip Attachments** (optional feature)

6. **Review & Send:**
   - Check preview
   - Click "Launch Campaign"

### Step 4: View Results

After sending, you'll see:
- ✅ Success count
- ❌ Failed count (if any)
- Detailed error messages for failures

---

## Common Issues

### "Docker daemon not running"

Start Docker Desktop or run:
```bash
# Linux
sudo systemctl start docker
```

### "Port already in use"

Another app is using port 3000 or 5000. Either:
- Close that app, or
- Change ports in `docker-compose.yml`

### "Build failed"

Try:
```bash
# Clean rebuild
docker-compose down --rmi all
docker-compose up --build -d

# Increase Docker memory to 4GB+
# Docker Desktop → Settings → Resources
```

### Setup takes too long (>10 minutes)

First build can take 5-10 minutes depending on:
- Internet speed (downloading packages)
- CPU/RAM (building images)
- Disk speed

**Normal:** 3-7 minutes  
**Slow:** 10-15 minutes  
**Too slow:** Check internet connection

### Still stuck?

See detailed [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

---

## Next Steps

- 📚 Read full [README.md](../README.md)
- 🎓 Try certificate generation feature
- 📎 Upload bulk documents
- ⭐ Star the repo if you find it useful!

---

## Need Help?

- 🐛 [Report issues](https://github.com/yourusername/mailtool/issues)
- 💬 [Ask questions](https://github.com/yourusername/mailtool/discussions)
