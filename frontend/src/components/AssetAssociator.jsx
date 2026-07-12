import React, { useState, useEffect } from 'react';

export default function AssetAssociator({ token, currentUser, employee, onRefreshEmployee }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Privilege Edit States
  const [editingPrivileges, setEditingPrivileges] = useState(false);
  const [privilegeInput, setPrivilegeInput] = useState('');

  // Device Form States
  const [deviceName, setDeviceName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');

  // Asset Form States
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Git Repository');
  const [accessLevel, setAccessLevel] = useState('Read');

  const canModify = currentUser.role === 'Administrator' || currentUser.role === 'Security Manager';

  useEffect(() => {
    if (employee) {
      setPrivilegeInput(employee.access_privileges || '');
      setError('');
      setSuccess('');
    }
  }, [employee]);

  if (!employee) {
    return (
      <div className="glass-panel" style={styles.emptyContainer}>
        <div style={styles.emptyShield}>🛡️</div>
        <h4>No Profile Selected</h4>
        <p style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
          Select an employee from the directory ledger to manage device bindings, network assets, and privilege access logs.
        </p>
      </div>
    );
  }

  const handleUpdatePrivileges = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/employees/${employee.employee_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ access_privileges: privilegeInput }),
      });
      if (!res.ok) throw new Error('Failed to update access privileges');
      setSuccess('Privilege profile updated successfully.');
      setEditingPrivileges(false);
      onRefreshEmployee();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!deviceName || !ipAddress) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/employees/${employee.employee_id}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          device_name: deviceName,
          ip_address: ipAddress,
          mac_address: macAddress,
          status: 'Active'
        })
      });
      if (!res.ok) throw new Error('Failed to associate device');
      
      // Reset device form
      setDeviceName('');
      setIpAddress('');
      setMacAddress('');
      setSuccess('Device binded to employee registry.');
      onRefreshEmployee();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('Remove this device binding from employee registry?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/employees/${employee.employee_id}/devices/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove device binding');
      setSuccess('Device mapping removed.');
      onRefreshEmployee();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!assetName) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/employees/${employee.employee_id}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset_name: assetName,
          asset_type: assetType,
          access_level: accessLevel
        })
      });
      if (!res.ok) throw new Error('Failed to associate asset');
      
      // Reset asset form
      setAssetName('');
      setSuccess('Enterprise asset permissions assigned.');
      onRefreshEmployee();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Revoke access privileges to this asset?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/employees/${employee.employee_id}/assets/${assetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to revoke asset mapping');
      setSuccess('Asset mapping revoked.');
      onRefreshEmployee();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert privileges CSV into array
  const privilegeList = employee.access_privileges
    ? employee.access_privileges.split(',').map(p => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="glass-panel fade-in" style={styles.container}>
      <h3 style={styles.title}>Secure Asset & Privilege Association</h3>
      <p style={styles.subtitle}>Identity: {employee.full_name} ({employee.employee_id})</p>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      {/* Profile Details */}
      <div style={styles.profileRow}>
        <div style={styles.profileItem}>
          <span style={styles.profileLabel}>Manager</span>
          <span style={styles.profileVal}>{employee.manager || 'N/A'}</span>
        </div>
        <div style={styles.profileItem}>
          <span style={styles.profileLabel}>Mapped Department</span>
          <span style={styles.profileVal}>{employee.department}</span>
        </div>
        <div style={styles.profileItem}>
          <span style={styles.profileLabel}>Privilege Status</span>
          <span style={{
            ...styles.profileVal, 
            color: employee.status === 'Active' ? 'var(--color-success)' : 'var(--color-danger)'
          }}>{employee.status}</span>
        </div>
      </div>

      {/* Privileges Block */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Access Privileges ({privilegeList.length})</h4>
          {canModify && !editingPrivileges && (
            <button className="btn btn-secondary" style={styles.editBtn} onClick={() => setEditingPrivileges(true)}>
              ✏️ Modify Privileges
            </button>
          )}
        </div>

        {editingPrivileges ? (
          <div style={styles.privilegeEditor} className="fade-in">
            <textarea
              className="form-textarea"
              rows="2"
              value={privilegeInput}
              onChange={(e) => setPrivilegeInput(e.target.value)}
              placeholder="e.g. AWS_ADMIN, DATABASE_WRITE, LOCAL_ADMIN"
            />
            <div style={styles.editorActions}>
              <button className="btn btn-primary" style={styles.editorBtn} onClick={handleUpdatePrivileges} disabled={loading}>
                Save Changes
              </button>
              <button className="btn btn-secondary" style={styles.editorBtn} onClick={() => setEditingPrivileges(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.privilegeContainer}>
            {privilegeList.length === 0 ? (
              <p style={styles.noneMessage}>No system privileges registered for this profile.</p>
            ) : (
              privilegeList.map((priv, idx) => (
                <span key={idx} style={styles.privilegeTag}>{priv}</span>
              ))
            )}
          </div>
        )}
      </div>

      {/* Devices Block */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Associated Corporate Devices</h4>
        <div style={styles.deviceList}>
          {employee.devices.length === 0 ? (
            <p style={styles.noneMessage}>No registered physical devices mapped to this employee.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Device</th>
                  <th style={styles.th}>IP Address</th>
                  <th style={styles.th}>MAC Address</th>
                  {canModify && <th style={styles.th}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {employee.devices.map((device) => (
                  <tr key={device.id} style={styles.tr}>
                    <td style={styles.td}>💻 {device.device_name}</td>
                    <td style={styles.td}>{device.ip_address}</td>
                    <td style={styles.td}>{device.mac_address || 'Unknown'}</td>
                    {canModify && (
                      <td style={styles.td}>
                        <button style={styles.actionBtn} onClick={() => handleDeleteDevice(device.id)}>Revoke</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {canModify && (
          <form onSubmit={handleAddDevice} style={styles.associationForm}>
            <h5 style={styles.subFormTitle}>Register Corporate Device</h5>
            <div style={styles.formRow}>
              <input
                type="text"
                className="form-input"
                placeholder="Device Name (e.g. Dell Latititude)"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                style={{flex: 2}}
              />
              <input
                type="text"
                className="form-input"
                placeholder="IP (e.g. 10.12.4.99)"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                required
                style={{flex: 1.5}}
              />
              <input
                type="text"
                className="form-input"
                placeholder="MAC (e.g. 00:1A:2B:3C:4D:5E)"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                style={{flex: 1.5}}
              />
              <button type="submit" className="btn btn-primary" style={styles.addBtn} disabled={loading}>
                Bind Device
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Assets Block */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Authorized Security Assets</h4>
        <div style={styles.deviceList}>
          {employee.assets.length === 0 ? (
            <p style={styles.noneMessage}>No system components or secure repositories mapped to this employee.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Asset Name</th>
                  <th style={styles.th}>Asset Type</th>
                  <th style={styles.th}>Access Level</th>
                  {canModify && <th style={styles.th}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {employee.assets.map((asset) => (
                  <tr key={asset.id} style={styles.tr}>
                    <td style={styles.td}>🔑 {asset.asset_name}</td>
                    <td style={styles.td}>{asset.asset_type}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.accessBadge,
                        color: asset.access_level === 'Admin' ? 'var(--color-danger)' : 
                               asset.access_level === 'Write' ? 'var(--color-warning)' : 'var(--color-info)'
                      }}>
                        {asset.access_level}
                      </span>
                    </td>
                    {canModify && (
                      <td style={styles.td}>
                        <button style={styles.actionBtn} onClick={() => handleDeleteAsset(asset.id)}>Revoke</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {canModify && (
          <form onSubmit={handleAddAsset} style={styles.associationForm}>
            <h5 style={styles.subFormTitle}>Authorize Secure Asset Access</h5>
            <div style={styles.formRow}>
              <input
                type="text"
                className="form-input"
                placeholder="Asset Name (e.g. Customer DB)"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                required
                style={{flex: 2}}
              />
              <select
                className="form-select"
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                style={{flex: 1}}
              >
                <option value="Git Repository">Git Repository</option>
                <option value="SQL Database">SQL Database</option>
                <option value="Active Directory">Active Directory</option>
                <option value="AWS S3 Bucket">AWS S3 Bucket</option>
                <option value="HR Portal Console">HR Portal Console</option>
              </select>
              <select
                className="form-select"
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                style={{flex: 1}}
              >
                <option value="Read">Read</option>
                <option value="Write">Write</option>
                <option value="Admin">Admin</option>
              </select>
              <button type="submit" className="btn btn-primary" style={styles.addBtn} disabled={loading}>
                Bind Asset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
  },
  emptyContainer: {
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center',
    minHeight: '400px',
  },
  emptyShield: {
    fontSize: '56px',
    animation: 'pulse 2s infinite ease-in-out',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '2px',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--accent-cyan)',
    marginBottom: '20px',
    fontFamily: 'var(--font-heading)',
  },
  profileRow: {
    display: 'flex',
    gap: '16px',
    background: 'rgba(7, 10, 19, 0.4)',
    border: '1px solid var(--panel-border)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  },
  profileItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  profileVal: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    borderTop: '1px solid var(--panel-border)',
    paddingTop: '20px',
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    marginBottom: '12px',
  },
  editBtn: {
    padding: '4px 10px',
    fontSize: '11px',
  },
  privilegeContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  privilegeTag: {
    background: 'rgba(56, 139, 253, 0.1)',
    border: '1px solid rgba(56, 139, 253, 0.3)',
    color: 'var(--accent-blue)',
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.02em',
    textShadow: '0 0 8px rgba(56, 139, 253, 0.5)',
  },
  privilegeEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  editorActions: {
    display: 'flex',
    gap: '10px',
  },
  editorBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  noneMessage: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
  },
  deviceList: {
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    color: 'var(--text-secondary)',
    padding: '10px',
    borderBottom: '1px solid var(--panel-border)',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '10px',
    color: 'var(--text-primary)',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-danger)',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '12px',
  },
  associationForm: {
    background: 'rgba(7, 10, 19, 0.3)',
    border: '1px solid var(--panel-border)',
    borderRadius: '6px',
    padding: '12px',
    marginTop: '12px',
  },
  subFormTitle: {
    fontSize: '12px',
    color: 'var(--accent-cyan)',
    marginBottom: '8px',
    fontWeight: '600',
  },
  formRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addBtn: {
    padding: '8px 16px',
    fontSize: '12px',
  },
  accessBadge: {
    fontWeight: '600',
  },
  errorAlert: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '6px',
    color: 'var(--color-danger)',
    padding: '10px',
    fontSize: '12px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  successAlert: {
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    borderRadius: '6px',
    color: 'var(--color-success)',
    padding: '10px',
    fontSize: '12px',
    marginBottom: '12px',
    textAlign: 'center',
  },
};
