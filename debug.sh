#!/bin/bash

echo "🔍 HRMS Debug Script"
echo "===================="
echo ""

echo "📊 Checking container status..."
docker-compose ps
echo ""

echo "📝 Checking backend logs..."
echo "Last 30 lines:"
docker-compose logs --tail=30 backend
echo ""

echo "🗄️ Checking database..."
echo "Checking if users exist:"
docker exec hrms-mysql mysql -uroot -proot123 -e "USE hrms_db; SELECT email, password, role FROM users;"
echo ""

echo "🔌 Testing backend API..."
curl -s http://localhost:5000/health
echo ""
echo ""

echo "🧪 Testing login endpoint..."
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hrms.com","password":"admin123"}' | jq .
echo ""
