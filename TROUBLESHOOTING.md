# 🔧 HRMS Troubleshooting Guide

## ❌ Problem: "Login failed" Error

### Quick Fix (Recommended)

Run this command in the project directory:

```bash
# Method 1: Use the fix script
chmod +x fix-login.sh
./fix-login.sh

# Method 2: Manual fix
docker-compose down -v
docker-compose up -d --build
```

**Wait 30 seconds** for the database to initialize, then try logging in again.

---

## 🔍 Why This Happens

The login fails when:
1. Database passwords aren't properly hashed
2. Database isn't fully initialized
3. Backend can't connect to database

---

## ✅ Step-by-Step Fix

### Step 1: Stop Everything
```bash
docker-compose down -v
```
**Note:** The `-v` flag removes volumes, resetting the database completely.

### Step 2: Start Fresh
```bash
docker-compose up -d --build
```

### Step 3: Wait for Initialization
```bash
# Check if MySQL is healthy
docker-compose ps

# Should show:
# hrms-mysql    running (healthy)
```

### Step 4: Verify Backend Connection
```bash
# Check backend logs
docker-compose logs backend

# Should see:
# ✅ Database connected successfully
# 🚀 Server running on port 5000
```

### Step 5: Test Login
- Go to http://localhost:3000
- Use credentials:
  - **Admin:** admin@hrms.com / admin123
  - **Employee:** employee@hrms.com / employee123

---

## 🐛 Still Not Working?

### Check 1: Verify Containers Are Running
```bash
docker-compose ps

# All should show "Up" or "running"
```

### Check 2: View Backend Logs
```bash
docker-compose logs backend

# Look for errors like:
# - Database connection failed
# - Port already in use
```

### Check 3: View MySQL Logs
```bash
docker-compose logs mysql

# Should see:
# ready for connections
```

### Check 4: Manual Database Check
```bash
# Enter MySQL container
docker exec -it hrms-mysql mysql -uroot -proot123

# Run these commands:
USE hrms_db;
SELECT * FROM users;

# Should show 2 users:
# - admin@hrms.com
# - employee@hrms.com

# Exit MySQL
exit;
```

---

## 🔐 Password Hash Issue

If you see users but still can't login, the password hashes might be wrong.

### Fix: Update Passwords Manually
```bash
# Enter MySQL
docker exec -it hrms-mysql mysql -uroot -proot123

# Update admin password (admin123)
USE hrms_db;
UPDATE users SET password = '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC' 
WHERE email = 'admin@hrms.com';

# Update employee password (employee123)
UPDATE users SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email = 'employee@hrms.com';

# Exit
exit;
```

---

## 🌐 Network Issues

### Check 1: Port Conflicts
```bash
# Check if ports are already in use
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :3306  # MySQL

# If ports are in use, change them in docker-compose.yml
```

### Check 2: Docker Network
```bash
# Check network
docker network ls

# Should see hrms-network or hrms-system_hrms-network
```

---

## 🔄 Complete Reset

If nothing works, do a complete reset:

```bash
# Stop everything
docker-compose down -v

# Remove all images
docker rmi $(docker images 'hrms*' -q)

# Clean Docker system
docker system prune -a

# Rebuild from scratch
docker-compose up -d --build
```

---

## 📊 Verify Each Service

### 1. MySQL (Database)
```bash
# Check health
docker-compose ps mysql

# Should show: (healthy)
```

### 2. Backend (API)
```bash
# Test API
curl http://localhost:5000/health

# Should return:
# {"status":"OK","message":"HRMS API is running"}
```

### 3. Frontend (React)
```bash
# Check if accessible
curl http://localhost:3000

# Should return HTML
```

---

## 💡 Common Errors & Solutions

### Error: "ECONNREFUSED"
**Problem:** Backend can't connect to MySQL  
**Solution:** Wait longer for MySQL to start (30-60 seconds)

### Error: "Port already allocated"
**Problem:** Port 3000, 5000, or 3306 is in use  
**Solution:** Change ports in docker-compose.yml

### Error: "Database connection failed"
**Problem:** Wrong database credentials  
**Solution:** Check .env and docker-compose.yml match

### Error: "Invalid credentials"
**Problem:** Wrong email or password  
**Solution:** Use exact credentials (case-sensitive)

---

## 📞 Debug Checklist

- [ ] Ran `docker-compose down -v`
- [ ] Ran `docker-compose up -d --build`
- [ ] Waited 30 seconds for initialization
- [ ] All containers show "running"
- [ ] Backend logs show "Database connected"
- [ ] MySQL shows "(healthy)" status
- [ ] Can access http://localhost:3000
- [ ] Using correct credentials
- [ ] No browser cache issues (try incognito)

---

## 🎯 Working Credentials

```
Admin Login:
Email:    admin@hrms.com
Password: admin123

Employee Login:
Email:    employee@hrms.com
Password: employee123
```

**Note:** Credentials are case-sensitive!

---

## 📝 Get Detailed Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql
docker-compose logs -f frontend

# Save logs to file
docker-compose logs > debug.log
```

---

## ✅ Success Indicators

When everything works correctly, you should see:

1. **Container Status:**
   ```
   hrms-mysql     running (healthy)
   hrms-backend   running
   hrms-frontend  running
   ```

2. **Backend Logs:**
   ```
   ✅ Database connected successfully
   🚀 Server running on port 5000
   ```

3. **Login Page:**
   - Loads at http://localhost:3000
   - Shows login form
   - No console errors

4. **After Login:**
   - Redirects to dashboard
   - Shows user name
   - No error messages

---

**If you're still having issues after trying all these steps, share the output of:**

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs mysql
```
