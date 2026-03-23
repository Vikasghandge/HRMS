#!/bin/bash

# ============================================
# HRMS Quick Fix Script
# ============================================
# This script fixes the login issue by resetting the database

echo "🔧 HRMS Quick Fix - Resetting Database..."
echo ""

# Stop all containers
echo "📦 Stopping containers..."
docker-compose down -v

echo ""
echo "🗑️  Database volumes removed"
echo ""

# Rebuild and start
echo "🚀 Starting fresh containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for database to initialize (30 seconds)..."
sleep 30

echo ""
echo "✅ Fix complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin:    admin@hrms.com / admin123"
echo "   Employee: employee@hrms.com / employee123"
echo ""
echo "📊 Check status:"
echo "   docker-compose ps"
echo "   docker-compose logs -f"
echo ""
