#!/bin/bash

echo "🔧 Fixing Frontend Container Crash"
echo "==================================="
echo ""

echo "📝 The frontend container is exiting immediately."
echo "This usually means nginx configuration has an error."
echo ""

echo "Step 1: Checking current nginx config..."
if [ -f frontend/nginx.conf ]; then
    echo "✅ nginx.conf exists"
    cat frontend/nginx.conf
else
    echo "❌ nginx.conf missing!"
fi
echo ""

echo "Step 2: Recreating simple nginx config..."
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://hrms-backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

echo "✅ Simple nginx config created"
echo ""

echo "Step 3: Updating frontend .env to use /api..."
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=/api
EOF

echo "✅ Frontend .env updated"
echo ""

echo "Step 4: Removing old frontend container..."
docker rm -f hrms-frontend 2>/dev/null

echo ""
echo "Step 5: Rebuilding and starting frontend..."
docker-compose up -d --build frontend

echo ""
echo "Step 6: Checking if frontend started..."
sleep 5
docker ps | grep frontend

echo ""
echo "Step 7: Checking frontend logs..."
docker logs hrms-frontend --tail=20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fix attempt complete!"
echo ""
echo "Check status with:"
echo "  docker ps"
echo ""
echo "If frontend is running, access at:"
echo "  http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
