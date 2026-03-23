import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, fileUploadAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBriefcase, FaGraduationCap, FaTools, FaFileAlt, FaPlus, FaTrash, FaEdit, FaCamera, FaUpload, FaDownload } from 'react-icons/fa';

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getMyProfile();
      setProfile(response.data.profile);
      setFormData(response.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await profileAPI.updateProfile(formData);
      alert('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('employee_id', profile.id);

      const response = await fileUploadAPI.uploadProfilePhoto(formData);
      
      alert('Profile photo uploaded successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const docType = prompt('Document type (resume/aadhar/pan/passport/degree/certificate/other):') || 'other';

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('employee_id', profile.id);
      formData.append('document_type', docType);

      const response = await fileUploadAPI.uploadFile(formData);
      
      alert('Document uploaded successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleAddExperience = async () => {
    const company = prompt('Company Name:');
    const title = prompt('Job Title:');
    const startDate = prompt('Start Date (YYYY-MM-DD):');
    const endDate = prompt('End Date (YYYY-MM-DD) or leave empty if current:');
    const location = prompt('Location:');
    
    if (company && title && startDate) {
      try {
        await profileAPI.addExperience({
          company_name: company,
          job_title: title,
          start_date: startDate,
          end_date: endDate || null,
          is_current: !endDate,
          location
        });
        alert('Experience added!');
        fetchProfile();
      } catch (error) {
        alert('Failed to add experience');
      }
    }
  };

  const handleDeleteExperience = async (id) => {
    if (window.confirm('Delete this experience?')) {
      try {
        await profileAPI.deleteExperience(id);
        alert('Experience deleted!');
        fetchProfile();
      } catch (error) {
        alert('Failed to delete experience');
      }
    }
  };

  const handleAddEducation = async () => {
    const degree = prompt('Degree:');
    const institution = prompt('Institution:');
    const field = prompt('Field of Study:');
    const startYear = prompt('Start Year (YYYY):');
    const endYear = prompt('End Year (YYYY):');
    const grade = prompt('Grade/GPA:');
    
    if (degree && institution) {
      try {
        await profileAPI.addEducation({
          degree,
          institution,
          field_of_study: field,
          start_year: startYear,
          end_year: endYear,
          grade
        });
        alert('Education added!');
        fetchProfile();
      } catch (error) {
        alert('Failed to add education');
      }
    }
  };

  const handleDeleteEducation = async (id) => {
    if (window.confirm('Delete this education?')) {
      try {
        await profileAPI.deleteEducation(id);
        alert('Education deleted!');
        fetchProfile();
      } catch (error) {
        alert('Failed to delete education');
      }
    }
  };

  const handleAddSkill = async () => {
    const skill = prompt('Skill Name:');
    const proficiency = prompt('Proficiency (beginner/intermediate/advanced/expert):');
    
    if (skill && proficiency) {
      try {
        await profileAPI.addSkill({
          skill_name: skill,
          proficiency
        });
        alert('Skill added!');
        fetchProfile();
      } catch (error) {
        alert('Failed to add skill');
      }
    }
  };

  const handleDeleteSkill = async (id) => {
    if (window.confirm('Delete this skill?')) {
      try {
        await profileAPI.deleteSkill(id);
        alert('Skill deleted!');
        fetchProfile();
      } catch (error) {
        alert('Failed to delete skill');
      }
    }
  };

  const handleDeleteDocument = async (id, filename) => {
    if (window.confirm('Delete this document?')) {
      try {
        await fileUploadAPI.deleteFile(filename);
        await profileAPI.deleteDocument(id);
        alert('Document deleted!');
        fetchProfile();
      } catch (error) {
        alert('Failed to delete document');
      }
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading profile...</div>;
  }

  const profilePhotoUrl = profile?.profile_photo 
    ? fileUploadAPI.downloadFile(profile.profile_photo)
    : null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/employee/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>My Profile</h1>
      </div>

      {/* Profile Summary Card */}
      <div style={styles.summaryCard}>
        <div style={styles.avatarContainer}>
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt="Profile" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
            </div>
          )}
          <button onClick={() => photoInputRef.current.click()} style={styles.cameraBtn} disabled={uploading}>
            <FaCamera /> {uploading ? 'Uploading...' : 'Change Photo'}
          </button>
          <input
            type="file"
            ref={photoInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            style={{display: 'none'}}
          />
        </div>
        <div style={styles.summaryInfo}>
          <h2 style={styles.name}>{profile?.first_name} {profile?.last_name}</h2>
          <p style={styles.designation}>{profile?.designation} • {profile?.department}</p>
          <p style={styles.empId}>Employee ID: {profile?.employee_id}</p>
          <p style={styles.email}>{profile?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          style={activeTab === 'personal' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('personal')}
        >
          <FaUser /> Personal Info
        </button>
        <button
          style={activeTab === 'experience' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('experience')}
        >
          <FaBriefcase /> Experience
        </button>
        <button
          style={activeTab === 'education' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('education')}
        >
          <FaGraduationCap /> Education
        </button>
        <button
          style={activeTab === 'skills' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('skills')}
        >
          <FaTools /> Skills
        </button>
        <button
          style={activeTab === 'documents' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('documents')}
        >
          <FaFileAlt /> Documents
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {/* Personal Info Tab - SAME AS BEFORE */}
        {activeTab === 'personal' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Personal Information</h2>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} style={styles.editBtn}>
                  <FaEdit /> Edit
                </button>
              ) : (
                <div style={{display: 'flex', gap: '10px'}}>
                  <button onClick={handleUpdateProfile} style={styles.saveBtn}>Save</button>
                  <button onClick={() => setEditMode(false)} style={styles.cancelBtn}>Cancel</button>
                </div>
              )}
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Blood Group</label>
                <input
                  type="text"
                  value={formData.blood_group || ''}
                  onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Marital Status</label>
                <select
                  value={formData.marital_status || ''}
                  onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nationality</label>
                <input
                  type="text"
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={{...styles.formGroup, gridColumn: '1 / -1'}}>
                <label style={styles.label}>Current Address</label>
                <textarea
                  value={formData.current_address || ''}
                  onChange={(e) => setFormData({...formData, current_address: e.target.value})}
                  disabled={!editMode}
                  style={{...styles.input, minHeight: '80px'}}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Country</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Postal Code</label>
                <input
                  type="text"
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>
            </div>

            <h3 style={{...styles.sectionTitle, marginTop: '30px'}}>Emergency Contact</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Phone</label>
                <input
                  type="text"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Relation</label>
                <input
                  type="text"
                  value={formData.emergency_contact_relation || ''}
                  onChange={(e) => setFormData({...formData, emergency_contact_relation: e.target.value})}
                  disabled={!editMode}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        )}

        {/* Experience Tab - SAME AS BEFORE */}
        {activeTab === 'experience' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Work Experience</h2>
              <button onClick={handleAddExperience} style={styles.addBtn}>
                <FaPlus /> Add Experience
              </button>
            </div>

            {profile?.experience?.length === 0 ? (
              <p style={styles.emptyText}>No experience added yet</p>
            ) : (
              <div style={styles.list}>
                {profile?.experience?.map(exp => (
                  <div key={exp.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.cardTitle}>{exp.job_title}</h3>
                        <p style={styles.cardSubtitle}>{exp.company_name}</p>
                        <p style={styles.cardDate}>
                          {new Date(exp.start_date).toLocaleDateString()} - {exp.is_current ? 'Present' : new Date(exp.end_date).toLocaleDateString()}
                        </p>
                        {exp.location && <p style={styles.cardLocation}>📍 {exp.location}</p>}
                      </div>
                      <button onClick={() => handleDeleteExperience(exp.id)} style={styles.deleteBtn}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Education Tab - SAME AS BEFORE */}
        {activeTab === 'education' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Education</h2>
              <button onClick={handleAddEducation} style={styles.addBtn}>
                <FaPlus /> Add Education
              </button>
            </div>

            {profile?.education?.length === 0 ? (
              <p style={styles.emptyText}>No education added yet</p>
            ) : (
              <div style={styles.list}>
                {profile?.education?.map(edu => (
                  <div key={edu.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.cardTitle}>{edu.degree}</h3>
                        <p style={styles.cardSubtitle}>{edu.institution}</p>
                        {edu.field_of_study && <p style={styles.cardDate}>{edu.field_of_study}</p>}
                        <p style={styles.cardDate}>{edu.start_year} - {edu.end_year}</p>
                        {edu.grade && <p style={styles.cardDate}>Grade: {edu.grade}</p>}
                      </div>
                      <button onClick={() => handleDeleteEducation(edu.id)} style={styles.deleteBtn}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skills Tab - SAME AS BEFORE */}
        {activeTab === 'skills' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Skills</h2>
              <button onClick={handleAddSkill} style={styles.addBtn}>
                <FaPlus /> Add Skill
              </button>
            </div>

            {profile?.skills?.length === 0 ? (
              <p style={styles.emptyText}>No skills added yet</p>
            ) : (
              <div style={styles.skillsGrid}>
                {profile?.skills?.map(skill => (
                  <div key={skill.id} style={styles.skillCard}>
                    <div>
                      <h4 style={styles.skillName}>{skill.skill_name}</h4>
                      <span style={styles.skillLevel}>{skill.proficiency}</span>
                    </div>
                    <button onClick={() => handleDeleteSkill(skill.id)} style={styles.deleteIconBtn}>
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab - WITH FILE UPLOAD */}
        {activeTab === 'documents' && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Documents</h2>
              <button onClick={() => docInputRef.current.click()} style={styles.addBtn} disabled={uploading}>
                <FaUpload /> {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
              <input
                type="file"
                ref={docInputRef}
                onChange={handleDocumentUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{display: 'none'}}
              />
            </div>

            {profile?.documents?.length === 0 ? (
              <p style={styles.emptyText}>No documents uploaded yet</p>
            ) : (
              <div style={styles.list}>
                {profile?.documents?.map(doc => (
                  <div key={doc.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.cardTitle}>{doc.document_name}</h3>
                        <p style={styles.cardSubtitle}>{doc.document_type}</p>
                        <p style={styles.cardDate}>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                        <p style={styles.cardDate}>Size: {(doc.file_size / 1024).toFixed(2)} KB</p>
                      </div>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <a 
                          href={fileUploadAPI.downloadFile(doc.file_path)} 
                          download
                          style={styles.downloadBtn}
                        >
                          <FaDownload /> Download
                        </a>
                        <button onClick={() => handleDeleteDocument(doc.id, doc.file_path)} style={styles.deleteBtn}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f5f6fa', padding: '30px' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  header: { marginBottom: '30px' },
  backBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '15px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#333' },
  summaryCard: { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '30px', display: 'flex', gap: '24px', alignItems: 'center' },
  avatarContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700' },
  avatarImg: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #667eea' },
  cameraBtn: { padding: '6px 12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' },
  summaryInfo: { flex: 1 },
  name: { fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '8px' },
  designation: { fontSize: '16px', color: '#666', marginBottom: '4px' },
  empId: { fontSize: '14px', color: '#999', marginBottom: '4px' },
  email: { fontSize: '14px', color: '#667eea' },
  tabBar: { display: 'flex', gap: '10px', marginBottom: '30px', background: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexWrap: 'wrap' },
  tab: { padding: '12px 20px', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' },
  activeTab: { background: '#667eea', color: 'white' },
  content: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  section: { padding: '30px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { fontSize: '20px', fontWeight: '600', color: '#333' },
  editBtn: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  saveBtn: { padding: '10px 20px', background: '#43e97b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { padding: '10px 20px', background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  addBtn: { padding: '10px 20px', background: '#43e97b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' },
  input: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  emptyText: { textAlign: 'center', color: '#999', padding: '40px', fontSize: '16px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' },
  cardTitle: { fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  cardSubtitle: { fontSize: '14px', color: '#666', marginBottom: '8px' },
  cardDate: { fontSize: '13px', color: '#999', marginBottom: '4px' },
  cardLocation: { fontSize: '13px', color: '#667eea', marginTop: '8px' },
  deleteBtn: { padding: '8px 16px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  downloadBtn: { padding: '8px 16px', background: '#43e97b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' },
  skillsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  skillCard: { background: '#f8f9fa', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' },
  skillName: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  skillLevel: { fontSize: '12px', padding: '4px 8px', background: '#667eea', color: 'white', borderRadius: '4px', textTransform: 'capitalize' },
  deleteIconBtn: { background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '16px' }
};

export default MyProfile;
