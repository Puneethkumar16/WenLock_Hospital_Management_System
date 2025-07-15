import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import { Container } from 'react-bootstrap';

const MainLayout = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        {user && <Sidebar />}
        <Container 
          fluid 
          className="py-4 px-3 flex-grow-1"
          style={{ marginLeft: user ? '250px' : '0' }}
        >
          <Outlet />
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
