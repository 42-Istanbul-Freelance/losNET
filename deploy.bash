#!/bin/bash

# Configuration
PROJECT_NAME="losev-net"
COMPOSE_FILE="docker-compose.yml"

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting deployment for $PROJECT_NAME...${NC}"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed!${NC}"
    exit 1
fi

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: docker-compose is not installed!${NC}"
    exit 1
fi

# 1. Environment Setup
echo -e "${BLUE}🔧 Checking environment files...${NC}"

# Root .env (if needed for docker-compose)
if [ ! -f ".env" ]; then
    echo -e "Creating root .env from template..."
    # Root .env might be empty or combined, let's just make sure it exists
    touch .env
fi

# Client .env
if [ ! -f "client/.env" ]; then
    echo -e "${BLUE}📝 Creating client/.env from .env.example...${NC}"
    cp client/.env.example client/.env
    echo -e "⚠️ Please update client/.env with your Firebase keys if needed."
else
    echo -e "${GREEN}✅ client/.env exists.${NC}"
fi

# Server .env
if [ ! -f "server/.env" ]; then
    echo -e "${BLUE}📝 Creating server/.env from .env.example...${NC}"
    cp server/.env.example server/.env
    # For Docker, MONGO_URI should point to the mongodb container
    sed -i 's/localhost:27017/mongodb:27017/g' server/.env
    echo -e "⚠️ server/.env updated to use 'mongodb' container host."
else
    echo -e "${GREEN}✅ server/.env exists.${NC}"
fi

# 2. Pull latest changes
if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo -e "${BLUE}📥 Pulling latest changes for branch '$CURRENT_BRANCH'...${NC}"
    git pull origin "$CURRENT_BRANCH" || echo -e "${RED}⚠️ Could not pull from git. Proceeding with local code.${NC}"
fi

# 3. Build and start services
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down

echo -e "${BLUE}🏗️  Building and starting containers...${NC}"
# Using --build to ensure all code changes are captured
docker-compose up --build -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Deployment failed during docker-compose up!${NC}"
    exit 1
fi

# 4. Service status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps

# 5. Cleanup
echo -e "${BLUE}🧹 Cleaning up dangling images...${NC}"
docker image prune -f

echo -e "----------------------------------------"
echo -e "🌐 Web Interface: ${BLUE}http://localhost:8080${NC}"
echo -e "🔌 API Gateway:   ${BLUE}http://localhost:5000${NC}"
echo -e "----------------------------------------"
echo -e "💡 View logs with: ${BLUE}docker-compose logs -f${NC}"
