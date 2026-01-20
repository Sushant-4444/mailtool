#!/bin/bash

echo "================================================"
echo "  📧 MailTool - Self-Hosted Setup Script"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker found"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your email credentials:"
    echo "   - EMAIL_USER: Your email address"
    echo "   - EMAIL_PASS: Your app password (for Gmail)"
    echo ""
    echo "Press Enter after you've updated .env file..."
    read -r
else
    echo "✅ .env file already exists"
fi

# Check if email credentials are configured
if grep -q "your-email@gmail.com" .env; then
    echo ""
    echo "⚠️  WARNING: Default email credentials detected!"
    echo "Please update .env with your actual email settings."
    echo ""
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Please update .env and run this script again."
        exit 0
    fi
fi

echo ""
echo "🚀 Starting MailTool with Docker..."
echo ""

# Build and start containers
docker-compose up --build -d

echo ""
echo "================================================"
echo "  🎉 MailTool is starting up!"
echo "================================================"
echo ""
echo "📦 Services:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo ""
echo "📊 Check logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "🔄 Restart services:"
echo "   docker-compose restart"
echo ""
echo "⏳ Waiting for services to be ready (this may take 30-60 seconds)..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Services are running!"
    echo "🌐 Open http://localhost:3000 in your browser"
else
    echo ""
    echo "❌ Something went wrong. Check logs with:"
    echo "   docker-compose logs"
fi

echo ""
