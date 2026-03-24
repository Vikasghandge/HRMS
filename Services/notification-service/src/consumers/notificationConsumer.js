const { sendEmail, templates } = require('../services/emailService');

// Process notification messages from queue
const consumeNotifications = async (channel) => {
  const queueName = process.env.QUEUE_NAME || 'notifications';
  
  console.log(`🔄 Waiting for messages in ${queueName}...`);
  
  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      try {
        const notification = JSON.parse(msg.content.toString());
        console.log('📬 Received notification:', notification.type);
        
        // Route to appropriate handler
        await handleNotification(notification);
        
        // Acknowledge message
        channel.ack(msg);
        console.log('✅ Notification processed successfully');
      } catch (error) {
        console.error('❌ Error processing notification:', error);
        // Reject and requeue if processing fails
        channel.nack(msg, false, true);
      }
    }
  });
};

// Handle different notification types
const handleNotification = async (notification) => {
  const { type, data } = notification;
  
  switch (type) {
    case 'LEAVE_APPLIED':
      await handleLeaveApplied(data);
      break;
      
    case 'LEAVE_APPROVED':
      await handleLeaveApproved(data);
      break;
      
    case 'LEAVE_REJECTED':
      await handleLeaveRejected(data);
      break;
      
    case 'EMPLOYEE_WELCOME':
      await handleEmployeeWelcome(data);
      break;
      
    case 'BIRTHDAY_WISH':
      await handleBirthdayWish(data);
      break;
      
    case 'LATE_ARRIVAL':
      await handleLateArrival(data);
      break;
      
    case 'DAILY_SUMMARY':
      await handleDailySummary(data);
      break;
      
    default:
      console.log('⚠️ Unknown notification type:', type);
  }
};

// Notification Handlers
const handleLeaveApplied = async (data) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New Leave Request from ${data.employeeName}`,
    html: templates.leaveApplied(data)
  });
};

const handleLeaveApproved = async (data) => {
  await sendEmail({
    to: data.employeeEmail,
    subject: '✅ Your Leave Request has been Approved',
    html: templates.leaveApproved(data)
  });
};

const handleLeaveRejected = async (data) => {
  await sendEmail({
    to: data.employeeEmail,
    subject: '❌ Your Leave Request has been Rejected',
    html: templates.leaveRejected(data)
  });
};

const handleEmployeeWelcome = async (data) => {
  await sendEmail({
    to: data.email,
    subject: '🎉 Welcome to HRMS Company!',
    html: templates.employeeWelcome(data)
  });
};

const handleBirthdayWish = async (data) => {
  await sendEmail({
    to: data.employeeEmail,
    subject: '🎂 Happy Birthday!',
    html: templates.birthdayWish(data)
  });
};

const handleLateArrival = async (data) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `⏰ Late Arrival Alert - ${data.employeeName}`,
    html: templates.lateArrival(data)
  });
};

const handleDailySummary = async (data) => {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `📊 Daily Summary Report - ${data.date}`,
    html: templates.dailySummary(data)
  });
};

module.exports = { consumeNotifications };
