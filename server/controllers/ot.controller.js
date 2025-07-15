const OT = require('../models/OperationTheatre');
const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Create a new OT
// @route   POST /api/ot
// @access  Private/Admin
exports.createOT = async (req, res) => {
  try {
    const { otNumber } = req.body;

    // Check if OT already exists
    const otExists = await OT.findOne({ otNumber });

    if (otExists) {
      return res.status(400).json({ message: 'Operation Theatre with this number already exists' });
    }

    // Create OT
    const ot = await OT.create({
      otNumber
    });

    if (ot) {
      res.status(201).json(ot);
    } else {
      res.status(400).json({ message: 'Invalid OT data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all OTs
// @route   GET /api/ot
// @access  Public
exports.getAllOTs = async (req, res) => {
  try {
    const ots = await OT.find({})
      .populate('patient', 'name')
      .populate('doctor', 'name');
    
    res.json(ots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get OT by ID
// @route   GET /api/ot/:id
// @access  Public
exports.getOTById = async (req, res) => {
  try {
    const ot = await OT.findById(req.params.id)
      .populate('patient', 'name age gender')
      .populate('doctor', 'name');

    if (ot) {
      res.json(ot);
    } else {
      res.status(404).json({ message: 'Operation Theatre not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update OT status
// @route   PUT /api/ot/:id/status
// @access  Private/Staff
exports.updateOTStatus = async (req, res) => {
  try {
    const { status, emergencyLevel = 0 } = req.body;
    const ot = await OT.findById(req.params.id);

    if (!ot) {
      return res.status(404).json({ message: 'Operation Theatre not found' });
    }

    ot.status = status;
    ot.emergencyLevel = emergencyLevel;
    ot.updatedAt = Date.now();

    const updatedOT = await ot.save();
    
    res.json(updatedOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Schedule an OT
// @route   PUT /api/ot/:id/schedule
// @access  Private/Doctor
exports.scheduleOT = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      surgeryType,
      scheduledDateTime,
      duration,
      notes,
      department,
      theatre
    } = req.body;

    // Input validation
    if (!surgeryType) {
      return res.status(400).json({ message: 'Surgery type is required' });
    }

    if (!scheduledDateTime) {
      return res.status(400).json({ message: 'Scheduled date and time are required' });
    }

    if (!patientId && !patientName) {
      return res.status(400).json({ message: 'Either patient ID or patient name is required' });
    }

    const ot = await OT.findById(req.params.id);

    if (!ot) {
      return res.status(404).json({ message: 'Operation Theatre not found' });
    }

    // Check if OT is available
    if (ot.status !== 'available' && ot.status !== 'maintenance') {
      return res.status(400).json({ message: `OT is currently ${ot.status}. Cannot schedule.` });
    }

    // Check for scheduling conflicts
    const scheduledTime = new Date(scheduledDateTime);
    const endTime = new Date(scheduledTime.getTime() + ((duration || 60) * 60000));

    const existingSchedules = await OT.find({
      _id: { $ne: req.params.id }, // Exclude current OT
      status: { $in: ['in-use', 'scheduled'] },
      $or: [
        {
          scheduledStartTime: { $lt: endTime },
          scheduledEndTime: { $gt: scheduledTime }
        }
      ]
    });

    if (existingSchedules.length > 0 && theatre) {
      // Check if the specific theatre is booked for this time slot
      const conflictingTheatre = existingSchedules.find(s => s.theatre === theatre);
      if (conflictingTheatre) {
        return res.status(400).json({ 
          message: `Theatre ${theatre} already has a scheduled procedure during this time slot.` 
        });
      }
    }

    // Validate patient
    if (patientId) {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      ot.patient = patientId;
    }

    // Validate doctor
    if (doctorId) {
      const doctor = await User.findById(doctorId);
      if (!doctor || doctor.role !== 'doctor') {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      ot.doctor = doctorId;
    }

    ot.currentProcedure = surgeryType;
    ot.theatre = theatre || ot.otNumber;
    ot.scheduledStartTime = scheduledDateTime;
    ot.scheduledEndTime = endTime;
    ot.status = 'scheduled';  // Changed from 'in-use' to 'scheduled'
    ot.notes = notes;
    ot.departmentId = department;
    ot.patientName = patientName;
    ot.duration = duration || 60;  // Default duration is 60 minutes
    ot.updatedAt = Date.now();

    const updatedOT = await ot.save();
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.to('role:doctor').to('role:nurse').to('role:admin').emit('ot:update', updatedOT);
    }
    
    res.json(updatedOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Cancel OT schedule
// @route   PUT /api/ot/:id/cancel
// @access  Private/Doctor
exports.cancelOTSchedule = async (req, res) => {
  try {
    const ot = await OT.findById(req.params.id);

    if (!ot) {
      return res.status(404).json({ message: 'Operation Theatre not found' });
    }

    ot.status = 'available';
    ot.patient = null;
    ot.doctor = null;
    ot.currentProcedure = '';
    ot.scheduledStartTime = null;
    ot.scheduledEndTime = null;
    ot.actualStartTime = null;
    ot.actualEndTime = null;
    ot.notes = req.body.notes || '';
    ot.updatedAt = Date.now();

    const updatedOT = await ot.save();
    
    res.json(updatedOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Start OT procedure
// @route   PUT /api/ot/:id/start
// @access  Private/Doctor
exports.startOTProcedure = async (req, res) => {
  try {
    const ot = await OT.findById(req.params.id);

    if (!ot) {
      return res.status(404).json({ message: 'Operation Theatre not found' });
    }

    ot.status = 'in-use';
    ot.actualStartTime = Date.now();
    ot.updatedAt = Date.now();

    const updatedOT = await ot.save();
    
    res.json(updatedOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    End OT procedure
// @route   PUT /api/ot/:id/end
// @access  Private/Doctor
exports.endOTProcedure = async (req, res) => {
  try {
    const ot = await OT.findById(req.params.id);

    if (!ot) {
      return res.status(404).json({ message: 'Operation Theatre not found' });
    }

    ot.status = 'cleaning';
    ot.actualEndTime = Date.now();
    ot.updatedAt = Date.now();

    const updatedOT = await ot.save();
    
    res.json(updatedOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Set emergency status for OT
// @route   PUT /api/ot/:id/emergency
// @access  Private/Staff
exports.setEmergency = async (req, res) => {
  try {
    const { emergencyLevel, notes } = req.body;
    const ot = await OT.findById(req.params.id);

    if (!ot) {
      return res.status(404).json({ message: 'Operation Theatre not found' });
    }

    ot.status = 'emergency';
    ot.emergencyLevel = emergencyLevel || 5; // Default highest level
    ot.notes = notes || ot.notes;
    ot.updatedAt = Date.now();

    const updatedOT = await ot.save();
    
    res.json(updatedOT);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
