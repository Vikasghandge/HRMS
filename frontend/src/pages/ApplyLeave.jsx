import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leaveAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ApplyLeave = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [formData, setFormData] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await leaveAPI.getBalance();
      setLeaveBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await leaveAPI.apply(formData);
      alert('Leave request submitted successfully!');
      navigate('/employee/leave-history');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/employee/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>Apply for Leave</h1>
      </div>

      <div style={styles.content}>
        {/* Leave Balance Cards */}
        <div style={styles.balanceSection}>
          <h2 style={styles.sectionTitle}>Your Leave Balance</h2>
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

        {/* Leave Application Form */}
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>Leave Application Form</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Leave Type *</label>
              <select
                value={formData.leave_type}
                onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                style={styles.select}
                required
              >
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="paid">Paid Leave</option>
              </select>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>End Date *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {days > 0 && (
              <div style={styles.daysInfo}>
                <p>Total Days: <strong>{days} day(s)</strong></p>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                style={styles.textarea}
                rows="4"
                placeholder="Please provide a reason for your leave..."
                required
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>
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
  content: {
    display: 'grid',
    gap: '30px',
  },
  balanceSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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
  formSection: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  input: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  daysInfo: {
    background: '#e3f2fd',
    padding: '12px',
    borderRadius: '8px',
    color: '#1976d2',
    fontSize: '14px',
    fontWeight: '600',
  },
  submitBtn: {
    padding: '14px',
    background: '#43e97b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    boxShadow: '0 4px 15px rgba(67,233,123,0.35)',
    transition: 'all 0.3s',
  },
};

export default ApplyLeave;
