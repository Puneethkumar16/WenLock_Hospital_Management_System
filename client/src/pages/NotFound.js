import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <div className="mb-4">
            <h1 className="display-1">404</h1>
            <h2>Page Not Found</h2>
          </div>
          <p className="lead mb-4">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          <div>
            <Button as={Link} to="/" variant="primary" className="me-2">
              Go to Home
            </Button>
            <Button as={Link} to="/dashboard" variant="outline-primary">
              Go to Dashboard
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
