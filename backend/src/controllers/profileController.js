const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

// Get employee profile
exports.getMyProfile = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    // Get employee details
    const [employee] = await pool.query(`
      SELECT e.*, u.email, u.role
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `, [employeeId]);

    if (employee.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get documents
    const [documents] = await pool.query(
      'SELECT * FROM employee_documents WHERE employee_id = ? ORDER BY uploaded_at DESC',
      [employeeId]
    );

    // Get experience
    const [experience] = await pool.query(
      'SELECT * FROM employee_experience WHERE employee_id = ? ORDER BY is_current DESC, start_date DESC',
      [employeeId]
    );

    // Get education
    const [education] = await pool.query(
      'SELECT * FROM employee_education WHERE employee_id = ? ORDER BY end_year DESC',
      [employeeId]
    );

    // Get skills
    const [skills] = await pool.query(
      'SELECT * FROM employee_skills WHERE employee_id = ?',
      [employeeId]
    );

    res.json({
      success: true,
      profile: {
        ...employee[0],
        documents,
        experience,
        education,
        skills
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update basic profile info
exports.updateProfile = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const {
      date_of_birth,
      gender,
      blood_group,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      current_address,
      permanent_address,
      city,
      state,
      country,
      postal_code,
      nationality,
      marital_status
    } = req.body;

    await pool.query(`
      UPDATE employees SET
        date_of_birth = ?,
        gender = ?,
        blood_group = ?,
        phone = ?,
        emergency_contact_name = ?,
        emergency_contact_phone = ?,
        emergency_contact_relation = ?,
        current_address = ?,
        permanent_address = ?,
        city = ?,
        state = ?,
        country = ?,
        postal_code = ?,
        nationality = ?,
        marital_status = ?
      WHERE id = ?
    `, [
      date_of_birth, gender, blood_group, phone,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
      current_address, permanent_address, city, state, country, postal_code,
      nationality, marital_status, employeeId
    ]);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add experience
exports.addExperience = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { company_name, job_title, start_date, end_date, is_current, description, location } = req.body;

    const [result] = await pool.query(`
      INSERT INTO employee_experience 
      (employee_id, company_name, job_title, start_date, end_date, is_current, description, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, company_name, job_title, start_date, end_date, is_current, description, location]);

    res.json({
      success: true,
      message: 'Experience added successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employeeId;

    await pool.query(
      'DELETE FROM employee_experience WHERE id = ? AND employee_id = ?',
      [id, employeeId]
    );

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });

  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add education
exports.addEducation = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { degree, institution, field_of_study, start_year, end_year, grade } = req.body;

    const [result] = await pool.query(`
      INSERT INTO employee_education 
      (employee_id, degree, institution, field_of_study, start_year, end_year, grade)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [employeeId, degree, institution, field_of_study, start_year, end_year, grade]);

    res.json({
      success: true,
      message: 'Education added successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete education
exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employeeId;

    await pool.query(
      'DELETE FROM employee_education WHERE id = ? AND employee_id = ?',
      [id, employeeId]
    );

    res.json({
      success: true,
      message: 'Education deleted successfully'
    });

  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add skill
exports.addSkill = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { skill_name, proficiency } = req.body;

    const [result] = await pool.query(`
      INSERT INTO employee_skills (employee_id, skill_name, proficiency)
      VALUES (?, ?, ?)
    `, [employeeId, skill_name, proficiency]);

    res.json({
      success: true,
      message: 'Skill added successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employeeId;

    await pool.query(
      'DELETE FROM employee_skills WHERE id = ? AND employee_id = ?',
      [id, employeeId]
    );

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });

  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add document (simplified - no actual file upload for now)
exports.addDocument = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { document_type, document_name, file_path } = req.body;

    const [result] = await pool.query(`
      INSERT INTO employee_documents (employee_id, document_type, document_name, file_path)
      VALUES (?, ?, ?, ?)
    `, [employeeId, document_type, document_name, file_path || 'placeholder.pdf']);

    res.json({
      success: true,
      message: 'Document added successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employeeId;

    await pool.query(
      'DELETE FROM employee_documents WHERE id = ? AND employee_id = ?',
      [id, employeeId]
    );

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
