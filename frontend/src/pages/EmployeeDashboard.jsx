import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leaveAPI, attendanceAPI } from '../services/api';
import { FaCalendarCheck, FaCalendarTimes, FaClock, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, statusRes] = await Promise.all([
        leaveAPI.getBalance(),
        attendanceAPI.getTodayStatus(),
      ]);
      setLeaveBalance(balanceRes.data.balance);
      setTodayStatus(statusRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      alert('Checked in successfully!');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      alert('Checked out successfully!');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
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
          <h1 style={styles.title}>Employee Dashboard</h1>
          <p style={styles.subtitle}>Welcome, {user?.name}!</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Attendance Section */}
      <div style={styles.attendanceSection}>
        <h2 style={styles.sectionTitle}>Today's Attendance</h2>
        <div style={styles.attendanceGrid}>
          <div style={styles.attendanceCard}>
            <FaClock size={40} color="#667eea" />
            <div style={styles.attendanceInfo}>
              <p style={styles.attendanceLabel}>Check In</p>
              <p style={styles.attendanceTime}>
                {todayStatus?.attendance?.check_in || 'Not checked in'}
              </p>
            </div>
            {!todayStatus?.isCheckedIn && (
              <button onClick={handleCheckIn} style={styles.checkInBtn}>
                <FaSignInAlt /> Check In
              </button>
            )}
          </div>

          <div style={styles.attendanceCard}>
            <FaClock size={40} color="#764ba2" />
            <div style={styles.attendanceInfo}>
              <p style={styles.attendanceLabel}>Check Out</p>
              <p style={styles.attendanceTime}>
                {todayStatus?.attendance?.check_out || 'Not checked out'}
              </p>
            </div>
            {todayStatus?.isCheckedIn && !todayStatus?.isCheckedOut && (
              <button onClick={handleCheckOut} style={styles.checkOutBtn}>
                <FaSignOutAlt /> Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <div style={styles.leaveSection}>
        <h2 style={styles.sectionTitle}>Leave Balance</h2>
        <div style={styles.leaveGrid}>
          <LeaveCard
            type="Sick Leave"
            balance={leaveBalance?.sick_leave || 12}
            icon={<FaCalendarTimes />}
            color="#ff6b6b"
          />
          <LeaveCard
            type="Casual Leave"
            balance={leaveBalance?.casual_leave || 10}
            icon={<FaCalendarCheck />}
            color="#4ecdc4"
          />
          <LeaveCard
            type="Paid Leave"
            balance={leaveBalance?.paid_leave || 15}
            icon={<FaCalendarCheck />}
            color="#95e1d3"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <ActionCard href="/employee/apply-leave" title="Apply for Leave" />
          <ActionCard href="/employee/leave-history" title="Leave History" />
          <ActionCard href="/employee/attendance" title="My Attendance" />
          <ActionCard href="/employee/profile" title="My Profile" />
        </div>
      </div>
    </div>
  );
};

const LeaveCard = ({ type, balance, icon, color }) => (
  <div style={{ ...styles.leaveCard, borderLeft: `4px solid ${color}` }}>
    <div style={{ ...styles.leaveIcon, color }}>{icon}</div>
    <div style={styles.leaveContent}>
      <p style={styles.leaveType}>{type}</p>
      <h3 style={styles.leaveBalance}>{balance} days</h3>
    </div>
  </div>
);

const ActionCard = ({ href, title }) => (
  <a href={href} style={styles.actionCard}>
    <h3 style={styles.actionTitle}>{title}</h3>
    <span style={styles.actionArrow}>→</span>
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
  attendanceSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  attendanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  attendanceCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  attendanceTime: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  checkInBtn: {
    padding: '10px 20px',
    background: '#43e97b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkOutBtn: {
    padding: '10px 20px',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  leaveSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    marginBottom: '30px',
  },
  leaveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  leaveCard: {
    background: '#f8f9fa',
    padding: '24px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  leaveIcon: {
    fontSize: '36px',
  },
  leaveContent: {
    flex: 1,
  },
  leaveType: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  leaveBalance: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
  },
  quickActions: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  actionCard: {
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
  actionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  },
  actionArrow: {
    fontSize: '20px',
    color: '#667eea',
  },
};

export default EmployeeDashboard;
