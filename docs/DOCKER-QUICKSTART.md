# Docker Quick Start Guide

Get Chore Buddy running with Docker in 5 minutes.

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running

## Step 1: Clone and Navigate

```bash
git clone <your-repo-url>
cd chore-buddy
```

## Step 2: Set Up Environment Variables

### Option A: Use the startup script (Recommended)

**On macOS/Linux:**
```bash
./docker-start.sh
```

**On Windows:**
```bash
docker-start.bat
```

The script will guide you through the setup.

### Option B: Manual setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use any text editor
```

Required variables:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate-a-random-secret-here"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Start the Application

```bash
docker-compose up -d
```

This will:
- Build the Docker image (~2-5 minutes first time)
- Run Prisma migrations to create the SQLite database
- Start the container in the background
- Make the app available at http://localhost:3000

## Step 4: Verify It's Running

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f app
```

Visit **http://localhost:3000** in your browser.

## Common Commands

| Action | Command |
|--------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Restart | `docker-compose restart` |
| View logs | `docker-compose logs -f app` |
| Rebuild | `docker-compose up -d --build` |

## Troubleshooting

### Port 3000 already in use

Edit `docker-compose.yml` and change the port:
```yaml
ports:
  - "8080:3000"  # Change 8080 to any available port
```

### Container won't start

Check the logs for errors:
```bash
docker-compose logs app
```

Common issues:
- Missing environment variables
- Port already in use
- Docker Desktop not running

### Need to reset everything

```bash
# Stop and remove containers
docker-compose down

# Remove all data and rebuild
docker-compose down -v
docker-compose up -d --build
```

## Next Steps

1. **Create an account**: Navigate to `/auth/register`
2. **Add family members**: Create kid profiles from the parent dashboard
3. **Create chores**: Start assigning chores with point values
4. **Set up rewards**: Build your family reward catalog

## Need More Help?

- **Full Docker documentation**: [docs/DOCKER.md](DOCKER.md)
- **Database schema**: [docs/database-schema.md](database-schema.md)
- **Main README**: [../README.md](../README.md)
- **Docker docs**: [docs.docker.com](https://docs.docker.com)

## Performance Tips

- **First build is slow**: Docker needs to download dependencies (~5 minutes)
- **Subsequent builds are fast**: Docker caches layers (30-60 seconds)
- **Increase memory**: If builds fail, increase Docker Desktop memory to 4GB+
- **Use BuildKit**: Set `DOCKER_BUILDKIT=1` for faster builds

---

**Happy Chore Tracking!**
