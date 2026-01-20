# Deployment Guide

## Local Development

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access: http://localhost:3000

---

## Production Deployment

### Option 1: DigitalOcean / AWS / Any VPS

#### Prerequisites
- Ubuntu 20.04+ server
- Docker & Docker Compose installed
- Domain name (optional but recommended)

#### Step-by-step

1. **SSH into your server**
```bash
ssh root@your-server-ip
```

2. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. **Clone repository**
```bash
git clone https://github.com/yourusername/mailtool.git
cd mailtool
```

4. **Configure environment**
```bash
cp .env.example .env
nano .env  # Edit with your email credentials
```

5. **Start services**
```bash
docker-compose up -d
```

6. **Configure firewall**
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

Access: http://your-server-ip:3000

#### Add HTTPS with Nginx (Recommended)

1. **Install Nginx**
```bash
sudo apt install nginx certbot python3-certbot-nginx
```

2. **Create Nginx config**
```bash
sudo nano /etc/nginx/sites-available/mailtool
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

3. **Enable site**
```bash
sudo ln -s /etc/nginx/sites-available/mailtool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Get SSL certificate**
```bash
sudo certbot --nginx -d yourdomain.com
```

Access: https://yourdomain.com

---

### Option 2: Heroku (Cloud Platform)

⚠️ Note: Heroku's free tier has been discontinued. Consider Railway, Render, or Fly.io instead.

---

### Option 3: Railway.app (Easy Cloud Deploy)

1. **Fork the repository** on GitHub

2. **Sign up** at [railway.app](https://railway.app)

3. **New Project** → **Deploy from GitHub**

4. **Add services:**
   - Add MongoDB database
   - Deploy backend
   - Deploy frontend

5. **Add environment variables** in Railway dashboard:
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_HOST`
   - `EMAIL_PORT`

6. **Set custom domain** (optional)

---

### Option 4: Docker Swarm (Multi-Server)

For high availability:

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mailtool

# Scale services
docker service scale mailtool_backend=3
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Check all services
docker-compose ps
```

### Logs

```bash
# View logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Backup Data

MailTool is stateless - no database to backup! 

All data is session-based (contacts, campaigns). For permanent storage of campaign history, you can optionally add logging to files.

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up --build -d
```

---

## Security Checklist

- [ ] Change default ports in production
- [ ] Use strong passwords in .env
- [ ] Enable firewall (ufw)
- [ ] Use HTTPS (SSL certificate)
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker and dependencies updated
- [ ] Restrict MongoDB access (not public)

---

## Performance Tips

1. **Email Rate Limiting**
   - Gmail: Max 500/day
   - Add delays between emails (already implemented)

2. **Resource Limits**
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

3. **Database Optimization**
   - Regular cleanup of old campaigns
   - Index frequently queried fields

---

## Troubleshooting

### Port conflicts
```bash
# Change ports in docker-compose.yml
ports:
  - "8080:3000"  # Frontend
  - "8081:5000"  # Backend
```

### Out of memory
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources
```

### Email sending fails
- Check .env credentials
- Verify SMTP port not blocked
- Check email provider limits

---

## Cost Estimate

**Self-Hosted (VPS):**
- DigitalOcean Droplet: $6/month (1GB RAM)
- Domain name: $10-15/year
- **Total: ~$7-8/month**

**Serverless (Railway/Render):**
- Free tier: 500 hours/month
- Paid: $5-10/month
- **Total: $0-10/month**

---

## Support

Need help deploying? Open an issue or discussion on GitHub!
