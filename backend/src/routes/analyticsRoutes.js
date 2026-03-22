const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

// Get comprehensive analytics
router.get('/', analyticsController.getAnalytics);

// Get headcount trend
router.get('/headcount-trend', analyticsController.getHeadcountTrend);

module.exports = router;
