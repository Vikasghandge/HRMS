import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI, leaveAPI, attendanceAPI } from '../services/api';
import { FaUsers, FaBriefcase, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await employeeAPI.getStatistics();
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={<FaUsers />}
          title="Total Employees"
          value={statistics?.totalEmployees || 0}
          color="#667eea"
        />
        <StatCard
          icon={<FaBriefcase />}
          title="Departments"
          value={statistics?.totalDepartments || 0}
          color="#f093fb"
        />
        <StatCard
          icon={<FaCalendarAlt />}
          title="Pending Leaves"
          value={statistics?.pendingLeaves || 0}
          color="#4facfe"
        />
        <StatCard
          icon={<FaCheckCircle />}
          title="Present Today"
          value={statistics?.presentToday || 0}
          color="#43e97b"
        />
      </div>

      {/* Quick Links */}
      <div style={styles.quickLinks}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.linksGrid}>
          <QuickLink href="/admin/employees" title="Manage Employees" />
          <QuickLink href="/admin/leaves" title="Leave Requests" />
          <QuickLink href="/admin/attendance" title="Attendance" />
          <QuickLink href="/admin/reports" title="Reports" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={{ ...styles.statIcon, color }}>{icon}</div>
    <div style={styles.statContent}>
      <p style={styles.statTitle}>{title}</p>
      <h3 style={styles.statValue}>{value}</h3>
    </div>
  </div>
);

const QuickLink = ({ href, title }) => (
  <a href={href} style={styles.quickLinkCard}>
    <h3 style={styles.quickLinkTitle}>{title}</h3>
    <span style={styles.quickLinkArrow}>→</span>
  </a>
);

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f6fa',
    padding: '30px',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#666',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '10px 24px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    fontSize: '36px',
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
  },
  quickLinks: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  linksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  quickLinkCard: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  quickLinkTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  quickLinkArrow: {
    fontSize: '20px',
    color: '#667eea',
  },
};

export default AdminDashboard;
