#!/bin/bash
# =============================================
# Splitly — Local Development Start Script
# =============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ███████╗██████╗ ██╗██╗████████╗██╗  ██╗   ██╗"
echo "  ██╔════╝██╔══██╗██║██║╚══██╔══╝██║  ╚██╗ ██╔╝"
echo "  ███████╗██████╔╝██║██║   ██║   ██║   ╚████╔╝ "
echo "  ╚════██║██╔═══╝ ██║██║   ██║   ██║    ╚██╔╝  "
echo "  ███████║██║     ███████╗ ██║   ███████╗██║   "
echo "  ╚══════╝╚═╝     ╚══════╝ ╚═╝   ╚══════╝╚═╝   "
echo -e "${NC}"
echo -e "${GREEN}Collaborative Expense & Settlement Platform${NC}"
echo "=============================================="

# Create frontend .env.local if missing
if [ ! -f "frontend/.env.local" ]; then
  echo "VITE_API_URL=http://localhost:8080" > frontend/.env.local
  echo -e "${YELLOW}Created frontend/.env.local${NC}"
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  cd frontend && npm install && cd ..
fi

echo -e "${GREEN}Starting backend (Spring Boot + H2)...${NC}"
cd backend && ./mvnw spring-boot:run -q &
BACKEND_PID=$!
cd ..

echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 10

echo -e "${GREEN}Starting frontend (React + Vite)...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Splitly is running!${NC}"
echo -e "   Frontend:   ${BLUE}http://localhost:5173${NC}"
echo -e "   Backend:    ${BLUE}http://localhost:8080${NC}"
echo -e "   H2 Console: ${BLUE}http://localhost:8080/h2-console${NC}"
echo ""
echo "Press Ctrl+C to stop all services"

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID
