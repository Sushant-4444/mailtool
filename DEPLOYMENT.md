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
sudo ufw allow 3000/tcp   # Frontend
sudo ufw allow 5000/tcp   # Backend API
sudo ufw allow 6379/tcp   # Redis (optional, only if accessing externally)
sudo ufw allow 22/tcp     # SSH
sudo ufw enable
```

**Note:** Port 6379 (Redis) only needs to be open if accessing Redis from outside Docker network.

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

4. **Deploy services:**
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
# Backend health (includes Redis status)
curl http://localhost:5000/health

# Check all services
docker-compose ps

# Should show:
# - mailtool-backend (healthy)
# - mailtool-frontend (healthy)
# - mailtool-redis (healthy)

# Check Redis directly
docker exec -it mailtool-redis redis-cli ping
# Should return: PONG

# View job queue stats
curl http://localhost:5000/api/campaigns/jobs?status=completed
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
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker and dependencies updated
- [ ] Restrict backend port access (5000)

---

## Performance Tips

1. **Email Rate Limiting (configured in .env)**
   - Gmail Personal: `EMAIL_BATCH_SIZE=8`, `EMAIL_BATCH_DELAY=600` (default)
   - Gmail Workspace: `EMAIL_BATCH_SIZE=20`, `EMAIL_BATCH_DELAY=200`
   - Dedicated SMTP: `EMAIL_BATCH_SIZE=50`, `EMAIL_BATCH_DELAY=50`

2. **Worker Concurrency**
   - `WORKER_CONCURRENCY=2` - Safe for Gmail Personal
   - Increase to 3-5 for dedicated SMTP servers

3. **Resource Limits**
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
  redis:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

4. **Redis Persistence**
   - Job data persists in Redis volume
   - Auto-cleanup: completed jobs after 24h, failed after 7d
   - Monitor Redis memory: `docker stats mailtool-redis`

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
- View job queue: `curl http://localhost:5000/api/campaigns/jobs?status=failed`
- Check Redis connection: `docker-compose logs redis`
- Restart worker: `docker-compose restart backend`

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
