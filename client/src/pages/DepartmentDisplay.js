import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getDepartments } from '../redux/slices/departmentSlice';
import { getAllTokens as getTokens } from '../redux/slices/tokenSlice';

const DepartmentDisplay = () => {
  const dispatch = useDispatch();
  const { departments, loading: deptLoading } = useSelector((state) => state.departments);
  const { tokens, loading: tokenLoading } = useSelector((state) => state.tokens);
  
  useEffect(() => {
    dispatch(getDepartments());
    dispatch(getTokens());
  }, [dispatch]);
  
  // Group tokens by department
  const getTokensByDepartment = (departmentId, status = 'waiting') => {
    if (!tokens) return [];
    return tokens.filter(
      token => token.department._id === departmentId && token.status === status
    );
  };
  
  // Get current token for a department
  const getCurrentToken = (departmentId) => {
    if (!tokens) return null;
    return tokens.find(
      token => token.department._id === departmentId && token.status === 'in_progress'
    );
  };
  
  // Get average wait time for a department
  const getAverageWaitTime = (departmentId) => {
    // In a real app, this would be calculated from historical data
    // For now, return a static value for demonstration
    const waitTimes = {
      'dept1': '15 min',
      'dept2': '30 min',
      'dept3': '10 min',
      'default': '20 min'
    };
    
    return waitTimes[departmentId] || waitTimes.default;
  };
  
  const loading = deptLoading || tokenLoading;
  
  return (
    <Container fluid className="px-4">
      <h1 className="mt-4">Department Display</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="breadcrumb-item active">Department Display</li>
      </ol>
      
      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-hospital me-1"></i>
              Department Overview
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Row>
                  {departments.map(dept => {
                    const waitingTokens = getTokensByDepartment(dept._id, 'waiting');
                    const currentToken = getCurrentToken(dept._id);
                    const avgWaitTime = getAverageWaitTime(dept._id);
                    
                    return (
                      <Col key={dept._id} lg={4} md={6} className="mb-4">
                        <Card className="h-100">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="m-0">{dept.name}</h5>
                            <Badge bg={dept.isActive ? 'success' : 'danger'}>
                              {dept.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Card.Header>
                          <Card.Body>
                            <div className="text-center mb-3">
                              <h6>Currently Serving</h6>
                              <div className="display-4">
                                {currentToken ? currentToken.tokenNumber : '—'}
                              </div>
                            </div>
                            
                            <Table bordered>
                              <tbody>
                                <tr>
                                  <th>Queue Status</th>
                                  <td>
                                    <Badge bg="primary" className="me-2">
                                      {waitingTokens.length} Waiting
                                    </Badge>
                                    
                                    {waitingTokens.length > 0 && (
                                      <small>
                                        Next: Token #{waitingTokens[0]?.tokenNumber}
                                      </small>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <th>Est. Wait Time</th>
                                  <td>{avgWaitTime}</td>
                                </tr>
                                <tr>
                                  <th>Doctors</th>
                                  <td>{dept.doctors?.length || 0}</td>
                                </tr>
                              </tbody>
                            </Table>
                            
                            {waitingTokens.length > 0 && (
                              <div className="mt-3">
                                <h6>Next in Queue</h6>
                                <div className="queue-display">
                                  {waitingTokens.slice(0, 5).map((token, index) => (
                                    <span
                                      key={token._id}
                                      className={`badge rounded-pill me-1 ${
                                        index === 0
                                          ? 'bg-success'
                                          : token.priority === 'emergency'
                                          ? 'bg-danger'
                                          : token.priority === 'urgent'
                                          ? 'bg-warning'
                                          : 'bg-info'
                                      }`}
                                    >
                                      {token.tokenNumber}
                                    </span>
                                  ))}
                                  
                                  {waitingTokens.length > 5 && (
                                    <span className="badge rounded-pill bg-secondary">
                                      +{waitingTokens.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Card.Body>
                          <Card.Footer className="text-muted">
                            Last Updated: {new Date().toLocaleTimeString()}
                          </Card.Footer>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Header>
              <i className="fas fa-info-circle me-1"></i>
              Display Legend
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-3">
                <div>
                  <Badge bg="success" className="me-2">
                    Current Token
                  </Badge>
                  <span>Currently being served</span>
                </div>
                
                <div>
                  <Badge bg="info" className="me-2">
                    Normal
                  </Badge>
                  <span>Standard priority</span>
                </div>
                
                <div>
                  <Badge bg="warning" className="me-2">
                    Urgent
                  </Badge>
                  <span>Urgent priority</span>
                </div>
                
                <div>
                  <Badge bg="danger" className="me-2">
                    Emergency
                  </Badge>
                  <span>Emergency priority</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DepartmentDisplay;
