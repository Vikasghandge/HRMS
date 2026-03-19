const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Employee routes
router.post('/checkin', verifyToken, attendanceController.checkIn);
router.post('/checkout', verifyToken, attendanceController.checkOut);
router.get('/my-attendance', verifyToken, attendanceController.getMyAttendance);
router.get('/today-status', verifyToken, attendanceController.getTodayStatus);

// Admin routes
router.get('/', verifyToken, isAdmin, attendanceController.getAllAttendance);

module.exports = router;
