#!/bin/bash

# Chore Buddy Docker Startup Script
# This script helps you set up and run Chore Buddy with Docker

set -e

echo "🏠 Chore Buddy - Docker Setup"
echo "=============================="
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

echo "✅ Docker is installed"
echo "✅ Docker Compose is available"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found"
    echo ""
    echo "Creating .env file from example..."

    if [ -f .env.docker.example ]; then
        cp .env.docker.example .env
        echo "✅ Created .env file"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and configure:"
        echo "   - DATABASE_URL  (pre-filled for Docker volume)"
        echo "   - AUTH_SECRET   (generate with: openssl rand -base64 32)"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        echo "❌ .env.docker.example not found"
        exit 1
    fi
fi

# Validate environment variables
echo "🔍 Validating environment variables..."
source .env

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is not set in .env"
    exit 1
fi

if [ -z "$AUTH_SECRET" ] || [ "$AUTH_SECRET" = "generate-a-random-secret-here" ]; then
    echo "❌ AUTH_SECRET is not set correctly in .env"
    echo "   Generate one with: openssl rand -base64 32"
    exit 1
fi

echo "✅ Environment variables are set"
echo ""

# Build and start containers
echo "🐳 Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

$COMPOSE_CMD up -d --build

# Wait for container to be healthy
echo ""
echo "⏳ Waiting for application to start..."
sleep 5

# Check if container is running
if $COMPOSE_CMD ps | grep -q "Up\|running"; then
    echo ""
    echo "✅ Chore Buddy is running!"
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:3000"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:       $COMPOSE_CMD logs -f app"
    echo "   Stop:            $COMPOSE_CMD down"
    echo "   Restart:         $COMPOSE_CMD restart"
    echo "   Rebuild:         $COMPOSE_CMD up -d --build"
    echo ""
else
    echo ""
    echo "❌ Container failed to start. Check logs with:"
    echo "   $COMPOSE_CMD logs app"
fi
