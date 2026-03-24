import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaUsers, FaCalendarCheck, FaChartLine, FaTrophy, FaArrowLeft } from 'react-icons/fa';

const Analytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading Analytics...</div>;
  }

  const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'];

  // Prepare data for charts
  const departmentData = analytics?.departmentDistribution?.map(d => ({
    name: d.department,
    employees: d.count
  })) || [];

  const leaveTypeData = analytics?.leaveTypeStats?.map(l => ({
    name: l.leave_type,
    value: l.count
  })) || [];

  const monthlyLeaveData = analytics?.monthlyLeaves?.map(m => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m.month - 1],
    leaves: m.count
  })) || [];

  const attendanceTrendData = analytics?.attendanceStats?.slice(-14).map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    present: a.total_present,
    avgHours: parseFloat(a.avg_hours).toFixed(1)
  })) || [];

  const salaryData = analytics?.salaryStats?.map(s => ({
    department: s.department,
    avgSalary: Math.round(s.avg_salary / 1000)
  })) || [];

  const genderData = analytics?.genderDistribution?.map(g => ({
    name: g.gender === 'male' ? 'Male' : g.gender === 'female' ? 'Female' : 'Other',
    value: g.count
  })) || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>
          <FaArrowLeft /> Back
        </button>
        <h1 style={styles.title}>📊 Analytics Dashboard</h1>
        <p style={styles.subtitle}>Comprehensive insights and reports</p>
      </div>

      {/* Overview Cards */}
      <div style={styles.overviewGrid}>
        <div style={{...styles.overviewCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
          <FaUsers style={styles.overviewIcon} />
          <div>
            <p style={styles.overviewLabel}>Total Employees</p>
            <h2 style={styles.overviewValue}>{analytics?.overview?.totalEmployees || 0}</h2>
            <p style={styles.overviewSubtext}>{analytics?.overview?.activeEmployees || 0} Active</p>
          </div>
        </div>

        <div style={{...styles.overviewCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
          <FaCalendarCheck style={styles.overviewIcon} />
          <div>
            <p style={styles.overviewLabel}>Present Today</p>
            <h2 style={styles.overviewValue}>{analytics?.overview?.presentToday || 0}</h2>
            <p style={styles.overviewSubtext}>Avg {analytics?.overview?.avgHoursToday || 0} hrs</p>
          </div>
        </div>

        <div style={{...styles.overviewCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
          <FaChartLine style={styles.overviewIcon} />
          <div>
            <p style={styles.overviewLabel}>Departments</p>
            <h2 style={styles.overviewValue}>{analytics?.overview?.totalDepartments || 0}</h2>
            <p style={styles.overviewSubtext}>Active Departments</p>
          </div>
        </div>

        <div style={{...styles.overviewCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
          <FaTrophy style={styles.overviewIcon} />
          <div>
            <p style={styles.overviewLabel}>Top Performer</p>
            <h2 style={styles.overviewValue}>{analytics?.topPerformers?.[0]?.avg_hours?.toFixed(1) || 0}h</h2>
            <p style={styles.overviewSubtext}>{analytics?.topPerformers?.[0]?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Department Distribution */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>👥 Department Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="employees" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Type Distribution */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📅 Leave Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {leaveTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div style={{...styles.chartCard, gridColumn: '1 / -1'}}>
          <h3 style={styles.chartTitle}>📈 14-Day Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#43e97b" strokeWidth={3} name="Present Employees" />
              <Line type="monotone" dataKey="avgHours" stroke="#f093fb" strokeWidth={3} name="Avg Working Hours" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Leaves */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 Monthly Leave Requests</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyLeaveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leaves" fill="#4facfe" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>👤 Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers Table */}
      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>🏆 Top Performers (Last 30 Days)</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Rank</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Avg Hours/Day</th>
              <th style={styles.th}>Days Present</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.topPerformers?.map((performer, index) => (
              <tr key={index} style={styles.tr}>
                <td style={styles.td}>
                  <span style={{...styles.rankBadge, background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}}>
                    #{index + 1}
                  </span>
                </td>
                <td style={styles.td}><strong>{performer.name}</strong></td>
                <td style={styles.td}>{performer.department}</td>
                <td style={styles.td}>{parseFloat(performer.avg_hours).toFixed(2)} hrs</td>
                <td style={styles.td}>{performer.days_present} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f6fa', padding: '30px' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '600' },
  header: { marginBottom: '30px' },
  backBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
  title: { fontSize: '32px', fontWeight: '800', color: '#333', marginBottom: '8px' },
  subtitle: { fontSize: '16px', color: '#666' },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
  overviewCard: { padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
  overviewIcon: { fontSize: '48px', opacity: 0.9 },
  overviewLabel: { fontSize: '14px', opacity: 0.9, marginBottom: '8px' },
  overviewValue: { fontSize: '36px', fontWeight: '800', marginBottom: '4px' },
  overviewSubtext: { fontSize: '13px', opacity: 0.8 },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '30px' },
  chartCard: { background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  chartTitle: { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '20px' },
  tableCard: { background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '600', color: '#666' },
  tr: { borderBottom: '1px solid #f1f3f5' },
  td: { padding: '12px', fontSize: '14px', color: '#333' },
  rankBadge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: 'white' }
};

export default Analytics;
