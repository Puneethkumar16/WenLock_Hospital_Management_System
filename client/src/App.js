import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layouts & Components
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Department & Token Pages
import TokenManagement from './pages/TokenManagement';
import DepartmentDisplay from './pages/DepartmentDisplay';

// Operation Theatre Pages
import OTDashboard from './pages/OTDashboard';
import OTScheduling from './pages/OTScheduling';

// Pharmacy Pages
import PharmacyDashboard from './pages/PharmacyDashboard';
import DrugInventory from './pages/DrugInventory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Token Management */}
            <Route path="tokens" element={
              <ProtectedRoute roles={['admin', 'doctor', 'nurse', 'receptionist']}>
                <TokenManagement />
              </ProtectedRoute>
            } />
            
            <Route path="departments" element={
              <ProtectedRoute>
                <DepartmentDisplay />
              </ProtectedRoute>
            } />
            
            <Route path="department/:id" element={<DepartmentDisplay />} />
            
            {/* OT Routes */}
            <Route path="ot" element={
              <ProtectedRoute roles={['admin', 'doctor', 'nurse']}>
                <OTDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="ot/scheduling" element={
              <ProtectedRoute roles={['admin', 'doctor']}>
                <OTScheduling />
              </ProtectedRoute>
            } />
            
            {/* Pharmacy Routes */}
            <Route path="pharmacy" element={
              <ProtectedRoute roles={['admin', 'doctor', 'pharmacist']}>
                <PharmacyDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="pharmacy/inventory" element={
              <ProtectedRoute roles={['admin', 'pharmacist']}>
                <DrugInventory />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="admin/dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="admin/users" element={
              <ProtectedRoute roles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="admin/departments" element={
              <ProtectedRoute roles={['admin']}>
                <DepartmentManagement />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
export default App;
