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

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found"
    echo ""

    if [ -f .env.docker.example ]; then
        echo "Creating .env file from example..."
        cp .env.docker.example .env
        echo "✅ Created .env file"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and add your Supabase credentials"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        echo "❌ .env.docker.example not found"
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
docker-compose -f docker-compose.dev.yml up -d

# Wait for container to be ready
echo ""
echo "⏳ Waiting for application to start..."
sleep 5

# Check if container is running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo ""
    echo "✅ Development environment is running!"
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo ""
    echo "📝 Your code changes will be reflected automatically!"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:       docker-compose -f docker-compose.dev.yml logs -f app"
    echo "   Stop:            docker-compose -f docker-compose.dev.yml down"
    echo "   Restart:         docker-compose -f docker-compose.dev.yml restart"
    echo "   Rebuild:         docker-compose -f docker-compose.dev.yml up -d --build"
    echo ""
    echo "💡 Tip: Keep this terminal open to see logs in real-time:"
    echo "   docker-compose -f docker-compose.dev.yml logs -f app"
else
    echo ""
    echo "❌ Container failed to start. Check logs with:"
    echo "   docker-compose -f docker-compose.dev.yml logs app"
fi
