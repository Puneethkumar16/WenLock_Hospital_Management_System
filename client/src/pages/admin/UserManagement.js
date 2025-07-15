import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { getDepartments } from '../../redux/slices/departmentSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleFilter = queryParams.get('role');
  
  const { departments } = useSelector((state) => state.departments);
  
  // In a real app, would come from Redux/API
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'patient',
    department: '',
    password: '',
    isActive: true
  });
  
  const [formError, setFormError] = useState('');
  
  useEffect(() => {
    dispatch(getDepartments());
    fetchUsers();
  }, [dispatch]);
  
  // Mock function to fetch users - would be replaced with actual API call
  const fetchUsers = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockUsers = [
        {
          _id: '1',
          name: 'Dr. Rohan Sharma',
          email: 'rohan.sharma@hospital.com',
          role: 'doctor',
          department: { _id: 'dept1', name: 'Cardiology' },
          createdAt: '2025-01-15T10:30:00.000Z',
          isActive: true
        },
        {
          _id: '2',
          name: 'Nurse Priya Singh',
          email: 'priya.singh@hospital.com',
          role: 'nurse',
          department: { _id: 'dept2', name: 'General Medicine' },
          createdAt: '2025-02-05T11:20:00.000Z',
          isActive: true
        },
        {
          _id: '3',
          name: 'Anil Kumar',
          email: 'anil.kumar@hospital.com',
          role: 'receptionist',
          department: null,
          createdAt: '2025-02-10T09:15:00.000Z',
          isActive: true
        },
        {
          _id: '4',
          name: 'Meera Patel',
          email: 'meera.patel@hospital.com',
          role: 'pharmacist',
          department: null,
          createdAt: '2025-03-01T14:45:00.000Z',
          isActive: true
        },
        {
          _id: '5',
          name: 'Dr. Sanjay Gupta',
          email: 'sanjay.gupta@hospital.com',
          role: 'doctor',
          department: { _id: 'dept3', name: 'Orthopedics' },
          createdAt: '2025-01-20T08:30:00.000Z',
          isActive: false
        },
        {
          _id: '6',
          name: 'Rahul Verma',
          email: 'rahul.verma@gmail.com',
          role: 'patient',
          department: null,
          createdAt: '2025-04-10T16:20:00.000Z',
          isActive: true
        },
        {
          _id: '7',
          name: 'Admin User',
          email: 'admin@hospital.com',
          role: 'admin',
          department: null,
          createdAt: '2025-01-01T10:00:00.000Z',
          isActive: true
        }
      ];
      
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  };
  
  // Filter users by role
  const getFilteredUsers = () => {
    if (!roleFilter) return users;
    return users.filter(user => user.role === roleFilter);
  };
  
  // Modal handlers
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleShowModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department?._id || '',
        password: '',
        isActive: user.isActive
      });
    }
    setShowModal(true);
  };
  
  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'patient',
      department: '',
      password: '',
      isActive: true
    });
    setSelectedUser(null);
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
      setFormError('Name is required');
      return false;
    }
    
    if (!formData.email) {
      setFormError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setFormError('Email is invalid');
      return false;
    }
    
    if (!selectedUser && !formData.password) {
      setFormError('Password is required for new users');
      return false;
    }
    
    if (formData.password && formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    
    // For doctor and nurse roles, department is required
    if ((formData.role === 'doctor' || formData.role === 'nurse') && !formData.department) {
      setFormError(`Department is required for ${formData.role} role`);
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // In a real app, this would call an API through Redux
    if (selectedUser) {
      // Update existing user
      const updatedUsers = users.map(user => 
        user._id === selectedUser._id
          ? {
              ...user,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              department: formData.department 
                ? departments.find(d => d._id === formData.department)
                : null,
              isActive: formData.isActive
            }
          : user
      );
      setUsers(updatedUsers);
    } else {
      // Create new user
      const newUser = {
        _id: Date.now().toString(), // Mock ID
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department 
          ? departments.find(d => d._id === formData.department)
          : null,
        createdAt: new Date().toISOString(),
        isActive: formData.isActive
      };
      setUsers([...users, newUser]);
    }
    
    handleCloseModal();
  };
  
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // In a real app, this would call an API through Redux
      setUsers(users.filter(user => user._id !== id));
    }
  };
  
  const handleToggleActive = user => {
    // In a real app, this would call an API through Redux
    const updatedUsers = users.map(u => 
      u._id === user._id
        ? { ...u, isActive: !u.isActive }
        : u
    );
    setUsers(updatedUsers);
  };
  
  const filteredUsers = getFilteredUsers();
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">User Management</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item">
          <a href="/admin/dashboard">Admin</a>
        </li>
        <li className="breadcrumb-item active">User Management</li>
      </ol>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <i className="fas fa-users me-1"></i>
            {roleFilter ? `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s` : 'All Users'}
          </div>
          <div>
            <Button variant="primary" onClick={() => handleShowModal()}>
              <i className="fas fa-user-plus me-1"></i>
              Add New User
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={8}>
              <Form.Control
                type="text"
                placeholder="Search users..."
                // In a real app, would be connected to state and search functionality
              />
            </Col>
            <Col md={4}>
              <Form.Select 
                value={roleFilter || ''}
                onChange={e => {
                  const value = e.target.value;
                  if (value) {
                    window.location.href = `/admin/users?role=${value}`;
                  } else {
                    window.location.href = `/admin/users`;
                  }
                }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="patient">Patient</option>
              </Form.Select>
            </Col>
          </Row>
          
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Alert variant="info">
              No users found
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover bordered>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge bg-${
                          user.role === 'admin' ? 'danger' :
                          user.role === 'doctor' ? 'primary' :
                          user.role === 'nurse' ? 'info' :
                          user.role === 'receptionist' ? 'success' :
                          user.role === 'pharmacist' ? 'warning' :
                          'secondary'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.department?.name || '-'}</td>
                      <td>
                        <span className={`badge bg-${user.isActive ? 'success' : 'danger'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleShowModal(user)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant={user.isActive ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="me-1"
                            onClick={() => handleToggleActive(user)}
                          >
                            <i className={`fas fa-${user.isActive ? 'ban' : 'check'}`}></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(user._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <strong>Total:</strong> {filteredUsers.length} users
            </div>
            
            <div>
              {/* In a real app, would implement pagination here */}
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* User Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Enter full name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={onChange}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="receptionist">Receptionist</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            
            {(formData.role === 'doctor' || formData.role === 'nurse') && (
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department}
                  onChange={onChange}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>
                {selectedUser ? 'Password (leave blank to keep current)' : 'Password'}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                placeholder={selectedUser ? 'Enter new password' : 'Enter password'}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                label="Account Active"
                checked={formData.isActive}
                onChange={onChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;
