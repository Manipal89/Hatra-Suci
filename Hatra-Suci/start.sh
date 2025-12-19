#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Hatra Suci Application...${NC}"

# Check if MongoDB is running
if ! docker ps | grep -q hatra-suci-mongodb; then
    echo -e "${GREEN}Starting MongoDB container...${NC}"
    docker start hatra-suci-mongodb 2>/dev/null || docker run -d -p 27017:27017 --name hatra-suci-mongodb mongo:latest
    sleep 3
fi

# Start backend in background
echo -e "${GREEN}Starting Backend Server...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo -e "${GREEN}Starting Frontend Server...${NC}"
cd ..
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
