import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, User, Shield, Laptop, ClipboardList } from 'lucide-react'

const EmployeeDetails = () => {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const empRes = await api.get(`/employees/${id}`)
        setEmployee(empRes.data)
        const actRes = await api.get(`/activities?employee_id=${id}`)
        setActivities(actRes.data)
      } catch (err) {
        console.error("Failed to load employee details", err)
      } finally {
        setLoading(false)
      }
    }
    loadDetails()
  }, [id])

  if (loading) {
    return (
      <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>
        <h2>Loading Personnel Profile Telemetry...</h2>
      </div>
    )
  }

  if (!employee) {
    return (
      <div style={{ color: '#ef4444', padding: '3rem', textAlign: 'center' }}>
        <h2>Employee Profile Not Found</h2>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/employees')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Directory
        </button>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk' }}>PERSONNEL PROFILE DOSSIER</h1>
        <p style={{ color: '#94a3b8' }}>Surveillance telemetry and asset mappings for {employee.name}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left: Employee Info Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <User size={40} />
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk', marginBottom: '0.25rem' }}>{employee.name}</h2>
            <p style={{ color: '#06b6d4', fontWeight: '600', fontSize: '0.95rem' }}>{employee.employee_id}</p>
            <span className="badge badge-low" style={{ marginTop: '0.75rem' }}>Active Monitoring</span>

            <div style={{ textAlign: 'left', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</span>
                <span style={{ color: '#f8fafc' }}>{employee.email}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Department</span>
                <span style={{ color: '#f8fafc' }}>{employee.department.name}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Designation</span>
                <span style={{ color: '#f8fafc' }}>{employee.designation}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Reporting Manager</span>
                <span style={{ color: '#f8fafc' }}>{employee.manager ? employee.manager.name : 'None'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Clearance Permissions</span>
                <span style={{ color: '#8b5cf6', fontWeight: '500' }}>{employee.access_privileges}</span>
              </div>
            </div>
          </div>

          {/* Assigned Devices */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4' }}>
              <Laptop size={18} /> Assigned Assets
            </h3>
            {employee.devices && employee.devices.length > 0 ? (
              employee.devices.map(dev => (
                <div key={dev.id} style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: '#080c14', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.9rem' }}>{dev.device_name}</span>
                    <span className="badge badge-low" style={{ fontSize: '0.7rem' }}>{dev.status}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span>ID: {dev.device_id} ({dev.device_type})</span>
                    <span>IP: {dev.ip_address || 'None'}</span>
                    <span>MAC: {dev.mac_address || 'None'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No tracking devices assigned to this profile.</p>
            )}
          </div>
        </div>

        {/* Right: Employee Chronological Activity logs */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={20} style={{ color: '#3b82f6' }} /> BEHAVIOR ACTIVITY TELEMETRY
          </h3>

          <div className="table-container" style={{ flex: 1 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Severity</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activities.length > 0 ? (
                  activities.map(act => (
                    <tr key={act.id}>
                      <td style={{ fontWeight: '500', color: '#f8fafc' }}>{act.event_type}</td>
                      <td>
                        <span className={`badge badge-${act.severity.toLowerCase()}`}>
                          {act.severity}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(act.details)}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(act.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No behaviors registered for this employee yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetails
