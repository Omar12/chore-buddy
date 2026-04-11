#!/bin/bash

# Chore Buddy Docker Development Script
# This script starts the development environment with hot reload

set -e

echo "🛠️  Chore Buddy - Development Mode"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Docker Compose is not available. Please install Docker Desktop or the Compose plugin:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found"
    echo ""

    if [ -f .env.example ]; then
        echo "Creating .env file from example..."
        cp .env.example .env
        echo "✅ Created .env file"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and configure:"
        echo "   - DATABASE_URL  (default is fine for local dev)"
        echo "   - AUTH_SECRET   (generate with: openssl rand -base64 32)"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

echo "🐳 Starting development environment with hot reload..."
echo ""
echo "Features enabled:"
echo "  ✓ Hot reload on code changes"
echo "  ✓ Development mode"
echo "  ✓ Source code mounted from host"
echo ""

# Start the development containers
$COMPOSE_CMD -f docker-compose.dev.yml up -d

# Wait for container to be ready
echo ""
echo "⏳ Waiting for application to start..."
sleep 5

# Check if container is running
if $COMPOSE_CMD -f docker-compose.dev.yml ps | grep -q "Up\|running"; then
    echo ""
    echo "✅ Development environment is running!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo ""
    echo "📝 Your code changes will be reflected automatically!"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:       $COMPOSE_CMD -f docker-compose.dev.yml logs -f app"
    echo "   Stop:            $COMPOSE_CMD -f docker-compose.dev.yml down"
    echo "   Restart:         $COMPOSE_CMD -f docker-compose.dev.yml restart"
    echo "   Rebuild:         $COMPOSE_CMD -f docker-compose.dev.yml up -d --build"
    echo ""
    echo "💡 Tip: Keep this terminal open to see logs in real-time:"
    echo "   $COMPOSE_CMD -f docker-compose.dev.yml logs -f app"
else
    echo ""
    echo "❌ Container failed to start. Check logs with:"
    echo "   $COMPOSE_CMD -f docker-compose.dev.yml logs app"
fi
