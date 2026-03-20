-- HRMS Database Initialization Script
-- Drop existing database if exists and create fresh
DROP DATABASE IF EXISTS hrms_db;
CREATE DATABASE hrms_db;
USE hrms_db;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: employees
-- ============================================
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10, 2),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_user_id (user_id),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: attendance
-- ============================================
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    working_hours DECIMAL(5, 2) DEFAULT 0.00,
    status ENUM('present', 'absent', 'half_day', 'leave') DEFAULT 'present',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employee_id, date),
    INDEX idx_employee_date (employee_id, date),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: leaves
-- ============================================
CREATE TABLE leaves (
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
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_leave_type (leave_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: leave_balance
-- ============================================
CREATE TABLE leave_balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    year INT NOT NULL,
    sick_leave INT DEFAULT 12,
    casual_leave INT DEFAULT 10,
    paid_leave INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_year (employee_id, year),
    INDEX idx_employee_year (employee_id, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: notifications
-- ============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Admin User
-- ============================================
-- Password is stored as plain text as per your requirement
INSERT INTO users (email, password, role, is_active) 
VALUES ('admin@hrms.com', 'admin123', 'admin', TRUE);

-- ============================================
-- Insert Sample Employees (Optional)
-- ============================================
-- Sample Employee 1
INSERT INTO users (email, password, role, is_active) 
VALUES ('john.doe@hrms.com', 'password123', 'employee', TRUE);

INSERT INTO employees (employee_id, user_id, first_name, last_name, phone, department, designation, joining_date, salary, address)
VALUES ('EMP001', 2, 'John', 'Doe', '+91-9876543210', 'IT', 'Software Engineer', '2024-01-15', 50000.00, 'Pune, Maharashtra');

-- Sample Employee 2
INSERT INTO users (email, password, role, is_active) 
VALUES ('jane.smith@hrms.com', 'password123', 'employee', TRUE);

INSERT INTO employees (employee_id, user_id, first_name, last_name, phone, department, designation, joining_date, salary, address)
VALUES ('EMP002', 3, 'Jane', 'Smith', '+91-9876543211', 'HR', 'HR Manager', '2024-02-01', 55000.00, 'Mumbai, Maharashtra');

-- Sample Employee 3
INSERT INTO users (email, password, role, is_active) 
VALUES ('mike.johnson@hrms.com', 'password123', 'employee', TRUE);

INSERT INTO employees (employee_id, user_id, first_name, last_name, phone, department, designation, joining_date, salary, address)
VALUES ('EMP003', 4, 'Mike', 'Johnson', '+91-9876543212', 'Finance', 'Accountant', '2024-03-10', 48000.00, 'Pune, Maharashtra');

-- ============================================
-- Insert Leave Balance for Sample Employees
-- ============================================
INSERT INTO leave_balance (employee_id, year, sick_leave, casual_leave, paid_leave)
VALUES 
    (1, 2024, 12, 10, 15),
    (2, 2024, 12, 10, 15),
    (3, 2024, 12, 10, 15);

-- ============================================
-- Insert Sample Attendance Records
-- ============================================
-- Attendance for today
INSERT INTO attendance (employee_id, date, check_in, check_out, working_hours, status)
VALUES 
    (1, CURDATE(), '09:00:00', '18:00:00', 9.00, 'present'),
    (2, CURDATE(), '09:15:00', '18:15:00', 9.00, 'present'),
    (3, CURDATE(), '09:30:00', NULL, 0.00, 'present');

-- Attendance for yesterday
INSERT INTO attendance (employee_id, date, check_in, check_out, working_hours, status)
VALUES 
    (1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '18:00:00', 9.00, 'present'),
    (2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '17:45:00', 8.75, 'present'),
    (3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:30:00', '18:30:00', 9.00, 'present');

-- ============================================
-- Insert Sample Leave Requests
-- ============================================
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason, status)
VALUES 
    (1, 'casual', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY), 2, 'Family function', 'pending'),
    (2, 'sick', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 1, 'Medical checkup', 'approved'),
    (3, 'paid', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 5, 'Vacation', 'pending');

-- ============================================
-- Insert Sample Notifications
-- ============================================
INSERT INTO notifications (user_id, title, message, is_read)
VALUES 
    (2, 'Welcome to HRMS', 'Your account has been created successfully.', FALSE),
    (3, 'Leave Request Approved', 'Your leave request from 2024-03-25 to 2024-03-25 has been approved', TRUE),
    (4, 'Welcome to HRMS', 'Your account has been created successfully.', FALSE);

-- ============================================
-- Display Summary
-- ============================================
SELECT '✅ Database initialized successfully!' AS Status;
SELECT 'Tables created:' AS Info;
SHOW TABLES;

SELECT '
Admin Credentials:' AS Info;
SELECT 'Email: admin@hrms.com' AS Credentials;
SELECT 'Password: admin123' AS Password;

SELECT '
Sample Employees Created:' AS Info;
SELECT 
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) AS Name,
    u.email,
    e.department,
    e.designation
FROM employees e
JOIN users u ON e.user_id = u.id;

SELECT '
Database Setup Complete!' AS Status;
