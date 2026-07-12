import React, { useState, useEffect } from 'react';

export default function EmployeeManager({ token, currentUser, onSelectEmployee, selectedEmployeeId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Onboarding Form States
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [empId, setEmpId] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('');
  const [manager, setManager] = useState('');
  const [privileges, setPrivileges] = useState('');
  const [status, setStatus] = useState('Active');
  
  const canModify = currentUser.role === 'Administrator' || currentUser.role === 'Security Manager';
  const isAdmin = currentUser.role === 'Administrator';

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load employee directory');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!canModify) {
      setError('Access Denied: Only Admins or Security Managers can onboard employees');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/employees/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: empId,
          full_name: fullName,
          department,
          designation,
          manager,
          access_privileges: privileges,
          status
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to onboard employee');
      
      // Reset form & Refresh list
      setEmpId('');
      setFullName('');
      setDesignation('');
      setManager('');
      setPrivileges('');
      setStatus('Active');
      setShowOnboardForm(false);
      
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId, e) => {
    e.stopPropagation(); // Avoid selecting employee card on delete click
    if (!isAdmin) {
      alert('Access Denied: Only Administrators can delete employee profiles');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to permanently delete profile ${employeeId}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Delete failed');
      }
      
      // If we deleted the currently selected employee, clear selection
      if (selectedEmployeeId === employeeId) {
        onSelectEmployee(null);
      }
      
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.gridContainer}>
      {/* Left panel: Onboard & employee list */}
      <div className="glass-panel" style={styles.listPanel}>
        <div style={styles.panelHeader}>
          <h3 style={styles.panelTitle}>Identity & Profile Management</h3>
          {canModify && (
            <button 
              className="btn btn-primary" 
              style={styles.onboardToggleBtn}
              onClick={() => setShowOnboardForm(!showOnboardForm)}
            >
              {showOnboardForm ? 'Close Onboard Form' : 'Onboard Employee'}
            </button>
          )}
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {showOnboardForm && (
          <form onSubmit={handleOnboardSubmit} style={styles.onboardForm} className="fade-in">
            <h4 style={styles.formSectionTitle}>New Employee Security Registry</h4>
            <div style={styles.formRow}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Employee ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="EMP-XXXX" 
                  value={empId} 
                  onChange={(e) => setEmpId(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{flex: 2}}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Johnathan Doe" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Department Mapping</label>
                <select 
                  className="form-select" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Finance">Finance</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Executive Office">Executive Office</option>
                  <option value="Sales & Operations">Sales & Operations</option>
                </select>
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Corporate Designation</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Lead Cloud Security Eng" 
                  value={designation} 
                  onChange={(e) => setDesignation(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Designated Manager</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Jane Manager" 
                  value={manager} 
                  onChange={(e) => setManager(e.target.value)} 
                />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Account Security Status</label>
                <select 
                  className="form-select" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active / Privileged</option>
                  <option value="Suspended">Suspended / Quarantined</option>
                  <option value="Offboarded">Offboarded</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Access Privileges (Comma-separated)</label>
              <textarea 
                className="form-textarea" 
                rows="2" 
                placeholder="SSH_ACCESS, DATABASE_ADMIN, GIT_REPO_WRITE, VPN_ACCESS"
                value={privileges}
                onChange={(e) => setPrivileges(e.target.value)}
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Onboard & Register ID
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowOnboardForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={styles.searchBarContainer}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="🔍 Search profiles by name, ID, dept, status..." 
            style={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.employeeList}>
          {loading && <div style={styles.infoMessage}>Synchronizing secure ledger database...</div>}
          {!loading && filteredEmployees.length === 0 && (
            <div style={styles.infoMessage}>No matching employee credentials found.</div>
          )}
          
          {filteredEmployees.map((emp) => (
            <div 
              key={emp.employee_id} 
              style={{
                ...styles.employeeCard,
                borderColor: selectedEmployeeId === emp.employee_id ? 'var(--accent-blue)' : 'var(--panel-border)',
                background: selectedEmployeeId === emp.employee_id ? 'rgba(56, 139, 253, 0.08)' : 'rgba(7, 10, 19, 0.4)'
              }}
              onClick={() => onSelectEmployee(emp)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.cardNameBlock}>
                  <div style={styles.avatar}>👤</div>
                  <div>
                    <h4 style={styles.empName}>{emp.full_name}</h4>
                    <p style={styles.empIdText}>{emp.employee_id}</p>
                  </div>
                </div>
                <span style={
                  emp.status === 'Active' ? styles.statusActive : 
                  emp.status === 'Suspended' ? styles.statusSuspended : styles.statusOffboarded
                }>
                  {emp.status}
                </span>
              </div>
              
              <div style={styles.cardDetails}>
                <div style={styles.detailRow}>
                  <span>Dept:</span><strong>{emp.department}</strong>
                </div>
                <div style={styles.detailRow}>
                  <span>Title:</span><strong>{emp.designation}</strong>
                </div>
              </div>

              {isAdmin && (
                <div style={styles.cardActions}>
                  <button 
                    className="btn btn-secondary" 
                    style={styles.deleteBtn}
                    onClick={(e) => handleDelete(emp.employee_id, e)}
                  >
                    🗑️ Delete Profile
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  listPanel: {
    padding: '24px',
    marginBottom: '20px',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--panel-border)',
    paddingBottom: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
  },
  onboardToggleBtn: {
    padding: '8px 16px',
    fontSize: '13px',
  },
  onboardForm: {
    background: 'rgba(7, 10, 19, 0.7)',
    border: '1px solid var(--panel-border-hover)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
  },
  formSectionTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--accent-cyan)',
    marginBottom: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '10px',
  },
  searchBarContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(7, 10, 19, 0.4)',
  },
  employeeList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  employeeCard: {
    border: '1px solid var(--panel-border)',
    borderRadius: '10px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  cardNameBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    fontSize: '24px',
    background: 'rgba(56, 139, 253, 0.1)',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
  },
  empIdText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  statusActive: {
    background: 'rgba(52, 211, 153, 0.12)',
    color: 'var(--color-success)',
    border: '1px solid rgba(52, 211, 153, 0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusSuspended: {
    background: 'rgba(248, 113, 113, 0.12)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusOffboarded: {
    background: 'rgba(139, 148, 158, 0.12)',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(139, 148, 158, 0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDetails: {
    fontSize: '13px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '10px',
    marginBottom: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    color: 'var(--text-secondary)',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '10px',
    marginTop: 'auto',
  },
  deleteBtn: {
    padding: '4px 8px',
    fontSize: '11px',
    color: 'var(--color-danger)',
    background: 'none',
    border: '1px solid rgba(248, 113, 113, 0.2)',
  },
  errorAlert: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-danger)',
    padding: '12px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  infoMessage: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    padding: '40px 0',
    fontSize: '14px',
  },
};
