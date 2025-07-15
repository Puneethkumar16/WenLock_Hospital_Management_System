import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="mt-auto bg-dark text-light py-3">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            &copy; {new Date().getFullYear()} Wenlock Hospital Management System
          </Col>
          <Col md={6} className="text-center text-md-end">
            Version 1.0.0
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
