# Chore Buddy Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-alpine3.21 AS deps

# Install security updates and required packages
# hadolint ignore=DL3018
RUN apk upgrade --no-cache && \
    apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine3.21 AS builder

# Install security updates
RUN apk upgrade --no-cache

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Copy environment variables for build time
# Note: Only NEXT_PUBLIC_ vars are embedded in the build
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client and build the application
RUN npx prisma generate && \
    npm run build

# Stage 3: Runner
FROM node:20-alpine3.21 AS runner

# Install security updates
RUN apk upgrade --no-cache

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user with no login shell for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --shell /sbin/nologin nextjs

# Copy package.json for metadata
COPY --from=builder /app/package.json ./package.json

# Copy public folder (static assets)
# Note: This will be empty or minimal in most cases
COPY --from=builder /app/public ./public

# Copy all production node_modules (includes full prisma CLI dep tree for migrate deploy)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy Prisma schema and generated client binary (created during build, not in deps)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy Next.js standalone output
# The standalone build includes all necessary dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files (JS, CSS, images built by Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy startup script
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x start.sh

# Create directory for SQLite database and set proper permissions
RUN mkdir -p /app/data && \
    chmod -R 755 /app && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application (runs prisma migrate deploy then node server.js)
CMD ["./start.sh"]
