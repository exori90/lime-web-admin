# Deployment Guide

This guide explains how to deploy the Lime Web Admin application to different environments using GitHub Actions.

## 🚀 Deployment Strategy

The application uses a simple, effective deployment strategy:

- **Local Development**: Uses `.env.local` file (committed to repo)
- **GitHub Actions**: Overwrites environment files during CI/CD
- **Staging**: Deploys from `develop` branch
- **Production**: Deploys from `main` branch

## 📁 Environment Files

### Local Development (.env.local)
- **Committed to repository** ✅
- Contains safe development values
- Used for local development only
- Overwritten during deployment

### CI/CD Generated Files
- **Generated during GitHub Actions** 🤖
- Uses secrets from GitHub repository
- Different configurations for staging/production
- Never committed to repository

## 🔧 GitHub Secrets Setup

Set up these secrets in your GitHub repository settings:

### Vercel Deployment Secrets
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Production Environment Configuration

Both staging and production now use Nektar.gg APIs:

**API Endpoints:**
- Main API: `https://api.nektar.gg/api`
- Authentication: `https://login.nektar.gg/api`
- Server Monitoring: `https://orchestrator.nektar.gg/api`

**Optional Secrets (if you want to override defaults):**
```
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
CDN_URL=https://cdn.nektar.gg
```

**Note:** The Nektar.gg API endpoints are now hardcoded in the deployment workflow, so you don't need to set up API URL secrets unless you want to override them.

## 🌊 Deployment Flow

### 1. Development Workflow
```bash
# Work locally with .env.local
git checkout -b feature/new-feature
# Make changes...
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR to develop
```

### 2. Staging Deployment
```bash
# Merge PR to develop branch
git checkout develop
git merge feature/new-feature
git push origin develop
```

This triggers:
- ✅ Test and build
- 🚀 Deploy to staging environment
- 🔧 Uses staging secrets from GitHub

### 3. Production Deployment
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main
```

This triggers:
- ✅ Test and build
- 🚀 Deploy to production environment  
- 🔧 Uses production secrets from GitHub

## 📋 GitHub Actions Workflow

The workflow (`.github/workflows/deploy.yml`) includes:

### Test Job
- Runs on every push and PR
- Creates test environment configuration
- Installs dependencies
- Runs linting
- Builds the application

### Deploy Staging Job
- Runs only on `develop` branch pushes
- Creates staging environment file from secrets
- Builds for staging
- Deploys to Vercel staging

### Deploy Production Job
- Runs only on `main` branch pushes
- Creates production environment file from secrets
- Builds for production
- Deploys to Vercel production

## 🔒 Security Benefits

This approach provides several security benefits:

1. **No Sensitive Data in Repo**: All production secrets are in GitHub secrets
2. **Environment Isolation**: Each environment has separate configurations
3. **Audit Trail**: All deployments are tracked in GitHub Actions
4. **Safe Defaults**: Local development uses safe, non-sensitive values

## ⚙️ Setting Up GitHub Secrets

### 1. Go to Repository Settings
1. Navigate to your GitHub repository
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"

### 2. Add Secrets
Click "New repository secret" for each required secret:

**Vercel Secrets:**
- `VERCEL_TOKEN`: Get from Vercel dashboard → Settings → Tokens
- `VERCEL_ORG_ID`: Found in Vercel project settings
- `VERCEL_PROJECT_ID`: Found in Vercel project settings

**API Endpoints:**
- Set staging and production API URLs according to your backend

**Optional Services:**
- Google Analytics ID for production analytics
- CDN URL if using a CDN

## 🛠️ Custom Deployment Platforms

### Docker Deployment
If deploying with Docker instead of Vercel:

```yaml
# Add to GitHub Actions workflow
- name: Build Docker image
  run: |
    echo "NODE_ENV=production" > .env.production
    echo "NEXT_PUBLIC_API_BASE_URL=${{ secrets.PROD_API_BASE_URL }}" >> .env.production
    # Add other environment variables...
    docker build -t lime-web-admin .

- name: Deploy to server
  run: |
    docker run --env-file .env.production -p 3000:3000 lime-web-admin
```

### Manual Deployment
For manual deployments:

1. Create environment file on server:
```bash
# On your server
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.lime-admin.com/api
# Add other variables...
EOF
```

2. Build and start:
```bash
npm ci
npm run build
npm start
```

## 🔍 Troubleshooting

### Common Issues

**Environment variables not loading:**
- Check GitHub secrets are set correctly
- Verify secret names match workflow file
- Check workflow syntax in `.github/workflows/deploy.yml`

**Build failures:**
- Run `npm run env:check` to verify environment
- Check for TypeScript errors
- Verify all required environment variables are set

**Deployment failures:**
- Check Vercel token has correct permissions
- Verify project ID and org ID are correct
- Check deployment logs in GitHub Actions

### Debug Environment
Add this step to your workflow for debugging:

```yaml
- name: Debug Environment
  run: |
    echo "Node version: $(node --version)"
    echo "Environment: $NODE_ENV"
    echo "API Base URL: $NEXT_PUBLIC_API_BASE_URL"
    npm run env:check
```

## 📊 Monitoring Deployments

### GitHub Actions
- View deployment status in "Actions" tab
- Check logs for build and deployment details
- Set up notifications for failed deployments

### Vercel Dashboard
- Monitor deployment status
- View build logs
- Check performance metrics
- Set up alerts for issues

This deployment strategy gives you a clean, secure, and maintainable way to manage different environments while keeping sensitive data safe! 🎯