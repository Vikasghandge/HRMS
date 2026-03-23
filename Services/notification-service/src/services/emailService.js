const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return { success: false, error: error.message };
  }
};

// Email Templates
const templates = {
  leaveApplied: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">🔔 New Leave Request</h2>
      <p>Dear Admin,</p>
      <p><strong>${data.employeeName}</strong> has applied for leave.</p>
      <div style="background: #f5f6fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Leave Type:</strong> ${data.leaveType}</p>
        <p><strong>Duration:</strong> ${data.startDate} to ${data.endDate}</p>
        <p><strong>Days:</strong> ${data.days}</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
      </div>
      <p>Please review and take action.</p>
      <a href="${data.dashboardUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        View Dashboard
      </a>
    </div>
  `,

  leaveApproved: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #43e97b;">✅ Leave Approved</h2>
      <p>Dear ${data.employeeName},</p>
      <p>Your leave request has been <strong style="color: #43e97b;">APPROVED</strong>!</p>
      <div style="background: #f5f6fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Leave Type:</strong> ${data.leaveType}</p>
        <p><strong>Duration:</strong> ${data.startDate} to ${data.endDate}</p>
        <p><strong>Days:</strong> ${data.days}</p>
        ${data.remarks ? `<p><strong>Remarks:</strong> ${data.remarks}</p>` : ''}
      </div>
      <p>Enjoy your time off!</p>
    </div>
  `,

  leaveRejected: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff4757;">❌ Leave Rejected</h2>
      <p>Dear ${data.employeeName},</p>
      <p>Unfortunately, your leave request has been <strong style="color: #ff4757;">REJECTED</strong>.</p>
      <div style="background: #f5f6fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Leave Type:</strong> ${data.leaveType}</p>
        <p><strong>Duration:</strong> ${data.startDate} to ${data.endDate}</p>
        ${data.remarks ? `<p><strong>Reason:</strong> ${data.remarks}</p>` : ''}
      </div>
      <p>Please contact your manager for more details.</p>
    </div>
  `,

  employeeWelcome: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">🎉 Welcome to the Team!</h2>
      <p>Dear ${data.employeeName},</p>
      <p>Welcome to <strong>HRMS Company</strong>! We're excited to have you on board.</p>
      <div style="background: #f5f6fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Employee ID:</strong> ${data.employeeId}</p>
        <p><strong>Department:</strong> ${data.department}</p>
        <p><strong>Designation:</strong> ${data.designation}</p>
        <p><strong>Joining Date:</strong> ${data.joiningDate}</p>
      </div>
      <p>Your login credentials:</p>
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
      </div>
      <p style="color: #856404;">⚠️ Please change your password after first login.</p>
      <a href="${data.loginUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Login Now
      </a>
    </div>
  `,

  birthdayWish: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h1 style="color: #f093fb; font-size: 48px;">🎂</h1>
      <h2 style="color: #667eea;">Happy Birthday, ${data.employeeName}! 🎉</h2>
      <p style="font-size: 18px;">Wishing you a wonderful birthday filled with joy and success!</p>
      <p>From all of us at <strong>HRMS Company</strong></p>
      <div style="margin: 30px 0;">
        <img src="https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif" alt="Birthday" style="max-width: 300px; border-radius: 8px;">
      </div>
    </div>
  `,

  lateArrival: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff4757;">⏰ Late Arrival Alert</h2>
      <p>Dear Admin,</p>
      <p><strong>${data.employeeName}</strong> arrived late today.</p>
      <div style="background: #f5f6fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Employee ID:</strong> ${data.employeeId}</p>
        <p><strong>Department:</strong> ${data.department}</p>
        <p><strong>Check-in Time:</strong> ${data.checkInTime}</p>
        <p><strong>Expected Time:</strong> ${data.expectedTime}</p>
        <p><strong>Late by:</strong> ${data.lateBy} minutes</p>
      </div>
    </div>
  `,

  dailySummary: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">📊 Daily Summary Report</h2>
      <p>Dear Admin,</p>
      <p>Here's today's summary:</p>
      <div style="background: #f5f6fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Attendance</h3>
        <p><strong>Present:</strong> ${data.presentCount} employees</p>
        <p><strong>Absent:</strong> ${data.absentCount} employees</p>
        <p><strong>Late Arrivals:</strong> ${data.lateCount} employees</p>
        <p><strong>Average Working Hours:</strong> ${data.avgHours} hours</p>
        
        <h3 style="margin-top: 20px;">Leave Requests</h3>
        <p><strong>Pending:</strong> ${data.pendingLeaves}</p>
        <p><strong>Approved Today:</strong> ${data.approvedToday}</p>
      </div>
      <p>Date: ${data.date}</p>
    </div>
  `
};

module.exports = { sendEmail, templates };
