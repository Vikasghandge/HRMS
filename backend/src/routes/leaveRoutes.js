const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Employee routes
router.post('/apply', verifyToken, leaveController.applyLeave);
router.get('/my-leaves', verifyToken, leaveController.getMyLeaves);
router.get('/balance', verifyToken, leaveController.getLeaveBalance);

// Admin routes
router.get('/', verifyToken, isAdmin, leaveController.getAllLeaves);
router.put('/:id/status', verifyToken, isAdmin, leaveController.updateLeaveStatus);

module.exports = router;
