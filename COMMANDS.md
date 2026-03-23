# Quick Command Reference

## Local Development (No Docker)

```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm test                # Run tests
npm run lint            # Run linter
```

## Database (Prisma + SQLite)

```bash
npx prisma migrate dev          # Run migrations (creates DB if needed)
npx prisma migrate dev --name <name>  # Create a new migration
npx prisma studio               # Open database browser GUI
npx prisma generate             # Regenerate Prisma Client
npx prisma db push              # Push schema changes without migration
```

## Docker Development (Hot Reload)

```bash
# Quick start
./docker-dev.sh                    # macOS/Linux
docker-dev.bat                     # Windows

# npm scripts
npm run docker:dev                 # Start dev container
npm run docker:dev:logs            # View logs
npm run docker:dev:down            # Stop container
npm run docker:dev:rebuild         # Rebuild & restart

# Direct docker-compose
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

## Docker Production

```bash
# Quick start
./docker-start.sh                  # macOS/Linux
docker-start.bat                   # Windows

# npm scripts
npm run docker:prod                # Start production container
npm run docker:prod:logs           # View logs
npm run docker:prod:down           # Stop container
npm run docker:prod:rebuild        # Rebuild & restart

# Direct docker-compose
docker-compose up -d
docker-compose logs -f app
docker-compose down
docker-compose up -d --build
```

## Common Docker Commands

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Clean up everything
docker system prune -a

# View disk usage
docker system df
```

## Git

```bash
git status              # Check status
git add .               # Stage all changes
git commit -m "msg"     # Commit changes
git push                # Push to remote
git pull                # Pull from remote
```

## Useful Combinations

```bash
# Fresh start (dev)
npm run docker:dev:down && npm run docker:dev:rebuild

# Fresh start (prod)
npm run docker:prod:down && npm run docker:prod:rebuild

# View logs and follow
npm run docker:dev:logs
# Press Ctrl+C to stop following

# Full reset
docker-compose down
docker-compose up -d --build --force-recreate
```

## Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit environment variables
nano .env                           # macOS/Linux
notepad .env                        # Windows
```

## Troubleshooting

```bash
# Port already in use
lsof -i :3000                      # macOS/Linux
netstat -ano | findstr :3000       # Windows

# Check container health
docker inspect chore-buddy | grep -A 10 Health

# Enter container shell
docker exec -it chore-buddy sh

# View container resources
docker stats chore-buddy

# Check Docker version
docker --version
docker-compose --version
```

## Performance

```bash
# Increase Docker memory
# Docker Desktop → Settings → Resources → Memory: 4GB+

# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1           # macOS/Linux
set DOCKER_BUILDKIT=1              # Windows CMD
$env:DOCKER_BUILDKIT=1             # Windows PowerShell
```
