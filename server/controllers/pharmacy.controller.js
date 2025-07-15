const Drug = require('../models/Drug');

// @desc    Add new drug
// @route   POST /api/pharmacy/drugs
// @access  Private/Staff
exports.addDrug = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      description,
      manufacturer,
      currentStock,
      minimumStock,
      unit,
      unitPrice,
      expiryDate,
      location
    } = req.body;

    // Check if drug already exists
    const existingDrug = await Drug.findOne({ name });
    
    if (existingDrug) {
      return res.status(400).json({ message: 'Drug already exists in inventory' });
    }

    // Create new drug
    const drug = await Drug.create({
      name,
      genericName,
      category,
      description,
      manufacturer,
      currentStock,
      minimumStock,
      unit,
      unitPrice,
      expiryDate,
      location,
      isAvailable: currentStock > 0 
    });

    if (drug) {
      res.status(201).json(drug);
    } else {
      res.status(400).json({ message: 'Invalid drug data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all drugs
// @route   GET /api/pharmacy/drugs
// @access  Private/Staff
exports.getAllDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find({});
    res.json(drugs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get drug by ID
// @route   GET /api/pharmacy/drugs/:id
// @access  Private/Staff
exports.getDrugById = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    
    if (drug) {
      res.json(drug);
    } else {
      res.status(404).json({ message: 'Drug not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update drug
// @route   PUT /api/pharmacy/drugs/:id
// @access  Private/Staff
exports.updateDrug = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    
    if (!drug) {
      return res.status(404).json({ message: 'Drug not found' });
    }

    // Update fields
    const {
      name,
      genericName,
      category,
      description,
      manufacturer,
      currentStock,
      minimumStock,
      unit,
      unitPrice,
      expiryDate,
      location
    } = req.body;

    drug.name = name || drug.name;
    drug.genericName = genericName || drug.genericName;
    drug.category = category || drug.category;
    drug.description = description || drug.description;
    drug.manufacturer = manufacturer || drug.manufacturer;
    drug.currentStock = currentStock !== undefined ? currentStock : drug.currentStock;
    drug.minimumStock = minimumStock !== undefined ? minimumStock : drug.minimumStock;
    drug.unit = unit || drug.unit;
    drug.unitPrice = unitPrice !== undefined ? unitPrice : drug.unitPrice;
    drug.expiryDate = expiryDate || drug.expiryDate;
    drug.location = location || drug.location;
    
    // Update availability based on stock
    drug.isAvailable = drug.currentStock > 0;
    drug.lastUpdated = Date.now();

    const updatedDrug = await drug.save();
    res.json(updatedDrug);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete drug
// @route   DELETE /api/pharmacy/drugs/:id
// @access  Private/Admin
exports.deleteDrug = async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id);
    
    if (drug) {
      await drug.remove();
      res.json({ message: 'Drug removed from inventory' });
    } else {
      res.status(404).json({ message: 'Drug not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update drug stock
// @route   PUT /api/pharmacy/drugs/:id/stock
// @access  Private/Staff
exports.updateDrugStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const drug = await Drug.findById(req.params.id);
    
    if (!drug) {
      return res.status(404).json({ message: 'Drug not found' });
    }

    const previousStock = drug.currentStock;
    
    // Update stock based on operation
    if (operation === 'add') {
      drug.currentStock += Number(quantity);
    } else if (operation === 'subtract') {
      // Prevent negative stock
      if (drug.currentStock < Number(quantity)) {
        return res.status(400).json({ message: 'Cannot subtract more than current stock' });
      }
      drug.currentStock -= Number(quantity);
    } else if (operation === 'set') {
      drug.currentStock = Number(quantity);
    }
    
    // Update availability based on stock
    drug.isAvailable = drug.currentStock > 0;
    drug.lastUpdated = Date.now();

    const updatedDrug = await drug.save();
    
    res.json({ 
      drug: updatedDrug,
      previousStock,
      change: operation === 'add' ? `+${quantity}` : 
              operation === 'subtract' ? `-${quantity}` : 
              `Set to ${quantity}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Search drugs
// @route   GET /api/pharmacy/drugs/search
// @access  Private/Staff
exports.searchDrugs = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const drugs = await Drug.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json(drugs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get low stock drugs
// @route   GET /api/pharmacy/drugs/lowstock
// @access  Private/Staff
exports.getLowStockDrugs = async (req, res) => {
  try {
    const drugs = await Drug.find({
      $where: 'this.currentStock <= this.minimumStock'
    });
    
    res.json(drugs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
