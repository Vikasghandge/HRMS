const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin only routes
router.get('/', verifyToken, isAdmin, employeeController.getAllEmployees);
router.get('/statistics', verifyToken, isAdmin, employeeController.getStatistics);
router.get('/:id', verifyToken, isAdmin, employeeController.getEmployeeById);
router.post('/', verifyToken, isAdmin, employeeController.createEmployee);
router.put('/:id', verifyToken, isAdmin, employeeController.updateEmployee);
router.delete('/:id', verifyToken, isAdmin, employeeController.deleteEmployee);

module.exports = router;
