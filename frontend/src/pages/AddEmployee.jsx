import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, AlertCircle, Save } from 'lucide-react'

const AddEmployee = () => {
  const [employeeId, setEmployeeId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [departmentId, setDepartmentId] = useState('1')
  const [designation, setDesignation] = useState('')
  const [managerId, setManagerId] = useState('')
  const [accessPrivileges, setAccessPrivileges] = useState('VPN_ACCESS, CODE_READ')
  
  // Device association fields
  const [deviceId, setDeviceId] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [deviceType, setDeviceType] = useState('Laptop')
  const [ipAddress, setIpAddress] = useState('')
  const [macAddress, setMacAddress] = useState('')

  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error("Error loading managers", err))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      employee_id: employeeId,
      name,
      email,
      department_id: parseInt(departmentId),
      designation,
      manager_id: managerId ? parseInt(managerId) : null,
      access_privileges: accessPrivileges,
      devices: deviceId ? [{
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
        ip_address: ipAddress || null,
        mac_address: macAddress || null,
        status: "Active"
      }] : []
    }

    try {
      await api.post('/employees', payload)
      navigate('/employees')
    } catch (err) {
      setError(err.response?.data?.detail || 'Employee onboarding failed. Check ID uniqueness.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/employees')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Directory
        </button>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk' }}>ONBOARD MONITORED PERSONNEL</h1>
        <p style={{ color: '#94a3b8' }}>Register employee details, clearance levels, and assign tracking hardware assets.</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Card: Core Employee Details */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            Personnel Identity
          </h3>

          <div className="form-group">
            <label className="form-label">Employee ID (Surveillance Key)</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. EMP-22941"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="j.doe@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="1">Information Technology</option>
                <option value="2">Engineering</option>
                <option value="3">Finance</option>
                <option value="4">Human Resources</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Senior Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Manager</label>
            <select
              className="form-control"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
            >
              <option value="">No Manager (Root Reporting)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Access Privileges (Comma Separated)</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="VPN_ACCESS, CODE_READ, FINANCE_READ"
              value={accessPrivileges}
              onChange={(e) => setAccessPrivileges(e.target.value)}
            />
          </div>
        </div>

        {/* Right Card: Asset Device Linkage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
              Surveillance Device Mapping (Optional)
            </h3>

            <div className="form-group">
              <label className="form-label">Device Serial / Asset ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. DEV-LAP-9921"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Device Model Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dell Latitude 5420"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Device Classification</label>
              <select
                className="form-control"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
              >
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Mobile">Mobile Device</option>
                <option value="Server">Surveilled Server</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Allocated IP Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="192.168.1.50"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">MAC Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="00:11:22:33:44:55"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '55px', display: 'flex', gap: '0.5rem' }} disabled={loading}>
            <Save size={18} /> {loading ? 'Onboarding Profile...' : 'Finalize Onboarding'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddEmployee
