const cron = require('node-cron');
const { pool } = require('../config/database');
const { sendEmail, templates } = require('./emailService');

// Check for birthdays every day at 9 AM
const scheduleBirthdayWishes = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🎂 Running birthday check...');
    
    try {
      const [employees] = await pool.query(`
        SELECT e.*, u.email 
        FROM employees e
        JOIN users u ON e.user_id = u.id
        WHERE DAY(e.date_of_birth) = DAY(CURDATE()) 
        AND MONTH(e.date_of_birth) = MONTH(CURDATE())
        AND u.is_active = 1
      `);
      
      for (const emp of employees) {
        await sendEmail({
          to: emp.email,
          subject: '🎂 Happy Birthday!',
          html: templates.birthdayWish({
            employeeName: `${emp.first_name} ${emp.last_name}`
          })
        });
        console.log(`✅ Birthday wish sent to ${emp.first_name}`);
      }
    } catch (error) {
      console.error('❌ Birthday check failed:', error);
    }
  });
  
  console.log('✅ Birthday wishes cron scheduled (9 AM daily)');
};

// Send daily summary every day at 6 PM
const scheduleDailySummary = () => {
  cron.schedule('0 18 * * *', async () => {
    console.log('📊 Generating daily summary...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get attendance stats
      const [attendance] = await pool.query(`
        SELECT 
          COUNT(*) as presentCount,
          AVG(working_hours) as avgHours
        FROM attendance
        WHERE date = ?
      `, [today]);
      
      // Get total employees
      const [total] = await pool.query('SELECT COUNT(*) as total FROM employees');
      
      // Get late arrivals (after 9:30 AM)
      const [late] = await pool.query(`
        SELECT COUNT(*) as lateCount
        FROM attendance
        WHERE date = ? AND TIME(check_in) > '09:30:00'
      `, [today]);
      
      // Get leave stats
      const [leaves] = await pool.query(`
        SELECT 
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingLeaves,
          COUNT(CASE WHEN status = 'approved' AND DATE(created_at) = ? THEN 1 END) as approvedToday
        FROM leaves
      `, [today]);
      
      const summaryData = {
        presentCount: attendance[0].presentCount,
        absentCount: total[0].total - attendance[0].presentCount,
        lateCount: late[0].lateCount,
        avgHours: parseFloat(attendance[0].avgHours || 0).toFixed(2),
        pendingLeaves: leaves[0].pendingLeaves,
        approvedToday: leaves[0].approvedToday,
        date: new Date().toLocaleDateString()
      };
      
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `📊 Daily Summary Report - ${summaryData.date}`,
        html: templates.dailySummary(summaryData)
      });
      
      console.log('✅ Daily summary sent');
    } catch (error) {
      console.error('❌ Daily summary failed:', error);
    }
  });
  
  console.log('✅ Daily summary cron scheduled (6 PM daily)');
};

module.exports = { scheduleBirthdayWishes, scheduleDailySummary };
