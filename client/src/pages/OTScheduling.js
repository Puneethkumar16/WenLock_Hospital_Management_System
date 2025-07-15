import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOTs, scheduleOT, reset } from '../redux/slices/otSlice';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSocket } from '../services/socketService';

const OTScheduling = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { operationTheatres, isLoading, isError, isSuccess, message } = useSelector((state) => state.ot);
  
  // State for views and filters
  const [view, setView] = useState('calendar'); // calendar, list, table
  const [filterDate, setFilterDate] = useState(new Date());
  
  // State for scheduling form
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    doctorId: '',
    surgeryType: '',
    scheduledDateTime: '',
    duration: 60,
    notes: '',
    department: '',
    theatre: ''
  });
  
  // State for validation
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    // Fetch all OT data
    dispatch(getAllOTs());
    
    // Parse query parameters (if any)
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
      setShowScheduleModal(true);
      setFormData({
        ...formData,
        scheduledDateTime: dateParam
      });
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
  
  // Format data for calendar view
  const getCalendarEvents = () => {
    if (!operationTheatres) return [];
    
    return operationTheatres.map(ot => {
      // Skip OTs without scheduled procedures
      if (!ot.scheduledStartTime && !ot.scheduledDateTime) return null;
      
      // Determine color based on status
      const colorMap = {
        scheduled: '#ffc107', // warning yellow
        'in-use': '#0d6efd', // primary blue
        completed: '#198754', // success green
        cancelled: '#dc3545', // danger red
        cleaning: '#17a2b8', // info cyan
        maintenance: '#6c757d', // secondary gray
        emergency: '#dc3545' // danger red
      };
      
      const startTime = ot.scheduledDateTime || ot.scheduledStartTime;
      const durationMinutes = ot.duration || 60;
      
      return {
        id: ot._id,
        title: `${ot.surgeryType || ot.currentProcedure} - ${ot.patientName || 'No Patient'}`,
        start: new Date(startTime),
        end: new Date(new Date(startTime).getTime() + durationMinutes * 60000),
        backgroundColor: colorMap[ot.status] || '#6c757d',
        borderColor: colorMap[ot.status] || '#6c757d',
        extendedProps: {
          department: ot.departmentId?.name,
          doctor: ot.doctor?.name,
          theatre: ot.theatre || ot.otNumber,
          status: ot.status
        }
      };
    }).filter(Boolean); // Remove null entries
  };
    // Handle calendar event click
  const handleEventClick = (info) => {
    const otId = info.event.id;
    navigate(`/ot?id=${otId}`);
  };
  
  // Handle date clicking for new event
  const handleDateClick = (info) => {
    setSelectedDate(new Date(info.dateStr));
    setShowScheduleModal(true);
    setFormData({
      ...formData,
      scheduledDateTime: info.dateStr
    });
  };
  
  // Form input change handler
  const handleInputChange = (e) => {
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
  
  // Validate form data
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
  
  // Handle form submission
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);
    
    if (validateForm() && form.checkValidity()) {
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
      
      // Dispatch action to schedule OT
      dispatch(scheduleOT({
        id: availableOT._id,
        scheduleData: formData
      })).then((result) => {
        if (!result.error) {
          // Success - close modal and show success message
          setShowScheduleModal(false);
          setFormData({
            patientName: '',
            patientId: '',
            doctorId: '',
            surgeryType: '',
            scheduledDateTime: '',
            duration: 60,
            notes: '',
            department: '',
            theatre: ''
          });
          setValidated(false);
        }
      });
    }
  };
  
  // Filter OTs by date for list view
  const getFilteredSchedules = () => {
    if (!operationTheatres) return [];
    
    const startOfDay = new Date(filterDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(filterDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return operationTheatres.filter(ot => {
      if (!ot.scheduledDateTime && !ot.scheduledStartTime) return false;
      
      const scheduleDate = new Date(ot.scheduledDateTime || ot.scheduledStartTime);
      return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
    });
  };
  
  // Format datetime
  const formatDateTime = dateTimeString => {
    if (!dateTimeString) return 'Not scheduled';
    const dateTime = new Date(dateTimeString);
    return `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  // Get status badge
  const getStatusBadge = status => {
    const statusMap = {
      scheduled: { variant: 'warning', label: 'Scheduled' },
      'in-use': { variant: 'primary', label: 'In Use' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'danger', label: 'Cancelled' },
      available: { variant: 'success', label: 'Available' },
      cleaning: { variant: 'info', label: 'Cleaning' },
      maintenance: { variant: 'secondary', label: 'Maintenance' },
      emergency: { variant: 'danger', label: 'Emergency' }
    };
    
    const { variant, label } = statusMap[status] || { variant: 'secondary', label: status };
    
    return <span className={`badge bg-${variant}`}>{label}</span>;
  };
    return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Operation Theatre Scheduling</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item">
          <a href="/ot">OT Dashboard</a>
        </li>
        <li className="breadcrumb-item active">Scheduling</li>
      </ol>
      
      {isError && <Alert variant="danger">{message}</Alert>}
      {isSuccess && <Alert variant="success">Operation scheduled successfully!</Alert>}
      
      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-calendar-alt me-1"></i>
                Schedule View
              </div>
              <div>
                <Button
                  variant={view === 'calendar' ? 'primary' : 'outline-primary'}
                  className="me-2"
                  onClick={() => setView('calendar')}
                >
                  <i className="fas fa-calendar-alt me-1"></i>
                  Calendar
                </Button>
                <Button
                  variant={view === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setView('list')}
                >
                  <i className="fas fa-list me-1"></i>
                  List
                </Button>
                <Button
                  variant="success"
                  className="ms-3"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setFormData({
                      ...formData,
                      scheduledDateTime: new Date().toISOString().split('.')[0]
                    });
                    setShowScheduleModal(true);
                  }}
                >
                  <i className="fas fa-plus me-1"></i>
                  New Schedule
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : view === 'calendar' ? (
                <div className="calendar-container">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={getCalendarEvents()}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    height="auto"
                    slotDuration="00:15:00"
                  />
                </div>
              ) : (
                <div>
                  <div className="mb-3">
                    <Form.Group>
                      <Form.Label>Filter by Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={filterDate.toISOString().split('T')[0]}
                        onChange={e => setFilterDate(new Date(e.target.value))}
                      />
                    </Form.Group>
                  </div>
                  
                  <Table responsive bordered hover>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Surgery Type</th>
                        <th>Theatre</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>                      {getFilteredSchedules().length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No schedules found for this date
                          </td>
                        </tr>
                      ) : (
                        getFilteredSchedules()
                          .sort((a, b) => new Date(a.scheduledDateTime || a.scheduledStartTime) - new Date(b.scheduledDateTime || b.scheduledStartTime))
                          .map(ot => (
                            <tr key={ot._id}>
                              <td>
                                {new Date(ot.scheduledDateTime || ot.scheduledStartTime).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td>{ot.patientName || 'N/A'}</td>
                              <td>{ot.surgeryType || ot.currentProcedure || 'N/A'}</td>
                              <td>{ot.theatre || ot.otNumber || 'OT-1'}</td>
                              <td>{ot.departmentId?.name || 'General'}</td>
                              <td>{getStatusBadge(ot.status)}</td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => navigate(`/ot?id=${ot._id}`)}
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  View
                                </Button>
                                {(ot.status === 'scheduled' || ot.status === 'available') && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDate(new Date(ot.scheduledDateTime || ot.scheduledStartTime));
                                      setFormData({
                                        patientName: ot.patientName || '',
                                        patientId: ot.patient?._id || '',
                                        doctorId: ot.doctor?._id || '',
                                        surgeryType: ot.surgeryType || ot.currentProcedure || '',
                                        scheduledDateTime: ot.scheduledDateTime || ot.scheduledStartTime,
                                        duration: ot.duration || 60,
                                        notes: ot.notes || '',
                                        department: ot.departmentId?._id || '',
                                        theatre: ot.theatre || ot.otNumber || ''
                                      });
                                      setShowScheduleModal(true);
                                    }}
                                  >
                                    <i className="fas fa-edit me-1"></i>
                                    Edit
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Schedule Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Schedule Operation Theatre</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleScheduleSubmit}>
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
                    {operationTheatres && operationTheatres
                      .filter(ot => ot.status === 'available')
                      .map(ot => (
                        <option key={ot._id} value={ot.theatre || ot.otNumber}>
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
                    <option value="6265a9e7c77e1fd8b1c71738">General Surgery</option>
                    <option value="6265a9e7c77e1fd8b1c71739">Orthopedics</option>
                    <option value="6265a9e7c77e1fd8b1c7173a">Cardiology</option>
                    <option value="6265a9e7c77e1fd8b1c7173b">Neurology</option>
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
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={isLoading}>
              {isLoading ? 'Scheduling...' : 'Schedule Operation'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
        <Row>
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-hospital me-1"></i>
              Available Theatres
            </Card.Header>
            <Card.Body>
              <Table>
                <thead>
                  <tr>
                    <th>Theatre</th>
                    <th>Status</th>
                    <th>Current Surgery</th>
                    <th>Next Available</th>
                  </tr>
                </thead>
                <tbody>
                  {operationTheatres && operationTheatres.length > 0 ? (
                    operationTheatres.map(ot => {
                      // Calculate next available time
                      let nextAvailable = "Now";
                      
                      if (ot.status === "scheduled") {
                        const startDate = new Date(ot.scheduledDateTime || ot.scheduledStartTime);
                        const endDate = new Date(startDate);
                        endDate.setMinutes(endDate.getMinutes() + (ot.duration || 60));
                        nextAvailable = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } else if (ot.status === "in-use") {
                        nextAvailable = "After Completion";
                      } else if (ot.status === "maintenance" || ot.status === "emergency") {
                        nextAvailable = "Check with Admin";
                      }
                      
                      return (
                        <tr key={ot._id}>
                          <td>{ot.theatre || ot.otNumber}</td>
                          <td>
                            {getStatusBadge(ot.status)}
                          </td>
                          <td>{ot.currentProcedure || ot.surgeryType || 'None'}</td>
                          <td>{nextAvailable}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">No theatres available</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-user-md me-1"></i>
              Theatre Usage Statistics
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column">
                <div className="mb-3">
                  <h6>Theatre Status</h6>
                  <div className="progress">
                    {/* Calculate percentages based on actual OT data */}
                    {operationTheatres && operationTheatres.length > 0 && (
                      <>
                        {(() => {
                          const total = operationTheatres.length;
                          const available = operationTheatres.filter(ot => ot.status === 'available').length;
                          const inUse = operationTheatres.filter(ot => ot.status === 'in-use').length;
                          const scheduled = operationTheatres.filter(ot => ot.status === 'scheduled').length;
                          const other = total - available - inUse - scheduled;
                          
                          return (
                            <>
                              <div 
                                className="progress-bar bg-success" 
                                style={{ width: `${(available/total * 100)}%` }}
                                title={`Available: ${available}`}>
                              </div>
                              <div 
                                className="progress-bar bg-primary" 
                                style={{ width: `${(inUse/total * 100)}%` }}
                                title={`In Use: ${inUse}`}>
                              </div>
                              <div 
                                className="progress-bar bg-warning" 
                                style={{ width: `${(scheduled/total * 100)}%` }}
                                title={`Scheduled: ${scheduled}`}>
                              </div>
                              <div 
                                className="progress-bar bg-secondary" 
                                style={{ width: `${(other/total * 100)}%` }}
                                title={`Other: ${other}`}>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                  <div className="d-flex justify-content-between mt-2 small">
                    <span><i className="fas fa-square text-success me-1"></i> Available</span>
                    <span><i className="fas fa-square text-primary me-1"></i> In Use</span>
                    <span><i className="fas fa-square text-warning me-1"></i> Scheduled</span>
                    <span><i className="fas fa-square text-secondary me-1"></i> Other</span>
                  </div>
                </div>
                
                <div>
                  <h6>Today's Schedule</h6>
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Surgery</th>
                        <th>Theatre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operationTheatres && operationTheatres
                        .filter(ot => 
                          ot.status === 'scheduled' || 
                          ot.status === 'in-use'
                        )
                        .sort((a, b) => new Date(a.scheduledDateTime || a.scheduledStartTime) - new Date(b.scheduledDateTime || b.scheduledStartTime))
                        .slice(0, 5)
                        .map(ot => (
                          <tr key={ot._id}>
                            <td>{new Date(ot.scheduledDateTime || ot.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{ot.surgeryType || ot.currentProcedure}</td>
                            <td>{ot.theatre || ot.otNumber}</td>
                          </tr>
                        ))}
                      {(!operationTheatres || operationTheatres.filter(ot => ot.status === 'scheduled' || ot.status === 'in-use').length === 0) && (
                        <tr>
                          <td colSpan="3" className="text-center">No scheduled surgeries</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OTScheduling;
