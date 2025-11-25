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

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop which includes Docker Compose:
    echo    https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  No .env file found
    echo.

    if exist .env.docker.example (
        echo Creating .env file from example...
        copy .env.docker.example .env >nul
        echo ✅ Created .env file
        echo.
        echo ⚠️  IMPORTANT: Please edit .env and add your Supabase credentials
        echo.
        pause
    ) else (
        echo ❌ .env.docker.example not found
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
docker-compose -f docker-compose.dev.yml up -d

REM Wait for container to be ready
echo.
echo ⏳ Waiting for application to start...
timeout /t 5 /nobreak >nul

REM Check if container is running
docker-compose -f docker-compose.dev.yml ps | findstr "Up" >nul
if not errorlevel 1 (
    echo.
    echo ✅ Development environment is running!
    echo.
    echo 🌐 Application: http://localhost:3000
    echo.
    echo 📝 Your code changes will be reflected automatically!
    echo.
    echo 📊 Useful commands:
    echo    View logs:       docker-compose -f docker-compose.dev.yml logs -f app
    echo    Stop:            docker-compose -f docker-compose.dev.yml down
    echo    Restart:         docker-compose -f docker-compose.dev.yml restart
    echo    Rebuild:         docker-compose -f docker-compose.dev.yml up -d --build
    echo.
    echo 💡 Tip: Keep this terminal open to see logs in real-time:
    echo    docker-compose -f docker-compose.dev.yml logs -f app
) else (
    echo.
    echo ❌ Container failed to start. Check logs with:
    echo    docker-compose -f docker-compose.dev.yml logs app
)

echo.
pause
