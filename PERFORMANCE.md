# Performance & Scalability Guide

## Overview

MailTool uses **asynchronous job queue processing** with Redis and BullMQ to handle large-scale email campaigns without HTTP timeouts or server overload.

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │─────▶│   Backend    │─────▶│    Redis     │
│  (React UI)  │      │  (Express)   │      │ (Job Queue)  │
└──────────────┘      └──────────────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   BullMQ     │
                      │   Worker     │
                      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Parallel     │
                      │ Email Sender │
                      └──────────────┘
```

## How It Works

### 1. Campaign Submission (Instant)
- User submits campaign with 1000 emails
- Backend queues job in Redis
- **Returns immediately** with Job ID (~100ms response)
- No HTTP timeout, no waiting

### 2. Background Processing (Parallel)
- BullMQ worker picks up job from queue
- Splits 1000 emails into batches (e.g., 125 batches of 8)
- **Sends each batch in parallel** using `Promise.all()`
- Adds configurable delay between batches

### 3. Real-Time Tracking
- Frontend polls job status: `GET /api/campaigns/status/{jobId}`
- Returns: `waiting`, `active`, `completed`, `failed`
- Shows progress, success count, failure details

## Performance Comparison

### Before (Synchronous)
```
┌─────────────────────────────────────────┐
│ Send 1000 emails sequentially          │
│ 1 email → wait 1s → next email         │
│                                         │
│ Time: 16+ minutes ❌                    │
│ HTTP Timeout: 30-60 seconds ❌          │
│ User Experience: Terrible ❌            │
└─────────────────────────────────────────┘
```

### After (Async + Parallel Batches)
```
┌─────────────────────────────────────────┐
│ Queue job instantly                     │
│ Background: 125 batches × 8 parallel    │
│ Batch delay: 600ms                      │
│                                         │
│ Time: ~75 seconds ✅                     │
│ HTTP Timeout: Never (instant queue) ✅  │
│ User Experience: Excellent ✅           │
│ Speed Improvement: 13x faster ⚡        │
└─────────────────────────────────────────┘
```

## Configuration Guide

### Email Provider Settings

#### Gmail Personal (500 emails/day)
```env
EMAIL_BATCH_SIZE=8        # Conservative
EMAIL_BATCH_DELAY=600     # 600ms between batches
WORKER_CONCURRENCY=2      # 2 campaigns at once
WORKER_MAX_JOBS=3         # Max 3 jobs/second
```

**Performance:**
- 500 emails = ~38 seconds
- ~18 emails/minute (safe rate)
- No risk of account suspension

#### Gmail Workspace (2000 emails/day)
```env
EMAIL_BATCH_SIZE=20       # More aggressive
EMAIL_BATCH_DELAY=200     # 200ms between batches
WORKER_CONCURRENCY=3      # 3 campaigns
WORKER_MAX_JOBS=5         # Max 5 jobs/second
```

**Performance:**
- 2000 emails = ~2-3 minutes
- ~40-50 emails/minute
- Safe for business accounts

#### Dedicated SMTP (SendGrid, Mailgun, etc.)
```env
EMAIL_BATCH_SIZE=50       # Very aggressive
EMAIL_BATCH_DELAY=50      # 50ms between batches
WORKER_CONCURRENCY=5      # 5 campaigns
WORKER_MAX_JOBS=10        # Max 10 jobs/second
```

**Performance:**
- 10,000 emails = ~30-60 seconds ⚡
- ~600+ emails/minute
- Use only with dedicated SMTP servers

### Configuration Variables Explained

| Variable | Purpose | Impact | Recommended |
|----------|---------|--------|-------------|
| `EMAIL_BATCH_SIZE` | Emails sent in parallel per batch | Higher = faster, more risk | 8-50 |
| `EMAIL_BATCH_DELAY` | Milliseconds between batches | Lower = faster, more risk | 50-600ms |
| `WORKER_CONCURRENCY` | Campaigns processed simultaneously | Higher = more throughput | 2-5 |
| `WORKER_MAX_JOBS` | Job start rate limit | Prevents queue overload | 3-10 |
| `WORKER_DURATION` | Rate limit window (ms) | Works with MAX_JOBS | 1000 |

## Real-World Examples

### Example 1: Small Newsletter (100 emails)
**Gmail Personal settings:**
- 100 emails ÷ 8 per batch = 13 batches
- 13 batches × 600ms = ~8 seconds
- **Total time: ~10 seconds** ✅

### Example 2: Medium Campaign (500 emails)
**Gmail Personal settings:**
- 500 emails ÷ 8 per batch = 63 batches
- 63 batches × 600ms = ~38 seconds
- **Total time: ~40 seconds** ✅

### Example 3: Large Campaign (5000 emails)
**Gmail Workspace settings:**
- Day 1: 2000 emails = ~3 minutes ✅
- Day 2: 2000 emails = ~3 minutes ✅
- Day 3: 1000 emails = ~1.5 minutes ✅
- **Total time: 3 days (automatic)** ✅

**Dedicated SMTP settings:**
- 5000 emails ÷ 50 per batch = 100 batches
- 100 batches × 50ms = ~5 seconds
- **Total time: ~10 seconds** ⚡⚡⚡

## Job Queue Features

### Automatic Retry
- Failed jobs retry automatically (3 attempts)
- Exponential backoff (2s, 4s, 8s)
- Transient errors resolved automatically

### Job Persistence
- Completed jobs: Kept for 24 hours
- Failed jobs: Kept for 7 days
- Automatic cleanup to save space

### Job States
- `waiting` - In queue, not started
- `active` - Currently processing
- `completed` - Successfully finished
- `failed` - Failed after all retries
- `delayed` - Scheduled for later

## API Endpoints

### Queue a Campaign
```bash
POST /api/campaigns/send
Content-Type: application/json

