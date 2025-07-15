import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <Container fluid>
      <Row className="mb-5">
        <Col>
          <div className="bg-primary text-white p-5 rounded-3 text-center">
            <h1>Welcome to Wenlock Hospital Management System</h1>
            <p className="lead">
              A centralized system for managing patient flow, tokens, OT scheduling, and drug inventory
            </p>
            {!user && (
              <div className="mt-4">
                <Button variant="light" size="lg" className="me-2" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="outline-light" size="lg" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12} className="text-center mb-4">
          <h2>Our Key Features</h2>
          <p>Streamlining healthcare operations for better patient care</p>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-4">
                <i className="bi bi-ticket-perforated text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <Card.Title className="text-center">Token Management</Card.Title>
              <Card.Text>
                Streamline patient queuing with our digital token system. Eliminate confusion and reduce waiting times.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-4">
                <i className="bi bi-hospital text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <Card.Title className="text-center">OT Scheduling</Card.Title>
              <Card.Text>
                Efficiently manage operation theatre schedules. Handle emergencies and procedure planning seamlessly.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-4">
                <i className="bi bi-capsule text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <Card.Title className="text-center">Pharmacy Management</Card.Title>
              <Card.Text>
                Real-time drug inventory tracking. Notify staff of low stock and drug availability status.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-4">
                <i className="bi bi-shield-check text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <Card.Title className="text-center">Security & Privacy</Card.Title>
              <Card.Text>
                Role-based access control ensures patient data security. Complete audit trails for all actions.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col lg={6} className="mb-4 mb-lg-0">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Hospital Departments</h4>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>Cardiology</ListGroup.Item>
              <ListGroup.Item>Neurology</ListGroup.Item>
              <ListGroup.Item>Orthopedics</ListGroup.Item>
              <ListGroup.Item>Pediatrics</ListGroup.Item>
              <ListGroup.Item>General Medicine</ListGroup.Item>
              <ListGroup.Item>General Surgery</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Emergency Contact</h4>
            </Card.Header>
            <Card.Body>
              <p><i className="bi bi-telephone-fill me-2"></i> Emergency: <strong>+91 999-999-9999</strong></p>
              <p><i className="bi bi-telephone me-2"></i> Reception: +91 888-888-8888</p>
              <p><i className="bi bi-envelope me-2"></i> Email: contact@wenlockhospital.org</p>
              <p><i className="bi bi-geo-alt me-2"></i> Address: Wenlock Hospital, Hampankatta, Mangalore, Karnataka, India - 575001</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
