# Environment Configuration Guide

This guide explains how to set up environment variables for different environments (development, test, production) in your Lime Web Admin application.

## 🌍 Environments

The application supports three environments:

- **Development** (`local`): For local development
- **Test** (`test`): For staging/testing environment  
- **Production** (`prod`): For live production environment

## 🚀 Quick Setup

### Local Development

The `.env.local` file is already configured for local development. You can customize it by editing the file directly:

```powershell
# Check current configuration
npm run env:check

# Edit the file if needed
notepad .env.local
```

### Deployment Environments

For test and production environments, configurations are managed through GitHub Actions using repository secrets. See the [Deployment Guide](./deployment.md) for details.

## 📋 Environment Variables Reference

### Core API Configuration

| Variable | Description | Development | Test | Production |
|----------|-------------|-------------|------|------------|
| `NODE_ENV` | Node environment | `development` | `test` | `production` |
| `NEXT_PUBLIC_API_BASE_URL` | Main API endpoint | `http://localhost:3001/api` | `https://api-test.lime-admin.com/api` | `https://api.lime-admin.com/api` |
| `NEXT_PUBLIC_AUTH_API_URL` | Auth API endpoint | `http://localhost:3001/api/auth` | `https://api-test.lime-admin.com/api/auth` | `https://api.lime-admin.com/api/auth` |
| `NEXT_PUBLIC_USERS_API_URL` | Users API endpoint | `http://localhost:3001/api/users` | `https://api-test.lime-admin.com/api/users` | `https://api.lime-admin.com/api/users` |
| `NEXT_PUBLIC_FILES_API_URL` | Files API endpoint | `http://localhost:3001/api/files` | `https://api-test.lime-admin.com/api/files` | `https://api.lime-admin.com/api/files` |
| `NEXT_PUBLIC_GAME_WORLD_HUB_URL` | Game World SignalR hub | `http://localhost:5002/hubs/gameworld` | `https://api-test.lime-admin.com/hubs/gameworld` | `https://api.lime-admin.com/hubs/gameworld` |

### Application Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `"Lime Web Admin"` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `"1.0.0"` |
| `NEXT_PUBLIC_APP_ENV` | App environment | Same as `NODE_ENV` |

### Feature Flags

| Variable | Description | Development | Test | Production |
|----------|-------------|-------------|------|------------|
| `NEXT_PUBLIC_ENABLE_DEBUG` | Enable debug mode | `true` | `true` | `false` |
| `NEXT_PUBLIC_ENABLE_MOCK_API` | Enable API mocking | `false` | `false` | `false` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `false` | `false` | `true` |

### API Behavior

| Variable | Description | Development | Test | Production |
|----------|-------------|-------------|------|------------|
| `NEXT_PUBLIC_API_TIMEOUT` | Request timeout (ms) | `15000` | `10000` | `10000` |
| `NEXT_PUBLIC_API_RETRIES` | Retry attempts | `2` | `3` | `3` |
| `NEXT_PUBLIC_API_RETRY_DELAY` | Retry delay (ms) | `500` | `1000` | `1000` |

### File Upload Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Max file size (MB) | `5` |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | Allowed MIME types | `"image/jpeg,image/png,image/gif,application/pdf"` |

### Caching

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CACHE_TTL` | Cache TTL (ms) | `300000` (5 minutes) |

### Security (Server-side only)

| Variable | Description | Required In |
|----------|-------------|-------------|
| `JWT_SECRET` | JWT signing secret | Production |
| `JWT_REFRESH_SECRET` | Refresh token secret | Production |
| `DATABASE_URL` | Database connection string | All |
| `REDIS_URL` | Redis connection string | All |

## 📝 Environment Templates

### Development (.env.local)

```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001/api/auth
NEXT_PUBLIC_USERS_API_URL=http://localhost:3001/api/users
NEXT_PUBLIC_FILES_API_URL=http://localhost:3001/api/files
NEXT_PUBLIC_GAME_WORLD_HUB_URL=http://localhost:5002/hubs/gameworld

NEXT_PUBLIC_APP_NAME="Lime Web Admin (Local)"
NEXT_PUBLIC_APP_VERSION="1.0.0-dev"
NEXT_PUBLIC_APP_ENV="development"

NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false

NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_API_RETRIES=2
NEXT_PUBLIC_API_RETRY_DELAY=500

NEXT_PUBLIC_MAX_FILE_SIZE=10
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
NEXT_PUBLIC_CACHE_TTL=300000

DATABASE_URL=postgresql://localhost:5432/lime_admin_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-for-local-development-only
JWT_REFRESH_SECRET=your-super-secret-refresh-key-for-local-development-only
```

### Test (.env.test)

```env
NODE_ENV=test
NEXT_PUBLIC_API_BASE_URL=https://api-test.lime-admin.com/api
NEXT_PUBLIC_AUTH_API_URL=https://api-test.lime-admin.com/api/auth
NEXT_PUBLIC_USERS_API_URL=https://api-test.lime-admin.com/api/users
NEXT_PUBLIC_FILES_API_URL=https://api-test.lime-admin.com/api/files
NEXT_PUBLIC_GAME_WORLD_HUB_URL=https://api-test.lime-admin.com/hubs/gameworld

