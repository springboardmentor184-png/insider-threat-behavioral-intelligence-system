import React from 'react';

export default function Profile({ user }) {
  return (
    <div style={{ padding: '30px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ margin: 0 }}>My Profile</h1>
        <p style={{ color: '#64748b' }}>
          View your Insider AI account information
        </p>
      </div>

      <div
        style={{
          maxWidth: '700px',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '30px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#dbeafe',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold'
            }}
          >
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : 'S'}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>
              {user?.name || 'Security Manager'}
            </h2>

            <p style={{ color: '#64748b', margin: '5px 0' }}>
              {user?.role || 'Security Manager'}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}
        >
          <InfoCard
            label="Name"
            value={user?.name || 'Security Manager'}
          />

          <InfoCard
            label="Role"
            value={user?.role || 'Security Manager'}
          />

          <InfoCard
            label="Account Status"
            value="Active"
          />

          <InfoCard
            label="Access Level"
            value="Security Operations"
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        padding: '18px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}
    >
      <div
        style={{
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '6px'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: '600',
          color: '#0f172a'
        }}
      >
        {value}
      </div>
    </div>
  );
}