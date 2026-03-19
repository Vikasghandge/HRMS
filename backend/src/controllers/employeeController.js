const bcrypt = require('bcryptjs');
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

// Create new employee (Admin only)
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'employee']
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
