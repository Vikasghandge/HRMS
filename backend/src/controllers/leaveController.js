const { pool } = require('../config/database');

// Apply for leave (Employee)
exports.applyLeave = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    const employeeId = req.user.employeeId;

    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID not found' });
    }

    // Validate dates
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (days <= 0) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    await connection.beginTransaction();

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const [balance] = await connection.query(
      'SELECT * FROM leave_balance WHERE employee_id = ? AND year = ?',
      [employeeId, currentYear]
    );

    if (balance.length === 0) {
      // Create leave balance if not exists
      await connection.query(
        'INSERT INTO leave_balance (employee_id, year) VALUES (?, ?)',
        [employeeId, currentYear]
      );
      
      // Fetch again
      const [newBalance] = await connection.query(
        'SELECT * FROM leave_balance WHERE employee_id = ? AND year = ?',
        [employeeId, currentYear]
      );
      balance[0] = newBalance[0];
    }

    const leaveColumn = `${leave_type}_leave`;
    const availableLeaves = balance[0][leaveColumn];

    if (availableLeaves < days) {
      return res.status(400).json({ 
        message: `Insufficient ${leave_type} leave balance. Available: ${availableLeaves} days` 
      });
    }

    // Create leave request
    await connection.query(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, leave_type, start_date, end_date, days, reason]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Get leave history (Employee)
exports.getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const [leaves] = await pool.query(
      `SELECT * FROM leaves 
       WHERE employee_id = ? 
       ORDER BY created_at DESC`,
      [employeeId]
    );

    // Get leave balance
    const currentYear = new Date().getFullYear();
    const [balance] = await pool.query(
      'SELECT * FROM leave_balance WHERE employee_id = ? AND year = ?',
      [employeeId, currentYear]
    );

    res.json({
      success: true,
      leaves,
      balance: balance[0] || null
    });

  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all leave requests (Admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const [leaves] = await pool.query(`
      SELECT l.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_id,
             e.department
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.created_at DESC
    `);

    res.json({
      success: true,
      count: leaves.length,
      leaves
    });

  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/Reject leave (Admin)
exports.updateLeaveStatus = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await connection.beginTransaction();

    // Get leave details
    const [leaves] = await connection.query(
      'SELECT * FROM leaves WHERE id = ?',
      [id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const leave = leaves[0];

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave already processed' });
    }

    // Update leave status
    await connection.query(
      'UPDATE leaves SET status = ?, admin_remarks = ? WHERE id = ?',
      [status, admin_remarks, id]
    );

    // If approved, deduct from leave balance
    if (status === 'approved') {
      const currentYear = new Date().getFullYear();
      const leaveColumn = `${leave.leave_type}_leave`;
      
      await connection.query(
        `UPDATE leave_balance 
         SET ${leaveColumn} = ${leaveColumn} - ?
         WHERE employee_id = ? AND year = ?`,
        [leave.days, leave.employee_id, currentYear]
      );
    }

    // Create notification for employee
    const [employee] = await connection.query(
      'SELECT user_id FROM employees WHERE id = ?',
      [leave.employee_id]
    );

    if (employee.length > 0) {
      await connection.query(
        `INSERT INTO notifications (user_id, title, message)
         VALUES (?, ?, ?)`,
        [
          employee[0].user_id,
          `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          `Your leave request from ${leave.start_date} to ${leave.end_date} has been ${status}`
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Leave ${status} successfully`
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// Get leave balance (Employee)
exports.getLeaveBalance = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const currentYear = new Date().getFullYear();

    const [balance] = await pool.query(
      'SELECT * FROM leave_balance WHERE employee_id = ? AND year = ?',
      [employeeId, currentYear]
    );

    res.json({
      success: true,
      balance: balance[0] || {
        sick_leave: 12,
        casual_leave: 10,
        paid_leave: 15
      }
    });

  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
