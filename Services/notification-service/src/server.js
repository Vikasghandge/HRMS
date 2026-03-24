const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectRabbitMQ, getChannel } = require('./config/rabbitmq');
const { testConnection } = require('./config/database');
const { consumeNotifications } = require('./consumers/notificationConsumer');
const { scheduleBirthdayWishes, scheduleDailySummary } = require('./services/cronService');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Notification Service',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Connect to RabbitMQ
    const channel = await connectRabbitMQ();
    
    if (channel) {
      // Start consuming notifications
      await consumeNotifications(channel);
    }
    
    // Schedule cron jobs
    scheduleBirthdayWishes();
    scheduleDailySummary();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Notification Service running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start notification service:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
