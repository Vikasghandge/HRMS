const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

// Generate unique QR code
const generateQRCode = async (data) => {
  try {
    const code = uuidv4(); // Unique identifier
    const qrData = JSON.stringify({ code, ...data });
    
    // Generate QR code as Data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: process.env.QR_ERROR_CORRECTION || 'M',
      width: parseInt(process.env.QR_CODE_SIZE) || 300,
      margin: 2
    });

    // Save to database
    await pool.query(
      `INSERT INTO qr_codes (code, employee_id, type, data, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [code, data.employee_id, data.type, JSON.stringify(data)]
    );

    console.log(`✅ QR Code generated: ${code}`);

    return {
      code,
      qrCodeDataURL,
      qrData: data
    };
  } catch (error) {
    console.error('QR generation error:', error);
    throw error;
  }
};

// Verify QR code
const verifyQRCode = async (code) => {
  try {
    const [results] = await pool.query(
      'SELECT * FROM qr_codes WHERE code = ?',
      [code]
    );

    if (results.length === 0) {
      return { valid: false, message: 'Invalid QR code' };
    }

    const qrRecord = results[0];
    const data = JSON.parse(qrRecord.data);

    // Get employee details
    const [employee] = await pool.query(
      `SELECT e.*, CONCAT(e.first_name, ' ', e.last_name) as name, u.email
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE e.employee_id = ?`,
      [qrRecord.employee_id]
    );

    if (employee.length === 0) {
      return { valid: false, message: 'Employee not found' };
    }

    return {
      valid: true,
      qrCode: qrRecord.code,
      type: qrRecord.type,
      employee: employee[0],
      data: data,
      createdAt: qrRecord.created_at
    };
  } catch (error) {
    console.error('QR verification error:', error);
    throw error;
  }
};

// Generate QR for employee ID card
const generateEmployeeIDCard = async (employee_id) => {
  return await generateQRCode({
    employee_id,
    type: 'id_card',
    purpose: 'Employee Identification'
  });
};

// Generate QR for attendance check-in
const generateAttendanceQR = async (employee_id) => {
  return await generateQRCode({
    employee_id,
    type: 'attendance',
    purpose: 'Attendance Check-in'
  });
};

// Generate QR for document verification
const generateDocumentQR = async (employee_id, document_id) => {
  return await generateQRCode({
    employee_id,
    document_id,
    type: 'document',
    purpose: 'Document Verification'
  });
};

module.exports = {
  generateQRCode,
  verifyQRCode,
  generateEmployeeIDCard,
  generateAttendanceQR,
  generateDocumentQR
};
