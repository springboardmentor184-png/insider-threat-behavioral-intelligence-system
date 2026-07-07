import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { Eye, Trash2, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EmployeeList = () => {
  const { user } = useContext(AuthContext)
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees')
      setEmployees(res.data)
    } catch (err) {
      console.error("Failed to fetch employees list", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee? This will wipe device linkages.")) {
      try {
        await api.delete(`/employees/${id}`)
        fetchEmployees()
      } catch (err) {
        alert(err.response?.data?.detail || "Delete operation failed due to insufficient permissions.")
      }
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    emp.designation.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.name.toLowerCase().includes(search.toLowerCase())
  )

  const isAdmin = user.role.name === 'Administrator'
  const isAdminOrManager = ['Administrator', 'Security Manager'].includes(user.role.name)

  if (loading) {
    return (
      <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>
        <h2>Loading Personnel Directory...</h2>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem' }}>MONITORED PERSONNEL</h1>
          <p style={{ color: '#94a3b8' }}>Corporate employees registered for telemetry and device tracking.</p>
        </div>
        {isAdminOrManager && (
          <button className="btn btn-primary" onClick={() => navigate('/employees/add')}>
            <Plus size={16} /> Onboard Employee
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: '#64748b' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search by name, designation, department, or corporate ID (e.g. EMP-10023)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Devices</th>
              <th>Privileges</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: '600', color: '#06b6d4' }}>{emp.employee_id}</td>
                  <td style={{ fontWeight: '500', color: '#f8fafc' }}>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department.name}</td>
                  <td>{emp.designation}</td>
                  <td>
                    <span className="badge badge-low" style={{ fontSize: '0.75rem' }}>
                      {emp.devices ? emp.devices.length : 0} Devices
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: '#8b5cf6', fontWeight: '500' }}>
                      {emp.access_privileges}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        <Eye size={14} /> View Details
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.8rem' }}
                          onClick={() => handleDelete(emp.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No personnel matching search criteria found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeList
