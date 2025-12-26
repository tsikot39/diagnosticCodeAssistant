# Deployment Guide

## Production Deployment Options

This guide covers deploying the Diagnostic Code Assistant to production.

## Option 1: Railway (Recommended - Easiest)

Railway provides a simple all-in-one deployment solution.

### Prerequisites
1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`
3. Login: `railway login`

### Deploy Backend + Database

```powershell
# Initialize Railway project
railway init

# Add PostgreSQL database
railway add --database postgres

# Deploy backend
cd backend
railway up

# Set environment variables
railway variables set DATABASE_URL=${{ RAILWAY_DATABASE_URL }}
railway variables set BACKEND_CORS_ORIGINS='["https://your-frontend-url.vercel.app"]'
```

### Deploy Frontend to Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app/api/v1
```

**Estimated Cost**: $5-20/month (Railway) + Free (Vercel)

---

## Option 2: AWS (Enterprise Grade)

### Backend (ECS + RDS)

1. **Create RDS PostgreSQL Database**
```bash
aws rds create-db-instance \
  --db-instance-identifier diagnostic-codes-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

2. **Build and Push Docker Image**
```bash
# Create Dockerfile for backend
cd backend

# Build
docker build -t diagnostic-codes-api .

# Tag and push to ECR
aws ecr create-repository --repository-name diagnostic-codes-api
docker tag diagnostic-codes-api:latest YOUR_ECR_URL/diagnostic-codes-api:latest
docker push YOUR_ECR_URL/diagnostic-codes-api:latest
```

3. **Deploy to ECS**
- Create ECS cluster
- Create task definition
- Create service with load balancer

### Frontend (CloudFront + S3)

```bash
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name your-bucket-name.s3.amazonaws.com
```

**Estimated Cost**: $50-200/month

---

## Option 3: DigitalOcean App Platform

### Deploy via GitHub

1. Connect GitHub repository to DigitalOcean
2. Configure app:
   - **Backend**: Python app, run command: `uvicorn main:app --host 0.0.0.0 --port 8080`
   - **Frontend**: Static site, build command: `npm run build`, output: `dist`
   - **Database**: Managed PostgreSQL database

3. Set environment variables in DigitalOcean dashboard

**Estimated Cost**: $12-30/month

---

## Environment Variables for Production

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/diagnostic_codes

# API Configuration
API_V1_PREFIX=/api/v1
PROJECT_NAME=Diagnostic Code Assistant

# CORS - Update with your frontend URL
BACKEND_CORS_ORIGINS=["https://your-frontend-url.com"]

# Security
SECRET_KEY=your-super-secret-key-min-32-characters
ENVIRONMENT=production

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.com/api/v1
```

---

## Pre-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Set strong SECRET_KEY (32+ characters)
- [ ] Configure CORS with actual frontend URL
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Review database connection security

### Configuration
- [ ] Set production environment variables
- [ ] Configure database connection pooling
- [ ] Set up database backups
- [ ] Configure logging level
- [ ] Set up error monitoring (Sentry)

### Performance
- [ ] Enable database indexes
- [ ] Configure caching headers
- [ ] Optimize frontend build (gzip, minification)
- [ ] Set up CDN for static assets
- [ ] Configure connection pooling

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation
- [ ] Create health check endpoints
- [ ] Set up alerts for failures

---

## GitHub Actions Secrets

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

### Required Secrets
- `RAILWAY_TOKEN` - Railway API token
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `BACKEND_URL` - Production backend URL
- `FRONTEND_URL` - Production frontend URL

---

## Deployment Scripts

### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose (Production)
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: diagnostic_codes
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/diagnostic_codes
    depends_on:
      - db
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
    restart: always

volumes:
  postgres_data:
```

---

## Post-Deployment

### Verify Deployment
```bash
# Check backend health
curl https://your-backend-url.com/health

# Check database connectivity
curl https://your-backend-url.com/health/db

# Check frontend
curl https://your-frontend-url.com
```

### Run Database Migrations
```bash
# SSH into backend server or run via Railway CLI
railway run alembic upgrade head
```

### Monitor Logs
```bash
# Railway
railway logs

# Vercel
vercel logs

# AWS CloudWatch
aws logs tail /aws/ecs/diagnostic-codes-api --follow
```

---

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correctly formatted
- Verify all required environment variables are set
- Check logs for Python errors
- Ensure database is accessible

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running and accessible
- Check browser console for errors

### Database connection issues
- Verify database is running
- Check connection string format
- Ensure firewall allows connections
- Verify credentials are correct

---

## Rollback Procedure

### Railway
```bash
railway rollback
```

### Vercel
```bash
vercel rollback
```

### Manual rollback
1. Revert to previous Git commit
2. Redeploy using CI/CD pipeline
3. Run database migration rollback if needed: `alembic downgrade -1`

---

## Cost Estimates

| Platform | Backend | Database | Frontend | Total/Month |
|----------|---------|----------|----------|-------------|
| Railway + Vercel | $5 | $5 | Free | $10 |
| DigitalOcean | $12 | $15 | Free | $27 |
| AWS (t3.micro) | $10 | $15 | $1 | $26 |
| AWS (t3.small) | $20 | $25 | $5 | $50 |

**Recommendation**: Start with Railway + Vercel, migrate to AWS as you scale.
