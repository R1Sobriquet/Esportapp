#!/bin/bash
# ==================================================
# Script de démarrage pour Linux/Mac - start.sh
# ==================================================

echo "🎮 E-Sport Social Platform - Startup Script"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is running
echo -e "${BLUE}Checking MySQL status...${NC}"
if ! pgrep -x "mysql" > /dev/null && ! pgrep -x "mysqld" > /dev/null; then
    echo -e "${RED}MySQL is not running!${NC}"
    echo "Please start MySQL first:"
    echo "  sudo systemctl start mysql  # Linux"
    echo "  brew services start mysql   # Mac"
    exit 1
fi
echo -e "${GREEN}✓ MySQL is running${NC}"

# Check if .env file exists in API folder
if [ ! -f "API/.env" ]; then
    echo -e "${RED}API/.env file not found!${NC}"
    echo "Creating .env file..."
    cat > API/.env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=esport_social
JWT_SECRET=your-secret-key-change-this-in-production
EOF
    echo -e "${GREEN}✓ .env file created (please update with your MySQL password)${NC}"
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Start API
echo -e "${BLUE}Starting FastAPI backend...${NC}"
if check_port 8000; then
    echo -e "${RED}Port 8000 is already in use!${NC}"
    echo "API might already be running or another service is using this port."
else
    cd API
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    echo "Installing Python dependencies..."
    pip install -q -r requirements.txt
    
    echo "Starting FastAPI on http://localhost:8000"
    python main.py &
    API_PID=$!
    cd ..
    echo -e "${GREEN}✓ API started (PID: $API_PID)${NC}"
fi

# Wait a bit for API to start
sleep 3

# Start Frontend
echo -e "${BLUE}Starting React frontend...${NC}"
if check_port 5173; then
    echo -e "${RED}Port 5173 is already in use!${NC}"
    echo "Frontend might already be running."
else
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm install
    fi
    
    echo "Starting React on http://localhost:5173"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Application is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🎮 Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to press Ctrl+C
trap "echo 'Stopping services...'; kill $API_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait