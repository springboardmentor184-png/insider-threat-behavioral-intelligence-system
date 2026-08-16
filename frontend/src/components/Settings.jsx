import React, { useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ margin: 0 }}>Settings</h1>
        <p style={{ color: '#64748b' }}>
          Manage security dashboard preferences
        </p>
      </div>

      <div
        style={{
          maxWidth: '750px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <SettingRow
          title="Threat Notifications"
          description="Show security threat notifications in the dashboard"
          enabled={notifications}
          onChange={setNotifications}
        />

        <SettingRow
          title="Email Alerts"
          description="Receive email notifications for high and critical threats"
          enabled={emailAlerts}
          onChange={setEmailAlerts}
        />

        <SettingRow
          title="Automatic Dashboard Refresh"
          description="Automatically refresh security telemetry"
          enabled={autoRefresh}
          onChange={setAutoRefresh}
        />

        <div
          style={{
            padding: '20px',
            background: '#f8fafc'
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: '#64748b'
            }}
          >
            System
          </div>

          <div
            style={{
              marginTop: '8px',
              fontWeight: '600'
            }}
          >
            Insider AI Behavioral Intelligence System
          </div>

          <div
            style={{
              marginTop: '4px',
              color: '#64748b',
              fontSize: '13px'
            }}
          >
            Security Operations Center
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  enabled,
  onChange
}) {
  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <div>
        <div
          style={{
            fontWeight: '600',
            marginBottom: '5px'
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: '#64748b',
            fontSize: '13px'
          }}
        >
          {description}
        </div>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        style={{
          width: '48px',
          height: '26px',
          borderRadius: '20px',
          border: 'none',
          background: enabled ? '#2563eb' : '#cbd5e1',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: enabled ? '25px' : '3px',
            width: '20px',
            height: '20px',
            background: 'white',
            borderRadius: '50%',
            transition: 'left 0.2s'
          }}
        />
      </button>
    </div>
  );
}