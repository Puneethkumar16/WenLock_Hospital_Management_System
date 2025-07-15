import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDepartments } from '../../redux/slices/departmentSlice';
import { getAllTokens as getTokens } from '../../redux/slices/tokenSlice';
import { getAllOTs as getOTSchedules } from '../../redux/slices/otSlice';
import { getAllDrugs as getDrugs } from '../../redux/slices/pharmacySlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { departments } = useSelector((state) => state.departments);
  const { tokens } = useSelector((state) => state.tokens);
  const { schedules } = useSelector((state) => state.ot);
  const { drugs } = useSelector((state) => state.pharmacy);
  
  useEffect(() => {
    dispatch(getDepartments());
    dispatch(getTokens());
    dispatch(getOTSchedules());
    dispatch(getDrugs());
  }, [dispatch]);
  
  // Stats calculations
  const getTokenStats = () => {
    if (!tokens) return { total: 0, waiting: 0, completed: 0 };
    
    const waiting = tokens.filter(t => t.status === 'waiting').length;
    const completed = tokens.filter(t => t.status === 'completed').length;
    
    return {
      total: tokens.length,
      waiting,
      completed
    };
  };
  
  const getOTStats = () => {
    if (!schedules) return { total: 0, scheduled: 0, completed: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = schedules.filter(s => {
      const scheduleDate = new Date(s.scheduledDateTime);
      return scheduleDate >= today;
    }).length;
    
    const completed = schedules.filter(s => s.status === 'completed').length;
    
    return {
      total: schedules.length,
      upcoming,
      completed
    };
  };
  
  const getDrugStats = () => {
    if (!drugs) return { total: 0, lowStock: 0, outOfStock: 0 };
    
    const lowStock = drugs.filter(d => d.currentStock > 0 && d.currentStock <= d.minStock).length;
    const outOfStock = drugs.filter(d => d.currentStock <= 0).length;
    
    return {
      total: drugs.length,
      lowStock,
      outOfStock
    };
  };
  
  const tokenStats = getTokenStats();
  const otStats = getOTStats();
  const drugStats = getDrugStats();
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Admin Dashboard</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item active">Admin</li>
      </ol>
      
      <Row>
        <Col xl={3} md={6}>
          <Card className="bg-primary text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{departments?.length || 0}</h2>
                  <div>Departments</div>
                </div>
                <div>
                  <i className="fas fa-hospital fa-3x"></i>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="d-flex align-items-center justify-content-between">
              <Link className="small text-white stretched-link" to="/admin/departments">
                View Details
              </Link>
              <div className="small text-white">
                <i className="fas fa-angle-right"></i>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col xl={3} md={6}>
          <Card className="bg-warning text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{tokenStats.waiting}</h2>
                  <div>Waiting Tokens</div>
                </div>
                <div>
                  <i className="fas fa-ticket-alt fa-3x"></i>
                </div>
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
          <Card className="bg-success text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{otStats.upcoming}</h2>
                  <div>Upcoming Surgeries</div>
                </div>
                <div>
                  <i className="fas fa-calendar-alt fa-3x"></i>
                </div>
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
        
        <Col xl={3} md={6}>
          <Card className="bg-danger text-white mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>{drugStats.lowStock + drugStats.outOfStock}</h2>
                  <div>Low/Out of Stock Drugs</div>
                </div>
                <div>
                  <i className="fas fa-pills fa-3x"></i>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="d-flex align-items-center justify-content-between">
              <Link className="small text-white stretched-link" to="/pharmacy/inventory">
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
        <Col xl={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-users me-1"></i>
                Users Management
              </div>
              <Button variant="primary" size="sm" as={Link} to="/admin/users">
                <i className="fas fa-plus me-1"></i>
                Add New User
              </Button>
            </Card.Header>
            <Card.Body>
              <Table hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Doctors</td>
                    <td>12</td>
                    <td>
                      <Button variant="outline-info" size="sm" as={Link} to="/admin/users?role=doctor">
                        View
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Nurses</td>
                    <td>24</td>
                    <td>
                      <Button variant="outline-info" size="sm" as={Link} to="/admin/users?role=nurse">
                        View
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Receptionists</td>
                    <td>8</td>
                    <td>
                      <Button variant="outline-info" size="sm" as={Link} to="/admin/users?role=receptionist">
                        View
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Pharmacists</td>
                    <td>6</td>
                    <td>
                      <Button variant="outline-info" size="sm" as={Link} to="/admin/users?role=pharmacist">
                        View
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Patients</td>
                    <td>450</td>
                    <td>
                      <Button variant="outline-info" size="sm" as={Link} to="/admin/users?role=patient">
                        View
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
            <Card.Footer>
              <Link to="/admin/users">Manage All Users</Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col xl={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <i className="fas fa-hospital me-1"></i>
                Departments Overview
              </div>
              <Button variant="primary" size="sm" as={Link} to="/admin/departments">
                <i className="fas fa-plus me-1"></i>
                Add Department
              </Button>
            </Card.Header>
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Doctors</th>
                    <th>Current Queue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departments && departments.length > 0 ? (
                    departments.slice(0, 5).map(dept => (
                      <tr key={dept._id}>
                        <td>{dept.name}</td>
                        <td>{dept.doctors?.length || 0}</td>
                        <td>
                          {tokens ? 
                            tokens.filter(t => 
                              t.department?._id === dept._id && 
                              t.status === 'waiting'
                            ).length : 0}
                        </td>
                        <td>
                          {dept.isActive ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No departments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
            <Card.Footer>
              <Link to="/admin/departments">Manage Departments</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-chart-bar me-1"></i>
              System Status
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Token System</h5>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Total Today:</span>
                          <strong>{tokenStats.total}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Waiting:</span>
                          <strong>{tokenStats.waiting}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Completed:</span>
                          <strong>{tokenStats.completed}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent">
                      <Link to="/tokens">Manage Tokens</Link>
                    </div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Operation Theatres</h5>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Total Surgeries:</span>
                          <strong>{otStats.total}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Upcoming:</span>
                          <strong>{otStats.upcoming}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Completed:</span>
                          <strong>{otStats.completed}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent">
                      <Link to="/ot/scheduling">View Schedule</Link>
                    </div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="card bg-light mb-3">
                    <div className="card-body">
                      <h5 className="card-title">Pharmacy</h5>
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Total Drugs:</span>
                          <strong>{drugStats.total}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Low Stock:</span>
                          <strong>{drugStats.lowStock}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Out of Stock:</span>
                          <strong>{drugStats.outOfStock}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent">
                      <Link to="/pharmacy/inventory">Check Inventory</Link>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-cogs me-1"></i>
              Quick Actions
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Button variant="outline-primary" as={Link} to="/admin/users">
                  <i className="fas fa-user-plus me-1"></i>
                  Add User
                </Button>
                
                <Button variant="outline-secondary" as={Link} to="/admin/departments">
                  <i className="fas fa-hospital-alt me-1"></i>
                  Manage Departments
                </Button>
                
                <Button variant="outline-success" as={Link} to="/ot/scheduling">
                  <i className="fas fa-calendar-plus me-1"></i>
                  Schedule Surgery
                </Button>
                
                <Button variant="outline-info" as={Link} to="/pharmacy/inventory">
                  <i className="fas fa-pills me-1"></i>
                  Update Inventory
                </Button>
                
                <Button variant="outline-dark" as={Link} to="/departments">
                  <i className="fas fa-desktop me-1"></i>
                  Display Interface
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
