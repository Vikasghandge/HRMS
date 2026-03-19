#!/bin/bash

# ============================================
# HRMS Auto-Fix Script
# Removes bcrypt complexity and uses simple passwords
# ============================================

echo "🔧 HRMS Auto-Fix Script"
echo "======================="
echo ""
echo "This script will:"
echo "1. Remove bcrypt password hashing"
echo "2. Use simple plain-text passwords"
echo "3. Restart the application"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

echo ""
echo "📝 Step 1: Fixing database passwords..."

# Fix database init.sql
cat > database/init/init.sql << 'EOF'
-- ============================================
-- HRMS Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS hrms_db;
USE hrms_db;

-- ============================================
-- Users Table (Authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Employees Table
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10, 2) DEFAULT 0.00,
    address TEXT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Leave Management
-- ============================================
CREATE TABLE IF NOT EXISTS leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('sick', 'casual', 'paid') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================
-- Leave Balance
-- ============================================
CREATE TABLE IF NOT EXISTS leave_balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNIQUE NOT NULL,
    sick_leave INT DEFAULT 12,
    casual_leave INT DEFAULT 10,
    paid_leave INT DEFAULT 15,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ============================================
-- Attendance
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('present', 'absent', 'half_day') DEFAULT 'present',
    working_hours DECIMAL(4, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_date (employee_id, date)
);

-- ============================================
-- Documents
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_path VARCHAR(255) NOT NULL,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Insert Default Users (PLAIN TEXT PASSWORDS)
-- ============================================
INSERT INTO users (email, password, role) VALUES 
('admin@hrms.com', 'admin123', 'admin');

INSERT INTO employees (employee_id, user_id, first_name, last_name, department, designation, joining_date, salary) VALUES 
('EMP001', 1, 'Admin', 'User', 'Management', 'HR Manager', '2024-01-01', 80000.00);

INSERT INTO users (email, password, role) VALUES 
('employee@hrms.com', 'employee123', 'employee');

INSERT INTO employees (employee_id, user_id, first_name, last_name, phone, department, designation, joining_date, salary) VALUES 
('EMP002', 2, 'John', 'Doe', '9876543210', 'Engineering', 'Software Developer', '2024-02-01', 60000.00);

INSERT INTO leave_balance (employee_id, year) VALUES 
(2, 2024);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX idx_employee_user ON employees(user_id);
CREATE INDEX idx_leave_employee ON leaves(employee_id);
CREATE INDEX idx_leave_status ON leaves(status);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_documents_employee ON documents(employee_id);

SELECT 'Database initialized successfully!' AS message;
EOF

echo "✅ Database file fixed"
echo ""
echo "📝 Step 2: Fixing authentication controller..."

# Fix authController.js
cat > backend/src/controllers/authController.js << 'EOF'
const { pool } = require('../config/database');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Simple password check (no bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get employee details
    const [employees] = await pool.query(
      'SELECT * FROM employees WHERE user_id = ?',
      [user.id]
    );

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        employeeId: employees[0]?.id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: employees[0]?.id || null,
        name: employees[0] ? `${employees[0].first_name} ${employees[0].last_name}` : 'Admin'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, email, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [employees] = await pool.query(
      'SELECT * FROM employees WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      user: users[0],
      employee: employees[0] || null
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simple password check (no bcrypt)
    if (currentPassword !== users[0].password) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password (plain text)
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
EOF

echo "✅ Authentication controller fixed"
echo ""
echo "📝 Step 3: Fixing employee controller..."

# Fix employeeController.js - Remove bcrypt from create employee
cat > backend/src/controllers/employeeController.js << 'EOF'
const { pool } = require('../config/database');

// Generate Employee ID
const generateEmployeeId = async () => {
  const [result] = await pool.query(
    'SELECT employee_id FROM employees ORDER BY id DESC LIMIT 1'
  );
  
  if (result.length === 0) {
    return 'EMP001';
  }
  
  const lastId = result[0].employee_id;
  const num = parseInt(lastId.replace('EMP', '')) + 1;
  return `EMP${num.toString().padStart(3, '0')}`;
};

// Get all employees (Admin only)
exports.getAllEmployees = async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, u.email, u.role, u.is_active
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `);

    res.json({
      success: true,
      count: employees.length,
      employees
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [employees] = await pool.query(`
      SELECT e.*, u.email, u.role, u.is_active
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `, [id]);

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      employee: employees[0]
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new employee (Admin only) - NO BCRYPT
exports.createEmployee = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      department,
      designation,
      joining_date,
      salary,
      address
    } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if email exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user with plain text password
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, password, 'employee']
    );

    const userId = userResult.insertId;

    // Generate employee ID
    const employeeId = await generateEmployeeId();

    // Create employee
    const [employeeResult] = await connection.query(
      `INSERT INTO employees 
       (employee_id, user_id, first_name, last_name, phone, department, designation, joining_date, salary, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, userId, first_name, last_name, phone, department, designation, joining_date, salary, address]
    );

    // Create leave balance for new employee
    const currentYear = new Date().getFullYear();
    await connection.query(
      'INSERT INTO leave_balance (employee_id, year) VALUES (?, ?)',
      [employeeResult.insertId, currentYear]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employeeId: employeeId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Update employee (Admin only)
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      department,
      designation,
      salary,
      address
    } = req.body;

    const [result] = await pool.query(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, phone = ?, department = ?, 
           designation = ?, salary = ?, address = ?
       WHERE id = ?`,
      [first_name, last_name, phone, department, designation, salary, address, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete employee (Admin only)
exports.deleteEmployee = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    await connection.beginTransaction();

    // Get user_id
    const [employees] = await connection.query(
      'SELECT user_id FROM employees WHERE id = ?',
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete user (cascade will delete employee)
    await connection.query('DELETE FROM users WHERE id = ?', [employees[0].user_id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Get employee statistics (Admin dashboard)
exports.getStatistics = async (req, res) => {
  try {
    const [totalEmployees] = await pool.query('SELECT COUNT(*) as count FROM employees');
    const [totalDepartments] = await pool.query('SELECT COUNT(DISTINCT department) as count FROM employees');
    const [pendingLeaves] = await pool.query('SELECT COUNT(*) as count FROM leaves WHERE status = "pending"');
    const [presentToday] = await pool.query('SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = "present"');

    res.json({
      success: true,
      statistics: {
        totalEmployees: totalEmployees[0].count,
        totalDepartments: totalDepartments[0].count,
        pendingLeaves: pendingLeaves[0].count,
        presentToday: presentToday[0].count
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
EOF

echo "✅ Employee controller fixed"
echo ""
echo "🛑 Step 4: Stopping containers..."
docker-compose down -v

echo ""
echo "🚀 Step 5: Starting fresh containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to initialize (30 seconds)..."
sleep 30

echo ""
echo "✅ Fix Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Access Application:"
echo "   URL: http://localhost:3000"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin:    admin@hrms.com / admin123"
echo "   Employee: employee@hrms.com / employee123"
echo ""
echo "📊 Check Status:"
echo "   docker-compose ps"
echo "   docker-compose logs -f"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
EOF

chmod +x /mnt/user-data/outputs/hrms-system/auto-fix.sh
