const express = require('express');
const { 
  addDrug, 
  getAllDrugs, 
  getDrugById, 
  updateDrug, 
  deleteDrug,
  updateDrugStock,
  searchDrugs,
  getLowStockDrugs
} = require('../controllers/pharmacy.controller');
const { protect, admin, staff } = require('../middleware/auth');

const router = express.Router();

// Staff routes
router.post('/drugs', protect, staff, addDrug);
router.get('/drugs', protect, staff, getAllDrugs);
router.get('/drugs/:id', protect, staff, getDrugById);
router.put('/drugs/:id', protect, staff, updateDrug);
router.put('/drugs/:id/stock', protect, staff, updateDrugStock);
router.get('/drugs/search', protect, staff, searchDrugs);
router.get('/drugs/lowstock', protect, staff, getLowStockDrugs);

// Admin routes
router.delete('/drugs/:id', protect, admin, deleteDrug);

module.exports = router;
