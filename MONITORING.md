# Monitoring & Observability Guide

## Overview
This guide covers monitoring, error tracking, and observability for the Diagnostic Code Assistant in production.

## Error Tracking with Sentry

### Setup

1. **Create Sentry Account**
   - Sign up at [sentry.io](https://sentry.io)
   - Create a new project for both backend (Python) and frontend (React)

2. **Get DSN Keys**
   - Navigate to Project Settings → Client Keys (DSN)
   - Copy the DSN for each project

3. **Configure Environment Variables**

**Backend** (.env):
```env
SENTRY_DSN=https://your-backend-key@o123456.ingest.sentry.io/7654321
ENVIRONMENT=production
```

**Frontend** (.env.production):
```env
VITE_SENTRY_DSN=https://your-frontend-key@o123456.ingest.sentry.io/1234567
```

### Features Enabled

#### Backend (Python/FastAPI)
- ✅ Automatic error capturing
- ✅ Performance monitoring (10% sample rate)
- ✅ SQL query tracking
- ✅ Request/Response context
- ✅ User identification (when auth is added)

#### Frontend (React)
- ✅ Automatic error capturing
- ✅ React component tree in errors
- ✅ User session replay (on errors)
- ✅ Performance monitoring
- ✅ Breadcrumb tracking (user actions)

### Testing Sentry Integration

**Backend:**
```python
# Add a test endpoint
@app.get("/sentry-test")
def trigger_error():
    division_by_zero = 1 / 0
```

**Frontend:**
```typescript
// Add a test button
<button onClick={() => { throw new Error("Test Sentry") }}>
  Test Error
</button>
```

Visit the endpoint/click button and check Sentry dashboard for the error.

---

## Rate Limiting

### Current Configuration

**Global Limits:**
- Default: 100 requests per minute per IP
- Root endpoint: 60 requests per minute
- Diagnostic codes list: 100 requests per minute

### Customizing Rate Limits

Edit `backend/main.py` and `backend/app/api/v1/endpoints/diagnostic_codes.py`:

```python
# Per-endpoint limit
@router.get("")
@limiter.limit("200/minute")  # Increase to 200
async def get_diagnostic_codes(request: Request, ...):
```

### Rate Limit Headers

Responses include headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

### Testing Rate Limits

```bash
# Trigger rate limit
for i in {1..150}; do
  curl http://localhost:8000/api/v1/diagnostic-codes
done
```

Expected response when limited:
```json
{
  "error": "Rate limit exceeded: 100 per 1 minute"
}
```

---

## Health Checks

### Endpoints

**Backend Health:**
```bash
curl https://your-backend-url.com/health
# Response: {"status": "healthy", "service": "diagnostic-code-assistant-api", "version": "1.0.0"}
```

**Database Health:**
```bash
curl https://your-backend-url.com/health/db
# Response: {"status": "healthy", "database": "connected"}
```

**Frontend Health (nginx):**
```bash
curl https://your-frontend-url.com/health
# Response: healthy
```

### Uptime Monitoring

**Recommended Services:**

1. **UptimeRobot** (Free tier available)
   - Monitor: `/health` endpoint every 5 minutes
   - Alert: Email/SMS when down
   - Setup: https://uptimerobot.com

2. **Better Uptime** (Free tier)
   - Status page included
   - Multiple regions
   - Setup: https://betteruptime.com

3. **Pingdom** (Paid)
   - Advanced monitoring
   - Performance tracking
   - Setup: https://pingdom.com

**Configuration Example (UptimeRobot):**
```
Monitor Type: HTTP(s)
URL: https://your-backend-url.com/health
Monitoring Interval: 5 minutes
Alert Contacts: your-email@example.com
```

---

## Logging

### Current Setup

**Backend Logging:**
- Uvicorn access logs (requests/responses)
- Application logs (errors, warnings)
- Database query logs (in development)

**Log Levels:**
- `DEBUG`: Development only
- `INFO`: General information
- `WARNING`: Warning messages
- `ERROR`: Error messages
- `CRITICAL`: Critical failures

### Viewing Logs

**Local Development:**
```bash
# Backend logs
cd backend
tail -f uvicorn.log
```

**Production (Railway):**
```bash
railway logs --tail
```

**Production (Vercel):**
```bash
vercel logs --follow
```

**Production (AWS):**
```bash
aws logs tail /aws/ecs/diagnostic-codes-api --follow
```

### Log Aggregation (Optional)

For centralized logging, consider:

**1. Logtail** (Free tier)
```bash
pip install logtail-python
```

**2. Papertrail** (Free tier)
```bash
# Add to Railway/Heroku
# Logs automatically forwarded
```

**3. CloudWatch** (AWS)
- Automatic with ECS/Lambda
- 5GB free tier per month

---

## Performance Monitoring

### Metrics to Track

**Backend:**
- Request duration (p50, p95, p99)
- Error rate
- Throughput (requests per second)
- Database query time
- Memory usage
- CPU usage

**Frontend:**
- Page load time
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- API request duration
- Bundle size

### Tools

**1. Sentry Performance**
- Included with Sentry setup
- Automatic transaction tracking
- Database query performance

**2. New Relic** (Free tier available)
```bash
pip install newrelic
# Add configuration
```

**3. DataDog** (14-day trial)
- Full-stack monitoring
- APM + Infrastructure

**4. Google Analytics** (Free)
- User behavior tracking
- Page performance

---

## Alerts & Notifications

### Setting Up Alerts

**Sentry Alerts:**
1. Go to Alerts → Create Alert
2. Configure conditions:
   - Error rate > 10 per minute
   - New issue created
   - Performance degradation

**UptimeRobot Alerts:**
1. Add alert contacts
2. Configure:
   - Email notifications
   - SMS (premium)
   - Webhook to Slack/Discord

**Slack Integration:**
```bash
# Sentry → Settings → Integrations → Slack
# Add webhook URL for notifications
```

---

## Database Monitoring

### Key Metrics
- Connection pool usage
- Query execution time
- Slow queries (> 1 second)
- Deadlocks
- Table sizes

### Tools

**1. Railway Dashboard**
- Built-in metrics
- Query performance
- Connection stats

**2. pgAdmin**
```bash
# Connect to production database (read-only recommended)
# Monitor: Sessions, Locks, Statistics
```

**3. AWS RDS Performance Insights**
- Detailed query analysis
- Wait events
- Top SQL queries

---

## Security Monitoring

### What to Monitor
- Failed authentication attempts (when auth added)
- Unusual traffic patterns
- SQL injection attempts
- XSS attempts
- DDoS patterns

### Tools

**1. Cloudflare** (Free tier)
- DDoS protection
- Web Application Firewall (WAF)
- Bot protection
- Rate limiting

**2. AWS WAF**
- SQL injection rules
- XSS protection
- Rate-based rules

---

## Dashboard Setup

### Example Grafana Dashboard

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

volumes:
  grafana-data:
```

### Metrics Collection

**Add Prometheus metrics to backend:**
```bash
pip install prometheus-fastapi-instrumentator
```

```python
# main.py
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

---

## Cost Optimization

### Free Tier Recommendations

| Service | Free Tier | Best For |
|---------|-----------|----------|
| Sentry | 5K errors/month | Error tracking |
| UptimeRobot | 50 monitors | Uptime monitoring |
| Logtail | 1GB/month | Log aggregation |
| Cloudflare | Unlimited bandwidth | DDoS protection |
| Google Analytics | Unlimited | User analytics |

### Paid Recommendations (Scale)

| Service | Cost | Best For |
|---------|------|----------|
| Datadog | $15/host/month | Full observability |
| New Relic | $99/month | APM |
| PagerDuty | $19/user/month | Incident management |

---

## Troubleshooting Guide

### High Error Rate

1. Check Sentry for error details
2. Review recent deployments
3. Check database health
4. Review API response times
5. Check external service status

### Slow Performance

1. Check Sentry performance tab
2. Review database query performance
3. Check network latency
4. Review frontend bundle size
5. Check server resources (CPU/Memory)

### Database Issues

1. Check connection pool exhaustion
2. Review slow query log
3. Check for table locks
4. Review index usage
5. Check disk space

---

## Best Practices

✅ **Set up alerts before issues occur**
✅ **Monitor both frontend and backend**
✅ **Track business metrics, not just technical**
✅ **Regular review of dashboards (weekly)**
✅ **Document incident response procedures**
✅ **Test monitoring setup in staging first**
✅ **Keep sensitive data out of logs**
✅ **Set up log retention policies**

---

## Quick Reference

### Essential URLs
- Sentry: https://sentry.io
- UptimeRobot: https://uptimerobot.com
- Vercel: https://vercel.com
- Railway: https://railway.app

### Key Commands
```bash
# View backend logs
railway logs --tail

# View frontend logs
vercel logs --follow

# Test health endpoint
curl https://your-api.com/health

# Check Sentry from CLI
sentry-cli monitors list
```
