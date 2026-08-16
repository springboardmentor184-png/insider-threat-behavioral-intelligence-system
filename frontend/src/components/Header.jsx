import React, { useEffect, useState } from 'react';
import { Search, Shield, User } from 'lucide-react';

export default function Header({
  user,
  onSearchEmployee,
  onSearchAlert
}) {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [results, setResults] = useState([]);

  const avatarText = user && user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'SU';

  // Load employees and alerts for search
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const [employeeResponse, alertResponse] =
          await Promise.all([
            fetch('http://localhost:8000/api/employees'),
            fetch('http://localhost:8000/api/alerts')
          ]);

        if (employeeResponse.ok) {
          const employeeData = await employeeResponse.json();
          setEmployees(employeeData);
        }

        if (alertResponse.ok) {
          const alertData = await alertResponse.json();
          setAlerts(alertData);
        }
      } catch (error) {
        console.error('Search data error:', error);
      }
    };

    loadSearchData();
  }, []);

  // Search whenever query changes
  useEffect(() => {
    const searchText = query.trim().toLowerCase();

    if (!searchText) {
      setResults([]);
      return;
    }

    const employeeResults = employees
      .filter(employee =>
        employee.name?.toLowerCase().includes(searchText) ||
        employee.id?.toLowerCase().includes(searchText) ||
        employee.department?.toLowerCase().includes(searchText) ||
        employee.privilege_level?.toLowerCase().includes(searchText)
      )
      .map(employee => ({
        type: 'employee',
        id: employee.id,
        title: employee.name,
        subtitle: `${employee.id} • ${employee.department}`,
        data: employee
      }));

    const alertResults = alerts
      .filter(alert =>
        alert.threat_type?.toLowerCase().includes(searchText) ||
        alert.severity?.toLowerCase().includes(searchText) ||
        alert.employee_id?.toLowerCase().includes(searchText) ||
        alert.reason?.toLowerCase().includes(searchText)
      )
      .map(alert => ({
        type: 'alert',
        id: alert.id,
        title: alert.threat_type,
        subtitle: `${alert.severity} • Employee ${alert.employee_id}`,
        data: alert
      }));

    setResults([
      ...employeeResults.slice(0, 5),
      ...alertResults.slice(0, 5)
    ]);
  }, [query, employees, alerts]);

  const handleResultClick = (result) => {
    if (result.type === 'employee') {
      setQuery('');
      setResults([]);

      if (onSearchEmployee) {
        onSearchEmployee(result.id);
      }
    }

    if (result.type === 'alert') {
      setQuery('');
      setResults([]);

      if (onSearchAlert) {
        onSearchAlert(result.id);
      }
    }
  };

  return (
    <header className="header">

      <div className="header-title-section">
        <Shield
          size={18}
          className="text-secondary"
          style={{ color: '#2563eb' }}
        />

        <h1 className="header-title">
          Security Operations Center
        </h1>
      </div>

      <div className="header-actions">

        {/* SEARCH */}
        <div
          className="search-bar"
          style={{
            position: 'relative'
          }}
        >
          <Search
            size={16}
            className="text-muted"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees, alerts, files..."
            style={{
              outline: 'none'
            }}
          />

          {/* SEARCH RESULTS */}
          {results.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '45px',
                left: 0,
                width: '380px',
                maxHeight: '420px',
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                zIndex: 1000
              }}
            >

              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    background: 'white',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'white';
                  }}
                >
                  <div
                    style={{
                      fontWeight: '600',
                      color: '#0f172a'
                    }}
                  >
                    {result.title}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginTop: '4px'
                    }}
                  >
                    {result.type === 'employee'
                      ? '👤 Employee'
                      : '🚨 Alert'}
                    {' • '}
                    {result.subtitle}
                  </div>
                </button>
              ))}

            </div>
          )}

          {/* NO RESULTS */}
          {query.trim() && results.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '45px',
                left: 0,
                width: '380px',
                padding: '15px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                zIndex: 1000,
                color: '#64748b',
                fontSize: '14px'
              }}
            >
              No matching employees or alerts found.
            </div>
          )}
        </div>

        {/* USER */}
        <div className="user-profile">

          <div className="user-avatar">
            {avatarText}
          </div>

          <div className="user-info">

            <span className="user-name">
              {user ? user.name : 'Security User'}
            </span>

            <span className="user-role">
              {user ? user.role : 'Administrator'}
            </span>

          </div>

        </div>

      </div>
    </header>
  );
}