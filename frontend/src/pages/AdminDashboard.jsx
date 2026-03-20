import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI, leaveAPI, attendanceAPI } from '../services/api';
import { FaUsers, FaBriefcase, FaCalendarAlt, FaCheckCircle, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statistics, setStatistics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, empRes, leavesRes, attRes] = await Promise.all([
        employeeAPI.getStatistics(),
        employeeAPI.getAll(),
        leaveAPI.getAll(),
        attendanceAPI.getAll(),
      ]);
      setStatistics(statsRes.data.statistics);
      setEmployees(empRes.data.employees);
      setLeaves(leavesRes.data.leaves);
      setAttendance(attRes.data.attendance);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.updateStatus(leaveId, { status: 'approved', admin_remarks: 'Approved' });
      alert('Leave approved!');
      fetchAllData();
    } catch (error) {
      alert('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await leaveAPI.updateStatus(leaveId, { status: 'rejected', admin_remarks: 'Rejected' });
      alert('Leave rejected!');
      fetchAllData();
    } catch (error) {
      alert('Failed to reject leave');
    }
  };

  const handleDeleteEmployee = async (empId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(empId);
        alert('Employee deleted successfully!');
        fetchAllData();
      } catch (error) {
        alert('Failed to delete employee');
      }
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  const filteredEmployees = employees.filter(emp =>
    emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingLeaves = leaves.filter(l => l.status === 'pending');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, Admin!</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabBar}>
        <button
          style={activeTab === 'dashboard' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          style={activeTab === 'employees' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button
          style={activeTab === 'leaves' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('leaves')}
        >
          Leave Requests
        </button>
        <button
          style={activeTab === 'attendance' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <div style={styles.statsGrid}>
            <StatCard icon={<FaUsers />} title="Total Employees" value={statistics?.totalEmployees || 0} color="#667eea" />
            <StatCard icon={<FaBriefcase />} title="Departments" value={statistics?.totalDepartments || 0} color="#f093fb" />
            <StatCard icon={<FaCalendarAlt />} title="Pending Leaves" value={statistics?.pendingLeaves || 0} color="#4facfe" />
            <StatCard icon={<FaCheckCircle />} title="Present Today" value={statistics?.presentToday || 0} color="#43e97b" />
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Pending Leave Requests</h2>
            {pendingLeaves.length === 0 ? (
              <p style={styles.emptyText}>No pending leave requests</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Employee</th>
                      <th style={styles.th}>Leave Type</th>
                      <th style={styles.th}>Start Date</th>
                      <th style={styles.th}>End Date</th>
                      <th style={styles.th}>Days</th>
                      <th style={styles.th}>Reason</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.map(leave => (
                      <tr key={leave.id} style={styles.tr}>
                        <td style={styles.td}>{leave.employee_name}</td>
                        <td style={styles.td}><span style={styles.badge}>{leave.leave_type}</span></td>
                        <td style={styles.td}>{new Date(leave.start_date).toLocaleDateString()}</td>
                        <td style={styles.td}>{new Date(leave.end_date).toLocaleDateString()}</td>
                        <td style={styles.td}>{leave.days}</td>
                        <td style={styles.td}>{leave.reason}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleApproveLeave(leave.id)} style={styles.approveBtn}>
                            <FaCheck /> Approve
                          </button>
                          <button onClick={() => handleRejectLeave(leave.id)} style={styles.rejectBtn}>
                            <FaTimes /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Employee Management</h2>
            <div style={styles.headerActions}>
              <div style={styles.searchBox}>
                <FaSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
                <FaPlus /> Add Employee
              </button>
            </div>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Designation</th>
                  <th style={styles.th}>Joining Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id} style={styles.tr}>
                    <td style={styles.td}><strong>{emp.employee_id}</strong></td>
                    <td style={styles.td}>{emp.first_name} {emp.last_name}</td>
                    <td style={styles.td}>{emp.email}</td>
                    <td style={styles.td}>{emp.department}</td>
                    <td style={styles.td}>{emp.designation}</td>
                    <td style={styles.td}>{new Date(emp.joining_date).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span style={emp.is_active ? styles.activeStatus : styles.inactiveStatus}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn}><FaEdit /></button>
                      <button onClick={() => handleDeleteEmployee(emp.id)} style={styles.deleteBtn}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaves Tab */}
      {activeTab === 'leaves' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>All Leave Requests</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>Start - End Date</th>
                  <th style={styles.th}>Days</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave.id} style={styles.tr}>
                    <td style={styles.td}>{leave.employee_name}</td>
                    <td style={styles.td}>{leave.department}</td>
                    <td style={styles.td}><span style={styles.badge}>{leave.leave_type}</span></td>
                    <td style={styles.td}>
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>{leave.days}</td>
                    <td style={styles.td}>
                      <span style={
                        leave.status === 'approved' ? styles.approvedStatus :
                        leave.status === 'rejected' ? styles.rejectedStatus :
                        styles.pendingStatus
                      }>
                        {leave.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {leave.status === 'pending' && (
                        <>
                          <button onClick={() => handleApproveLeave(leave.id)} style={styles.approveBtn}>
                            <FaCheck />
                          </button>
                          <button onClick={() => handleRejectLeave(leave.id)} style={styles.rejectBtn}>
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Today's Attendance</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Check In</th>
                  <th style={styles.th}>Check Out</th>
                  <th style={styles.th}>Working Hours</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(att => (
                  <tr key={att.id} style={styles.tr}>
                    <td style={styles.td}><strong>{att.employee_id}</strong></td>
                    <td style={styles.td}>{att.employee_name}</td>
                    <td style={styles.td}>{att.department}</td>
                    <td style={styles.td}>{att.check_in || '-'}</td>
                    <td style={styles.td}>{att.check_out || '-'}</td>
                    <td style={styles.td}>{att.working_hours || '0.00'} hrs</td>
                    <td style={styles.td}>
                      <span style={styles.presentStatus}>{att.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onSuccess={fetchAllData} />}
    </div>
  );
};

// Add Employee Modal Component
const AddEmployeeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    designation: '',
    joining_date: '',
    salary: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.create(formData);
      alert('Employee added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add employee');
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Add New Employee</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="First Name *"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Last Name *"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formRow}>
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({...formData, designation: e.target.value})}
              style={styles.input}
            />
            <input
              type="date"
              placeholder="Joining Date"
              value={formData.joining_date}
              onChange={(e) => setFormData({...formData, joining_date: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.formRow}>
            <input
              type="number"
              placeholder="Salary"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>Add Employee</button>
          </div>
        </form>
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
    marginBottom: '20px',
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
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
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(255,71,87,0.3)',
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    background: 'white',
    padding: '10px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: '#666',
    transition: 'all 0.3s',
  },
  activeTab: {
    background: '#667eea',
    color: 'white',
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
  section: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '30px',
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
  headerActions: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#f8f9fa',
    padding: '10px 15px',
    borderRadius: '8px',
    gap: '10px',
  },
  searchIcon: {
    color: '#666',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    width: '200px',
  },
  addBtn: {
    padding: '10px 20px',
    background: '#43e97b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(67,233,123,0.3)',
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
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#e3f2fd',
    color: '#1976d2',
  },
  approveBtn: {
    padding: '6px 12px',
    background: '#43e97b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  rejectBtn: {
    padding: '6px 12px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  editBtn: {
    padding: '6px 12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '8px',
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  activeStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#d4edda',
    color: '#155724',
  },
  inactiveStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#f8d7da',
    color: '#721c24',
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
  presentStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#d4edda',
    color: '#155724',
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    fontSize: '16px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  input: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#e2e8f0',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  submitBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default AdminDashboard;
