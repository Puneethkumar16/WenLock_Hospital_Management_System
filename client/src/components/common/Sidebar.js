import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // If no user, don't show sidebar
  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div 
      className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" 
      style={{ 
        width: '250px', 
        height: 'calc(100vh - 56px)', 
        position: 'fixed', 
        top: '56px', 
        left: '0', 
        overflowY: 'auto' 
      }}
    >
      <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4">Menu</span>
      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link to="/dashboard" className={`nav-link text-white ${isActive('/dashboard')}`}>
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </Link>
        </li>
        
        {/* Token Management */}
        {['admin', 'receptionist', 'doctor', 'nurse'].includes(user.role) && (
          <li>
            <Link to="/tokens" className={`nav-link text-white ${isActive('/tokens')}`}>
              <i className="bi bi-ticket-perforated me-2"></i>
              Token Management
            </Link>
          </li>
        )}
        
        {/* Operation Theatre */}
        {['admin', 'doctor', 'nurse'].includes(user.role) && (
          <>
            <li>
              <Link to="/ot" className={`nav-link text-white ${isActive('/ot')}`}>
                <i className="bi bi-hospital me-2"></i>
                OT Dashboard
              </Link>
            </li>
            
            {['admin', 'doctor'].includes(user.role) && (
              <li>
                <Link to="/ot/schedule" className={`nav-link text-white ${isActive('/ot/schedule')}`}>
                  <i className="bi bi-calendar-plus me-2"></i>
                  Schedule OT
                </Link>
              </li>
            )}
          </>
        )}
        
        {/* Pharmacy */}
        {['admin', 'doctor', 'pharmacist'].includes(user.role) && (
          <>
            <li>
              <Link to="/pharmacy" className={`nav-link text-white ${isActive('/pharmacy')}`}>
                <i className="bi bi-capsule me-2"></i>
                Pharmacy Dashboard
              </Link>
            </li>
            
            {['admin', 'pharmacist'].includes(user.role) && (
              <li>
                <Link to="/pharmacy/inventory" className={`nav-link text-white ${isActive('/pharmacy/inventory')}`}>
                  <i className="bi bi-box-seam me-2"></i>
                  Drug Inventory
                </Link>
              </li>
            )}
          </>
        )}
        
        {/* Admin Panel */}
        {user.role === 'admin' && (
          <>
            <li className="border-top my-3"></li>
            <li className="mb-1">
              <span className="nav-link text-muted">
                Admin Controls
              </span>
            </li>
            <li>
              <Link to="/admin" className={`nav-link text-white ${isActive('/admin')}`}>
                <i className="bi bi-gear me-2"></i>
                Admin Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className={`nav-link text-white ${isActive('/admin/users')}`}>
                <i className="bi bi-people me-2"></i>
                User Management
              </Link>
            </li>
            <li>
              <Link to="/admin/departments" className={`nav-link text-white ${isActive('/admin/departments')}`}>
                <i className="bi bi-building me-2"></i>
                Department Management
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
