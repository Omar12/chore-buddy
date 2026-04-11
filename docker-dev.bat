@echo off
REM Chore Buddy Docker Development Script for Windows

echo.
echo 🛠️  Chore Buddy - Development Mode
echo ==================================
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

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found
    echo.

    if exist .env.example (
        echo Creating .env file from example...
        copy .env.example .env >nul
        echo ✅ Created .env file
        echo.
        echo ⚠️  IMPORTANT: Please edit .env and configure:
        echo    - DATABASE_URL  (default is fine for local dev)
        echo    - AUTH_SECRET   (generate a random secret)
        echo.
        pause
    ) else (
        echo ❌ .env.example not found
        pause
        exit /b 1
    )
)

echo 🐳 Starting development environment with hot reload...
echo.
echo Features enabled:
echo   ✓ Hot reload on code changes
echo   ✓ Development mode
echo   ✓ Source code mounted from host
echo.

REM Start the development containers
%COMPOSE_CMD% -f docker-compose.dev.yml up -d

REM Wait for container to be ready
echo.
echo ⏳ Waiting for application to start...
timeout /t 5 /nobreak >nul

REM Check if container is running
%COMPOSE_CMD% -f docker-compose.dev.yml ps | findstr /R "Up running" >nul
if not errorlevel 1 (
    echo.
    echo ✅ Development environment is running!
    echo.
    echo 🌐 Application: http://localhost:3000
    echo.
    echo 📝 Your code changes will be reflected automatically!
    echo.
    echo 📊 Useful commands:
    echo    View logs:       %COMPOSE_CMD% -f docker-compose.dev.yml logs -f app
    echo    Stop:            %COMPOSE_CMD% -f docker-compose.dev.yml down
    echo    Restart:         %COMPOSE_CMD% -f docker-compose.dev.yml restart
    echo    Rebuild:         %COMPOSE_CMD% -f docker-compose.dev.yml up -d --build
    echo.
    echo 💡 Tip: Keep this terminal open to see logs in real-time:
    echo    %COMPOSE_CMD% -f docker-compose.dev.yml logs -f app
) else (
    echo.
    echo ❌ Container failed to start. Check logs with:
    echo    %COMPOSE_CMD% -f docker-compose.dev.yml logs app
)

echo.
pause
