# Docker Quick Start Guide

Get Chore Buddy running with Docker in 5 minutes.

## Prerequisites

- [Docker Desktop](https://docs.docker.com/get-docker/) installed and running
- A [Supabase](https://supabase.com) account with a project set up

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
cp .env.docker.example .env

# Edit .env with your Supabase credentials
nano .env  # or use any text editor
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Run the Database Migration

Before starting the app, set up your Supabase database:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `supabase/migrations/20240101000000_init_schema.sql`
5. Paste and run it in the SQL Editor

## Step 4: Start the Application

```bash
docker-compose up -d
```

This will:
- Build the Docker image (~2-5 minutes first time)
- Start the container in the background
- Make the app available at http://localhost:3000

## Step 5: Verify It's Running

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
- Missing or invalid Supabase credentials
- Port already in use
- Docker Desktop not running

### Can't connect to Supabase

Verify your credentials in `.env`:
- URL should start with `https://` and end with `.supabase.co`
- Anon key should be a long JWT string

Test your connection:
1. Go to Supabase Dashboard → Settings → API
2. Verify the Project URL matches your `.env` file
3. Copy the `anon` `public` key (not the `service_role` key)

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
- **Supabase docs**: [supabase.com/docs](https://supabase.com/docs)
- **Docker docs**: [docs.docker.com](https://docs.docker.com)

## Performance Tips

- **First build is slow**: Docker needs to download dependencies (~5 minutes)
- **Subsequent builds are fast**: Docker caches layers (30-60 seconds)
- **Increase memory**: If builds fail, increase Docker Desktop memory to 4GB+
- **Use BuildKit**: Set `DOCKER_BUILDKIT=1` for faster builds

---

**Happy Chore Tracking! 🏠**
