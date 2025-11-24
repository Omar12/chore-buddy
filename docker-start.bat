@echo off
REM Chore Buddy Docker Startup Script for Windows

echo.
echo 🏠 Chore Buddy - Docker Setup
echo ==============================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first:
    echo    https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop which includes Docker Compose:
    echo    https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

echo ✅ Docker is installed
echo ✅ Docker Compose is installed
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found
    echo.
    echo Creating .env file from example...

    if exist .env.docker.example (
        copy .env.docker.example .env >nul
        echo ✅ Created .env file
        echo.
        echo ⚠️  IMPORTANT: Please edit .env and add your Supabase credentials:
        echo    - NEXT_PUBLIC_SUPABASE_URL
        echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
        echo.
        pause
    ) else (
        echo ❌ .env.docker.example not found
        pause
        exit /b 1
    )
)

REM Build and start containers
echo 🐳 Building and starting Docker containers...
echo This may take a few minutes on first run...
echo.

docker-compose up -d --build

REM Wait for container to be healthy
echo.
echo ⏳ Waiting for application to start...
timeout /t 5 /nobreak >nul

REM Check if container is running
docker-compose ps | findstr "Up" >nul
if not errorlevel 1 (
    echo.
    echo ✅ Chore Buddy is running!
    echo.
    echo 🌐 Open your browser and navigate to:
    echo    http://localhost:3000
    echo.
    echo 📊 Useful commands:
    echo    View logs:       docker-compose logs -f app
    echo    Stop:            docker-compose down
    echo    Restart:         docker-compose restart
    echo    Rebuild:         docker-compose up -d --build
    echo.
    echo 📚 For more information, see docs\DOCKER.md
) else (
    echo.
    echo ❌ Container failed to start. Check logs with:
    echo    docker-compose logs app
)

echo.
pause
