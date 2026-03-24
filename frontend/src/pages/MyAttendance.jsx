import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const MyAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getMyAttendance(filters);
      setAttendance(response.data.attendance);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/employee/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>My Attendance</h1>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Present</p>
            <h3 style={styles.statValue}>{statistics?.totalPresent || 0} days</h3>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Working Hours</p>
            <h3 style={styles.statValue}>{statistics?.totalWorkingHours || 0} hrs</h3>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Average Hours</p>
            <h3 style={styles.statValue}>{statistics?.averageHours || 0} hrs</h3>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div style={styles.attendanceSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Attendance Records</h2>
          <div style={styles.filters}>
            <select
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: e.target.value})}
              style={styles.select}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              style={styles.select}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No attendance records found for selected period</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Check In</th>
                  <th style={styles.th}>Check Out</th>
                  <th style={styles.th}>Working Hours</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</strong>
                    </td>
                    <td style={styles.td}>{record.check_in || '-'}</td>
                    <td style={styles.td}>{record.check_out || '-'}</td>
                    <td style={styles.td}>
                      <strong>{record.working_hours || '0.00'} hrs</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={
                        record.status === 'present' ? styles.presentStatus :
                        record.status === 'absent' ? styles.absentStatus :
                        record.status === 'half_day' ? styles.halfDayStatus :
                        styles.leaveStatus
                      }>
                        {record.status}
                      </span>
                    </td>
                    <td style={styles.td}>{record.remarks || '-'}</td>
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
  statsSection: {
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
  },
  attendanceSection: {
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
    flexWrap: 'wrap',
    gap: '15px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
  select: {
    padding: '10px 15px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999',
    fontSize: '16px',
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
  presentStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#d4edda',
    color: '#155724',
    textTransform: 'capitalize',
  },
  absentStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#f8d7da',
    color: '#721c24',
    textTransform: 'capitalize',
  },
  halfDayStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#fff3cd',
    color: '#856404',
    textTransform: 'capitalize',
  },
  leaveStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#e3f2fd',
    color: '#1976d2',
    textTransform: 'capitalize',
  },
};

export default MyAttendance;
