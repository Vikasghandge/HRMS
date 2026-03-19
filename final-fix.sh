#!/bin/bash

echo "🔧 Final Fix - Correct Service Names"
echo "====================================="
echo ""

echo "📝 Creating correct nginx configuration..."
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

echo "✅ Nginx config created with correct service name: 'backend'"
echo ""

echo "📝 Updating frontend environment..."
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=/api
EOF

echo "✅ Frontend .env updated"
echo ""

echo "🛑 Stopping all containers..."
docker-compose down

echo ""
echo "🚀 Starting all containers fresh..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for containers to start (15 seconds)..."
sleep 15

echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ All done!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Access: http://localhost:3000"
echo "🔐 Login: admin@hrms.com / admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
