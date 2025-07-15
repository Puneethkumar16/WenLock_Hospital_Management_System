import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar as BootstrapNavbar, Container, Nav, Button, NavDropdown } from 'react-bootstrap';
import { logout, reset } from '../../redux/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/">
          <img 
            src="/logo192.png" 
            width="30" 
            height="30" 
            className="d-inline-block align-top me-2" 
            alt="Hospital Logo" 
          />
          Wenlock Hospital
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" />
        <BootstrapNavbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                
                {['admin', 'receptionist', 'doctor', 'nurse'].includes(user.role) && (
                  <Nav.Link as={Link} to="/tokens">Token Management</Nav.Link>
                )}
                
                {['admin', 'doctor', 'nurse'].includes(user.role) && (
                  <NavDropdown title="Operation Theatre" id="ot-dropdown">
                    <NavDropdown.Item as={Link} to="/ot">OT Dashboard</NavDropdown.Item>
                    
                    {['admin', 'doctor'].includes(user.role) && (
                      <NavDropdown.Item as={Link} to="/ot/schedule">Schedule OT</NavDropdown.Item>
                    )}
                  </NavDropdown>
                )}
                
                {['admin', 'doctor', 'pharmacist'].includes(user.role) && (
                  <NavDropdown title="Pharmacy" id="pharmacy-dropdown">
                    <NavDropdown.Item as={Link} to="/pharmacy">Pharmacy Dashboard</NavDropdown.Item>
                    
                    {['admin', 'pharmacist'].includes(user.role) && (
                      <NavDropdown.Item as={Link} to="/pharmacy/inventory">Drug Inventory</NavDropdown.Item>
                    )}
                  </NavDropdown>
                )}
                
                {user.role === 'admin' && (
                  <NavDropdown title="Admin" id="admin-dropdown">
                    <NavDropdown.Item as={Link} to="/admin">Admin Dashboard</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/users">User Management</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/departments">Department Management</NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  <i className="bi bi-person-circle me-2"></i>
                  {user.name} ({user.role})
                </span>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="btn btn-outline-light me-2">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn btn-light">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
