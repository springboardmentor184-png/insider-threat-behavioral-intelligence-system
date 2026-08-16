import React, { useState } from 'react';
import { Zap, RefreshCw, AlertOctagon, ShieldAlert, Award } from 'lucide-react';

export default function Simulator({ onSimulationTriggered }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = async (scenario) => {
    try {
      setRunning(true);
      setResult(null);
      const res = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ scenario, data });
        if (onSimulationTriggered) {
          onSimulationTriggered(scenario, data);
        }
      }
    } catch (e) {
      console.error("Error triggering simulation:", e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Insider Threat Simulator</h2>
        <p className="page-subtitle">Test and audit the end-to-end telemetry flow: Ingest Suspicious Activity &rarr; Trigger Alert &rarr; Alert Manager &rarr; Update Dashboard</p>
      </div>

      <div className="simulator-layout">
        {/* Scenarios Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Critical Exfiltration Scenario */}
          <div className="simulator-scenario-card">
            <div className="simulator-scenario-title" style={{ color: '#ef4444' }}>
              <AlertOctagon size={20} />
              Scenario 1: Critical Data Exfiltration
            </div>
            <p className="simulator-scenario-desc">
              Simulates employee Carol Campbell (CCA0846, Finance Department) downloading confidential financial logs and writing them to an unapproved external USB drive.
            </p>
            <div style={{ fontSize: '13px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
              <strong>Expected Output:</strong> Risk score raises by +35.5 (overall score 95.5). Triggers a **Critical Alert**. Automatically logs and sends an email notification to the manager.
            </div>
            <button 
              className="simulator-btn critical" 
              onClick={() => runSimulation('critical_exfiltration')}
              disabled={running}
            >
              {running ? 'Simulating threat...' : 'Simulate Critical Exfiltration'}
            </button>
          </div>

          {/* High Privilege Abuse Scenario */}
          <div className="simulator-scenario-card">
            <div className="simulator-scenario-title" style={{ color: '#f97316' }}>
              <ShieldAlert size={20} />
              Scenario 2: High Privilege Abuse
            </div>
            <p className="simulator-scenario-desc">
              Simulates system admin Edward Vance (ESC1389, Engineering) modifying production database backup node permissions for a suspicious external IP address.
            </p>
            <div style={{ fontSize: '13px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #f97316' }}>
              <strong>Expected Output:</strong> Risk score raises by +19.5 (overall score 82.3). Triggers a **High Alert**. Logs and triggers a manager alert email.
            </div>
            <button 
              className="simulator-btn high" 
              onClick={() => runSimulation('high_privilege_abuse')}
              disabled={running}
            >
              {running ? 'Simulating threat...' : 'Simulate Privilege Abuse'}
            </button>
          </div>

          {/* Reset Scenario */}
          <div className="simulator-scenario-card" style={{ gap: '12px' }}>
            <div className="simulator-scenario-title" style={{ color: '#64748b' }}>
              <RefreshCw size={18} />
              Reset Telemetry Database
            </div>
            <p className="simulator-scenario-desc" style={{ fontSize: '13px' }}>
              Clears all custom simulated logs, resets employee risk scores, and restores the database back to clean seeded states.
            </p>
            <button 
              className="simulator-btn reset" 
              onClick={() => runSimulation('reset')}
              disabled={running}
            >
              {running ? 'Resetting DB...' : 'Reset Database to Seed State'}
            </button>
          </div>
        </div>

        {/* Results Card */}
        <div className="section-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="section-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Award size={18} style={{ color: '#2563eb' }} />
            Simulation Output Telemetry
          </h3>

          {result ? (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div style={{ padding: '12px 16px', backgroundColor: result.scenario === 'reset' ? '#f1f5f9' : '#ecfdf5', borderRadius: '8px', border: result.scenario === 'reset' ? '1px solid #cbd5e1' : '1px solid #a7f3d0' }}>
                <strong style={{ color: result.scenario === 'reset' ? '#475569' : '#047857' }}>
                  {result.scenario === 'reset' ? '✅ Reset Complete' : '🔥 Security Event Captured!'}
                </strong>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  {result.data.message}
                </p>
              </div>

              {result.scenario !== 'reset' && result.data.details && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Alert Triggered:</span>
                    <strong style={{ color: result.data.details.alert_severity === 'Critical' ? '#ef4444' : '#ea580c' }}>
                      {result.data.details.alert_triggered ? 'YES - ' + result.data.details.alert_severity : 'NO'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Target Employee:</span>
                    <strong style={{ color: '#0f172a' }}>
                      {result.scenario === 'critical_exfiltration' ? 'Carol Campbell (CCA0846)' : 'Edward Vance (ESC1389)'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>New Profile Risk Score:</span>
                    <strong style={{ color: '#0f172a' }}>{result.data.details.employee_new_risk.toFixed(2)} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Generated Alert ID:</span>
                    <strong style={{ color: '#0f172a' }}>#{result.data.details.alert_id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Automatic Notification Email:</span>
                    <strong style={{ color: '#16a34a' }}>Logged in Mock Inbox</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8', textAlign: 'center' }}>
              <Zap size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px', fontWeight: 500 }}>Waiting for simulation trigger...</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Click one of the simulation buttons on the left to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
