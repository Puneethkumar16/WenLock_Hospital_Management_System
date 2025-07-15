const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private/Staff
exports.createPatient = async (req, res) => {
  try {
    const {
      userId,
      name,
      age,
      gender,
      bloodGroup,
      phoneNumber,
      address,
      medicalHistory,
      currentMedications,
      allergies,
      emergencyContact
    } = req.body;

    let user;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    const patient = await Patient.create({
      user: userId || null,
      name,
      age,
      gender,
      bloodGroup,
      phoneNumber,
      address,
      medicalHistory,
      currentMedications,
      allergies,
      emergencyContact
    });

    if (patient) {
      res.status(201).json(patient);
    } else {
      res.status(400).json({ message: 'Invalid patient data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Staff
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private/Staff
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email');

    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Staff
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      patient.name = req.body.name || patient.name;
      patient.age = req.body.age || patient.age;
      patient.gender = req.body.gender || patient.gender;
      patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
      patient.phoneNumber = req.body.phoneNumber || patient.phoneNumber;
      patient.address = req.body.address || patient.address;
      patient.medicalHistory = req.body.medicalHistory || patient.medicalHistory;
      
      // Handle arrays and objects
      if (req.body.currentMedications) {
        patient.currentMedications = req.body.currentMedications;
      }
      if (req.body.allergies) {
        patient.allergies = req.body.allergies;
      }
      if (req.body.emergencyContact) {
        patient.emergencyContact = {
          ...patient.emergencyContact,
          ...req.body.emergencyContact
        };
      }

      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
      await patient.remove();
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get patient by user ID
// @route   GET /api/patients/user/:userId
// @access  Private
exports.getPatientByUserId = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.params.userId });

    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found for this user' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
