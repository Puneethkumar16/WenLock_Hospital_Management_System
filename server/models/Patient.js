const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  bloodGroup: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  medicalHistory: {
    type: String
  },
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String
  }],
  allergies: [String],
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', PatientSchema);
