import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getDepartments } from '../../redux/slices/departmentSlice';

const DepartmentManagement = () => {
  const dispatch = useDispatch();
  const { departments, loading, error } = useSelector((state) => state.departments);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  
  const [formError, setFormError] = useState('');
  
  // In a real app, this would come from Redux/API
  const [users, setUsers] = useState([]);
  const [departmentUsers, setDepartmentUsers] = useState([]);
  
  useEffect(() => {
    dispatch(getDepartments());
    fetchUsers();
  }, [dispatch]);
  
  // Mock function to fetch users - would be replaced with actual API call
  const fetchUsers = () => {
    // Simulate API call
    setTimeout(() => {
      const mockUsers = [
        {
          _id: '1',
          name: 'Dr. Rohan Sharma',
          email: 'rohan.sharma@hospital.com',
          role: 'doctor',
          department: { _id: 'dept1', name: 'Cardiology' }
        },
        {
          _id: '2',
          name: 'Nurse Priya Singh',
          email: 'priya.singh@hospital.com',
          role: 'nurse',
          department: { _id: 'dept2', name: 'General Medicine' }
        },
        {
          _id: '3',
          name: 'Dr. Sanjay Gupta',
          email: 'sanjay.gupta@hospital.com',
          role: 'doctor',
          department: { _id: 'dept3', name: 'Orthopedics' }
        },
        {
          _id: '4',
          name: 'Dr. Anita Desai',
          email: 'anita.desai@hospital.com',
          role: 'doctor',
          department: { _id: 'dept1', name: 'Cardiology' }
        },
        {
          _id: '5',
          name: 'Nurse Raj Kumar',
          email: 'raj.kumar@hospital.com',
          role: 'nurse',
          department: { _id: 'dept3', name: 'Orthopedics' }
        }
      ];
      
      setUsers(mockUsers);
    }, 500);
  };
  
  useEffect(() => {
    if (selectedDepartment) {
      const deptStaff = users.filter(user => 
        user.department && user.department._id === selectedDepartment._id
      );
      setDepartmentUsers(deptStaff);
    }
  }, [selectedDepartment, users]);
  
  // Modal handlers
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleShowModal = (dept = null) => {
    if (dept) {
      setSelectedDepartment(dept);
      setFormData({
        name: dept.name,
        description: dept.description || '',
        isActive: dept.isActive
      });
    }
    setShowModal(true);
  };
  
  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setSelectedDepartment(null);
    setDepartmentUsers([]);
    setFormError('');
  };
  
  const onChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isActive' ? e.target.checked : value
    });
    setFormError('');
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Department name is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // In a real app, this would dispatch an action to update Redux store via API
    handleCloseModal();
    // After API success, would refresh departments
    // dispatch(getDepartments());
  };
  
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      // In a real app, this would dispatch an action to delete via API
      // dispatch(deleteDepartment(id));
      alert('Department deletion would be implemented in a real app');
    }
  };
  
  const handleToggleActive = dept => {
    // In a real app, this would dispatch an action to update via API
    // dispatch(updateDepartment({ id: dept._id, departmentData: { isActive: !dept.isActive } }));
    alert('Department status toggle would be implemented in a real app');
  };
  
  // Get staff counts for a department
  const getDepartmentStaffCount = (deptId) => {
    const deptStaff = users.filter(user => user.department && user.department._id === deptId);
    const doctors = deptStaff.filter(user => user.role === 'doctor').length;
    const nurses = deptStaff.filter(user => user.role === 'nurse').length;
    
    return { doctors, nurses, total: deptStaff.length };
  };
  
  // Mock function to get current tokens for a department
  const getDepartmentTokens = (deptId) => {
    // In a real app, would come from Redux store
    const mockTokenMap = {
      'dept1': 12,
      'dept2': 8,
      'dept3': 5,
      'default': 0
    };
    
    return mockTokenMap[deptId] || mockTokenMap.default;
  };
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Department Management</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item">
          <a href="/admin/dashboard">Admin</a>
        </li>
        <li className="breadcrumb-item active">Department Management</li>
      </ol>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <i className="fas fa-hospital me-1"></i>
            Departments
          </div>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="fas fa-plus me-1"></i>
            Add Department
          </Button>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : departments && departments.length === 0 ? (
            <Alert variant="info">
              No departments found
            </Alert>
          ) : (
            <Table hover bordered>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Staff</th>
                  <th>Current Queue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments && departments.map(dept => {
                  const staffCount = getDepartmentStaffCount(dept._id);
                  const currentTokens = getDepartmentTokens(dept._id);
                  
                  return (
                    <tr key={dept._id}>
                      <td>{dept.name}</td>
                      <td>{dept.description || '-'}</td>
                      <td>
                        <div>
                          <span className="badge bg-primary me-1">
                            {staffCount.doctors} Doctors
                          </span>
                          <span className="badge bg-info">
                            {staffCount.nurses} Nurses
                          </span>
                        </div>
                      </td>
                      <td>{currentTokens} waiting</td>
                      <td>
                        <span className={`badge bg-${dept.isActive ? 'success' : 'danger'}`}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex">
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="me-1"
                            onClick={() => handleShowModal(dept)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant={dept.isActive ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="me-1"
                            onClick={() => handleToggleActive(dept)}
                          >
                            <i className={`fas fa-${dept.isActive ? 'ban' : 'check'}`}></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(dept._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Department Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedDepartment ? 'Edit Department' : 'Add New Department'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="Enter department name"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Department Active"
                    checked={formData.isActive}
                    onChange={onChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter department description"
              />
            </Form.Group>
          </Form>
          
          {selectedDepartment && (
            <div className="mt-4">
              <h5>Department Staff</h5>
              {departmentUsers.length === 0 ? (
                <Alert variant="info">
                  No staff members assigned to this department
                </Alert>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>
                          <span className={`badge bg-${user.role === 'doctor' ? 'primary' : 'info'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              
              <div className="d-flex justify-content-end">
                <Button variant="outline-primary" size="sm" as="a" href="/admin/users">
                  Manage Staff
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedDepartment ? 'Update Department' : 'Create Department'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-info-circle me-1"></i>
              Department Overview
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Card className="border-left-primary h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {departments?.length || 0}
                          </div>
                          <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                            Total Departments
                          </div>
                        </div>
                        <div className="h2">
                          <i className="fas fa-hospital-alt text-primary"></i>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4}>
                  <Card className="border-left-success h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {departments?.filter(d => d.isActive).length || 0}
                          </div>
                          <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                            Active Departments
                          </div>
                        </div>
                        <div className="h2">
                          <i className="fas fa-check-circle text-success"></i>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={4}>
                  <Card className="border-left-danger h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {departments?.filter(d => !d.isActive).length || 0}
                          </div>
                          <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                            Inactive Departments
                          </div>
                        </div>
                        <div className="h2">
                          <i className="fas fa-ban text-danger"></i>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DepartmentManagement;
