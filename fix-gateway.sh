#!/bin/bash

echo "🔧 Fixing Bad Gateway - Network Configuration"
echo "=============================================="
echo ""

echo "📝 Step 1: Updating docker-compose.yml with correct network..."

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: hrms-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: hrms_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - hrms-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot123"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hrms-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=root123
      - DB_NAME=hrms_db
      - JWT_SECRET=your_jwt_secret_key_change_this_in_production
      - JWT_EXPIRES_IN=7d
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - hrms-network
    volumes:
      - ./backend/uploads:/app/uploads

  # Frontend React App
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: hrms-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - hrms-network

networks:
  hrms-network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
EOF

echo "✅ docker-compose.yml updated"
echo ""

echo "📝 Step 2: Updating nginx.conf..."

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

    # API proxy to backend container
    location /api/ {
        proxy_pass http://hrms-backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    error_page 404 /index.html;
}
EOF

echo "✅ nginx.conf updated"
echo ""

echo "📝 Step 3: Updating frontend API URL..."

cat > frontend/.env << 'EOF'
REACT_APP_API_URL=/api
EOF

echo "✅ frontend .env updated"
echo ""

echo "🛑 Step 4: Stopping all containers..."
docker-compose down

echo ""
echo "🚀 Step 5: Rebuilding and starting containers..."
docker-compose up -d --build

echo ""
echo "⏳ Step 6: Waiting for services to initialize (40 seconds)..."
sleep 40

echo ""
echo "📊 Step 7: Checking container status..."
docker-compose ps

echo ""
echo "🧪 Step 8: Testing connections..."

echo "Testing backend health..."
curl -s http://localhost:5000/health || echo "❌ Backend not responding"

echo ""
echo "Testing frontend..."
curl -s http://localhost:3000 | head -n 5 || echo "❌ Frontend not responding"

echo ""
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
echo "📊 Check Status:"
echo "   docker-compose ps"
echo "   docker-compose logs -f frontend"
echo "   docker-compose logs -f backend"
echo ""
echo "🔍 If still having issues:"
echo "   1. Clear browser cache"
echo "   2. Try incognito mode"
echo "   3. Check: docker-compose logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
