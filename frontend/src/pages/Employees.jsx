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
