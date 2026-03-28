CREATE TABLE IF NOT EXISTS qr_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  type ENUM('id_card', 'attendance', 'document', 'leave', 'other') NOT NULL,
  data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_code (code),
  INDEX idx_employee (employee_id),
  INDEX idx_type (type)
);
