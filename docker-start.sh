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

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is installed"
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
        echo "⚠️  IMPORTANT: Please edit .env and add your Supabase credentials:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
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

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "https://your-project.supabase.co" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set correctly in .env"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your-anon-key-here" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set correctly in .env"
    exit 1
fi

echo "✅ Environment variables are set"
echo ""

# Build and start containers
echo "🐳 Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up -d --build

# Wait for container to be healthy
echo ""
echo "⏳ Waiting for application to start..."
sleep 5

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Chore Buddy is running!"
    echo ""
    echo "🌐 Open your browser and navigate to:"
    echo "   http://localhost:3000"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:       docker-compose logs -f app"
    echo "   Stop:            docker-compose down"
    echo "   Restart:         docker-compose restart"
    echo "   Rebuild:         docker-compose up -d --build"
    echo ""
    echo "📚 For more information, see docs/DOCKER.md"
else
    echo ""
    echo "❌ Container failed to start. Check logs with:"
    echo "   docker-compose logs app"
fi
