const express = require('express');
const { 
  createDepartment, 
  getDepartments, 
  getDepartmentById, 
  updateDepartment, 
  deleteDepartment,
  addDoctorToDepartment,
  addNurseToDepartment
} = require('../controllers/department.controller');
const { protect, admin, staff } = require('../middleware/auth');

const router = express.Router();

// Get all departments
router.get('/', getDepartments);

// Get department by ID
router.get('/:id', getDepartmentById);

// Admin routes
router.post('/', protect, admin, createDepartment);
router.put('/:id', protect, admin, updateDepartment);
router.delete('/:id', protect, admin, deleteDepartment);

// Add staff to department
router.put('/:id/doctors', protect, admin, addDoctorToDepartment);
router.put('/:id/nurses', protect, admin, addNurseToDepartment);

module.exports = router;
