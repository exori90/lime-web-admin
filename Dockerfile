# Multi-stage build for Next.js app
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Development build
FROM base AS builder-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set development environment variables (localhost)
ENV NEXT_PUBLIC_WEB_SERVER_API_URL=http://localhost:5001/api
ENV NEXT_PUBLIC_LOGIN_API_URL=http://localhost:5000/api/v1
ENV NEXT_PUBLIC_ORCHESTRATOR_API_URL=http://localhost:5002/api
ENV NEXT_PUBLIC_GAME_WORLD_HUB_URL=http://localhost:5002/hubs/gameworld
ENV NEXT_PUBLIC_APP_NAME="Lime Web Admin (Dev)"
ENV NEXT_PUBLIC_APP_VERSION=1.0.0-dev

RUN npm run build

# Production build
FROM base AS builder-prod
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment variables (nektar.gg domains)
ENV NEXT_PUBLIC_WEB_SERVER_API_URL=https://api.nektar.gg/api
ENV NEXT_PUBLIC_LOGIN_API_URL=https://login.nektar.gg/api/v1
ENV NEXT_PUBLIC_ORCHESTRATOR_API_URL=https://orchestrator.nektar.gg/api
ENV NEXT_PUBLIC_GAME_WORLD_HUB_URL=https://orchestrator.nektar.gg/hubs/gameworld
ENV NEXT_PUBLIC_APP_NAME="Lime Web Admin"
ENV NEXT_PUBLIC_APP_VERSION=1.0.0

RUN npm run build

# Staging build
FROM base AS builder-staging
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set staging environment variables (can be customized)
ENV NEXT_PUBLIC_WEB_SERVER_API_URL=https://staging-api.nektar.gg/api
ENV NEXT_PUBLIC_LOGIN_API_URL=https://staging-login.nektar.gg/api/v1
ENV NEXT_PUBLIC_ORCHESTRATOR_API_URL=https://staging-orchestrator.nektar.gg/api
ENV NEXT_PUBLIC_GAME_WORLD_HUB_URL=https://staging-orchestrator.nektar.gg/hubs/gameworld
ENV NEXT_PUBLIC_APP_NAME="Lime Web Admin (Staging)"
ENV NEXT_PUBLIC_APP_VERSION=1.0.0-staging

RUN npm run build

# Runtime image - accepts builder stage as build argument
FROM base AS runner
ARG BUILDER_STAGE=builder-prod
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=${BUILDER_STAGE} /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=${BUILDER_STAGE} --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=${BUILDER_STAGE} --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]