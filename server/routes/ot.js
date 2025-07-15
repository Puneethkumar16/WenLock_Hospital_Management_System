const express = require('express');
const { 
  createOT, 
  getAllOTs, 
  getOTById, 
  updateOTStatus, 
  scheduleOT,
  cancelOTSchedule,
  startOTProcedure,
  endOTProcedure,
  setEmergency
} = require('../controllers/ot.controller');
const { protect, admin, doctor, staff } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllOTs);
router.get('/:id', getOTById);

// Staff routes
router.put('/:id/status', protect, staff, updateOTStatus);
router.put('/:id/emergency', protect, staff, setEmergency);

// Doctor routes
router.put('/:id/schedule', protect, doctor, scheduleOT);
router.put('/:id/cancel', protect, doctor, cancelOTSchedule);
router.put('/:id/start', protect, doctor, startOTProcedure);
router.put('/:id/end', protect, doctor, endOTProcedure);

// Admin routes
router.post('/', protect, admin, createOT);

module.exports = router;
