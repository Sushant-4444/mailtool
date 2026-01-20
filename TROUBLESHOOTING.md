# Troubleshooting Guide

## Common Issues & Solutions

### 1. "Docker daemon is not running"

**Problem:** Docker Desktop/service is not started.

**Solution:**
```bash
# Windows/Mac: Start Docker Desktop
# Linux:
sudo systemctl start docker
sudo systemctl enable docker
```

---

### 2. "Port already in use" (3000 or 5000)

**Problem:** Another application is using the required ports.

**Solutions:**

**Option A: Stop the conflicting application**
```bash
# Find what's using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
```

**Option B: Change MailTool ports**

Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Access on port 8080 instead
  backend:
    ports:
      - "8081:5000"  # Access on port 8081 instead
```

Then access at: `http://localhost:8080`

---

### 3. "Build failed" or "npm install errors"

**Problem:** Docker build failing during npm install.

**Solutions:**

**Clean build:**
```bash
# Remove all containers and images
docker-compose down --rmi all --volumes

# Rebuild from scratch
docker-compose up --build -d
```

**Increase Docker memory:**
- Docker Desktop → Settings → Resources
- Set Memory to at least 4GB
- Apply & Restart

**Check disk space:**
```bash
df -h  # Ensure you have 5GB+ free
```

---

### 4. "Canvas module installation failed"

**Problem:** Node canvas needs system dependencies.

**Solution:** The Dockerfile now includes all required dependencies. If still failing:

```bash
# Rebuild with no cache
docker-compose build --no-cache backend
docker-compose up -d
```

---

### 5. Frontend shows "Cannot connect to backend"

**Problem:** Frontend can't reach backend API.

**Check backend is running:**
```bash
docker-compose ps
curl http://localhost:5000/health
```

**Expected output:**
```json
{"status":"ok","uptime":123,"timestamp":"...","emailConfigured":true}
```

**If backend is down:**
```bash
# View backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

---

### 6. "Email sending fails" / SMTP errors

**Problem:** Email credentials incorrect or SMTP blocked.

**Solutions:**

**Check .env configuration:**
```bash
cat .env
```

Verify:
- `EMAIL_USER` is your full email address
- `EMAIL_PASS` is **App Password** (not your regular password)
- `EMAIL_HOST` and `EMAIL_PORT` are correct

**Gmail App Password:**
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-digit password (remove spaces)

**Test SMTP connection:**
```bash
# Check backend logs when sending
docker-compose logs -f backend
```

**Common SMTP errors:**
- `Invalid credentials` → Wrong app password
- `Connection timeout` → Port 587 blocked by firewall
- `Too many emails` → Gmail daily limit (500/day)

---

### 7. Services start but pages won't load

**Problem:** Services running but not accessible.

**Check health status:**
```bash
docker-compose ps

# Should show "healthy" status
# If "starting" for >2 minutes, something's wrong
```

**View logs:**
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs backend
```

**Restart everything:**
```bash
docker-compose down
docker-compose up -d
```

---

### 8. "Out of memory" errors

**Problem:** Docker running out of memory during build/runtime.

**Solution:**

**Increase Docker memory limit:**
- Docker Desktop → Preferences → Resources
- Memory: 4GB minimum, 8GB recommended
- Swap: 2GB
- Apply & Restart

**For Linux:**
```bash
# Check available memory
free -h

# If low, close other applications
```

---

### 9. Changes not reflecting after editing .env

**Problem:** Environment variables not updated.

**Solution:**
```bash
# Restart containers to load new .env
docker-compose down
docker-compose up -d

# For immediate effect
docker-compose restart
```

---

### 10. Extremely slow build times

**Problem:** Docker builds taking 10+ minutes.

**Solutions:**

**Use pre-built images (faster):**
```bash
# Pull from Docker Hub instead of building
# (If we publish pre-built images)
```

**Clear Docker cache:**
```bash
docker system prune -a
docker-compose build --no-cache
```

**Ensure good internet connection:**
- npm downloads packages during build
- Slow internet = slow builds

---

### 11. "Permission denied" errors (Linux)

**Problem:** Docker requires sudo on Linux.

**Solution:**
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then test:
docker ps  # Should work without sudo
```

---

### 12. Frontend blank white screen

**Problem:** React app not loading correctly.

**Solutions:**

**Check browser console:**
- Press F12 → Console tab
- Look for errors (red text)

**Rebuild frontend:**
```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

**Clear browser cache:**
- Ctrl+Shift+R (hard refresh)
- Or open in incognito/private window

---

### 13. CSV import not working

**Problem:** Contact upload fails or shows no data.

**Common issues:**

**File encoding:** Ensure CSV is UTF-8 encoded
```bash
# Convert to UTF-8 (Mac/Linux)
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

**File format:** Check CSV structure
```csv
email,firstName,lastName
john@example.com,John,Doe
```

**File size:** Very large files (>10MB) may timeout
- Split into smaller batches
- Reduce number of custom fields

---

### 14. Development mode (for contributors)

**Problem:** Need hot-reload during development.

**Solution:**
```bash
# Use development docker-compose
docker-compose -f docker-compose.dev.yml up

# Or run locally without Docker:
cd backend && npm install && npm run dev
cd frontend/mailtool && npm install && npm run dev
```

---

## Getting Help

### 1. Collect Debug Info

```bash
# System info
docker --version
docker-compose --version

# Service status
docker-compose ps

# Logs
docker-compose logs > debug.log
```

### 2. Check Documentation
- [README.md](README.md) - Main documentation
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production setup
- [SECURITY.md](SECURITY.md) - Security best practices

### 3. Report Issue

If none of the above helps, open an issue on GitHub with:
- Your OS and Docker version
- Complete error message
- Output of `docker-compose logs`
- Steps to reproduce

**GitHub Issues:** https://github.com/yourusername/mailtool/issues

---

## Quick Fixes Checklist

Before reporting an issue, try these:

- [ ] Is Docker Desktop running?
- [ ] Did you create `.env` from `.env.example`?
- [ ] Is your email App Password correct?
- [ ] Are ports 3000 and 5000 available?
- [ ] Did you try `docker-compose down && docker-compose up -d`?
- [ ] Did you check logs with `docker-compose logs`?
- [ ] Do you have 5GB+ free disk space?
- [ ] Is Docker memory set to 4GB+?

---

## Still Having Issues?

1. **Reset everything:**
```bash
docker-compose down --rmi all --volumes
docker system prune -a
./setup.sh
```

2. **Try manual setup** (without Docker):
See [DEPLOYMENT.md](DEPLOYMENT.md) → Non-Docker Setup

3. **Ask for help:**
- GitHub Discussions: https://github.com/yourusername/mailtool/discussions
- GitHub Issues: https://github.com/yourusername/mailtool/issues
