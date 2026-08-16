import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function EmployeeDetails({ employeeId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [riskHistory, setRiskHistory] = useState([]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8000/api/employees/${employeeId}`
      );

      if (!response.ok) {
        throw new Error('Employee not found');
      }

      const result = await response.json();

      setData(result);
      setError('');
      const riskResponse = await fetch(
  `http://localhost:8000/api/employees/${employeeId}/risk-history`
);

if (riskResponse.ok) {
  const riskData = await riskResponse.json();
  setRiskHistory(riskData.history || []);
}
    } catch (err) {
      console.error(err);
      setError('Unable to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

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

  const getSeverityStyle = (severity) => {
    if (severity === 'Critical') {
      return {
        background: '#fee2e2',
        color: '#991b1b'
      };
    }

    if (severity === 'High') {
      return {
        background: '#ffedd5',
        color: '#9a3412'
      };
    }

    if (severity === 'Medium') {
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
        <h2>Employee Details</h2>
        <p>Loading employee information...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '30px' }}>
        <button
          onClick={onBack}
          style={backButtonStyle}
        >
          ← Back to Employees
        </button>

        <p style={{ marginTop: '20px', color: '#dc2626' }}>
          {error}
        </p>
      </div>
    );
  }

  const employee = data.employee;
  const activities = data.activities || [];

  const riskScore = Number(employee.risk_score);
  const riskLevel = getRiskLevel(riskScore);
  const chartData = riskHistory.map((item) => ({
  time: new Date(item.timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }),
  risk: Number(item.risk_score),
  activity: item.activity_type,
  severity: item.severity
}));

  const criticalCount = activities.filter(
    (a) => a.severity === 'Critical'
  ).length;

  const highCount = activities.filter(
    (a) => a.severity === 'High'
  ).length;

  const mediumCount = activities.filter(
    (a) => a.severity === 'Medium'
  ).length;

  const lowCount = activities.filter(
    (a) => a.severity === 'Low'
  ).length;

  const totalRiskContribution = activities.reduce(
    (total, activity) =>
      total + Number(activity.risk_score_contribution || 0),
    0
  );

  return (
    <div style={{ padding: '30px' }}>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '25px'
        }}
      >
        <div>
          <button
            onClick={onBack}
            style={backButtonStyle}
          >
            ← Back to Employees
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginTop: '15px'
            }}
          >
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '700'
              }}
            >
              {employee.name
                .split(' ')
                .map((name) => name[0])
                .join('')
                .toUpperCase()}
            </div>

            <div>
              <h1 style={{ margin: 0 }}>
                {employee.name}
              </h1>

              <p
                style={{
                  color: '#64748b',
                  margin: '5px 0 0'
                }}
              >
                {employee.id} • {employee.department}
              </p>
            </div>
          </div>
        </div>

        <span
          style={{
            ...getRiskStyle(riskLevel),
            padding: '9px 16px',
            borderRadius: '20px',
            fontWeight: '700'
          }}
        >
          {riskLevel.toUpperCase()}
        </span>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '25px'
        }}
      >
        <InfoCard
          title="Risk Score"
          value={`${riskScore.toFixed(2)} / 100`}
        />

        <InfoCard
          title="Total Activities"
          value={activities.length}
        />

        <InfoCard
          title="Critical Activities"
          value={criticalCount}
        />

        <InfoCard
          title="Risk Contribution"
          value={totalRiskContribution.toFixed(2)}
        />
      </div>

      {/* Risk Meter */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '22px',
          marginBottom: '25px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}
        >
          <strong>Current Risk Level</strong>

          <strong>
            {riskScore.toFixed(2)}%
          </strong>
        </div>

        <div
          style={{
            height: '12px',
            background: '#e2e8f0',
            borderRadius: '20px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${Math.min(riskScore, 100)}%`,
              height: '100%',
              background:
                riskLevel === 'Critical'
                  ? '#dc2626'
                  : riskLevel === 'High'
                    ? '#ea580c'
                    : riskLevel === 'Medium'
                      ? '#ca8a04'
                      : '#16a34a',
              borderRadius: '20px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            color: '#94a3b8',
            fontSize: '12px'
          }}
        >
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Critical</span>
        </div>
      </div>

{/* Risk Trend */}
<div
  style={{
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '22px',
    marginBottom: '25px'
  }}
>
  <div style={{ marginBottom: '20px' }}>
    <h2 style={{ margin: 0 }}>
      Risk Trend
    </h2>

    <p
      style={{
        color: '#64748b',
        marginTop: '6px'
      }}
    >
      Employee risk score based on recorded activities
    </p>
  </div>

  {chartData.length > 0 ? (
    <div style={{ width: '100%', height: '320px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 20,
            left: 10,
            bottom: 10
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            formatter={(value) => [
              `${Number(value).toFixed(2)}`,
              'Risk Score'
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />

          <Line
            type="monotone"
            dataKey="risk"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <div
      style={{
        height: '250px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b'
      }}
    >
      No historical risk data available.
    </div>
  )}
</div>

      {/* Employee Information */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '25px'
        }}
      >
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Employee Information
          </h2>

          <InfoRow
            label="Employee ID"
            value={employee.id}
          />

          <InfoRow
            label="Department"
            value={employee.department}
          />

          <InfoRow
            label="Privilege Level"
            value={employee.privilege_level}
          />

          <InfoRow
            label="Account Status"
            value={employee.status}
          />
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Activity Summary
          </h2>

          <InfoRow
            label="Critical"
            value={criticalCount}
          />

          <InfoRow
            label="High"
            value={highCount}
          />

          <InfoRow
            label="Medium"
            value={mediumCount}
          />

          <InfoRow
            label="Low"
            value={lowCount}
          />
        </div>
      </div>

      {/* Activity History */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2 style={{ margin: 0 }}>
            Activity History
          </h2>

          <p style={{ color: '#64748b' }}>
            Recent activities associated with this employee
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={cellStyle}>Time</th>
                <th style={cellStyle}>Activity</th>
                <th style={cellStyle}>Description</th>
                <th style={cellStyle}>Severity</th>
                <th style={cellStyle}>Risk Contribution</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td style={cellStyle}>
                    {new Date(
                      activity.timestamp
                    ).toLocaleString()}
                  </td>

                  <td style={cellStyle}>
                    <strong>
                      {activity.activity_type}
                    </strong>
                  </td>

                  <td style={cellStyle}>
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
                    +
                    {Number(
                      activity.risk_score_contribution
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activities.length === 0 && (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: '#64748b'
            }}
          >
            No activity history available.
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '20px'
      }}
    >
      <div
        style={{
          color: '#64748b',
          fontSize: '13px',
          marginBottom: '8px'
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '21px',
          fontWeight: '700'
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f1f5f9'
      }}
    >
      <span style={{ color: '#64748b' }}>
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}

const sectionStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '20px'
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: '15px'
};

const backButtonStyle = {
  padding: '8px 14px',
  border: '1px solid #cbd5e1',
  background: 'white',
  borderRadius: '6px',
  cursor: 'pointer'
};

const cellStyle = {
  padding: '14px 12px',
  textAlign: 'left',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '14px',
  verticalAlign: 'top'
};