const { pool } = require('../config/database');

// Get comprehensive analytics for admin dashboard
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    // 1. Employee Statistics
    const [totalEmployees] = await pool.query(
      'SELECT COUNT(*) as total FROM employees'
    );

    const [activeEmployees] = await pool.query(
      'SELECT COUNT(*) as active FROM employees e JOIN users u ON e.user_id = u.id WHERE u.is_active = 1'
    );

    const [departmentCount] = await pool.query(
      'SELECT COUNT(DISTINCT department) as total FROM employees WHERE department IS NOT NULL'
    );

    // 2. Department-wise employee distribution
    const [departmentDistribution] = await pool.query(`
      SELECT department, COUNT(*) as count
      FROM employees
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY count DESC
    `);

    // 3. Attendance Analytics
    const [attendanceStats] = await pool.query(`
      SELECT 
        DATE(date) as date,
        COUNT(*) as total_present,
        AVG(working_hours) as avg_hours
      FROM attendance
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(date)
      ORDER BY date ASC
    `);

    const [todayAttendance] = await pool.query(`
      SELECT 
        COUNT(*) as present_today,
        AVG(working_hours) as avg_hours_today
      FROM attendance
      WHERE date = CURDATE()
    `);

    // 4. Leave Analytics
    const [leaveStats] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM leaves
      WHERE YEAR(created_at) = YEAR(CURDATE())
      GROUP BY status
    `);

    const [leaveTypeStats] = await pool.query(`
      SELECT 
        leave_type,
        COUNT(*) as count,
        SUM(days) as total_days
      FROM leaves
      WHERE status = 'approved' AND YEAR(start_date) = YEAR(CURDATE())
      GROUP BY leave_type
    `);

    const [monthlyLeaves] = await pool.query(`
      SELECT 
        MONTH(start_date) as month,
        COUNT(*) as count
      FROM leaves
      WHERE YEAR(start_date) = YEAR(CURDATE())
      GROUP BY MONTH(start_date)
      ORDER BY month
    `);

    // 5. Department-wise attendance rate
    const [departmentAttendance] = await pool.query(`
      SELECT 
        e.department,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(DISTINCT CASE WHEN a.date = CURDATE() THEN a.employee_id END) as present_today,
        ROUND(COUNT(DISTINCT CASE WHEN a.date = CURDATE() THEN a.employee_id END) * 100.0 / COUNT(DISTINCT e.id), 2) as attendance_rate
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id
      WHERE e.department IS NOT NULL
      GROUP BY e.department
    `);

    // 6. Recent joinings
    const [recentJoinings] = await pool.query(`
      SELECT 
        MONTH(joining_date) as month,
        COUNT(*) as count
      FROM employees
      WHERE YEAR(joining_date) = YEAR(CURDATE())
      GROUP BY MONTH(joining_date)
      ORDER BY month
    `);

    // 7. Top performers by working hours
    const [topPerformers] = await pool.query(`
      SELECT 
        CONCAT(e.first_name, ' ', e.last_name) as name,
        e.department,
        AVG(a.working_hours) as avg_hours,
        COUNT(a.id) as days_present
      FROM employees e
      JOIN attendance a ON e.id = a.employee_id
      WHERE a.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY e.id, e.first_name, e.last_name, e.department
      HAVING days_present >= 15
      ORDER BY avg_hours DESC
      LIMIT 5
    `);

    // 8. Gender distribution
    const [genderDistribution] = await pool.query(`
      SELECT 
        COALESCE(gender, 'Not Specified') as gender,
        COUNT(*) as count
      FROM employees
      GROUP BY gender
    `);

    // 9. Salary statistics by department
    const [salaryStats] = await pool.query(`
      SELECT 
        department,
        COUNT(*) as employee_count,
        AVG(salary) as avg_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary
      FROM employees
      WHERE department IS NOT NULL AND salary IS NOT NULL
      GROUP BY department
    `);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalEmployees: totalEmployees[0].total,
          activeEmployees: activeEmployees[0].active,
          totalDepartments: departmentCount[0].total,
          presentToday: todayAttendance[0]?.present_today || 0,
          avgHoursToday: parseFloat(todayAttendance[0]?.avg_hours_today || 0).toFixed(2)
        },
        departmentDistribution,
        attendanceStats,
        leaveStats,
        leaveTypeStats,
        monthlyLeaves,
        departmentAttendance,
        recentJoinings,
        topPerformers,
        genderDistribution,
        salaryStats
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get headcount trend
exports.getHeadcountTrend = async (req, res) => {
  try {
    const [headcountTrend] = await pool.query(`
      SELECT 
        DATE_FORMAT(joining_date, '%Y-%m') as month,
        COUNT(*) as new_joinings
      FROM employees
      WHERE joining_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(joining_date, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: headcountTrend
    });

  } catch (error) {
    console.error('Headcount trend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
