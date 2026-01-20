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

echo "✅ Docker found: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker Compose found"

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running!"
    echo "Please start Docker Desktop or Docker service"
    exit 1
fi

echo "✅ Docker daemon is running"
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

# Stop any existing containers
echo ""
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Clean up old images (optional)
echo ""
echo "🧹 Clean up old images? (y/n)"
read -r cleanup
if [[ "$cleanup" =~ ^[Yy]$ ]]; then
    docker-compose down --rmi all --volumes 2>/dev/null || true
    echo "✅ Cleanup complete"
fi

echo ""
echo "🚀 Building and starting MailTool..."
echo "   (This may take 3-5 minutes on first run)"
echo ""

# Build and start containers with progress
docker-compose up --build -d

# Check build status
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Check the errors above."
    echo ""
    echo "Common issues:"
    echo "  - Missing .env file"
    echo "  - Docker out of memory (increase in Docker settings)"
    echo "  - Port conflicts (close other apps using ports 3000/5000)"
    echo ""
    echo "For detailed logs, run: docker-compose logs"
    exit 1
fi

echo ""
echo "================================================"
echo "  🎉 MailTool is starting up!"
echo "================================================"
echo ""
echo "📦 Services:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo ""
echo "📊 Useful commands:"
echo "   View logs:          docker-compose logs -f"
echo "   Check status:       docker-compose ps"
echo "   Stop services:      docker-compose down"
echo "   Restart services:   docker-compose restart"
echo ""
echo "⏳ Waiting for services to be ready..."
echo "   This may take 30-60 seconds..."
echo ""

# Wait for services with timeout
TIMEOUT=60
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker-compose ps | grep -q "Up"; then
        # Wait a bit more for health checks
        sleep 10
        
        # Check if backend is responding
        if curl -s http://localhost:5000/health > /dev/null 2>&1; then
            echo ""
            echo "✅ Backend is healthy!"
            
            # Check if frontend is responding
            if curl -s http://localhost:3000 > /dev/null 2>&1; then
                echo "✅ Frontend is healthy!"
                echo ""
                echo "🎉 SUCCESS! MailTool is ready!"
                echo "🌐 Open http://localhost:3000 in your browser"
                echo ""
                exit 0
            fi
        fi
    fi
    
    sleep 5
    ELAPSED=$((ELAPSED + 5))
    echo "   Still starting... ($ELAPSED seconds)"
done

echo ""
echo "⚠️  Services started but health checks pending."
echo "   Give it another minute, then check:"
echo "   http://localhost:3000"
echo ""
echo "If issues persist, check logs:"
echo "   docker-compose logs backend"
echo "   docker-compose logs frontend"
echo ""
