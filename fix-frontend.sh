#!/bin/bash

echo "🔧 Fixing Frontend API Connection"
echo "=================================="
echo ""

echo "📝 Step 1: Updating frontend environment..."

# Update frontend .env
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=/api
EOF

echo "✅ Frontend .env updated"
echo ""

echo "📝 Step 2: Updating nginx configuration..."

# Update nginx.conf to properly proxy API calls
cat > frontend/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy - Route /api calls to backend
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    error_page 404 /index.html;
}
EOF

echo "✅ Nginx config updated"
echo ""

echo "📝 Step 3: Rebuilding frontend container..."
docker-compose up -d --build frontend

echo ""
echo "⏳ Waiting for frontend to rebuild (20 seconds)..."
sleep 20

echo ""
echo "✅ Fix Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Access Application:"
echo "   URL: http://localhost:3000"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin:    admin@hrms.com / admin123"
echo "   Employee: employee@hrms.com / employee123"
echo ""
echo "📊 Verify:"
echo "   - Clear browser cache (Ctrl+Shift+Delete)"
echo "   - Try incognito mode"
echo "   - Check browser console (F12)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
