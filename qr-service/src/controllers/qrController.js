const qrService = require('../services/qrService');
const { pool } = require('../config/database');

// Generate QR code (Generic)
exports.generateQR = async (req, res) => {
  try {
    const { employee_id, type, data } = req.body;

    if (!employee_id || !type) {
      return res.status(400).json({
        success: false,
        message: 'employee_id and type are required'
      });
    }

    const qrCode = await qrService.generateQRCode({
      employee_id,
      type,
      ...data
    });

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      qrCode: qrCode.qrCodeDataURL,
      code: qrCode.code,
      data: qrCode.qrData
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
};

// Generate Employee ID Card QR
exports.generateIDCardQR = async (req, res) => {
  try {
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: 'employee_id is required'
      });
    }

    const qrCode = await qrService.generateEmployeeIDCard(employee_id);

    res.status(201).json({
      success: true,
      message: 'ID Card QR generated successfully',
      qrCode: qrCode.qrCodeDataURL,
      code: qrCode.code
    });
  } catch (error) {
    console.error('Generate ID Card QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate ID card QR'
    });
  }
};

// Generate Attendance QR
exports.generateAttendanceQR = async (req, res) => {
  try {
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: 'employee_id is required'
      });
    }

    const qrCode = await qrService.generateAttendanceQR(employee_id);

    res.status(201).json({
      success: true,
      message: 'Attendance QR generated successfully',
      qrCode: qrCode.qrCodeDataURL,
      code: qrCode.code
    });
  } catch (error) {
    console.error('Generate Attendance QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate attendance QR'
    });
  }
};

// Verify QR Code
exports.verifyQR = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'code is required'
      });
    }

    const verification = await qrService.verifyQRCode(code);

    if (!verification.valid) {
      return res.status(404).json({
        success: false,
        message: verification.message || 'Invalid QR code'
      });
    }

    res.json({
      success: true,
      message: 'QR code verified successfully',
      ...verification
    });
  } catch (error) {
    console.error('Verify QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify QR code'
    });
  }
};

// Check-in via QR Code
exports.checkInViaQR = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'code is required'
      });
    }

    // Verify QR code
    const verification = await qrService.verifyQRCode(code);

    if (!verification.valid) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND DATE(date) = ?',
      [verification.employee.id, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    // Mark attendance
    await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, status)
       VALUES (?, CURDATE(), NOW(), 'present')`,
      [verification.employee.id]
    );

    res.json({
      success: true,
      message: `Check-in successful! Welcome, ${verification.employee.name}`,
      employee: {
        name: verification.employee.name,
        employee_id: verification.employee.employee_id,
        department: verification.employee.department
      },
      checkInTime: new Date().toLocaleTimeString()
    });
  } catch (error) {
    console.error('Check-in via QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in'
    });
  }
};

// Get employee's QR codes
exports.getEmployeeQRCodes = async (req, res) => {
  try {
    const { employee_id } = req.params;

    const [qrCodes] = await pool.query(
      `SELECT * FROM qr_codes 
       WHERE employee_id = ?
       ORDER BY created_at DESC`,
      [employee_id]
    );

    res.json({
      success: true,
      count: qrCodes.length,
      qrCodes
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get QR codes'
    });
  }
};
