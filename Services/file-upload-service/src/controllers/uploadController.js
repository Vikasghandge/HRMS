const { pool } = require('../config/database');
const { processImage, createThumbnail } = require('../services/imageService');
const path = require('path');
const fs = require('fs').promises;

// Upload single file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { employee_id, document_type } = req.body;
    const file = req.file;
    
    // Process image if it's an image file
    if (file.mimetype.startsWith('image/')) {
      await processImage(file.path);
      await createThumbnail(file.path);
    }

    // Save file metadata to database
    const [result] = await pool.query(
      `INSERT INTO employee_documents 
       (employee_id, document_type, document_name, file_path, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [
        employee_id,
        document_type || 'other',
        file.originalname,
        file.filename,
        file.size
      ]
    );

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: result.insertId,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        url: `/api/files/download/${file.filename}`
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
};

// Upload multiple files
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { employee_id, document_type } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      // Process image if needed
      if (file.mimetype.startsWith('image/')) {
        await processImage(file.path);
        await createThumbnail(file.path);
      }

      // Save to database
      const [result] = await pool.query(
        `INSERT INTO employee_documents 
         (employee_id, document_type, document_name, file_path, file_size)
         VALUES (?, ?, ?, ?, ?)`,
        [
          employee_id,
          document_type || 'other',
          file.originalname,
          file.filename,
          file.size
        ]
      );

      uploadedFiles.push({
        id: result.insertId,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/api/files/download/${file.filename}`
      });
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.env.UPLOAD_DIR || '/app/uploads', filename);

    // Check if file exists
    await fs.access(filePath);

    res.download(filePath);

  } catch (error) {
    console.error('Download error:', error);
    res.status(404).json({ message: 'File not found' });
  }
};

// Get file info
exports.getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;

    const [files] = await pool.query(
      'SELECT * FROM employee_documents WHERE file_path = ?',
      [filename]
    );

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({
      success: true,
      file: files[0]
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;

    // Get file info from database
    const [files] = await pool.query(
      'SELECT * FROM employee_documents WHERE file_path = ?',
      [filename]
    );

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || '/app/uploads', filename);
    
    // Delete file from filesystem
    await fs.unlink(filePath);
    
    // Delete thumbnail if exists
    const ext = path.extname(filePath);
    const thumbPath = filePath.replace(ext, `_thumb${ext}`);
    try {
      await fs.unlink(thumbPath);
    } catch (err) {
      // Thumbnail might not exist
    }

    // Delete from database
    await pool.query('DELETE FROM employee_documents WHERE file_path = ?', [filename]);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'File deletion failed' });
  }
};

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { employee_id } = req.body;
    const file = req.file;

    // Process image
    await processImage(file.path);
    await createThumbnail(file.path);

    // Update employee profile photo
    await pool.query(
      'UPDATE employees SET profile_photo = ? WHERE id = ?',
      [file.filename, employee_id]
    );

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      photo: {
        filename: file.filename,
        url: `/api/files/download/${file.filename}`,
        thumbnail: `/api/files/download/${file.filename.replace(path.extname(file.filename), '_thumb' + path.extname(file.filename))}`
      }
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ message: 'Profile photo upload failed' });
  }
};
