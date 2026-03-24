# 🏢 HRMS System - Project Structure

```
.
├── DEPLOYMENT.md
├── PROJECT_STRUCTURE.md
├── README (3).md
├── README.md
├── Services
│   ├── file-upload-service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src
│   │       ├── config
│   │       │   ├── database.js
│   │       │   └── multer.js
│   │       ├── controllers
│   │       │   └── uploadController.js
│   │       ├── routes
│   │       │   └── uploadRoutes.js
│   │       ├── server.js
│   │       └── services
│   │           └── imageService.js
│   └── notification-service
│       ├── Dockerfile
│       ├── package.json
│       └── src
│           ├── config
│           │   ├── database.js
│           │   └── rabbitmq.js
│           ├── consumers
│           │   └── notificationConsumer.js
│           ├── server.js
│           └── services
│               ├── cronService.js
│               └── emailService.js
├── TROUBLESHOOTING.md
├── backend
│   ├── Dockerfile
│   ├── package.json
│   ├── src
│   │   ├── config
│   │   │   └── database.js
│   │   ├── controllers
│   │   │   ├── analyticsController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── authController.js
│   │   │   ├── employeeController.js
│   │   │   ├── leaveController.js
│   │   │   ├── profileController.js
│   │   │   └── vi
│   │   ├── middleware
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── routes
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── leaveRoutes.js
│   │   │   └── profileRoutes.js
│   │   ├── server.js
│   │   └── utils
│   │       └── publisher.js
│   └── uploads
├── creds.txt
├── database
│   ├── add-profile-tables.sql
│   ├── hrms_complete_backup.sql
│   └── init
│       └── init.sql
├── debug.sh
├── docker-compose.yml
├── docker-compose.yml-bkp
├── file-upload-service
│   ├── Dockerfile
│   ├── package.json
│   └── src
│       ├── config
│       │   ├── database.js
│       │   └── multer.js
│       ├── controllers
│       │   └── uploadController.js
│       ├── routes
│       │   └── uploadRoutes.js
│       ├── server.js
│       └── services
│           └── imageService.js
├── frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── public
│   │   └── index.html
│   └── src
│       ├── App.js
│       ├── contexts
│       │   └── AuthContext.jsx
│       ├── index.js
│       ├── pages
│       │   ├── AdminDashboard.jsx
│       │   ├── Analytics.jsx
│       │   ├── ApplyLeave.jsx
│       │   ├── Attendance.jsx
│       │   ├── EmployeeDashboard.jsx
│       │   ├── Employees.jsx
│       │   ├── LeaveHistory.jsx
│       │   ├── LeaveRequests.jsx
│       │   ├── Login.jsx
│       │   ├── Login.jsx-bkp
│       │   ├── MyAttendance.jsx
│       │   ├── MyProfile.jsx
│       │   └── Reports.jsx
│       └── services
│           └── api.js
├── notification-service
│   ├── Dockerfile
│   ├── package.json
│   └── src
│       ├── config
│       │   ├── database.js
│       │   └── rabbitmq.js
│       ├── consumers
│       │   └── notificationConsumer.js
│       ├── server.js
│       └── services
│           ├── cronService.js
│           └── emailService.js
└── sh
    ├── auto-fix.sh
    ├── final-fix.sh
    ├── fix-container.sh
    ├── fix-frontend.sh
    ├── fix-gateway.sh
    ├── fix-login.sh
    ├── quick-fix.sh
    └── updatefronted.sh
```

## 📦 Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MySQL2
- JWT (jsonwebtoken)
- Bcrypt
- Multer (file uploads)

### Database
- MySQL 8.0

### DevOps
- Docker
- Docker Compose

## 🚀 Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run: `docker-compose up --build`
4. Access: http://localhost:3000

## 📝 Default Credentials

**Admin:**
- Email: admin@hrms.com
- Password: admin123

**Employee:**
- Email: employee@hrms.com
- Password: employee123
