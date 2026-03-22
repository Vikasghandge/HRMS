const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get my profile
router.get('/my-profile', profileController.getMyProfile);

// Update basic profile
router.put('/update', profileController.updateProfile);

// Experience routes
router.post('/experience', profileController.addExperience);
router.delete('/experience/:id', profileController.deleteExperience);

// Education routes
router.post('/education', profileController.addEducation);
router.delete('/education/:id', profileController.deleteEducation);

// Skills routes
router.post('/skills', profileController.addSkill);
router.delete('/skills/:id', profileController.deleteSkill);

// Documents routes
router.post('/documents', profileController.addDocument);
router.delete('/documents/:id', profileController.deleteDocument);

module.exports = router;
