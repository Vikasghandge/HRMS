# 🚀 HRMS Deployment Guide

## 📦 What You Need

- Docker installed
- Docker Compose installed
- 4GB RAM minimum
- 10GB disk space

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Prepare the Project
```bash
cd hrms-system
```

### Step 2: Start Everything
```bash
docker-compose up -d --build
```

### Step 3: Wait for Services (2-3 minutes)
```bash
# Check if all services are running
docker-compose ps

# Should show:
# hrms-frontend   running
# hrms-backend    running
# hrms-mysql      running (healthy)
```

### Step 4: Access the Application
- Open browser: http://localhost:3000
- Login with demo credentials

## 🔍 Verify Installation

### Check Services
```bash
# All services running
docker-compose ps

# View logs
docker-compose logs -f
```

### Check Database
```bash
# Enter MySQL container
docker exec -it hrms-mysql mysql -uroot -proot123

# Run in MySQL:
USE hrms_db;
SHOW TABLES;
SELECT * FROM users;
exit;
```

### Check Backend
```bash
# Test API
curl http://localhost:5000/health

# Should return:
# {"status":"OK","message":"HRMS API is running"}
```

### Check Frontend
```bash
# Open in browser
http://localhost:3000

# Should see login page
```

## 🎯 Default Credentials

### Admin Login
```
Email: admin@hrms.com
Password: admin123
```

### Employee Login
```
Email: employee@hrms.com
Password: employee123
```

## 📊 Container Status

### Expected Output of `docker-compose ps`:
```
NAME              STATUS              PORTS
hrms-frontend     Up 2 minutes        0.0.0.0:3000->80/tcp
hrms-backend      Up 2 minutes        0.0.0.0:5000->5000/tcp
hrms-mysql        Up 2 minutes (healthy) 0.0.0.0:3306->3306/tcp
```

## 🔧 Common Issues & Fixes

### Issue 1: Port Already in Use
```bash
# Error: port 3000 already allocated

# Solution: Change port in docker-compose.yml
frontend:
  ports:
    - "8080:80"  # Change 3000 to 8080
```

### Issue 2: Database Connection Failed
```bash
# Wait for MySQL to be ready
docker-compose logs mysql

# Restart if needed
docker-compose restart mysql
```

### Issue 3: Frontend Shows 404
```bash
# Rebuild frontend
docker-compose up -d --build frontend
```

### Issue 4: Cannot Login
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

## 🔄 Update Code

```bash
# After making code changes:
docker-compose up -d --build

# Or rebuild specific service:
docker-compose up -d --build backend
```

## 📋 Health Checks

### Backend Health
```bash
curl http://localhost:5000/health
```

### Database Health
```bash
docker exec hrms-mysql mysqladmin ping -h localhost -uroot -proot123
```

### Frontend Health
```bash
curl http://localhost:3000
```

## 🎨 Customization

### Change Ports
Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "YOUR_PORT:80"
  
  backend:
    ports:
      - "YOUR_PORT:5000"
```

### Change Database Password
Edit `docker-compose.yml`:
```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: your_new_password

backend:
  environment:
    DB_PASSWORD: your_new_password
```

## 📝 Logs

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Save Logs to File
```bash
docker-compose logs > logs.txt
```

## 💾 Backup Database

```bash
# Backup
docker exec hrms-mysql mysqldump -uroot -proot123 hrms_db > backup.sql

# Restore
docker exec -i hrms-mysql mysql -uroot -proot123 hrms_db < backup.sql
```

## 🚀 Production Deployment

### 1. Change Secrets
```bash
# Edit backend/.env
JWT_SECRET=generate_strong_32_char_secret_here
DB_PASSWORD=strong_database_password
```

### 2. Enable HTTPS
- Use SSL certificates
- Configure nginx for HTTPS
- Update frontend API URL

### 3. Database Security
- Change MySQL root password
- Create separate database user
- Enable SSL connections

### 4. Monitoring
- Set up logging
- Enable health checks
- Configure alerts

## 📞 Support

### Check Status
```bash
docker-compose ps
docker-compose logs
```

### Restart Everything
```bash
docker-compose restart
```

### Clean Restart
```bash
docker-compose down -v
docker-compose up -d --build
```

---

**🎉 Deployment Complete!**

Access your HRMS at: **http://localhost:3000**