NEXT_PUBLIC_APP_NAME="Lime Web Admin (Test)"
NEXT_PUBLIC_APP_VERSION="1.0.0-test"
NEXT_PUBLIC_APP_ENV="test"

NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false

NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_API_RETRY_DELAY=1000

NEXT_PUBLIC_MAX_FILE_SIZE=5
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
NEXT_PUBLIC_CACHE_TTL=600000

DATABASE_URL=postgresql://test-db.lime-admin.com:5432/lime_admin_test
REDIS_URL=redis://test-redis.lime-admin.com:6379
JWT_SECRET=test-environment-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=test-environment-refresh-secret-key-change-in-production
```

### Production (.env.production)

```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.lime-admin.com/api
NEXT_PUBLIC_AUTH_API_URL=https://api.lime-admin.com/api/auth
NEXT_PUBLIC_USERS_API_URL=https://api.lime-admin.com/api/users
NEXT_PUBLIC_FILES_API_URL=https://api.lime-admin.com/api/files
NEXT_PUBLIC_GAME_WORLD_HUB_URL=https://api.lime-admin.com/hubs/gameworld

NEXT_PUBLIC_APP_NAME="Lime Web Admin"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_ENV="production"

NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true

NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_API_RETRIES=3
NEXT_PUBLIC_API_RETRY_DELAY=1000

NEXT_PUBLIC_MAX_FILE_SIZE=5
NEXT_PUBLIC_ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
NEXT_PUBLIC_CACHE_TTL=300000

DATABASE_URL=REPLACE_WITH_PRODUCTION_DATABASE_URL
REDIS_URL=REPLACE_WITH_PRODUCTION_REDIS_URL
JWT_SECRET=CHANGE_THIS_IN_PRODUCTION_SUPER_SECURE_SECRET_KEY
JWT_REFRESH_SECRET=CHANGE_THIS_IN_PRODUCTION_SUPER_SECURE_REFRESH_KEY
```

## 🔧 Using Environment Configuration

### In Your Code

```tsx
import { appConfig, featureFlags, validateEnvironment } from '@/services/api';

// Access app configuration
console.log(appConfig.name); // "Lime Web Admin"
console.log(appConfig.environment); // "development"
console.log(appConfig.maxFileSize); // 5242880 (5MB in bytes)

// Check feature flags
if (featureFlags.enableDebug) {
  console.log('Debug mode enabled');
}

// Validate environment
const validation = validateEnvironment();
if (!validation.valid) {
  console.error('Environment validation failed:', validation.errors);
}
```

### Environment Detection

The API service automatically detects the environment and applies the appropriate configuration:

```tsx
import { apiService } from '@/services/api';

// The service is automatically configured based on the current environment
const response = await apiService.get('/users');
```

## 🔒 Security Best Practices

### Development Environment
- Use placeholder secrets (already provided in templates)
- Keep debug mode enabled for easier troubleshooting
- Use local database/Redis instances

### Test Environment  
- Use test/sandbox credentials for external services
- Keep debug mode enabled for testing
- Use test databases that mirror production structure

### Production Environment
- **NEVER** use default or placeholder secrets
- Generate strong, unique JWT secrets (min 32 characters)
- Disable debug mode
- Use production databases with proper security
- Enable analytics and monitoring
- Use environment variables in your hosting platform (don't commit .env.production)

## 🚦 Environment Validation

The API service includes built-in environment validation:

```tsx
import { validateEnvironment } from '@/services/api';

const validation = validateEnvironment();
if (!validation.valid) {
  console.error('Environment issues:', validation.errors);
}
```

Common validation errors:
- Missing required environment variables
- Default secrets in production
- Invalid API URLs

## 📦 Deployment

### Vercel
Set environment variables in your Vercel dashboard:
```bash
vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel env add JWT_SECRET production
```

### Docker
Use environment files or pass variables:
```bash
docker run --env-file .env.production your-app
```

### Manual Deployment
Set environment variables in your hosting platform's dashboard or use:
```bash
export NEXT_PUBLIC_API_BASE_URL=https://api.lime-admin.com/api
export JWT_SECRET=your-production-secret
```

## 🔍 Troubleshooting

### Common Issues

1. **API calls failing**: Check `NEXT_PUBLIC_API_BASE_URL` is correct
2. **Environment not detected**: Verify `NODE_ENV` and `NEXT_PUBLIC_APP_ENV`
3. **Configuration not loading**: Ensure environment variables are set correctly
4. **Production validation failing**: Check all required secrets are set

### Debug Environment

Enable debug mode to see current configuration:
```env
NEXT_PUBLIC_ENABLE_DEBUG=true
```

This will log the current environment configuration to the console.