import React, { useState, useEffect } from 'react';

export default function MyProfile({ token, currentUser, onUpdateUser }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Security Analyst');
  const [isActive, setIsActive] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: success | error
  const [auditFeed, setAuditFeed] = useState([]);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || 'Security Analyst');
      setIsActive(currentUser.is_active !== false);
      setProfilePhoto(currentUser.profile_photo || '');
    }
    fetchProfileAudits();
  }, [currentUser, token]);

  const fetchProfileAudits = async () => {
    try {
      const res = await fetch('/api/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const logs = await res.json();
        // Filter only audits related to profile modifications of the current user
        const filtered = logs.filter(l => l.user_email === currentUser.email && l.action.includes('PROFILE'));
        setAuditFeed(filtered.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to load profile audit logs:", err);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'File size must be under 2MB.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
      setMessage({ text: 'Photo uploaded. Click Save to commit change.', type: 'success' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const payload = {
      full_name: fullName,
      email: email,
      role: role,
      is_active: isActive,
      profile_photo: profilePhoto || null
    };

    if (password.trim() !== '') {
      payload.password = password;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setPassword('');
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        fetchProfileAudits();
      } else {
        const errData = await res.json();
        setMessage({ text: errData.detail || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network connection failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Get initials for profile photo fallback
  const getInitials = () => {
    if (!fullName) return 'U';
    const parts = fullName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="fade-in" style={styles.container}>
      <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: '700' }}>👤 My User Profile Settings</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
        Manage your personal account details, password credentials, system role access, and profile avatar
      </p>

      {message.text && (
        <div style={{
          ...styles.alert,
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          borderColor: message.type === 'success' ? '#10b981' : '#ef4444',
          color: message.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      <div style={styles.contentGrid}>
        {/* Left Column: Avatar & Account Metadata Card */}
        <div className="glass-panel" style={styles.avatarCard}>
          <div style={styles.avatarWrapper}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>{getInitials()}</div>
            )}
            <label style={styles.editPhotoLabel}>
              📷 Change Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          <div style={styles.metaInfo}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700', margin: '0' }}>{fullName}</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{email}</span>
            <div style={styles.badgeWrapper}>
              <span style={{
                ...styles.statusBadge,
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isActive ? '#10b981' : '#ef4444'
              }}>{isActive ? 'Active Account' : 'Inactive'}</span>
              <span style={{
                ...styles.roleBadge,
                background: 'rgba(0, 242, 254, 0.15)',
                color: '#00f2fe'
              }}>{role}</span>
            </div>
          </div>

          {/* User History Audit Feed */}
          <div style={styles.auditBlock}>
            <div style={styles.auditTitle}>Profile Audit Logs</div>
            <div style={styles.auditList}>
              {auditFeed.length === 0 ? (
                <div style={styles.emptyAudit}>No profile edits recorded in logs.</div>
              ) : (
                auditFeed.map((log, idx) => (
                  <div key={idx} style={styles.auditItem}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{log.action.split(' ')[0]}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: '700' }}>{log.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings Edit Form */}
        <div className="glass-panel" style={styles.formCard}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>
            Account Settings
          </h3>
          <form onSubmit={handleSaveChanges} style={styles.form}>
            {/* Input Row 1 */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
                className="input-field" 
                style={styles.input}
              />
            </div>

            {/* Input Row 2 */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="input-field" 
                style={styles.input}
              />
            </div>

            {/* Input Row 3 (Password modification) */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Reset Password (leave empty to keep current)</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="input-field" 
                style={styles.input}
              />
            </div>

            {/* Input Row 4 (System Role change) */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Security System Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                className="input-field" 
                style={{
                  ...styles.input,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--panel-border)'
                }}
              >
                <option value="Administrator" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Administrator</option>
                <option value="Security Analyst" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Security Analyst</option>
                <option value="SOC Engineer" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>SOC Engineer</option>
                <option value="Security Manager" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Security Manager</option>
              </select>
            </div>

            {/* Input Row 5 (Account status) */}
            <div style={styles.statusToggleBlock}>
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  style={styles.checkbox}
                />
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Active Account Status</span>
              </label>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '4px 0 0 24px' }}>
                If unchecked, this account will be suspended and unable to authenticate to the portal.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary" 
              style={styles.saveBtn}
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 0',
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '13px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    marginTop: '20px'
  },
  avatarCard: {
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
    background: 'var(--panel-bg)',
    border: '1px solid var(--panel-border)',
  },
  avatarWrapper: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--accent-cyan)',
    boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '38px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    border: '3px solid var(--panel-border)',
  },
  editPhotoLabel: {
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--panel-border)',
    color: 'var(--text-primary)',
    fontSize: '10px',
    padding: '4px 8px',
    borderRadius: '20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center'
  },
  badgeWrapper: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px'
  },
  statusBadge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  roleBadge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  auditBlock: {
    width: '100%',
    borderTop: '1px solid var(--panel-border)',
    paddingTop: '16px',
    textAlign: 'left',
  },
  auditTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '10px',
  },
  auditList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  auditItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    background: 'var(--bg-primary)',
    borderRadius: '6px',
    border: '1px solid var(--panel-border)',
    fontSize: '11px'
  },
  emptyAudit: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    textAlign: 'center',
    padding: '10px 0'
  },
  formCard: {
    padding: '24px',
    borderRadius: '12px',
    background: 'var(--panel-bg)',
    border: '1px solid var(--panel-border)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--panel-border)',
    color: 'var(--text-primary)',
    fontSize: '13px'
  },
  statusToggleBlock: {
    padding: '12px',
    background: 'var(--bg-primary)',
    borderRadius: '6px',
    border: '1px solid var(--panel-border)'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  checkbox: {
    cursor: 'pointer'
  },
  saveBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '700',
    marginTop: '10px'
  }
};
