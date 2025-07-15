const express = require('express');
const { 
  generateToken, 
  getAllTokens, 
  getDepartmentTokens, 
  getTokenById, 
  updateTokenStatus,
  getPatientTokens,
  getCurrentDepartmentToken
} = require('../controllers/token.controller');
const { protect, staff } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/department/:departmentId', getDepartmentTokens);
router.get('/department/:departmentId/current', getCurrentDepartmentToken);
router.get('/:id', getTokenById);

// Staff routes
router.post('/', protect, staff, generateToken);
router.get('/', protect, staff, getAllTokens);
router.put('/:id', protect, staff, updateTokenStatus);
router.get('/patient/:patientId', protect, getPatientTokens);

module.exports = router;
