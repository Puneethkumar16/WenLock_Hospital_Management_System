const mongoose = require('mongoose');

const DrugSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  genericName: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  manufacturer: {
    type: String
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  minimumStock: {
    type: Number,
    default: 10
  },
  unit: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date
  },
  location: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create index on name for faster searches
DrugSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Drug', DrugSchema);
