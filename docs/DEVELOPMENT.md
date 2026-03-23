# Development Guide

This guide covers development workflows for Chore Buddy, including local development, Docker development, and debugging.

## Table of Contents

- [Local Development (without Docker)](#local-development-without-docker)
- [Docker Development (with hot reload)](#docker-development-with-hot-reload)
- [Production Docker Build](#production-docker-build)
- [Making Changes](#making-changes)
- [Debugging](#debugging)
- [Testing](#testing)

## Local Development (without Docker)

Best for rapid development with instant hot reload.

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed (defaults work out of the box)

# Set up the database
npx prisma migrate dev

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Advantages:**
- Instant hot reload
- Faster than Docker
- Full IDE integration
- Easy debugging

**Disadvantages:**
- Requires Node.js installed locally
- May have environment differences from production

## Docker Development (with hot reload)

Best for ensuring consistency with production environment while developing.

### Quick Start

**Option 1: Use the startup script (Recommended)**

```bash
# macOS/Linux
./docker-dev.sh

# Windows
docker-dev.bat
```

**Option 2: Use npm scripts**

```bash
# Start development containers
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop containers
npm run docker:dev:down

# Rebuild and restart
npm run docker:dev:rebuild
```

**Option 3: Use docker-compose directly**

```bash
# Start
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop
docker-compose -f docker-compose.dev.yml down

# Rebuild
docker-compose -f docker-compose.dev.yml up -d --build
```

### How It Works

The development setup:

1. **Mounts your source code** as a volume into the container
2. **Runs `npm run dev`** with Next.js development server
3. **Hot reload works** - changes are reflected immediately
4. **node_modules stays in container** - faster than syncing

**File Structure:**
```
Your Computer          Docker Container
─────────────         ─────────────────
/app                  → /app (mounted)
  ├── components      → changes sync
  ├── app            → changes sync
  ├── lib            → changes sync
  └── node_modules   ← stays in container
```

**Advantages:**
- Matches production environment
- Hot reload works
- Isolated environment
- No Node.js installation needed on host

**Disadvantages:**
- Slightly slower than local
- File sync overhead on some systems

## Production Docker Build

For testing the production build locally.

### Build and Run

```bash
# Using npm scripts
npm run docker:prod          # Start
npm run docker:prod:logs     # View logs
npm run docker:prod:down     # Stop
npm run docker:prod:rebuild  # Rebuild

# Or using docker-compose
docker-compose up -d
docker-compose logs -f app
docker-compose down
```

### Differences from Development

| Feature | Development | Production |
|---------|-------------|------------|
| Build Type | Next.js dev server | Optimized build |
| Hot Reload | Yes | No |
| Code Mounted | Yes | No (baked into image) |
| Image Size | Larger | Smaller (~150MB) |
| Startup Time | Fast | Fast |
| Performance | Good | Optimized |

## Making Changes

### When Changes Are Reflected

#### Local Development (`npm run dev`)
- **Instant** - Hot reload on save
- **What updates**: Components, pages, styles, server actions
- **What requires restart**: Environment variables, config files

#### Docker Development (`npm run docker:dev`)
- **~1-2 seconds** - After file save
- **What updates**: All source code changes
- **What requires rebuild**:
  - package.json changes (run `npm run docker:dev:rebuild`)
  - Dockerfile.dev changes
  - Environment variable changes in .env

#### Production Docker (`npm run docker:prod`)
- **Requires rebuild** - No hot reload
- Run `npm run docker:prod:rebuild` after any code change

### Workflow Examples

#### Example 1: Changing a Component

```bash
# Start dev environment
npm run docker:dev

# Edit file
# app/components/ui/Button.tsx
# Save the file

# Changes appear automatically in ~1-2 seconds
# No rebuild needed!
```

#### Example 2: Installing a Package

```bash
# Install package locally first
npm install some-package

# Rebuild Docker container to include it
npm run docker:dev:rebuild

# Continue developing
```

#### Example 3: Changing Environment Variables

```bash
# Edit .env file
nano .env

# Restart container to pick up changes
npm run docker:dev:down
npm run docker:dev
```

#### Example 4: Changing the Database Schema

```bash
# Edit prisma/schema.prisma

# Run migration
npx prisma migrate dev --name describe_your_change

# If using Docker, restart the container
npm run docker:dev:rebuild
```

## Debugging

### View Logs

```bash
# Local development
# Logs appear in the terminal where you ran `npm run dev`

# Docker development
npm run docker:dev:logs

# Docker production
npm run docker:prod:logs

# Specific number of lines
docker-compose -f docker-compose.dev.yml logs --tail=100 app
```

### Common Issues

#### Changes not reflecting in Docker dev

```bash
# 1. Check if volume is mounted correctly
docker-compose -f docker-compose.dev.yml ps

# 2. Restart the container
npm run docker:dev:down
npm run docker:dev

# 3. Force rebuild
npm run docker:dev:rebuild
```

#### Port already in use

```bash
# Check what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.dev.yml
ports:
  - "8080:3000"  # Use port 8080 instead
```

#### Container crashes immediately

```bash
# Check logs for errors
docker-compose -f docker-compose.dev.yml logs app

# Common causes:
# - Missing .env file
# - Syntax error in code
```

### Database Debugging

```bash
# Open Prisma Studio to browse/edit data
npx prisma studio

# Reset the database (drops all data)
npx prisma migrate reset

# View raw SQL for a migration
cat prisma/migrations/*/migration.sql
```

### Browser DevTools

1. Open DevTools (F12 or Cmd+Option+I)
2. Check Console tab for JavaScript errors
3. Check Network tab for API call errors
4. Use React DevTools extension for component inspection

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npm test -- points.test.ts

# Run with coverage
npm test -- --coverage
```

### Testing in Docker

```bash
# Enter the container
docker-compose -f docker-compose.dev.yml exec app sh

# Run tests inside container
npm test
```

## Environment Variables

### Development (.env)

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="dev-secret-change-in-production"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Required Variables

- `DATABASE_URL` - SQLite database path
- `AUTH_SECRET` - Secret for NextAuth.js session encryption
- `NEXT_PUBLIC_APP_URL` (defaults to http://localhost:3000)

### Adding New Environment Variables

1. Add to `.env.example`
2. Add to your local `.env` file
3. If using Docker, restart container
4. If variable name starts with `NEXT_PUBLIC_`, rebuild is required for production

## Best Practices

### Development Workflow

1. **Start with local development** for rapid iteration
2. **Test in Docker dev** before committing
3. **Test production build** before deploying
4. **Run tests** before pushing
5. **Check logs** if something breaks

### Performance Tips

- Use local development for active coding
- Use Docker dev for integration testing
- Keep Docker Desktop running (faster startups)
- Increase Docker memory to 4GB+ in settings
- Use BuildKit for faster builds: `export DOCKER_BUILDKIT=1`

### Code Organization

- Keep server actions in `app/api/*/actions.ts`
- Keep UI components in `components/ui/`
- Keep utilities in `lib/utils/`
- Keep types in `types/`
- Database schema in `prisma/schema.prisma`
- Follow existing patterns and naming conventions

## Useful Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run docker:dev` | Start Docker dev with hot reload |
| `npm run docker:dev:logs` | View Docker dev logs |
| `npm run docker:dev:down` | Stop Docker dev |
| `npm run docker:dev:rebuild` | Rebuild Docker dev |
| `npx prisma studio` | Open database browser |
| `npx prisma migrate dev` | Run database migrations |

### Production

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production locally |
| `npm run start` | Start production server locally |
| `npm run docker:prod` | Start Docker production |
| `npm run docker:prod:rebuild` | Rebuild Docker production |

### Testing & Quality

| Command | Description |
|---------|-------------|
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run check` | Run type-check and lint |

## Getting Help

- Check [README.md](../README.md) for setup instructions
- Check [DOCKER.md](DOCKER.md) for Docker details
- Check [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md) for quick Docker setup
- Check browser console for frontend errors
- Check Docker logs for backend errors

---

**Happy Developing!**
