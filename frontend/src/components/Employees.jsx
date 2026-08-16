import React, { useEffect, useState } from 'react';

export default function Employees({ onViewEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:8000/api/employees'
      );

      if (!response.ok) {
        throw new Error('Failed to load employees');
      }

      const data = await response.json();

      setEmployees(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load employee data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getRiskLevel = (score) => {
    if (score >= 90) return 'Critical';
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const getRiskStyle = (level) => {
    if (level === 'Critical') {
      return {
        background: '#fee2e2',
        color: '#991b1b'
      };
    }

    if (level === 'High') {
      return {
        background: '#ffedd5',
        color: '#9a3412'
      };
    }

    if (level === 'Medium') {
      return {
        background: '#fef3c7',
        color: '#92400e'
      };
    }

    return {
      background: '#dcfce7',
      color: '#166534'
    };
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h2>Employees</h2>
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Employees
          </h1>

          <p style={{ color: '#64748b' }}>
            Employee identity and insider risk information
          </p>
        </div>

        <button
          onClick={fetchEmployees}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderRadius: '6px',
            background: '#2563eb',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '6px',
            background: '#fee2e2',
            color: '#991b1b'
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: 'white',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'auto'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={cellStyle}>Employee ID</th>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Department</th>
              <th style={cellStyle}>Privilege</th>
              <th style={cellStyle}>Risk Score</th>
              <th style={cellStyle}>Risk Level</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => {
              const riskLevel = getRiskLevel(
                Number(employee.risk_score)
              );

              return (
                <tr key={employee.id}>

                  <td style={cellStyle}>
                    {employee.id}
                  </td>

                <td style={cellStyle}>
  <button
    onClick={() => onViewEmployee(employee.id)}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      color: '#2563eb',
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer'
    }}
  >
    {employee.name}
  </button>
</td>

                  <td style={cellStyle}>
                    {employee.department}
                  </td>

                  <td style={cellStyle}>
                    {employee.privilege_level}
                  </td>

                  <td style={cellStyle}>
                    {Number(employee.risk_score).toFixed(2)}
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        ...getRiskStyle(riskLevel),
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {riskLevel}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    {employee.status}
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() =>
                        onViewEmployee(employee.id)
                      }
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: '#64748b'
            }}
          >
            No employees found.
          </div>
        )}
      </div>
    </div>
  );
}

const cellStyle = {
  padding: '14px 12px',
  textAlign: 'left',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '14px'
};