# Docker Setup for Chore Buddy

This guide explains how to run Chore Buddy using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) (1.29 or later)
- A Supabase account and project

## Quick Start

### 1. Set up environment variables

Create a `.env` file in the project root:

```bash
cp .env.docker.example .env
```

Edit `.env` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Build and run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container in detached mode
- Expose the app on `http://localhost:3000`

### 3. Verify it's running

```bash
docker-compose ps
```

You should see the `chore-buddy` container running.

Visit `http://localhost:3000` in your browser.

### 4. View logs

```bash
docker-compose logs -f app
```

Press `Ctrl+C` to stop following logs.

## Common Commands

### Start the application

```bash
docker-compose up -d
```

### Stop the application

```bash
docker-compose down
```

### Restart the application

```bash
docker-compose restart
```

### Rebuild the image (after code changes)

```bash
docker-compose up -d --build
```

### View logs

```bash
# Follow logs in real-time
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

### Execute commands in the container

```bash
# Open a shell
docker-compose exec app sh

# Run npm commands
docker-compose exec app npm run lint
```

### Clean up everything

```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (careful - this removes data)
docker-compose down -v

# Remove images
docker rmi chore-buddy-app
```

## Building for Production

### Using Docker directly

```bash
# Build the image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -t chore-buddy:latest .

# Run the container
docker run -d \
  -p 3000:3000 \
  --name chore-buddy \
  --restart unless-stopped \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  chore-buddy:latest
```

### Multi-platform builds (ARM and x86)

For deploying to different architectures:

```bash
# Create a builder
docker buildx create --name multiarch --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -t your-registry/chore-buddy:latest \
  --push .
```

## Deployment Options

### Deploy to AWS ECS

1. Push image to ECR:

```bash
# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t chore-buddy .
docker tag chore-buddy:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chore-buddy:latest

# Push
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/chore-buddy:latest
```

2. Create an ECS task definition using the ECR image
3. Deploy to an ECS service

### Deploy to Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/chore-buddy

# Deploy
gcloud run deploy chore-buddy \
  --image gcr.io/YOUR_PROJECT_ID/chore-buddy \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co,NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Deploy to DigitalOcean App Platform

1. Connect your GitHub repository
2. Select "Dockerfile" as the build method
3. Add environment variables in the dashboard
4. Deploy

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Deploy
fly deploy
```

## Docker Image Structure

The Dockerfile uses a multi-stage build for optimization:

### Stage 1: Dependencies
- Installs production dependencies only
- Uses npm ci for reproducible builds

### Stage 2: Builder
- Copies dependencies from stage 1
- Runs the Next.js build
- Creates optimized production bundle

### Stage 3: Runner
- Minimal runtime image (node:18-alpine)
- Runs as non-root user (nextjs)
- Only includes necessary files
- Final image size: ~150-200 MB

## Environment Variables

### Build-time variables (embedded in the build)

These are set during `docker build` and embedded in the JavaScript bundle:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_APP_URL` - Your application URL

### Runtime variables

These can be changed without rebuilding:

- `PORT` - Port to listen on (default: 3000)
- `NODE_ENV` - Environment (production/development)

## Troubleshooting

### Port already in use

If port 3000 is already in use, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Change 8080 to any available port
```

### Build failures

Clear Docker cache and rebuild:

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Container crashes immediately

Check logs:

```bash
docker-compose logs app
```

Common issues:
- Missing environment variables
- Invalid Supabase credentials
- Port conflicts

### Out of memory

Increase Docker memory limit in Docker Desktop settings (4GB recommended).

### Slow builds

Use BuildKit for faster builds:

```bash
export DOCKER_BUILDKIT=1
docker-compose build
```

## Performance Optimization

### Use .dockerignore

The `.dockerignore` file excludes unnecessary files from the build context, speeding up builds.

### Layer caching

The Dockerfile is optimized for layer caching:
- Dependencies are installed before copying source code
- Only rebuilds when dependencies change

### Multi-stage builds

Separates build and runtime stages, resulting in a smaller final image.

## Security Best Practices

### Updated Base Images

The Dockerfile uses:
- **Node.js 20.18.1 LTS** - Latest stable version with security patches
- **Alpine Linux 3.20** - Minimal, secure base image
- **Security updates** - `apk upgrade` in all stages

### Non-root user

The container runs as a non-root user (`nextjs:nodejs`) with:
- No login shell (`/sbin/nologin`)
- Proper file permissions (755)
- Dedicated UID/GID (1001)

### Secrets management

Never commit `.env` files to version control. Use:
- Docker secrets for Swarm
- Kubernetes secrets for K8s
- AWS Secrets Manager for ECS
- Environment variables in cloud platforms

### Vulnerability Scanning

**Important:** Some vulnerabilities may exist in the base Node.js image that are beyond our control. These are typically:
- Low-risk vulnerabilities in system libraries
- Already patched in newer Node.js versions (update regularly)
- Not exploitable in our container context

Scan regularly:

```bash
# Scan with Docker Scout (recommended)
docker scout cves chore-buddy:latest
docker scout recommendations chore-buddy:latest

# Scan with Trivy
trivy image --severity HIGH,CRITICAL chore-buddy:latest

# Scan with Snyk
snyk container test chore-buddy:latest
```

See [DOCKER-SECURITY.md](DOCKER-SECURITY.md) for comprehensive security documentation.

## Monitoring and Health Checks

The container includes a health check that pings the app every 30 seconds.

View health status:

```bash
docker inspect chore-buddy | grep -A 10 Health
```

## Development with Docker

For development with hot reload:

```dockerfile
# Create a Dockerfile.dev
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
```

Run with:

```bash
docker-compose -f docker-compose.dev.yml up
```

## Resources

- [Docker documentation](https://docs.docker.com/)
- [Next.js Docker deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose documentation](https://docs.docker.com/compose/)
