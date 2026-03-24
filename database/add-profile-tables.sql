-- Add columns to employees table for additional profile info
ALTER TABLE employees 
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender ENUM('male', 'female', 'other'),
ADD COLUMN blood_group VARCHAR(10),
ADD COLUMN emergency_contact_name VARCHAR(100),
ADD COLUMN emergency_contact_phone VARCHAR(20),
ADD COLUMN emergency_contact_relation VARCHAR(50),
ADD COLUMN current_address TEXT,
ADD COLUMN permanent_address TEXT,
ADD COLUMN city VARCHAR(50),
ADD COLUMN state VARCHAR(50),
ADD COLUMN country VARCHAR(50) DEFAULT 'India',
ADD COLUMN postal_code VARCHAR(10),
ADD COLUMN nationality VARCHAR(50) DEFAULT 'Indian',
ADD COLUMN marital_status ENUM('single', 'married', 'divorced', 'widowed'),
ADD COLUMN profile_photo VARCHAR(255);

-- Create employee_documents table
CREATE TABLE IF NOT EXISTS employee_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  document_type ENUM('resume', 'aadhar', 'pan', 'passport', 'driving_license', 'degree', 'certificate', 'other') NOT NULL,
  document_name VARCHAR(200) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create employee_experience table
CREATE TABLE IF NOT EXISTS employee_experience (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create employee_education table
CREATE TABLE IF NOT EXISTS employee_education (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  degree VARCHAR(100) NOT NULL,
  institution VARCHAR(200) NOT NULL,
  field_of_study VARCHAR(100),
  start_year YEAR,
  end_year YEAR,
  grade VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create employee_skills table
CREATE TABLE IF NOT EXISTS employee_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  proficiency ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
