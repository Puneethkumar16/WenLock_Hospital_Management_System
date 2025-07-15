import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllOTs, 
  scheduleOT, 
  updateOTStatus, 
  cancelOTSchedule, 
  startOTProcedure,
  endOTProcedure, 
  reset 
} from '../redux/slices/otSlice';
import { getDepartments } from '../redux/slices/departmentSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSocket } from '../services/socketService';

const OTDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { operationTheatres, isLoading, isError, isSuccess, message } = useSelector((state) => state.ot);
  const { departments } = useSelector((state) => state.departments);
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    surgeryType: '',
    department: '',
    doctorId: '',
    scheduledDateTime: '',
    duration: 60,
    theatre: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const [selectedOT, setSelectedOT] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    // Fetch all OTs from the API
    dispatch(getAllOTs());
    dispatch(getDepartments());
    
    // Check URL parameters for OT ID
    const params = new URLSearchParams(location.search);
    const otId = params.get('id');
    
    if (otId) {
      const ot = operationTheatres?.find(ot => ot._id === otId);
      if (ot) {
        setSelectedOT(ot);
        setFormData({
          patientName: ot.patientName || '',
          patientId: ot.patient || '',
          surgeryType: ot.surgeryType || ot.currentProcedure || '',
          department: ot.departmentId || '',
          doctorId: ot.doctor || '',
          scheduledDateTime: ot.scheduledDateTime || ot.scheduledStartTime || '',
          duration: ot.duration || 60,
          theatre: ot.theatre || ot.otNumber || '',
          notes: ot.notes || ''
        });
        setIsEditing(true);
        setShowModal(true);
      }
    }
    
  // Setup socket listener for real-time updates
    const socket = getSocket();
    if (socket) {
      socket.on('ot:update', () => {
        // Refresh data when we get socket updates
        dispatch(getAllOTs());
      });
      
      socket.on('ot:new', () => {
        dispatch(getAllOTs());
      });
      
      socket.on('ot:delete', () => {
        dispatch(getAllOTs());
      });
    }
      // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('ot:update');
        socket.off('ot:new');
        socket.off('ot:delete');
      }
      dispatch(reset());
    };
  }, [dispatch, location.search]);

  // Reset success and error states after they've been shown
  useEffect(() => {
    if (isSuccess || isError) {
      const timer = setTimeout(() => {
        dispatch(reset());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, dispatch]);

  // Handlers for modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };
  
  const handleShowModal = () => {
    setShowModal(true);
  };
  
  // Form handlers
  const resetForm = () => {
    setFormData({
      patientName: '',
      patientId: '',
      surgeryType: '',
      department: '',
      doctorId: '',
      scheduledDateTime: '',
      duration: 60,
      theatre: '',
      notes: ''
    });
    setIsEditing(false);
    setSelectedOT(null);
    setFormErrors({});
    setValidated(false);
  };
  
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.patientName) {
      errors.patientName = 'Patient name is required';
    }
    
    if (!formData.surgeryType) {
      errors.surgeryType = 'Surgery type is required';
    }
    
    if (!formData.scheduledDateTime) {
      errors.scheduledDateTime = 'Schedule date and time is required';
    }
    
    if (!formData.theatre) {
      errors.theatre = 'Operation theatre is required';
    }
    
    if (!formData.duration || formData.duration < 15) {
      errors.duration = 'Duration must be at least 15 minutes';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    
    if (validateForm() && form.checkValidity()) {
      if (isEditing && selectedOT) {
        // Update an existing OT schedule
        dispatch(scheduleOT({
          id: selectedOT._id,
          scheduleData: formData
        })).then((result) => {
          if (!result.error) {
            // Success - close modal and show success message
            setShowModal(false);
            resetForm();
          }
        });
      } else {
        // Find an available OT for scheduling
        const availableOT = operationTheatres.find(
          ot => ot.status === 'available' && (
            !formData.theatre || ot.theatre === formData.theatre || ot.otNumber === formData.theatre
          )
        );
        
        if (!availableOT) {
          setFormErrors({
            ...formErrors,
            theatre: 'Selected theatre is not available'
          });
          return;
        }
        
        // Schedule a new OT
        dispatch(scheduleOT({
          id: availableOT._id,
          scheduleData: formData
        })).then((result) => {
          if (!result.error) {
            // Success - close modal and show success message
            setShowModal(false);
            resetForm();
          }
        });
      }
    }
  };
  
  // Handle OT actions
  const handleStartProcedure = (otId) => {
    if (window.confirm('Start this procedure now?')) {
      dispatch(startOTProcedure(otId));
    }
  };
  
  const handleEndProcedure = (otId) => {
    if (window.confirm('Mark this procedure as completed?')) {
      dispatch(endOTProcedure(otId));
    }
  };
  
  const handleCancelSchedule = (otId) => {
    if (window.confirm('Are you sure you want to cancel this schedule?')) {
      dispatch(cancelOTSchedule({ id: otId }));
    }
  };
  
  // Handle edit button click
  const handleEdit = (ot) => {
    setIsEditing(true);
    setSelectedOT(ot);
    
    setFormData({
      patientName: ot.patientName || '',
      patientId: ot.patient || '',
      surgeryType: ot.surgeryType || ot.currentProcedure || '',
      department: ot.departmentId || '',
      doctorId: ot.doctor || '',
      scheduledDateTime: ot.scheduledDateTime || 
                        (ot.scheduledStartTime ? new Date(ot.scheduledStartTime).toISOString().slice(0, 16) : ''),
      duration: ot.duration || 60,
      theatre: ot.theatre || ot.otNumber || '',
      notes: ot.notes || ''
    });
    
    handleShowModal();
  };
  
  // Helper functions for organizing data
  const getStatusBadge = status => {
    const badgeMap = {
      'scheduled': 'warning',
      'in-use': 'primary',
      'completed': 'success',
      'cancelled': 'danger',
      'cleaning': 'info',
      'maintenance': 'secondary',
      'available': 'success',
      'emergency': 'danger'
    };
    
    return (
      <Badge bg={badgeMap[status] || 'secondary'}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };
  
  const getTodaySchedules = () => {
    if (!operationTheatres) return [];
    
    const today = new Date().toISOString().split('T')[0];
    return operationTheatres.filter(ot => {
      if (!ot.scheduledDateTime && !ot.scheduledStartTime) return false;
      
      const scheduleDate = new Date(ot.scheduledDateTime || ot.scheduledStartTime).toISOString().split('T')[0];
      return scheduleDate === today && (ot.status === 'scheduled' || ot.status === 'in-use');
    });
  };
  
  const getUpcomingSchedules = () => {
    if (!operationTheatres) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return operationTheatres.filter(ot => {
      if (!ot.scheduledDateTime && !ot.scheduledStartTime) return false;
      
      const scheduleDate = new Date(ot.scheduledDateTime || ot.scheduledStartTime);
      return scheduleDate > today && ot.status === 'scheduled';
    });
  };
  
  // Format datetime
  const formatDateTime = dateTimeString => {
    if (!dateTimeString) return 'Not scheduled';
    const dateTime = new Date(dateTimeString);
    return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const todaySchedules = getTodaySchedules();
  const upcomingSchedules = getUpcomingSchedules();
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Operation Theatre Dashboard</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item active">OT Dashboard</li>
      </ol>
      
      {isError && <Alert variant="danger">{message}</Alert>}
      {isSuccess && <Alert variant="success">Operation scheduled successfully!</Alert>}
      
      <Row>
        <Col lg={12} className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Operation Theatre Status</h2>
            <div>
              <Button variant="primary" onClick={handleShowModal} className="me-2">
                <i className="fas fa-plus me-1"></i>
                Schedule Surgery
              </Button>
              <Button variant="outline-info" onClick={() => navigate('/ot/scheduling')}>
                <i className="fas fa-calendar-alt me-1"></i>
                View Schedule Calendar
              </Button>
            </div>
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-calendar-day me-1"></i>
              Today's Schedule
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : todaySchedules.length === 0 ? (
                <div className="text-center">No surgeries scheduled for today</div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Surgery</th>
                      <th>Theatre</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySchedules.map(ot => (
                      <tr key={ot._id}>
                        <td>
                          {new Date(ot.scheduledDateTime || ot.scheduledStartTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>{ot.patientName}</td>
                        <td>{ot.surgeryType || ot.currentProcedure}</td>
                        <td>{ot.theatre || ot.otNumber}</td>
                        <td>{getStatusBadge(ot.status)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button
                              variant="outline-info"
                              onClick={() => handleEdit(ot)}
                              className="me-1"
                              title="Edit schedule"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            
                            {ot.status === 'scheduled' && (
                              <Button
                                variant="outline-primary"
                                onClick={() => handleStartProcedure(ot._id)}
                                className="me-1"
                                title="Start procedure"
                              >
                                <i className="fas fa-play"></i>
                              </Button>
                            )}
                            
                            {ot.status === 'in-use' && (
                              <Button
                                variant="outline-success"
                                onClick={() => handleEndProcedure(ot._id)}
                                className="me-1"
                                title="End procedure"
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                            )}
                            
                            {(ot.status === 'scheduled' || ot.status === 'in-use') && (
                              <Button
                                variant="outline-danger"
                                onClick={() => handleCancelSchedule(ot._id)}
                                title="Cancel schedule"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-calendar-alt me-1"></i>
              Upcoming Surgeries
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : upcomingSchedules.length === 0 ? (
                <div className="text-center">No upcoming surgeries scheduled</div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Patient</th>
                      <th>Surgery</th>
                      <th>Theatre</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingSchedules.slice(0, 5).map(ot => (
                      <tr key={ot._id}>
                        <td>{formatDateTime(ot.scheduledDateTime || ot.scheduledStartTime)}</td>
                        <td>{ot.patientName}</td>
                        <td>{ot.surgeryType || ot.currentProcedure}</td>
                        <td>{ot.theatre || ot.otNumber}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Button
                              variant="outline-info"
                              onClick={() => handleEdit(ot)}
                              className="me-1"
                              title="Edit schedule"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              onClick={() => handleCancelSchedule(ot._id)}
                              title="Cancel schedule"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              
              {upcomingSchedules.length > 5 && (
                <div className="text-center mt-3">
                  <Button variant="link" as="a" href="/ot/scheduling">
                    View All Scheduled Surgeries
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-chart-bar me-1"></i>
              Theatre Status Overview
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="card bg-primary text-white mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h2>{todaySchedules.length}</h2>
                          <div>Today's Surgeries</div>
                        </div>
                        <div>
                          <i className="fas fa-calendar-day fa-3x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col md={3}>
                  <div className="card bg-warning text-white mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h2>
                            {
                              operationTheatres?.filter(
                                ot => ot.status === 'in-use'
                              ).length || 0
                            }
                          </h2>
                          <div>In Use</div>
                        </div>
                        <div>
                          <i className="fas fa-procedures fa-3x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col md={3}>
                  <div className="card bg-success text-white mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h2>
                            {
                              operationTheatres?.filter(
                                ot => ot.status === 'available'
                              ).length || 0
                            }
                          </h2>
                          <div>Available</div>
                        </div>
                        <div>
                          <i className="fas fa-check-circle fa-3x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col md={3}>
                  <div className="card bg-danger text-white mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h2>
                            {
                              operationTheatres?.filter(
                                ot => ot.status === 'maintenance' || ot.status === 'emergency'
                              ).length || 0
                            }
                          </h2>
                          <div>Unavailable</div>
                        </div>
                        <div>
                          <i className="fas fa-exclamation-circle fa-3x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <div className="mt-4">
                <h5>Theatre Status</h5>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Theatre</th>
                      <th>Status</th>
                      <th>Current/Next Surgery</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operationTheatres && operationTheatres.map(ot => {
                      // Calculate expected end time
                      let endTime = "N/A";
                      if (ot.scheduledDateTime || ot.scheduledStartTime) {
                        const startTime = new Date(ot.scheduledDateTime || ot.scheduledStartTime);
                        const expectedEnd = new Date(startTime.getTime() + (ot.duration || 60) * 60000);
                        endTime = expectedEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      }
                      
                      return (
                        <tr key={ot._id}>
                          <td>{ot.theatre || ot.otNumber}</td>
                          <td>{getStatusBadge(ot.status)}</td>
                          <td>{ot.surgeryType || ot.currentProcedure || "None"}</td>
                          <td>
                            {ot.scheduledDateTime || ot.scheduledStartTime
                              ? new Date(ot.scheduledDateTime || ot.scheduledStartTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : "N/A"}
                          </td>
                          <td>{endTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Schedule modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Edit Surgery Schedule' : 'Schedule New Surgery'}
          </Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            {isError && <Alert variant="danger">{message}</Alert>}
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Patient Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter patient name"
                    required
                    isInvalid={!!formErrors.patientName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.patientName || 'Patient name is required'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Surgery Type <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="surgeryType"
                    value={formData.surgeryType}
                    onChange={handleInputChange}
                    placeholder="Enter surgery type"
                    required
                    isInvalid={!!formErrors.surgeryType}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.surgeryType || 'Surgery type is required'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date & Time <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="scheduledDateTime"
                    value={formData.scheduledDateTime}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!formErrors.scheduledDateTime}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.scheduledDateTime || 'Date and time is required'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duration (minutes) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="15"
                    required
                    isInvalid={!!formErrors.duration}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.duration || 'Duration must be at least 15 minutes'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Theatre <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="select"
                    name="theatre"
                    value={formData.theatre}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!formErrors.theatre}
                  >
                    <option value="">Select Theatre</option>
                    {operationTheatres && operationTheatres.map(ot => (
                      <option 
                        key={ot._id} 
                        value={ot.theatre || ot.otNumber}
                        disabled={ot.status !== 'available' && ot._id !== selectedOT?._id}
                      >
                        {ot.theatre || ot.otNumber} - {ot.status}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.theatre || 'Theatre is required'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    as="select"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Department</option>
                    {departments && departments.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : isEditing ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default OTDashboard;
