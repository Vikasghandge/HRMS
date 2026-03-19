const { pool } = require('../config/database');

// Check in (Employee)
exports.checkIn = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toTimeString().split(' ')[0];

    // Check if already checked in today
    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Insert check-in record
    await pool.query(
      'INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, ?)',
      [employeeId, today, checkInTime, 'present']
    );

    res.json({
      success: true,
      message: 'Checked in successfully',
      checkInTime
    });

  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check out (Employee)
exports.checkOut = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toTimeString().split(' ')[0];

    // Get today's attendance record
    const [attendance] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (attendance.length === 0) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance[0].check_out) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    // Calculate working hours
    const checkIn = new Date(`${today} ${attendance[0].check_in}`);
    const checkOut = new Date(`${today} ${checkOutTime}`);
    const workingHours = (checkOut - checkIn) / (1000 * 60 * 60);

    // Update check-out time
    await pool.query(
      'UPDATE attendance SET check_out = ?, working_hours = ? WHERE id = ?',
      [checkOutTime, workingHours.toFixed(2), attendance[0].id]
    );

    res.json({
      success: true,
      message: 'Checked out successfully',
      checkOutTime,
      workingHours: workingHours.toFixed(2)
    });

  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my attendance (Employee)
exports.getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { month, year } = req.query;

    let query = 'SELECT * FROM attendance WHERE employee_id = ?';
    const params = [employeeId];

    if (month && year) {
      query += ' AND MONTH(date) = ? AND YEAR(date) = ?';
      params.push(month, year);
    }

    query += ' ORDER BY date DESC';

    const [attendance] = await pool.query(query, params);

    // Calculate statistics
    const totalPresent = attendance.filter(a => a.status === 'present').length;
    const totalWorkingHours = attendance.reduce((sum, a) => sum + (parseFloat(a.working_hours) || 0), 0);

    res.json({
      success: true,
      attendance,
      statistics: {
        totalPresent,
        totalWorkingHours: totalWorkingHours.toFixed(2),
        averageHours: totalPresent > 0 ? (totalWorkingHours / totalPresent).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all attendance (Admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const today = date || new Date().toISOString().split('T')[0];

    const [attendance] = await pool.query(`
      SELECT a.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_id,
             e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.date = ?
      ORDER BY a.check_in ASC
    `, [today]);

    res.json({
      success: true,
      date: today,
      count: attendance.length,
      attendance
    });

  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance status for today (Employee)
exports.getTodayStatus = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().split('T')[0];

    const [attendance] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    res.json({
      success: true,
      attendance: attendance[0] || null,
      isCheckedIn: attendance.length > 0,
      isCheckedOut: attendance.length > 0 && attendance[0].check_out !== null
    });

  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
