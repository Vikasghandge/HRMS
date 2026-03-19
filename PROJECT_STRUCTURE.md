# 🏢 HRMS System - Project Structure

```
hrms-system/
│
├── frontend/                      # React Frontend Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Table.jsx
│   │   ├── pages/                # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── LeaveManagement.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/             # API calls
│   │   │   └── api.js
│   │   ├── contexts/             # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/                # Helper functions
│   │   │   └── constants.js
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── backend/                       # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── employeeController.js
│   │   │   ├── leaveController.js
│   │   │   └── attendanceController.js
│   │   ├── routes/               # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── leaveRoutes.js
│   │   │   └── attendanceRoutes.js
│   │   ├── models/               # Database models
│   │   │   └── db.js
│   │   ├── middleware/           # Custom middleware
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── config/               # Configuration
│   │   │   └── database.js
│   │   ├── utils/                # Utilities
│   │   │   └── helpers.js
│   │   └── server.js             # Entry point
│   ├── uploads/                  # File uploads directory
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── database/                      # Database initialization
│   └── init/
│       └── init.sql              # Database schema
│
├── docker-compose.yml            # Docker Compose configuration
├── .env.example                  # Environment variables template
├── .gitignore
├── README.md                     # Setup instructions
└── DEPLOYMENT.md                 # Deployment guide
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
