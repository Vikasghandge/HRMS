# 🏢 HRMS - Human Resource Management System

A complete, production-ready HR Management System built with React, Node.js, Express, and MySQL. Deploy with just Docker and Docker Compose!

## ✨ Features

### 🔐 Authentication & Authorization
- Separate login for Admin and Employees
- JWT-based secure authentication
- Role-based access control (RBAC)
- Protected routes

### 👨‍💼 Admin Dashboard
- Employee management (Add/Edit/Delete)
- Auto-generated Employee IDs
- Leave request approval/rejection
- Attendance monitoring
- Statistics and analytics
- Department management

### 👤 Employee Dashboard
- Personal profile management
- Leave application system
- Leave balance tracking
- Attendance check-in/check-out
- Leave history
- Real-time notifications

### 📅 Leave Management
- Multiple leave types (Sick, Casual, Paid)
- Leave balance tracking
- Admin approval workflow
- Leave history and status

### ⏰ Attendance System
- Daily check-in/check-out
- Working hours calculation
- Attendance history
- Admin monitoring dashboard

## 🛠️ Tech Stack

### Frontend
- React.js 18
- React Router v6
- Axios
- React Icons
- Inline CSS (no external dependencies)

### Backend
- Node.js
- Express.js
- MySQL 8.0
- JWT Authentication
- Bcrypt for password hashing
- Helmet for security
- Morgan for logging

### DevOps
- Docker
- Docker Compose
- Nginx (reverse proxy)
- Multi-stage builds

## 📋 Prerequisites

- Docker (20.10 or higher)
- Docker Compose (2.0 or higher)
- 4GB RAM minimum
- 10GB free disk space

## 🚀 Quick Start

### 1. Clone or Download the Project

```bash
cd hrms-system
```

### 2. Start with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

### 4. Default Login Credentials

**Admin:**
- Email: `admin@hrms.com`
- Password: `admin123`

**Employee:**
- Email: `employee@hrms.com`
- Password: `employee123`

## 📁 Project Structure

```
hrms-system/
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React Context (Auth)
│   │   ├── services/         # API calls
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/                   # Node.js Backend
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, error handling
│   │   ├── config/           # Database config
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── database/                  # Database
│   └── init/
│       └── init.sql          # Schema & seed data
│
├── docker-compose.yml        # Docker orchestration
├── .env.example              # Environment template
└── README.md
```

## 🔧 Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### Clean Everything
```bash
docker-compose down -v
docker system prune -a
```

## 📊 Database Schema

### Tables
- **users** - Authentication & user roles
- **employees** - Employee information
- **leaves** - Leave requests
- **leave_balance** - Annual leave balance
- **attendance** - Daily attendance records
- **documents** - Employee documents
- **notifications** - System notifications

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### Employees (Admin)
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/statistics` - Get statistics

### Leaves
- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/my-leaves` - Get my leaves
- `GET /api/leaves` - Get all leaves (Admin)
- `PUT /api/leaves/:id/status` - Approve/reject leave (Admin)
- `GET /api/leaves/balance` - Get leave balance

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-attendance` - Get my attendance
- `GET /api/attendance` - Get all attendance (Admin)
- `GET /api/attendance/today-status` - Get today's status

## 🎨 Customization

### Change Database Password
1. Edit `docker-compose.yml`
2. Update `MYSQL_ROOT_PASSWORD`
3. Update `DB_PASSWORD` in backend environment
4. Rebuild: `docker-compose up -d --build`

### Change Port
Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Change 3000 to 8080

backend:
  ports:
    - "5001:5000"  # Change 5000 to 5001
```

### Add More Features
- Edit backend controllers in `backend/src/controllers/`
- Add routes in `backend/src/routes/`
- Create frontend pages in `frontend/src/pages/`

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if MySQL is running
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process or change port in docker-compose.yml
```

### Cannot Login
```bash
# Re-initialize database
docker-compose down -v
docker-compose up -d
```

## 🔐 Security Considerations

### For Production:
1. **Change JWT Secret**
   - Edit `JWT_SECRET` in backend `.env`
   - Use minimum 32 characters

2. **Use Environment Variables**
   - Never commit `.env` files
   - Use different secrets per environment

3. **Enable HTTPS**
   - Use SSL certificates
   - Configure nginx for HTTPS

4. **Database Security**
   - Change default passwords
   - Use strong passwords
   - Enable SSL for database connections

5. **Rate Limiting**
   - Implement rate limiting on API
   - Prevent brute force attacks

## 📈 Future Enhancements

- [ ] Payroll management
- [ ] Performance reviews
- [ ] Document upload/download
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Biometric attendance
- [ ] Shift management
- [ ] Role permissions customization

## 🤝 Contributing

Feel free to fork this project and submit pull requests!

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💡 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Check database connection
4. Verify environment variables

---

**Built with ❤️ for efficient HR management**

**Version:** 1.0.0  
**Last Updated:** March 2026
