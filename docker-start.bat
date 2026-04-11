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

REM Check if Docker Compose is available (plugin or standalone)
set COMPOSE_CMD=
docker compose version >nul 2>&1
if not errorlevel 1 (
    set COMPOSE_CMD=docker compose
) else (
    docker-compose --version >nul 2>&1
    if not errorlevel 1 (
        set COMPOSE_CMD=docker-compose
    ) else (
        echo ❌ Docker Compose is not available. Please install Docker Desktop which includes Docker Compose:
        echo    https://docs.docker.com/desktop/install/windows-install/
        pause
        exit /b 1
    )
)

echo ✅ Docker is installed
echo ✅ Docker Compose is available
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
        echo ⚠️  IMPORTANT: Please edit .env and configure:
        echo    - DATABASE_URL  (pre-filled for Docker volume)
        echo    - AUTH_SECRET   (generate a random secret)
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

%COMPOSE_CMD% up -d --build

REM Wait for container to be healthy
echo.
echo ⏳ Waiting for application to start...
timeout /t 5 /nobreak >nul

REM Check if container is running
%COMPOSE_CMD% ps | findstr /R "Up running" >nul
if not errorlevel 1 (
    echo.
    echo ✅ Chore Buddy is running!
    echo.
    echo 🌐 Open your browser and navigate to:
    echo    http://localhost:3000
    echo.
    echo 📊 Useful commands:
    echo    View logs:       %COMPOSE_CMD% logs -f app
    echo    Stop:            %COMPOSE_CMD% down
    echo    Restart:         %COMPOSE_CMD% restart
    echo    Rebuild:         %COMPOSE_CMD% up -d --build
) else (
    echo.
    echo ❌ Container failed to start. Check logs with:
    echo    %COMPOSE_CMD% logs app
)

echo.
pause
