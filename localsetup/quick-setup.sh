#!/bin/bash

# Quick Setup Script for E-Sport Social Gaming Platform
# This creates all the files and folders, then guides you on what to paste where

echo "🎮 E-Sport Social Gaming Platform - Quick Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create all directories
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p backend/src/config
mkdir -p backend/src/middleware
mkdir -p backend/src/controllers
mkdir -p frontend/src/contexts
mkdir -p frontend/src/services
mkdir -p frontend/pages

# Create all backend files (empty for now)
echo -e "${BLUE}Creating backend files...${NC}"
touch backend/.env
touch backend/.htaccess
touch backend/index.php
touch backend/src/config/database.php
touch backend/src/middleware/auth.php
touch backend/src/controllers/AuthController.php
touch backend/src/controllers/ProfileController.php
touch backend/src/controllers/GameController.php
touch backend/src/controllers/MatchingController.php
touch backend/src/controllers/MessageController.php
touch backend/src/controllers/ForumController.php

# Create all frontend files
echo -e "${BLUE}Creating frontend files...${NC}"
touch frontend/tailwind.config.js
touch frontend/postcss.config.js
touch frontend/src/contexts/AuthContext.jsx
touch frontend/src/services/api.js

# Create/update page files
touch frontend/pages/Home.jsx
touch frontend/pages/Login.jsx
touch frontend/pages/Register.jsx
touch frontend/pages/Profile.jsx
touch frontend/pages/Games.jsx
touch frontend/pages/Matching.jsx
touch frontend/pages/Messages.jsx
touch frontend/pages/Forum.jsx

# Create database.sql
touch database.sql

# Create the copy guide
cat > COPY_GUIDE.md << 'EOF'
# 📋 Copy Guide - What Goes Where

## Backend Files

### 1. database.sql
Copy content from: "Database Schema - esport_social.sql" artifact

### 2. backend/.env
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password_here
DB_NAME=esport_social
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

### 3. backend/index.php
Copy content from: "Backend Index - backend/index.php" artifact

### 4. backend/.htaccess
Copy content from: "Backend .htaccess" artifact

### 5. backend/src/config/database.php
Copy content from: "Database Configuration" artifact

### 6. backend/src/middleware/auth.php
Copy content from: "Auth Middleware" artifact

### 7. backend/src/controllers/AuthController.php
Copy content from: "Auth Controller" artifact

### 8. backend/src/controllers/ProfileController.php
Copy content from: "Profile Controller" artifact

### 9. backend/src/controllers/GameController.php
Copy content from: "Game Controller" artifact

### 10. backend/src/controllers/MatchingController.php
Copy content from: "Matching Controller" artifact

### 11. backend/src/controllers/MessageController.php
Copy content from: "Message Controller" artifact

### 12. backend/src/controllers/ForumController.php
Copy content from: "Forum Controller" artifact

## Frontend Files

### 1. frontend/tailwind.config.js
Copy content from: "Tailwind Config" artifact

### 2. frontend/postcss.config.js
Copy content from: "PostCSS Config" artifact

### 3. frontend/vite.config.js
UPDATE existing file with content from artifact

### 4. frontend/src/App.jsx
REPLACE entire content from artifact

### 5. frontend/src/index.css
REPLACE entire content from artifact

### 6. frontend/src/contexts/AuthContext.jsx
Copy content from: "Auth Context" artifact

### 7. frontend/src/services/api.js
Copy content from: "API Service" artifact

### 8. frontend/pages/*.jsx
Update each page file with content from respective artifacts

## Order of Operations

1. Copy all backend files first
2. Copy frontend configuration files
3. Update frontend source files
4. Run installation commands
EOF

echo -e "${GREEN}✅ All files and folders created!${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo "1. Open COPY_GUIDE.md for detailed instructions"
echo "2. Copy content from each artifact to the corresponding file"
echo "3. Configure your database credentials in backend/.env"
echo ""
echo -e "${BLUE}After copying all files, run these commands:${NC}"
echo ""
echo "Backend setup:"
echo "  cd backend"
echo "  composer install"
echo "  mysql -u root -p -e 'CREATE DATABASE esport_social;'"
echo "  mysql -u root -p esport_social < ../database.sql"
echo "  php -S localhost:8000"
echo ""
echo "Frontend setup (in new terminal):"
echo "  cd frontend"
echo "  npm install -D tailwindcss postcss autoprefixer"
echo "  npm run dev"
echo ""
echo -e "${GREEN}The app will be available at http://localhost:5173${NC}"

# Create a verification script
cat > verify-setup.sh << 'VERIFY'
#!/bin/bash

echo "🔍 Verifying setup..."
echo ""

# Check if files have content
check_file() {
    if [ -s "$1" ]; then
        echo "✅ $1 - Has content"
    else
        echo "❌ $1 - Empty or missing"
    fi
}

echo "Backend files:"
check_file "backend/index.php"
check_file "backend/.htaccess"
check_file "backend/src/config/database.php"
check_file "backend/src/middleware/auth.php"
check_file "backend/src/controllers/AuthController.php"

echo ""
echo "Frontend files:"
check_file "frontend/src/App.jsx"
check_file "frontend/src/contexts/AuthContext.jsx"
check_file "frontend/tailwind.config.js"

echo ""
echo "Database:"
check_file "database.sql"

echo ""
echo "Run this script after copying all files to verify setup is complete."
VERIFY

chmod +x verify-setup.sh

echo ""
echo -e "${GREEN}Created verify-setup.sh - Run it after copying files to check your setup${NC}"