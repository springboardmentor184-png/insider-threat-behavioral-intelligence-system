import React, { useEffect, useState } from 'react';

export default function ActivityLogs() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:8000/api/activities'
      );

      if (!response.ok) {
        throw new Error('Failed to load activities');
      }

      const data = await response.json();

      setActivities(data);
      setFilteredActivities(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...activities];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((activity) =>
        activity.employee_name?.toLowerCase().includes(query) ||
        activity.employee_id?.toLowerCase().includes(query) ||
        activity.department?.toLowerCase().includes(query) ||
        activity.activity_type?.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.severity?.toLowerCase().includes(query)
      );
    }

    // Employee
    if (employeeFilter !== 'All') {
      result = result.filter(
        (activity) =>
          activity.employee_id === employeeFilter
      );
    }

    // Severity
    if (severityFilter !== 'All') {
      result = result.filter(
        (activity) =>
          activity.severity === severityFilter
      );
    }

    // Activity type
    if (activityFilter !== 'All') {
      result = result.filter(
        (activity) =>
          activity.activity_type === activityFilter
      );
    }

    // Date
    if (dateFilter) {
      result = result.filter((activity) => {
        const activityDate = new Date(
          activity.timestamp
        )
          .toISOString()
          .slice(0, 10);

        return activityDate === dateFilter;
      });
    }

    setFilteredActivities(result);
  }, [
    activities,
    search,
    employeeFilter,
    severityFilter,
    activityFilter,
    dateFilter
  ]);

  const resetFilters = () => {
    setSearch('');
    setEmployeeFilter('All');
    setSeverityFilter('All');
    setActivityFilter('All');
    setDateFilter('');
  };

  // Unique employees
  const employees = [
    ...new Map(
      activities.map((activity) => [
        activity.employee_id,
        activity.employee_name
      ])
    ).entries()
  ];

  // Unique activity types
  const activityTypes = [
    ...new Set(
      activities
        .map((activity) => activity.activity_type)
        .filter(Boolean)
    )
  ];

  const downloadCSV = () => {
    if (filteredActivities.length === 0) {
      alert('No filtered activity logs available to download.');
      return;
    }

    const headers = [
      'Time',
      'Employee ID',
      'Employee Name',
      'Department',
      'Activity Type',
      'Description',
      'Severity',
      'Risk Contribution'
    ];

    const rows = filteredActivities.map((activity) => [
      activity.timestamp,
      activity.employee_id,
      activity.employee_name,
      activity.department,
      activity.activity_type,
      activity.description,
      activity.severity,
      activity.risk_score_contribution
    ]);

    const csvContent = [
      headers,
      ...rows
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download =
      `activity_logs_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (filteredActivities.length === 0) {
      alert('No filtered activity logs available to download.');
      return;
    }

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow pop-ups to generate the PDF.');
      return;
    }

    const rows = filteredActivities
      .map(
        (activity) => `
          <tr>
            <td>${new Date(
              activity.timestamp
            ).toLocaleString()}</td>

            <td>${activity.employee_id}</td>

            <td>${activity.employee_name}</td>

            <td>${activity.department}</td>

            <td>${activity.activity_type}</td>

            <td>${activity.description}</td>

            <td>${activity.severity}</td>

            <td>${Number(
              activity.risk_score_contribution
            ).toFixed(2)}</td>
          </tr>
        `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Activity Logs Report</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 25px;
              color: #111827;
            }

            h1 {
              margin-bottom: 5px;
            }

            .subtitle {
              color: #64748b;
              margin-bottom: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }

            th {
              background: #f1f5f9;
              font-weight: bold;
            }

            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 7px;
              text-align: left;
              vertical-align: top;
            }

            @media print {
              body {
                padding: 10px;
              }

              button {
                display: none;
              }
            }
          </style>
        </head>

        <body>

          <h1>Insider Threat - Activity Logs</h1>

          <div class="subtitle">
            Filtered records: ${filteredActivities.length}
            <br />
            Generated on ${new Date().toLocaleString()}
          </div>

          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Employee ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Activity</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return {
          background: '#fee2e2',
          color: '#991b1b'
        };

      case 'High':
        return {
          background: '#ffedd5',
          color: '#9a3412'
        };

      case 'Medium':
        return {
          background: '#fef3c7',
          color: '#92400e'
        };

      default:
        return {
          background: '#dcfce7',
          color: '#166534'
        };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '30px' }}>
        <h2>Activity Logs</h2>
        <p>Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>

      {/* HEADER */}
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
            Activity Logs
          </h1>

          <p style={{ color: '#64748b' }}>
            Monitor employee activities and behavioral events
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px'
          }}
        >
          <button
            onClick={fetchActivities}
            style={buttonStyle('#2563eb')}
          >
            Refresh
          </button>

          <button
            onClick={downloadCSV}
            style={buttonStyle('#16a34a')}
          >
            Download CSV
          </button>

          <button
            onClick={downloadPDF}
            style={buttonStyle('#dc2626')}
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* ERROR */}
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

      {/* FILTER PANEL */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}
      >

        <h3
          style={{
            marginTop: 0,
            marginBottom: '15px'
          }}
        >
          Filter Activity Logs
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '2fr 1fr 1fr 1fr 1fr auto',
            gap: '12px',
            alignItems: 'end'
          }}
        >

          {/* SEARCH */}
          <div>
            <label style={labelStyle}>
              Search
            </label>

            <input
              type="text"
              placeholder="Employee, activity, description..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {/* EMPLOYEE */}
          <div>
            <label style={labelStyle}>
              Employee
            </label>

            <select
              value={employeeFilter}
              onChange={(e) =>
                setEmployeeFilter(e.target.value)
              }
              style={inputStyle}
            >
              <option value="All">
                All Employees
              </option>

              {employees.map(
                ([id, name]) => (
                  <option
                    key={id}
                    value={id}
                  >
                    {name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* SEVERITY */}
          <div>
            <label style={labelStyle}>
              Severity
            </label>

            <select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value)
              }
              style={inputStyle}
            >
              <option value="All">
                All
              </option>
              <option value="Critical">
                Critical
              </option>
              <option value="High">
                High
              </option>
              <option value="Medium">
                Medium
              </option>
              <option value="Low">
                Low
              </option>
            </select>
          </div>

          {/* ACTIVITY */}
          <div>
            <label style={labelStyle}>
              Activity Type
            </label>

            <select
              value={activityFilter}
              onChange={(e) =>
                setActivityFilter(e.target.value)
              }
              style={inputStyle}
            >
              <option value="All">
                All Activities
              </option>

              {activityTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}
            </select>
          </div>

          {/* DATE */}
          <div>
            <label style={labelStyle}>
              Date
            </label>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {/* RESET */}
          <button
            onClick={resetFilters}
            style={{
              height: '40px',
              padding: '0 15px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>

        </div>

        {/* RESULT COUNT */}
        <div
          style={{
            marginTop: '15px',
            color: '#64748b',
            fontSize: '14px'
          }}
        >
          Showing{' '}
          <strong>
            {filteredActivities.length}
          </strong>{' '}
          of{' '}
          <strong>
            {activities.length}
          </strong>{' '}
          activity records
        </div>

      </div>

      {/* TABLE */}
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
              <th style={cellStyle}>
                Time
              </th>

              <th style={cellStyle}>
                Employee
              </th>

              <th style={cellStyle}>
                Department
              </th>

              <th style={cellStyle}>
                Activity
              </th>

              <th style={cellStyle}>
                Description
              </th>

              <th style={cellStyle}>
                Severity
              </th>

              <th style={cellStyle}>
                Risk Contribution
              </th>
            </tr>
          </thead>

          <tbody>

            {filteredActivities.map(
              (activity) => (
                <tr key={activity.id}>

                  <td style={cellStyle}>
                    {new Date(
                      activity.timestamp
                    ).toLocaleString()}
                  </td>

                  <td style={cellStyle}>
                    <strong>
                      {activity.employee_name}
                    </strong>

                    <br />

                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}
                    >
                      {activity.employee_id}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    {activity.department}
                  </td>

                  <td style={cellStyle}>
                    {activity.activity_type}
                  </td>

                  <td
                    style={{
                      ...cellStyle,
                      maxWidth: '350px'
                    }}
                  >
                    {activity.description}
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        ...getSeverityStyle(
                          activity.severity
                        ),
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {activity.severity}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <strong>
                      +
                      {Number(
                        activity.risk_score_contribution
                      ).toFixed(2)}
                    </strong>
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

        {filteredActivities.length === 0 && (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#64748b'
            }}
          >
            No activity logs match the selected filters.
          </div>
        )}

      </div>

    </div>
  );
}

const buttonStyle = (background) => ({
  padding: '10px 18px',
  border: 'none',
  borderRadius: '6px',
  background,
  color: 'white',
  cursor: 'pointer'
});

const inputStyle = {
  width: '100%',
  height: '40px',
  padding: '0 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  boxSizing: 'border-box',
  background: 'white'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '13px',
  color: '#475569',
  fontWeight: '600'
};

const cellStyle = {
  padding: '14px 12px',
  textAlign: 'left',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '14px',
  verticalAlign: 'top'
};