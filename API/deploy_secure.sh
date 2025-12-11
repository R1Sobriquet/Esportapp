#!/bin/bash

echo "🔒 Secure Deployment Check"

# Vérifier la configuration de sécurité
python3 API/security_check.py

if [ $? -ne 0 ]; then
    echo "❌ Security check failed. Aborting deployment."
    exit 1
fi

# Appliquer les migrations
echo "📊 Applying database migrations..."
mysql -u root -p esport_social < database_migration.sql
mysql -u root -p esport_social < database_activity.sql

echo "✅ Deployment security check passed"