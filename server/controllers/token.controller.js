const Token = require('../models/Token');
const Department = require('../models/Department');
const Patient = require('../models/Patient');

// @desc    Generate a new token for a patient
// @route   POST /api/tokens
// @access  Private/Staff
exports.generateToken = async (req, res) => {
  try {
    const { departmentId, patientId, priority = 0 } = req.body;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Increment the last token number and create new token
    department.lastTokenNumber += 1;
    await department.save();

    // Create the token
    const token = await Token.create({
      tokenNumber: department.lastTokenNumber,
      patientId,
      departmentId,
      priority,
      estimatedTime: new Date(Date.now() + 20 * 60 * 1000) // Default 20 minutes from now
    });

    if (token) {
      res.status(201).json({
        token,
        estimatedWaitingTime: '20 minutes' // This is a default, could be calculated based on queue length
      });
    } else {
      res.status(400).json({ message: 'Invalid token data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all tokens
// @route   GET /api/tokens
// @access  Private/Staff
exports.getAllTokens = async (req, res) => {
  try {
    const tokens = await Token.find({})
      .populate('patientId', 'name')
      .populate('departmentId', 'name');
    
    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get tokens for a specific department
// @route   GET /api/tokens/department/:departmentId
// @access  Public
exports.getDepartmentTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ 
      departmentId: req.params.departmentId,
      status: { $nin: ['completed', 'no-show'] }
    })
    .populate('patientId', 'name')
    .sort({ priority: -1, createdAt: 1 });
    
    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get token by ID
// @route   GET /api/tokens/:id
// @access  Private
exports.getTokenById = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate('patientId', 'name')
      .populate('departmentId', 'name currentToken');

    if (token) {
      // Calculate estimated waiting time
      const department = await Department.findById(token.departmentId);
      const waitingTokens = await Token.countDocuments({
        departmentId: token.departmentId,
        status: 'waiting',
        tokenNumber: { $lt: token.tokenNumber }
      });
      
      const estimatedWaitingTime = waitingTokens * 5; // Assume 5 minutes per token
      
      res.json({
        ...token._doc,
        waitingInFront: waitingTokens,
        estimatedWaitingTime: `${estimatedWaitingTime} minutes`,
        currentToken: department.currentToken
      });
    } else {
      res.status(404).json({ message: 'Token not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update token status
// @route   PUT /api/tokens/:id
// @access  Private/Staff
exports.updateTokenStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const token = await Token.findById(req.params.id);

    if (token) {
      token.status = status;
      
      // If token is being set to in-progress, update department's current token
      if (status === 'in-progress') {
        const department = await Department.findById(token.departmentId);
        department.currentToken = token.tokenNumber;
        await department.save();
        
        // Set actual service time
        token.actualServiceTime = Date.now();
      }
      
      const updatedToken = await token.save();
      res.json(updatedToken);
    } else {
      res.status(404).json({ message: 'Token not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get patient's tokens (history and active)
// @route   GET /api/tokens/patient/:patientId
// @access  Private
exports.getPatientTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ patientId: req.params.patientId })
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get current active token in a department
// @route   GET /api/tokens/department/:departmentId/current
// @access  Public
exports.getCurrentDepartmentToken = async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const currentToken = await Token.findOne({
      departmentId: req.params.departmentId,
      status: 'in-progress'
    }).populate('patientId', 'name');
    
    res.json({
      currentTokenNumber: department.currentToken,
      currentToken: currentToken ? currentToken : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
