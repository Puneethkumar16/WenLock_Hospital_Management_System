const express = require('express');
const { 
  createPatient, 
  getPatients, 
  getPatientById, 
  updatePatient, 
  deletePatient,
  getPatientByUserId
} = require('../controllers/patient.controller');
const { protect, admin, staff } = require('../middleware/auth');

const router = express.Router();

// Staff routes
router.post('/', protect, staff, createPatient);
router.get('/', protect, staff, getPatients);
router.get('/:id', protect, staff, getPatientById);
router.put('/:id', protect, staff, updatePatient);
router.get('/user/:userId', protect, getPatientByUserId);

// Admin routes
router.delete('/:id', protect, admin, deletePatient);

module.exports = router;
