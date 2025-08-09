# Build Configurations

This project supports multiple build configurations for different environments using Docker multi-stage builds.

## Available Configurations

### 🔧 Development (`builder-dev`)
- **API URLs**: `localhost` (for local development)
- **App Name**: "Lime Web Admin (Dev)"
- **Version**: `1.0.0-dev`
- **Use Case**: Local development and testing

### 🚀 Production (`builder-prod`)
- **API URLs**: `nektar.gg` domains (production endpoints)
- **App Name**: "Lime Web Admin"
- **Version**: `1.0.0`
- **Use Case**: Production deployment

### 🧪 Staging (`builder-staging`)
- **API URLs**: `staging-*.nektar.gg` domains (staging endpoints)
- **App Name**: "Lime Web Admin (Staging)"
- **Version**: `1.0.0-staging`
- **Use Case**: Staging/testing environment

## Usage

### Docker Compose

#### Development
```bash
docker-compose up
# Uses builder-dev configuration with localhost APIs
```

#### Production
```bash
docker-compose -f docker-compose.production.yml up
# Uses builder-prod configuration with production APIs
```

#### Staging
```bash
docker-compose -f docker-compose.staging.yml up
# Uses builder-staging configuration with staging APIs
```

### Manual Docker Build

You can also build specific configurations manually:

```bash
# Development build
docker build --build-arg BUILDER_STAGE=builder-dev -t lime-web-admin:dev .

# Production build
docker build --build-arg BUILDER_STAGE=builder-prod -t lime-web-admin:prod .

# Staging build
docker build --build-arg BUILDER_STAGE=builder-staging -t lime-web-admin:staging .
```

## Environment Variables

The environment variables are baked into the build at **build time**, not runtime. Each build stage has its own predefined environment variables:

### Production URLs
- `NEXT_PUBLIC_WEB_SERVER_API_URL`: `https://api.nektar.gg/api`
- `NEXT_PUBLIC_LOGIN_API_URL`: `https://login.nektar.gg/api/v1`
- `NEXT_PUBLIC_ORCHESTRATOR_API_URL`: `https://orchestrator.nektar.gg/api`
- `NEXT_PUBLIC_GAME_WORLD_HUB_URL`: `https://orchestrator.nektar.gg/hubs/gameworld`

### Development URLs
- `NEXT_PUBLIC_WEB_SERVER_API_URL`: `http://localhost:5001/api`
- `NEXT_PUBLIC_LOGIN_API_URL`: `http://localhost:5000/api/v1`
- `NEXT_PUBLIC_ORCHESTRATOR_API_URL`: `http://localhost:5002/api`
- `NEXT_PUBLIC_GAME_WORLD_HUB_URL`: `http://localhost:5002/hubs/gameworld`

## Benefits

✅ **No runtime configuration complexity**  
✅ **Environment-specific builds are immutable**  
✅ **Clear separation between environments**  
✅ **No localhost fallback issues in production**  
✅ **Faster container startup (no environment processing)**  

## Deployment

For CI/CD, you can build and tag different configurations:

```bash
# Build and tag for different environments
docker build --build-arg BUILDER_STAGE=builder-prod -t myregistry/lime-web-admin:latest .
docker build --build-arg BUILDER_STAGE=builder-staging -t myregistry/lime-web-admin:staging .
docker build --build-arg BUILDER_STAGE=builder-dev -t myregistry/lime-web-admin:dev .
```
