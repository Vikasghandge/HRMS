const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

// Generate QR codes
router.post('/generate', qrController.generateQR);
router.post('/generate-id-card', qrController.generateIDCardQR);
router.post('/generate-attendance', qrController.generateAttendanceQR);

// Verify QR code
router.post('/verify', qrController.verifyQR);

// Check-in via QR
router.post('/checkin', qrController.checkInViaQR);

// Get employee QR codes
router.get('/employee/:employee_id', qrController.getEmployeeQRCodes);

module.exports = router;
