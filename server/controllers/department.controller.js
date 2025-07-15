const Department = require('../models/Department');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if department already exists
    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    // Create department
    const department = await Department.create({
      name,
      description
    });

    if (department) {
      res.status(201).json(department);
    } else {
      res.status(400).json({ message: 'Invalid department data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('doctors', '_id name email')
      .populate('nurses', '_id name email');

    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const department = await Department.findById(req.params.id);

    if (department) {
      department.name = name || department.name;
      department.description = description || department.description;
      department.isActive = isActive !== undefined ? isActive : department.isActive;

      const updatedDepartment = await department.save();
      res.json(updatedDepartment);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (department) {
      await department.remove();
      res.json({ message: 'Department removed' });
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add doctor to department
// @route   PUT /api/departments/:id/doctors
// @access  Private/Admin
exports.addDoctorToDepartment = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const department = await Department.findById(req.params.id);

    if (department) {
      if (!department.doctors.includes(doctorId)) {
        department.doctors.push(doctorId);
        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
      } else {
        res.status(400).json({ message: 'Doctor already in this department' });
      }
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add nurse to department
// @route   PUT /api/departments/:id/nurses
// @access  Private/Admin
exports.addNurseToDepartment = async (req, res) => {
  try {
    const { nurseId } = req.body;
    const department = await Department.findById(req.params.id);

    if (department) {
      if (!department.nurses.includes(nurseId)) {
        department.nurses.push(nurseId);
        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
      } else {
        res.status(400).json({ message: 'Nurse already in this department' });
      }
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
