# Chore Buddy Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20.18.1-alpine3.20 AS deps

# Install security updates and required packages
RUN apk upgrade --no-cache && \
    apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20.18.1-alpine3.20 AS builder

# Install security updates
RUN apk upgrade --no-cache

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copy environment variables for build time
# Note: Only NEXT_PUBLIC_ vars are embedded in the build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20.18.1-alpine3.20 AS runner

# Install security updates
RUN apk upgrade --no-cache

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user with no login shell
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --shell /sbin/nologin nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy built application with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper permissions
RUN chmod -R 755 /app && \
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

# Start the application
CMD ["node", "server.js"]
