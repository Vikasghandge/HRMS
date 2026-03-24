import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leaveAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const LeaveHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      const response = await leaveAPI.getMyLeaves();
      setLeaves(response.data.leaves);
      setLeaveBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/employee/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>Leave History</h1>
      </div>

      {/* Leave Balance Summary */}
      <div style={styles.balanceSection}>
        <h2 style={styles.sectionTitle}>Leave Balance</h2>
        <div style={styles.balanceGrid}>
          <div style={styles.balanceCard}>
            <p style={styles.balanceLabel}>Sick Leave</p>
            <h3 style={styles.balanceValue}>{leaveBalance?.sick_leave || 0} days</h3>
          </div>
          <div style={styles.balanceCard}>
            <p style={styles.balanceLabel}>Casual Leave</p>
            <h3 style={styles.balanceValue}>{leaveBalance?.casual_leave || 0} days</h3>
          </div>
          <div style={styles.balanceCard}>
            <p style={styles.balanceLabel}>Paid Leave</p>
            <h3 style={styles.balanceValue}>{leaveBalance?.paid_leave || 0} days</h3>
          </div>
        </div>
      </div>

      {/* Leave History Table */}
      <div style={styles.historySection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>My Leave Requests</h2>
          <button onClick={() => navigate('/employee/apply-leave')} style={styles.applyBtn}>
            + Apply for Leave
          </button>
        </div>

        {leaves.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No leave requests found</p>
            <button onClick={() => navigate('/employee/apply-leave')} style={styles.applyBtnLarge}>
              Apply for Leave
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>Start Date</th>
                  <th style={styles.th}>End Date</th>
                  <th style={styles.th}>Days</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Admin Remarks</th>
                  <th style={styles.th}>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.leaveTypeBadge}>{leave.leave_type}</span>
                    </td>
                    <td style={styles.td}>{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td style={styles.td}>{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td style={styles.td}><strong>{leave.days}</strong></td>
                    <td style={styles.td}>{leave.reason}</td>
                    <td style={styles.td}>
                      <span style={
                        leave.status === 'approved' ? styles.approvedStatus :
                        leave.status === 'rejected' ? styles.rejectedStatus :
                        styles.pendingStatus
                      }>
                        {leave.status}
                      </span>
                    </td>
                    <td style={styles.td}>{leave.admin_remarks || '-'}</td>
                    <td style={styles.td}>{new Date(leave.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

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
    marginBottom: '30px',
  },
  backBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '15px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
  },
  balanceSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '20px',
  },
  balanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  balanceCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '2px solid #e2e8f0',
  },
  balanceLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  balanceValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
  },
  historySection: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  applyBtn: {
    padding: '10px 20px',
    background: '#43e97b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(67,233,123,0.3)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
  },
  applyBtnLarge: {
    padding: '12px 28px',
    background: '#43e97b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    marginTop: '20px',
    boxShadow: '0 4px 15px rgba(67,233,123,0.35)',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  tr: {
    borderBottom: '1px solid #f1f3f5',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#333',
  },
  leaveTypeBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#e3f2fd',
    color: '#1976d2',
    textTransform: 'capitalize',
  },
  approvedStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#d4edda',
    color: '#155724',
    textTransform: 'capitalize',
  },
  rejectedStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#f8d7da',
    color: '#721c24',
    textTransform: 'capitalize',
  },
  pendingStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#fff3cd',
    color: '#856404',
    textTransform: 'capitalize',
  },
};

export default LeaveHistory;
