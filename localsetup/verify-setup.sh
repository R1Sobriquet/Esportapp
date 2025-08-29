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
