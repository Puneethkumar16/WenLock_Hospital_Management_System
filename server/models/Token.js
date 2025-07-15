const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'no-show'],
    default: 'waiting'
  },
  priority: {
    type: Number,
    default: 0 // 0: normal, higher numbers indicate higher priority
  },
  estimatedTime: {
    type: Date
  },
  actualServiceTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Token', TokenSchema);