{
  "subject": "Hello {{firstName}}",
  "audience": [...],
  "htmlContent": "..."
}

# Response (instant):
{
  "jobId": "campaign-1234567890",
  "status": "queued",
  "message": "Campaign queued successfully"
}
```

### Check Job Status
```bash
GET /api/campaigns/status/campaign-1234567890

# Response:
{
  "exists": true,
  "jobId": "campaign-1234567890",
  "state": "completed",
  "progress": 100,
  "result": {
    "success": 485,
    "failed": 15,
    "errors": [...]
  }
}
```

### List All Jobs
```bash
GET /api/campaigns/jobs?status=completed&start=0&end=10

# Response:
{
  "status": "completed",
  "count": 5,
  "jobs": [...]
}
```

## Monitoring

### Docker Logs
```bash
# View all logs
docker-compose logs -f

# Backend worker logs
docker-compose logs -f backend | grep "Campaign"

# Redis logs
docker-compose logs -f redis
```

### Health Checks
```bash
# Check backend health (includes Redis status)
curl http://localhost:5000/health

# Check Redis directly
docker exec -it mailtool-redis redis-cli ping
# Should return: PONG

# View active jobs
docker exec -it mailtool-redis redis-cli keys "bull:campaigns:*"
```

### Performance Metrics
```bash
# Docker stats
docker stats mailtool-backend mailtool-redis

# Redis memory usage
docker exec -it mailtool-redis redis-cli info memory
```

## Troubleshooting

### Jobs Stuck in Queue
```bash
# Check worker is running
docker-compose ps backend

# Restart worker
docker-compose restart backend

# Check Redis connection
docker-compose logs redis
```

### High Redis Memory
```bash
# Check memory usage
docker exec -it mailtool-redis redis-cli info memory

# Clear completed jobs manually
curl -X DELETE http://localhost:5000/api/campaigns/jobs/cleanup

# Or restart Redis (will clear all jobs)
docker-compose restart redis
```

### Slow Email Sending
```bash
# Increase batch size (if safe)
EMAIL_BATCH_SIZE=20

# Decrease delay between batches
EMAIL_BATCH_DELAY=200

# Check SMTP connection
docker-compose logs backend | grep "SMTP"
```

## Best Practices

### 1. Start Conservative
- Use default settings first
- Monitor for rate limit errors
- Gradually increase if no issues

### 2. Respect Email Limits
- Gmail Personal: Stay under 450-480/day (buffer)
- Monitor daily totals across all campaigns
- Add delays for safety

### 3. Monitor Job Queue
- Check failed jobs regularly
- Investigate error patterns
- Adjust settings based on failures

### 4. Resource Planning
- **Small campaigns (<500):** Default settings work
- **Medium (500-2000):** May need multiple days for Gmail
- **Large (>2000):** Use dedicated SMTP or split campaigns

### 5. Testing
```bash
# Test with small batch first
EMAIL_BATCH_SIZE=5
WORKER_CONCURRENCY=1

# Send to 10-20 test emails
# Monitor logs and adjust
```

## Scaling Further

### Horizontal Scaling (Multiple Workers)
```yaml
# docker-compose.yml
services:
  backend:
    replicas: 3  # 3 worker instances
  redis:
    # Shared queue
```

### Redis Clustering (High Availability)
```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
```

### Load Balancing
```
Internet → Nginx → Multiple Backend Instances → Shared Redis Queue
```

## Summary

✅ **Instant Response** - No HTTP timeouts  
✅ **Parallel Processing** - 10x-100x faster  
✅ **Automatic Retry** - Handles transient failures  
✅ **Real-Time Tracking** - Poll job status  
✅ **Configurable** - Tune for your provider  
✅ **Production-Ready** - Handles 1000s of emails  

**Your campaigns now scale! 🚀**
