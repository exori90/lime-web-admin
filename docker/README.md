# Docker Deployment Guide

This directory contains Docker-related configurations for deploying the Lime Web Admin application.

## 📁 Structure

```
docker/
├── env/
│   ├── production.env    # Production environment variables
│   └── staging.env       # Staging environment variables
├── docker-compose.production.yml
├── docker-compose.staging.yml
└── README.md
```

## 🚀 Deployment Options

### Option 1: Environment Files (Recommended)

Use the provided environment files with Docker:

```bash
# Production deployment
docker run -d \
  --name lime-web-admin-prod \
  --env-file ./docker/env/production.env \
  -p 3000:3000 \
  your-registry/lime-web-admin:latest

# Staging deployment
docker run -d \
  --name lime-web-admin-staging \
  --env-file ./docker/env/staging.env \
  -p 3001:3000 \
  your-registry/lime-web-admin:staging
```

### Option 2: Docker Compose (Recommended)

```bash
# Production
docker-compose -f docker/docker-compose.production.yml up -d

# Staging
docker-compose -f docker/docker-compose.staging.yml up -d
```

### Option 3: Individual Environment Variables

```bash
docker run -d \
  --name lime-web-admin \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.nektar.gg/api \
  -e NEXT_PUBLIC_AUTH_API_URL=https://login.nektar.gg/api \
  -e NEXT_PUBLIC_USERS_API_URL=https://api.nektar.gg/api/users \
  -e NEXT_PUBLIC_FILES_API_URL=https://api.nektar.gg/api/files \
  -e NEXT_PUBLIC_ORCHESTRATOR_API_URL=https://orchestrator.nektar.gg/api \
  -e NEXT_PUBLIC_APP_NAME="Lime Web Admin" \
  -e NEXT_PUBLIC_APP_VERSION="1.0.0" \
  -e NEXT_PUBLIC_APP_ENV="production" \
  -e NEXT_PUBLIC_ENABLE_DEBUG=false \
  -e NEXT_PUBLIC_ENABLE_ANALYTICS=true \
  -p 3000:3000 \
  your-registry/lime-web-admin:latest
```

## 🔧 Configuration Management

### For Kubernetes

Create ConfigMaps and Secrets:

```yaml
# config-map.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: lime-web-admin-config
data:
  NEXT_PUBLIC_API_BASE_URL: "https://api.nektar.gg/api"
  NEXT_PUBLIC_AUTH_API_URL: "https://login.nektar.gg/api"
  NEXT_PUBLIC_USERS_API_URL: "https://api.nektar.gg/api/users"
  NEXT_PUBLIC_FILES_API_URL: "https://api.nektar.gg/api/files"
  NEXT_PUBLIC_ORCHESTRATOR_API_URL: "https://orchestrator.nektar.gg/api"
  NEXT_PUBLIC_APP_NAME: "Lime Web Admin"
  NEXT_PUBLIC_ENABLE_DEBUG: "false"
  NEXT_PUBLIC_ENABLE_ANALYTICS: "true"

---
apiVersion: v1
kind: Secret
metadata:
  name: lime-web-admin-secrets
type: Opaque
stringData:
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: "GA_MEASUREMENT_ID"
```

### For Docker Swarm

```yaml
# docker-stack.yml
version: '3.8'

services:
  lime-web-admin:
    image: your-registry/lime-web-admin:latest
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_BASE_URL=https://api.nektar.gg/api
      # ... other env vars
    configs:
      - source: app-config
        target: /app/.env.production
    secrets:
      - analytics-key
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s

configs:
  app-config:
    external: true

secrets:
  analytics-key:
    external: true
```

### For Server-side Scripts

Create a deployment script that pulls the image and sets environment variables:

```bash
#!/bin/bash
# deploy.sh

ENV=${1:-production}

# Pull latest image
docker pull your-registry/lime-web-admin:latest

# Stop existing container
docker stop lime-web-admin-$ENV 2>/dev/null || true
docker rm lime-web-admin-$ENV 2>/dev/null || true

# Start new container with environment file
docker run -d \
  --name lime-web-admin-$ENV \
  --env-file ./docker/env/$ENV.env \
  --restart unless-stopped \
  -p 3000:3000 \
  your-registry/lime-web-admin:latest

echo "Deployed lime-web-admin:latest to $ENV environment"
```

## 🔐 Security Notes

1. **Environment Files**: Keep `.env` files secure and never commit them with sensitive data
2. **Image Registry**: Use a private registry for production images
3. **Secrets Management**: Use proper secrets management for sensitive values
4. **Network Security**: Run containers in isolated networks
5. **Health Checks**: Always configure health checks for production deployments

## 🔄 CI/CD Integration

Your external deployment app can:

1. **Monitor for new images** in your registry
2. **Pull latest images** when available
3. **Use the environment files** provided in this directory
4. **Execute rolling deployments** with zero downtime

Example deployment flow:
```
GitHub Push → CI builds image → Registry updated → 
External app detects new image → Pulls image → 
Deploys with docker/env/production.env
```