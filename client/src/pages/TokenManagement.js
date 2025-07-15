import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTokens as getTokens, generateToken as createToken, updateTokenStatus as updateToken } from '../redux/slices/tokenSlice';
import { getDepartments } from '../redux/slices/departmentSlice';

const TokenManagement = () => {
  const dispatch = useDispatch();
  const { tokens, loading, error } = useSelector((state) => state.tokens);
  const { departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    departmentId: '',
    priority: 'normal',
    notes: ''
  });
  
  const [formError, setFormError] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    dispatch(getTokens());
    dispatch(getDepartments());
  }, [dispatch]);
  
  const { patientName, patientId, departmentId, priority, notes } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };
  
  const resetForm = () => {
    setFormData({
      patientName: '',
      patientId: '',
      departmentId: '',
      priority: 'normal',
      notes: ''
    });
    setIsEditing(false);
    setSelectedToken(null);
  };
  
  const validateForm = () => {
    if (!patientName.trim()) {
      setFormError('Patient name is required');
      return false;
    }
    
    if (!departmentId) {
      setFormError('Department is required');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (isEditing && selectedToken) {
      dispatch(updateToken({
        id: selectedToken._id,
        tokenData: formData
      }))
        .unwrap()
        .then(() => {
          resetForm();
        })
        .catch(err => {
          console.error('Error updating token:', err);
        });
    } else {
      dispatch(createToken(formData))
        .unwrap()
        .then(() => {
          resetForm();
        })
        .catch(err => {
          console.error('Error creating token:', err);
        });
    }
  };
  
  const handleEdit = token => {
    setIsEditing(true);
    setSelectedToken(token);
    setFormData({
      patientName: token.patientName,
      patientId: token.patientId || '',
      departmentId: token.department._id,
      priority: token.priority,
      notes: token.notes || ''
    });
  };
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this token?')) {
      // Token deletion functionality not available in current API
      alert('Token deletion is not supported in the current version');
      if (selectedToken && selectedToken._id === id) {
        resetForm();
      }
    }
  };
  
  const handleNext = (departmentId) => {
    // This function would call an API to move to next token
    // For now, we'll just update the token status
    const currentToken = tokens.find(
      token => token.department._id === departmentId && token.status === 'waiting'
    );
    
    if (currentToken) {
      dispatch(updateToken({
        id: currentToken._id,
        tokenData: { status: 'completed' }
      }));
    }
  };
  
  // Filter tokens based on user role and department
  const filterTokens = () => {
    if (!tokens) return [];
    
    if (user?.role === 'admin') {
      return tokens;
    }
    
    if (user?.department) {
      return tokens.filter(token => token.department._id === user.department);
    }
    
    return tokens;
  };
  
  const filteredTokens = filterTokens();
  
  // Group tokens by department for queue display
  const tokensByDepartment = departments.reduce((acc, dept) => {
    acc[dept._id] = filteredTokens.filter(
      token => token.department._id === dept._id && token.status === 'waiting'
    );
    return acc;
  }, {});
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Token Management</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item active">Token Management</li>
      </ol>
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-table me-1"></i>
              Current Tokens
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Token #</th>
                      <th>Patient Name</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">No tokens found</td>
                      </tr>
                    ) : (
                      filteredTokens.map(token => (
                        <tr key={token._id}>
                          <td>{token.tokenNumber}</td>
                          <td>{token.patientName}</td>
                          <td>{token.department.name}</td>
                          <td>
                            <Badge bg={
                              token.status === 'waiting' ? 'warning' :
                              token.status === 'in_progress' ? 'primary' :
                              token.status === 'completed' ? 'success' : 'secondary'
                            }>
                              {token.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={
                              token.priority === 'emergency' ? 'danger' :
                              token.priority === 'urgent' ? 'warning' :
                              'info'
                            }>
                              {token.priority}
                            </Badge>
                          </td>
                          <td>
                            {new Date(token.createdAt).toLocaleDateString()}{' '}
                            {new Date(token.createdAt).toLocaleTimeString()}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(token)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(token._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-ticket-alt me-1"></i>
              {isEditing ? 'Edit Token' : 'Create New Token'}
            </Card.Header>
            <Card.Body>
              {formError && <Alert variant="danger">{formError}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="patientName"
                    value={patientName}
                    onChange={onChange}
                    placeholder="Enter patient name"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Patient ID (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="patientId"
                    value={patientId}
                    onChange={onChange}
                    placeholder="Enter patient ID if available"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="departmentId"
                    value={departmentId}
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
                
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={priority}
                    onChange={onChange}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={notes}
                    onChange={onChange}
                    placeholder="Optional notes"
                  />
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit">
                    {isEditing ? 'Update Token' : 'Create Token'}
                  </Button>
                  
                  {isEditing && (
                    <Button variant="secondary" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-list-ol me-1"></i>
              Current Queues
            </Card.Header>
            <Card.Body>
              {departments.map(dept => (
                <div key={dept._id} className="mb-3">
                  <h5>{dept.name}</h5>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>
                        {tokensByDepartment[dept._id]?.length || 0} waiting
                      </strong>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleNext(dept._id)}
                    >
                      Next
                    </Button>
                  </div>
                  <hr />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TokenManagement;
