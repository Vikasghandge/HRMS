#!/bin/bash
cd ~/HRMS

echo "📝 Adding missing pages to frontend..."

# Create Employees page
cat > frontend/src/pages/Employees.jsx << 'ENDFILE'
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Employees = () => {
  const { logout } = useAuth();
  
  return (
    <div style={{minHeight:'100vh',background:'#f5f6fa',padding:'30px'}}>
      <div style={{background:'white',padding:'24px',borderRadius:'12px',marginBottom:'20px',display:'flex',justifyContent:'space-between'}}>
        <h1>Manage Employees</h1>
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={() => window.location.href='/admin/dashboard'} style={{padding:'10px 20px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>← Back</button>
          <button onClick={logout} style={{padding:'10px 20px',background:'#ff4757',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <div style={{background:'white',padding:'40px',borderRadius:'12px',textAlign:'center'}}>
        <h2>Employee Management Coming Soon</h2>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};

export default Employees;
ENDFILE

# Create LeaveRequests page  
cat > frontend/src/pages/LeaveRequests.jsx << 'ENDFILE'
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LeaveRequests = () => {
  const { logout } = useAuth();
  
  return (
    <div style={{minHeight:'100vh',background:'#f5f6fa',padding:'30px'}}>
      <div style={{background:'white',padding:'24px',borderRadius:'12px',marginBottom:'20px',display:'flex',justifyContent:'space-between'}}>
        <h1>Leave Requests</h1>
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={() => window.location.href='/admin/dashboard'} style={{padding:'10px 20px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>← Back</button>
          <button onClick={logout} style={{padding:'10px 20px',background:'#ff4757',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <div style={{background:'white',padding:'40px',borderRadius:'12px',textAlign:'center'}}>
        <h2>Leave Requests Coming Soon</h2>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};

export default LeaveRequests;
ENDFILE

# Create Attendance page
cat > frontend/src/pages/Attendance.jsx << 'ENDFILE'
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Attendance = () => {
  const { logout } = useAuth();
  
  return (
    <div style={{minHeight:'100vh',background:'#f5f6fa',padding:'30px'}}>
      <div style={{background:'white',padding:'24px',borderRadius:'12px',marginBottom:'20px',display:'flex',justifyContent:'space-between'}}>
        <h1>Attendance</h1>
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={() => window.location.href='/admin/dashboard'} style={{padding:'10px 20px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>← Back</button>
          <button onClick={logout} style={{padding:'10px 20px',background:'#ff4757',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <div style={{background:'white',padding:'40px',borderRadius:'12px',textAlign:'center'}}>
        <h2>Attendance Tracking Coming Soon</h2>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};

export default Attendance;
ENDFILE

# Create Reports page
cat > frontend/src/pages/Reports.jsx << 'ENDFILE'
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { logout } = useAuth();
  
  return (
    <div style={{minHeight:'100vh',background:'#f5f6fa',padding:'30px'}}>
      <div style={{background:'white',padding:'24px',borderRadius:'12px',marginBottom:'20px',display:'flex',justifyContent:'space-between'}}>
        <h1>Reports</h1>
        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={() => window.location.href='/admin/dashboard'} style={{padding:'10px 20px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>← Back</button>
          <button onClick={logout} style={{padding:'10px 20px',background:'#ff4757',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <div style={{background:'white',padding:'40px',borderRadius:'12px',textAlign:'center'}}>
        <h2>Reports Coming Soon</h2>
        <p>This feature is under development</p>
      </div>
    </div>
  );
};

export default Reports;
ENDFILE

# Update App.js to include new routes
cat > frontend/src/App.js << 'ENDFILE'
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Employees from './pages/Employees';
import LeaveRequests from './pages/LeaveRequests';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? (user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/employee/dashboard" replace />) : <Login />} />
      
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute requiredRole="admin"><Employees /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute requiredRole="admin"><LeaveRequests /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><Attendance /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>} />
      
      <Route path="/employee/dashboard" element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
      
      <Route path="/" element={isAuthenticated ? (user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/employee/dashboard" replace />) : <Navigate to="/login" replace />} />
      
      <Route path="/unauthorized" element={<div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><h1>403 - Unauthorized</h1><p>You don't have permission to access this page.</p></div>} />
      
      <Route path="*" element={<div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}><h1>404 - Page Not Found</h1></div>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
ENDFILE

echo "✅ Pages created!"
echo "🔄 Rebuilding frontend..."
docker-compose up -d --build frontend

echo "⏳ Waiting for rebuild..."
sleep 20

echo "✅ Done! Refresh your browser!"
