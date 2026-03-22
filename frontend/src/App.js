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
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import MyAttendance from './pages/MyAttendance';
import MyProfile from './pages/MyProfile';
import Analytics from './pages/Analytics';

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
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <Navigate to="/employee/dashboard" replace />
          ) : <Login />
        } 
      />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute requiredRole="admin"><Employees /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute requiredRole="admin"><LeaveRequests /></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><Attendance /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/apply-leave" element={<ProtectedRoute requiredRole="employee"><ApplyLeave /></ProtectedRoute>} />
      <Route path="/employee/leave-history" element={<ProtectedRoute requiredRole="employee"><LeaveHistory /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute requiredRole="employee"><MyAttendance /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute requiredRole="employee"><MyProfile /></ProtectedRoute>} />

      {/* Default Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <Navigate to="/employee/dashboard" replace />
          ) : <Navigate to="/login" replace />
        } 
      />

      {/* Error Routes */}
      <Route 
        path="/unauthorized" 
        element={
          <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <h1>403 - Unauthorized</h1>
            <p>You don't have permission to access this page.</p>
          </div>
        } 
      />
      <Route 
        path="*" 
        element={
          <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <h1>404 - Page Not Found</h1>
          </div>
        } 
      />
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
