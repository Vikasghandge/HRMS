import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [activeRole, setActiveRole] = useState('admin'); // 'admin' or 'employee'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (role) => {
    if (role === 'admin') {
      setFormData({ email: 'admin@hrms.com', password: 'admin123' });
      setActiveRole('admin');
    } else {
      setFormData({ email: 'employee@hrms.com', password: 'employee123' });
      setActiveRole('employee');
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Animation */}
      <div style={styles.backgroundShapes}>
        <div style={{...styles.shape, ...styles.shape1}}></div>
        <div style={{...styles.shape, ...styles.shape2}}></div>
        <div style={{...styles.shape, ...styles.shape3}}></div>
      </div>

      <div style={styles.content}>
        {/* Logo & Title */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>🏢</span>
            </div>
          </div>
          <h1 style={styles.title}>HRMS</h1>
          <p style={styles.subtitle}>Human Resource Management System</p>
        </div>

        {/* Role Selection Cards */}
        <div style={styles.roleCards}>
          {/* Admin Card */}
          <div
            style={{
              ...styles.roleCard,
              ...(activeRole === 'admin' ? styles.roleCardActive : {}),
            }}
            onClick={() => setActiveRole('admin')}
          >
            <div style={styles.roleIcon}>👨‍💼</div>
            <h3 style={styles.roleTitle}>Admin</h3>
            <p style={styles.roleDesc}>Manage employees, leaves, and reports</p>
            {activeRole === 'admin' && <div style={styles.activeIndicator}>●</div>}
          </div>

          {/* Employee Card */}
          <div
            style={{
              ...styles.roleCard,
              ...(activeRole === 'employee' ? styles.roleCardActive : {}),
            }}
            onClick={() => setActiveRole('employee')}
          >
            <div style={styles.roleIcon}>👨‍💻</div>
            <h3 style={styles.roleTitle}>Employee</h3>
            <p style={styles.roleDesc}>Apply leaves, track attendance</p>
            {activeRole === 'employee' && <div style={styles.activeIndicator}>●</div>}
          </div>
        </div>

        {/* Login Form */}
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={activeRole === 'admin' ? 'admin@hrms.com' : 'employee@hrms.com'}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                style={styles.input}
              />
            </div>

            {error && (
              <div style={styles.error}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={styles.loginButton}>
              {loading ? (
                <span style={styles.loader}>Logging in...</span>
              ) : (
                <>
                  <span>Login as {activeRole === 'admin' ? 'Admin' : 'Employee'}</span>
                  <span style={styles.arrow}>→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div style={styles.quickLogin}>
            <p style={styles.quickLoginText}>Quick Demo Login:</p>
            <div style={styles.quickLoginButtons}>
              <button onClick={() => quickFill('admin')} style={styles.quickButton}>
                👨‍💼 Demo Admin
              </button>
              <button onClick={() => quickFill('employee')} style={styles.quickButton}>
                👨‍💻 Demo Employee
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Credentials: admin@hrms.com / admin123 or employee@hrms.com / employee123
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  backgroundShapes: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 0,
  },
  shape: {
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.1,
    background: 'white',
  },
  shape1: {
    width: '300px',
    height: '300px',
    top: '-100px',
    left: '-100px',
    animation: 'float 20s infinite ease-in-out',
  },
  shape2: {
    width: '200px',
    height: '200px',
    bottom: '-50px',
    right: '-50px',
    animation: 'float 15s infinite ease-in-out',
  },
  shape3: {
    width: '150px',
    height: '150px',
    top: '50%',
    right: '10%',
    animation: 'float 25s infinite ease-in-out',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '900px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  logo: {
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: '40px',
  },
  title: {
    fontSize: '48px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '8px',
    textShadow: '0 4px 20px rgba(0,0,0,0.2)',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  roleCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },
  roleCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  roleCardActive: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  roleIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  roleTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px',
  },
  roleDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: '1.4',
  },
  activeIndicator: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    color: '#4ade80',
    fontSize: '20px',
  },
  formContainer: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  form: {
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  error: {
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '20px',
    color: '#991b1b',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  loginButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  loader: {
    display: 'inline-block',
  },
  arrow: {
    fontSize: '20px',
    transition: 'transform 0.3s ease',
  },
  quickLogin: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
  },
  quickLoginText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
    textAlign: 'center',
  },
  quickLoginButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  quickButton: {
    padding: '12px',
    background: '#f3f4f6',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
  },
};

export default Login;
