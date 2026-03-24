const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'File Upload Service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/files', uploadRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ message: err.message || 'Server error' });
});

// Start server
const startServer = async () => {
  try {
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 File Upload Service running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start file upload service:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
