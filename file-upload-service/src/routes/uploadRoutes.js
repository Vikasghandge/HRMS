const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const uploadController = require('../controllers/uploadController');

// Upload single file
router.post('/upload', upload.single('file'), uploadController.uploadFile);

// Upload multiple files (max 10)
router.post('/upload-multiple', upload.array('files', 10), uploadController.uploadMultiple);

// Upload profile photo
router.post('/upload-profile-photo', upload.single('photo'), uploadController.uploadProfilePhoto);

// Download file
router.get('/download/:filename', uploadController.downloadFile);

// Get file info
router.get('/info/:filename', uploadController.getFileInfo);

// Delete file
router.delete('/delete/:filename', uploadController.deleteFile);

module.exports = router;
