const mongoose = require('mongoose');

const OTSchema = new mongoose.Schema({
  otNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['available', 'scheduled', 'in-use', 'cleaning', 'maintenance', 'emergency', 'completed', 'cancelled'],
    default: 'available'
  },
  currentProcedure: {
    type: String
  },
  surgeryType: {
    type: String
  },
  patientName: {
    type: String
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  theatre: {
    type: String
  },
  scheduledStartTime: {
    type: Date
  },
  scheduledEndTime: {
    type: Date
  },
  scheduledDateTime: {
    type: Date
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  duration: {
    type: Number,
    default: 60 // Duration in minutes
  },
  emergencyLevel: {
    type: Number,
    default: 0 // 0: not emergency, 1-5: increasing levels of emergency
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OperationTheatre', OTSchema);
