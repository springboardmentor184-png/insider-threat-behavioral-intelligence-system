import React from 'react';
import {
  Users,
  Bell,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  ShieldAlert,
  FolderOpen,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard({
  data,
  alerts = [],
  loading,
  setCurrentTab,
  onViewEmployee
}) {
  if (loading || !data) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px'
        }}
      >
        <p style={{ color: '#475569', fontWeight: 600 }}>
          Loading security telemetry...
        </p>
      </div>
    );
  }

  const {
    stats,
    trends = [],
    high_risk_employees = []
  } = data;

  /* -----------------------------
     Derived Statistics
  ----------------------------- */

  const openAlerts = alerts.filter(
    alert => alert.status === 'Open'
  ).length;

  const investigatingAlerts = alerts.filter(
    alert => alert.status === 'Investigating'
  ).length;

  const resolvedAlerts = alerts.filter(
    alert => alert.status === 'Resolved'
  ).length;

  const criticalAlerts = alerts.filter(
    alert => alert.severity === 'Critical'
  ).length;

  const highAlerts = alerts.filter(
    alert => alert.severity === 'High'
  ).length;

  const mediumAlerts = alerts.filter(
    alert => alert.severity === 'Medium'
  ).length;

  const lowRiskEmployees = high_risk_employees.filter(
    emp => Number(emp.risk_score) < 40
  ).length;

  const mediumRiskEmployees = high_risk_employees.filter(
    emp =>
      Number(emp.risk_score) >= 40 &&
      Number(emp.risk_score) < 70
  ).length;

  const highRiskEmployees = high_risk_employees.filter(
    emp =>
      Number(emp.risk_score) >= 70 &&
      Number(emp.risk_score) < 90
  ).length;

  const criticalRiskEmployees = high_risk_employees.filter(
    emp => Number(emp.risk_score) >= 90
  ).length;

  const totalRiskUsers =
    lowRiskEmployees +
    mediumRiskEmployees +
    highRiskEmployees +
    criticalRiskEmployees;

  const getRiskLevel = score => {
    if (score >= 90) return 'Critical';
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  const getRiskColors = score => {
    if (score >= 90) {
      return {
        bg: '#fee2e2',
        text: '#dc2626'
      };
    }

    if (score >= 70) {
      return {
        bg: '#ffedd5',
        text: '#ea580c'
      };
    }

    if (score >= 40) {
      return {
        bg: '#fef3c7',
        text: '#ca8a04'
      };
    }

    return {
      bg: '#dcfce7',
      text: '#16a34a'
    };
  };

  const maxTrend = Math.max(
    ...trends.map(
      t => t.critical + t.high + t.medium
    ),
    1
  );

  /* -----------------------------
     Donut calculations
  ----------------------------- */

  const totalThreats =
    criticalAlerts +
    highAlerts +
    mediumAlerts;

  const criticalPercent =
    totalThreats > 0
      ? (criticalAlerts / totalThreats) * 100
      : 0;

  const highPercent =
    totalThreats > 0
      ? (highAlerts / totalThreats) * 100
      : 0;

  const mediumPercent =
    totalThreats > 0
      ? (mediumAlerts / totalThreats) * 100
      : 0;

  return (
    <div>

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <h2
              className="page-title"
              style={{ marginBottom: '4px' }}
            >
              Executive Risk Dashboard
            </h2>

            <span
              style={{
                background: '#dbeafe',
                color: '#2563eb',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={15} />
            </span>
          </div>

          <p className="page-subtitle">
            Real-time security posture, insider risk analytics,
            and threat intelligence overview
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => setCurrentTab('alerts')}
            style={{
              border: '1px solid #dbe3ef',
              background: 'white',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#334155'
            }}
          >
            View Alerts
          </button>

          <button
            onClick={() => setCurrentTab('logs')}
            style={{
              border: '1px solid #dbe3ef',
              background: 'white',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#334155'
            }}
          >
            Activity Logs
          </button>
        </div>
      </div>


      {/* =====================================
          KPI CARDS
      ====================================== */}

      <div
        className="metrics-row"
        style={{
          gridTemplateColumns:
            'repeat(6, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >

        <MetricCard
          title="Total Monitored Users"
          value={stats.total_users}
          icon={<Users size={20} />}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          onClick={() => setCurrentTab('employees')}
        />

        <MetricCard
          title="Total Security Alerts"
          value={stats.total_alerts}
          icon={<Bell size={20} />}
          iconBg="#ede9fe"
          iconColor="#7c3aed"
          onClick={() => setCurrentTab('alerts')}
        />

        <MetricCard
          title="High-Risk Users"
          value={stats.high_risk_users}
          icon={<AlertTriangle size={20} />}
          iconBg="#ffedd5"
          iconColor="#f97316"
          onClick={() => setCurrentTab('employees')}
        />

        <MetricCard
          title="Critical Incidents"
          value={stats.critical_incidents}
          icon={<AlertOctagon size={20} />}
          iconBg="#fee2e2"
          iconColor="#ef4444"
          onClick={() => setCurrentTab('alerts')}
        />

        <MetricCard
          title="Open Incidents"
          value={openAlerts}
          icon={<FolderOpen size={20} />}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          onClick={() => setCurrentTab('alerts')}
        />

        <MetricCard
          title="Resolved Incidents"
          value={resolvedAlerts}
          icon={<CheckCircle size={20} />}
          iconBg="#dcfce7"
          iconColor="#16a34a"
          onClick={() => setCurrentTab('alerts')}
        />

      </div>


      {/* =====================================
          MAIN GRID
      ====================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.7fr) minmax(320px, 1fr)',
          gap: '18px',
          marginBottom: '18px'
        }}
      >

        {/* THREAT TRENDS */}

        <div className="section-card">

          <div
            className="section-header"
            style={{
              marginBottom: '15px'
            }}
          >
            <div>
              <h3
                className="section-title"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <TrendingUp
                  size={18}
                  style={{ color: '#2563eb' }}
                />

                Threat Trends
              </h3>

              <span
                style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}
              >
                Grouped by severity • Last 7 days
              </span>
            </div>

            <select
              style={{
                border: '1px solid #dbe3ef',
                borderRadius: '7px',
                padding: '7px 10px',
                background: 'white'
              }}
              defaultValue="7"
            >
              <option value="7">
                Last 7 Days
              </option>
            </select>
          </div>


          {/* Chart */}

          <div
            style={{
              height: '250px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: '18px',
              padding:
                '20px 15px 5px 15px',
              borderBottom:
                '1px solid #e2e8f0'
            }}
          >

            {trends.map((item, index) => {

              const total =
                item.critical +
                item.high +
                item.medium;

              const height =
                total > 0
                  ? (total / maxTrend) * 180
                  : 0;

              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    minWidth: '20px'
                  }}
                >

                  <div
                    style={{
                      width: '28px',
                      height: `${height}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      borderRadius:
                        '5px 5px 0 0',
                      overflow: 'hidden'
                    }}
                  >

                    <div
                      title={`Critical: ${item.critical}`}
                      style={{
                        height:
                          total > 0
                            ? `${(item.critical / total) * 100}%`
                            : '0%',
                        background: '#ef4444'
                      }}
                    />

                    <div
                      title={`High: ${item.high}`}
                      style={{
                        height:
                          total > 0
                            ? `${(item.high / total) * 100}%`
                            : '0%',
                        background: '#f97316'
                      }}
                    />

                    <div
                      title={`Medium: ${item.medium}`}
                      style={{
                        height:
                          total > 0
                            ? `${(item.medium / total) * 100}%`
                            : '0%',
                        background: '#eab308'
                      }}
                    />

                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      marginTop: '8px'
                    }}
                  >
                    {item.date}
                  </span>

                </div>
              );
            })}

          </div>


          {/* Legend */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '14px'
            }}
          >

            <Legend
              color="#ef4444"
              label="Critical"
            />

            <Legend
              color="#f97316"
              label="High"
            />

            <Legend
              color="#eab308"
              label="Medium"
            />

          </div>

        </div>


        {/* HIGH RISK USERS */}

        <div className="section-card">

          <div
            className="section-header"
            style={{
              marginBottom: '5px'
            }}
          >

            <h3
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert
                size={18}
                style={{ color: '#ef4444' }}
              />

              High Insider Risk Profiles
            </h3>

            <button
              onClick={() =>
                setCurrentTab('employees')
              }
              style={{
                border: 'none',
                background: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              View All →
            </button>

          </div>


          <div>

            {high_risk_employees.map(emp => {

              const colors =
                getRiskColors(
                  Number(emp.risk_score)
                );

              return (
                <div
                  key={emp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom:
                      '1px solid #eef2f7',
                    gap: '10px'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      minWidth: 0
                    }}
                  >

                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background:
                          colors.bg,
                        color:
                          colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}
                    >
                      {emp.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>

                    <div>

                      <button
                        onClick={() =>
                          onViewEmployee(emp.id)
                        }
                        style={{
                          border: 'none',
                          background: 'none',
                          padding: 0,
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        {emp.name}
                      </button>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          marginTop: '3px'
                        }}
                      >
                        {emp.id}
                        {' • '}
                        {emp.department}
                        {' • '}
                        {emp.privilege_level}
                      </div>

                    </div>

                  </div>


                  <div
                    style={{
                      minWidth: '55px',
                      textAlign: 'center',
                      padding: '7px 9px',
                      borderRadius: '8px',
                      background: colors.bg,
                      color: colors.text,
                      fontWeight: 800
                    }}
                  >
                    {Number(emp.risk_score).toFixed(1)}

                    <div
                      style={{
                        fontSize: '9px',
                        fontWeight: 600
                      }}
                    >
                      {getRiskLevel(
                        Number(emp.risk_score)
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>


      {/* =====================================
          SECOND ROW
      ====================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr 1.4fr',
          gap: '18px',
          marginBottom: '18px'
        }}
      >

        {/* THREAT DISTRIBUTION */}

        <div className="section-card">

          <h3
            className="section-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Activity
              size={17}
              style={{ color: '#2563eb' }}
            />

            Threat Distribution
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '18px'
            }}
          >

            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: `conic-gradient(
                  #ef4444 0 ${criticalPercent}%,
                  #f97316 ${criticalPercent}% ${criticalPercent + highPercent}%,
                  #eab308 ${criticalPercent + highPercent}% 100%
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >

              <div
                style={{
                  width: '78px',
                  height: '78px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >

                <strong
                  style={{
                    fontSize: '22px'
                  }}
                >
                  {totalThreats}
                </strong>

                <span
                  style={{
                    fontSize: '10px',
                    color: '#64748b'
                  }}
                >
                  Total
                </span>

              </div>

            </div>


            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >

              <DistributionRow
                color="#ef4444"
                label="Critical"
                value={criticalAlerts}
              />

              <DistributionRow
                color="#f97316"
                label="High"
                value={highAlerts}
              />

              <DistributionRow
                color="#eab308"
                label="Medium"
                value={mediumAlerts}
              />

            </div>

          </div>

        </div>


        {/* ALERT STATUS */}

        <div className="section-card">

          <h3
            className="section-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Bell
              size={17}
              style={{ color: '#2563eb' }}
            />

            Alert Status
          </h3>


          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginTop: '18px'
            }}
          >

            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: `conic-gradient(
                  #2563eb 0 ${
                    alerts.length
                      ? (resolvedAlerts / alerts.length) * 100
                      : 0
                  }%,
                  #f97316 ${
                    alerts.length
                      ? (resolvedAlerts / alerts.length) * 100
                      : 0
                  }% ${
                    alerts.length
                      ? ((resolvedAlerts + investigatingAlerts) /
                          alerts.length) *
                        100
                      : 0
                  }%,
                  #ef4444 ${
                    alerts.length
                      ? ((resolvedAlerts + investigatingAlerts) /
                          alerts.length) *
                        100
                      : 0
                  }% 100%
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >

              <div
                style={{
                  width: '78px',
                  height: '78px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '20px'
                }}
              >
                {alerts.length}
              </div>

            </div>


            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >

              <DistributionRow
                color="#ef4444"
                label="Open"
                value={openAlerts}
              />

              <DistributionRow
                color="#f97316"
                label="Investigating"
                value={investigatingAlerts}
              />

              <DistributionRow
                color="#2563eb"
                label="Resolved"
                value={resolvedAlerts}
              />

            </div>

          </div>

        </div>


        {/* RECENT CRITICAL ALERTS */}

        <div className="section-card">

          <div
            className="section-header"
          >

            <h3
              className="section-title"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertOctagon
                size={17}
                style={{
                  color: '#ef4444'
                }}
              />

              Recent Critical Alerts
            </h3>

            <button
              onClick={() =>
                setCurrentTab('alerts')
              }
              style={{
                border: 'none',
                background: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              View All →
            </button>

          </div>


          <div>

            {alerts
              .filter(
                a => a.severity === 'Critical'
              )
              .slice(0, 4)
              .map(alert => (

                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '11px 0',
                    borderBottom:
                      '1px solid #eef2f7'
                  }}
                >

                  <AlertOctagon
                    size={17}
                    style={{
                      color: '#ef4444',
                      flexShrink: 0
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0
                    }}
                  >

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '13px'
                      }}
                    >
                      {alert.threat_type}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8'
                      }}
                    >
                      {alert.employee_name}
                      {' • '}
                      {alert.department}
                    </div>

                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      padding: '4px 7px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}
                  >
                    Critical
                  </span>

                </div>

              ))}

            {alerts.filter(
              a => a.severity === 'Critical'
            ).length === 0 && (
              <div
                style={{
                  padding: '30px 10px',
                  textAlign: 'center',
                  color: '#64748b'
                }}
              >
                No critical alerts
              </div>
            )}

          </div>

        </div>

      </div>


      {/* =====================================
          SECURITY POSTURE
      ====================================== */}

      <div className="section-card">

        <div
          className="section-header"
          style={{
            marginBottom: '18px'
          }}
        >

          <h3
            className="section-title"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck
              size={18}
              style={{
                color: '#2563eb'
              }}
            />

            Security Posture Summary
          </h3>

          <span
            style={{
              fontSize: '12px',
              color: '#64748b'
            }}
          >
            Live telemetry
          </span>

        </div>


        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(5, 1fr)',
            gap: '0'
          }}
        >

          <PostureItem
            title="Overall Risk Score"
            value={
              stats.high_risk_users > 0
                ? 'High'
                : 'Low'
            }
            detail={`${stats.high_risk_users} high-risk users`}
            color="#f97316"
          />

          <PostureItem
            title="Attack Surface"
            value={
              stats.critical_incidents > 0
                ? 'High'
                : 'Medium'
            }
            detail="Based on active threats"
            color="#ef4444"
          />

          <PostureItem
            title="Open Investigations"
            value={openAlerts}
            detail="Require analyst review"
            color="#2563eb"
          />

          <PostureItem
            title="User Behavior Anomalies"
            value={stats.total_alerts}
            detail="Detected by telemetry"
            color="#7c3aed"
          />

          <PostureItem
            title="Monitoring Coverage"
            value="100%"
            detail="Users actively monitored"
            color="#16a34a"
          />

        </div>

      </div>

    </div>
  );
}


/* ==========================================
   COMPONENTS
========================================== */

function MetricCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  onClick
}) {
  return (
    <div
      className="metric-card"
      onClick={onClick}
      style={{
        cursor: onClick
          ? 'pointer'
          : 'default',
        minWidth: 0
      }}
    >

      <div className="metric-info">

        <span className="metric-label">
          {title}
        </span>

        <span
          className="metric-value"
          style={{
            fontSize: '27px'
          }}
        >
          {value}
        </span>

      </div>

      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>

    </div>
  );
}


function Legend({ color, label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#475569'
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: color
        }}
      />

      {label}
    </div>
  );
}


function DistributionRow({
  color,
  label,
  value
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        minWidth: '115px'
      }}
    >

      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          fontSize: '12px',
          color: '#475569'
        }}
      >

        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color
          }}
        />

        {label}

      </span>

      <strong
        style={{
          fontSize: '13px'
        }}
      >
        {value}
      </strong>

    </div>
  );
}


function PostureItem({
  title,
  value,
  detail,
  color
}) {
  return (
    <div
      style={{
        padding: '4px 20px',
        borderRight:
          '1px solid #e2e8f0'
      }}
    >

      <div
        style={{
          fontSize: '11px',
          color: '#64748b',
          marginBottom: '7px'
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '21px',
          fontWeight: 800,
          color: color
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: '10px',
          color: '#94a3b8',
          marginTop: '3px'
        }}
      >
        {detail}
      </div>

    </div>
  );
}