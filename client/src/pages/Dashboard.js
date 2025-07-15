import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDepartments } from '../redux/slices/departmentSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { departments } = useSelector((state) => state.departments);
  
  useEffect(() => {
    dispatch(getDepartments());
  }, [dispatch]);

  // Function to render role-specific dashboard content
  const renderRoleBasedContent = () => {
    const role = user?.role || 'patient';
    
    switch (role) {
      case 'admin':
        return (
          <>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-user me-2"></i>
                User Management
              </Card.Header>
              <Card.Body>
                <p>Manage users and their roles across the hospital system.</p>
                <Link to="/admin/users" className="btn btn-primary">
                  Manage Users
                </Link>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-hospital me-2"></i>
                Department Management
              </Card.Header>
              <Card.Body>
                <p>Configure departments and assign staff members.</p>
                <Link to="/admin/departments" className="btn btn-primary">
                  Manage Departments
                </Link>
              </Card.Body>
            </Card>
          </>
        );
      
      case 'doctor':
      case 'nurse':
        return (
          <>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-procedures me-2"></i>
                Patient Management
              </Card.Header>
              <Card.Body>
                <p>View and manage your assigned patients.</p>
                <Link to="/patients" className="btn btn-primary">
                  View Patients
                </Link>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-ticket-alt me-2"></i>
                Token Queue
              </Card.Header>
              <Card.Body>
                <p>Manage the patient queue for your department.</p>
                <Link to="/tokens" className="btn btn-primary">
                  Manage Queue
                </Link>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-calendar-alt me-2"></i>
                Operation Theatre
              </Card.Header>
              <Card.Body>
                <p>Schedule and view operation theatre bookings.</p>
                <Link to="/ot" className="btn btn-primary">
                  OT Dashboard
                </Link>
              </Card.Body>
            </Card>
          </>
        );
      
      case 'receptionist':
        return (
          <>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-user-plus me-2"></i>
                Patient Registration
              </Card.Header>
              <Card.Body>
                <p>Register new patients and update patient information.</p>
                <Link to="/register-patient" className="btn btn-primary">
                  Register Patient
                </Link>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-ticket-alt me-2"></i>
                Token Management
              </Card.Header>
              <Card.Body>
                <p>Issue and manage tokens for patient queues.</p>
                <Link to="/tokens/manage" className="btn btn-primary">
                  Issue Tokens
                </Link>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-hospital me-2"></i>
                Department Status
              </Card.Header>
              <Card.Body>
                <p>View current status of all departments and token queues.</p>
                <Link to="/departments" className="btn btn-primary">
                  View Departments
                </Link>
              </Card.Body>
            </Card>
          </>
        );
      
      case 'pharmacist':
        return (
          <>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-pills me-2"></i>
                Drug Inventory
              </Card.Header>
              <Card.Body>
                <p>Manage the pharmacy inventory and medication stock.</p>
                <Link to="/pharmacy/inventory" className="btn btn-primary">
                  Manage Inventory
                </Link>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-prescription me-2"></i>
                Prescriptions
              </Card.Header>
              <Card.Body>
                <p>View and fulfill patient prescriptions.</p>
                <Link to="/pharmacy/prescriptions" className="btn btn-primary">
                  View Prescriptions
                </Link>
              </Card.Body>
            </Card>
          </>
        );
      
      case 'patient':
      default:
        return (
          <>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-ticket-alt me-2"></i>
                My Tokens
              </Card.Header>
              <Card.Body>
                <p>View your current tokens and queue positions.</p>
                <Link to="/my-tokens" className="btn btn-primary">
                  View My Tokens
                </Link>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <i className="fas fa-hospital me-2"></i>
                Departments
              </Card.Header>
              <Card.Body>
                <p>View available departments and their current queue status.</p>
                <Link to="/departments" className="btn btn-primary">
                  View Departments
                </Link>
              </Card.Body>
            </Card>
          </>
        );
    }
  };

  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Dashboard</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item active">Welcome, {user?.name || 'User'}</li>
      </ol>
      
      <Row>
        <Col xl={3} md={6}>
          <Card className="bg-primary text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>{departments?.length || 0}</div>
                <div>Total Departments</div>
              </div>
            </Card.Body>
            <Card.Footer className="d-flex align-items-center justify-content-between">
              <Link className="small text-white stretched-link" to="/departments">
                View Details
              </Link>
              <div className="small text-white">
                <i className="fas fa-angle-right"></i>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        
        {user?.role === 'admin' && (
          <Col xl={3} md={6}>
            <Card className="bg-warning text-white mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>User Management</div>
                </div>
              </Card.Body>
              <Card.Footer className="d-flex align-items-center justify-content-between">
                <Link className="small text-white stretched-link" to="/admin/users">
                  View Details
                </Link>
                <div className="small text-white">
                  <i className="fas fa-angle-right"></i>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        )}
        
        <Col xl={3} md={6}>
          <Card className="bg-success text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>Token Management</div>
              </div>
            </Card.Body>
            <Card.Footer className="d-flex align-items-center justify-content-between">
              <Link className="small text-white stretched-link" to="/tokens">
                View Details
              </Link>
              <div className="small text-white">
                <i className="fas fa-angle-right"></i>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col xl={3} md={6}>
          <Card className="bg-danger text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>Operation Theatre</div>
              </div>
            </Card.Body>
            <Card.Footer className="d-flex align-items-center justify-content-between">
              <Link className="small text-white stretched-link" to="/ot">
                View Details
              </Link>
              <div className="small text-white">
                <i className="fas fa-angle-right"></i>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12} lg={8}>
          {renderRoleBasedContent()}
        </Col>
        
        <Col md={12} lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-bell me-1"></i>
              Notifications
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span>
                    <i className="fas fa-info-circle text-primary me-2"></i>
                    Welcome to Wenlock Hospital Management System
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
