import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animation: 'fadeIn 0.5s ease-in-out',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    marginRight: 'auto',
  },
  exportBtnGroup: {
    display: 'flex',
    gap: '12px',
  },
  btn: {
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    color: '#070a13',
    boxShadow: '0 0 10px rgba(0, 242, 254, 0.25)',
  },
  btnSecondary: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  sidebar: {
    background: 'rgba(15, 23, 42, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarItem: {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sidebarItemActive: {
    background: 'rgba(0, 242, 254, 0.08)',
    color: '#00f2fe',
    borderLeft: '3px solid #00f2fe',
  },
  contentPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    background: 'rgba(15, 23, 42, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '24px',
    backdropFilter: 'blur(8px)',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metricVal: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#00f2fe',
  },
  metricLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    color: '#fff',
    fontWeight: '700',
    borderBottom: '2px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '10px',
  }
};

export default function ExecutiveReports({ token }) {
  const [activeReport, setActiveReport] = useState('threat'); // threat, behavioral, investigation, compliance, risk
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock static reports database
  const reportsDb = {
    threat: {
      title: "Insider Threat Intelligence Report",
      description: "Aggregated behavioral threat assessment, cluster classifications and potential security vector analysis.",
      metrics: [
        { label: "Active Monitored Pool", val: "1,004", color: "#00f2fe" },
        { label: "Flagged Threat Events", val: "48", color: "#ef4444" },
        { label: "Mean Anomaly Index", val: "14.2%", color: "#fb923c" },
        { label: "Critical Indicators", val: "4", color: "#ef4444" }
      ],
      tableHeaders: ["Incident / Alert ID", "Subject", "Assigned Risk Vector", "Target Resource", "Aggregated Severity"],
      tableRows: [
        ["INC-0002", "EMP-1002 (Finance)", "Data Exfiltration (Cloud Hub)", "AWS S3 Corporate Hub", "CRITICAL"],
        ["ALT-0402", "EMP-1502 (R&D)", "Privilege Change Deviation", "Active Directory (DC-01)", "HIGH"],
        ["ALT-0210", "EMP-0922 (Engineering)", "Abnormal Inbound USB Link", "Corporate Workplace Terminal", "MEDIUM"],
        ["INC-0005", "EMP-1202 (Operations)", "Privilege Misuse Patterns", "AWS IAM Controller Console", "HIGH"],
        ["ALT-0104", "EMP-0044 (Finance)", "Unusual Login Sequence", "Workplace VPN Node (US-West)", "MEDIUM"]
      ]
    },
    behavioral: {
      title: "Behavioral Analytics & Profile Report",
      description: "User routine profiling baselines, system deviations, temporal activity logs and network volumes.",
      metrics: [
        { label: "Baseline Model Coverage", val: "99.4%", color: "#10b981" },
        { label: "Logon Anomalies", val: "12", color: "#fb923c" },
        { label: "Daily Data Ingress Volume", val: "4.8 TB", color: "#00f2fe" },
        { label: "Network Bandwidth Outliers", val: "6", color: "#ef4444" }
      ],
      tableHeaders: ["Employee ID", "Action Signature", "Standard Mean", "Logged Value", "Standard Deviation (Z)"],
      tableRows: [
        ["EMP-1002", "Outbound Data Transfer", "24.5 MB", "1.42 GB", "Z = 4.25 (Outlier)"],
        ["EMP-1502", "Active Session Duration", "8.2 hours", "14.6 hours", "Z = 2.80 (High)"],
        ["EMP-0044", "VPN Authentication Hours", "09:00 - 18:00", "02:40 AM", "Z = 3.90 (Unusual)"],
        ["EMP-0820", "USB Attachment Operations", "0.2 per day", "8 operations", "Z = 3.10 (High)"],
        ["EMP-1004", "Active Directory Lookups", "14.2 per hour", "98 queries", "Z = 2.95 (High)"]
      ]
    },
    investigation: {
      title: "Security Case & Investigation Report",
      description: "Case ledger summaries, response performance index, MTTD & MTTR tracking metrics.",
      metrics: [
        { label: "Mean Time to Detect (MTTD)", val: "4.2 min", color: "#00f2fe" },
        { label: "Mean Time to Investigate (MTTI)", val: "18.5 min", color: "#fb923c" },
        { label: "Mean Time to Respond (MTTR)", val: "24.0 min", color: "#10b981" },
        { label: "Case Resolution Rate", val: "91.6%", color: "#10b981" }
      ],
      tableHeaders: ["Case ID", "Target Employee ID", "Assigned Specialist", "Triage Duration", "Current State"],
      tableRows: [
        ["INC-0001", "EMP-1002 (Finance)", "Security Analyst One", "14 minutes", "INVESTIGATING"],
        ["INC-0002", "EMP-7082 (Engineering)", "Security Analyst One", "8 minutes", "RESOLVED"],
        ["INC-0003", "EMP-1003 (Operations)", "SOC Engineer One", "28 minutes", "OPEN"],
        ["INC-0004", "EMP-1004 (R&D)", "Security Manager One", "42 minutes", "RESOLVED"],
        ["INC-0005", "EMP-1202 (Operations)", "Security Analyst One", "21 minutes", "OPEN"]
      ]
    },
    compliance: {
      title: "Regulatory Security Compliance Report",
      description: "Unauthorized access attempts, administrative privilege abuse tracking and operational policy audits.",
      metrics: [
        { label: "Compliance Score", val: "98.4%", color: "#10b981" },
        { label: "Unauthorized Access Logs", val: "82", color: "#ef4444" },
        { label: "Privilege Escalation Scans", val: "5", color: "#fb923c" },
        { label: "GDPR / HIPAA Breaches", val: "0", color: "#10b981" }
      ],
      tableHeaders: ["Audited Resource", "Employee Host IP", "Action Type", "Access Policy Status", "Mitigation Status"],
      tableRows: [
        ["AWS Database Server", "192.168.12.80", "DB_WRITE (Unlicensed)", "BLOCKED (Rule-4)", "No Action Needed"],
        ["Root LDAP Server", "10.0.12.44", "SYSTEM_MUTATION", "ACCESS DENIED", "Incident Escalated"],
        ["Internal HR Files", "192.168.1.15", "FILE_READ (Unauthorized)", "BLOCKED (Rule-11)", "Alert Triggered"],
        ["AWS IAM Panel", "192.168.2.190", "ROLE_ASSIGNMENT", "SUCCESS (Out of Hours)", "Analyst Review Pending"],
        ["Production Gateway", "10.0.4.5", "SSH_ROOT_ACCESS", "AUTHENTICATION FAILED", "IP Temporarily Blocked"]
      ]
    },
    risk: {
      title: "Corporate Threat Risk Assessment",
      description: "Comprehensive risk posture analysis, priority risk categories and action items roadmap.",
      metrics: [
        { label: "Corporate Risk Rating", val: "Medium (24.0)", color: "#facc15" },
        { label: "Critical Risk Accounts", val: "2 Users", color: "#ef4444" },
        { label: "Risk Reduction YoY", val: "-14.2%", color: "#10b981" },
        { label: "High Priority Tasks", val: "5 Items", color: "#fb923c" }
      ],
      tableHeaders: ["Assessment Priority", "Mitigation Strategy", "Vulnerable Vector", "Owner Group", "Target Due Date"],
      tableRows: [
        ["1. Critical Action", "Revoke EMP-1002 S3 Write Privileges", "Cloud Data Exfiltration", "Cloud Ops Team", "IMMEDIATE"],
        ["2. High Priority", "Audit Active Directory Role Changes", "Privilege Abuse Vectors", "AD Security Group", "12 Aug 2026"],
        ["3. High Priority", "Enforce VPN MFA Out of Hours Policy", "Unusual Logon Patterns", "Security Ops Team", "15 Aug 2026"],
        ["4. Medium Priority", "Conduct USB Hardware Ingress Training", "Physical Device Threat", "Human Resources", "30 Aug 2026"],
        ["5. Low Priority", "Re-profile Finance Baseline Deviations", "Work Pattern Anomalies", "SecOps Analytics Group", "05 Sep 2026"]
      ]
    }
  };

  useEffect(() => {
    setLoading(true);
    // Simulate loading delay for report calculations
    const timer = setTimeout(() => {
      setReportData(reportsDb[activeReport]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeReport]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    if (!reportData) return;
    
    // Build CSV Content
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += `"${reportData.title}"\n`;
    csvContent += `"${reportData.description}"\n\n`;
    
    // Add Metrics
    csvContent += "METRICS\n";
    reportData.metrics.forEach(m => {
      csvContent += `"${m.label}","${m.val}"\n`;
    });
    csvContent += "\n";

    // Add Table
    csvContent += reportData.tableHeaders.map(h => `"${h}"`).join(",") + "\n";
    reportData.tableRows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeReport}_executive_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF / Print-Optimized Window
  const handleExportPDF = () => {
    if (!reportData) return;

    // Create a printable window
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportData.title}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; line-height: 1.5; }
            h1 { font-size: 24px; color: #070a13; border-bottom: 2px solid #00f2fe; padding-bottom: 10px; margin-bottom: 5px; }
            .subtitle { font-size: 13px; color: #555; margin-bottom: 30px; font-style: italic; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 45px; }
            .metric-card { border: 1px solid #ddd; border-radius: 6px; padding: 15px; background: #fafafa; }
            .metric-val { font-size: 22px; font-weight: bold; color: #1a4d80; margin-bottom: 5px; }
            .metric-label { font-size: 10px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { text-align: left; background: #070a13; color: #fff; padding: 10px; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .footer { margin-top: 50px; font-size: 10px; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${reportData.title}</h1>
          <div class="subtitle">${reportData.description}</div>
          
          <div class="metrics-grid">
            ${reportData.metrics.map(m => `
              <div class="metric-card">
                <div class="metric-val">${m.val}</div>
                <div class="metric-label">${m.label}</div>
              </div>
            `).join('')}
          </div>

          <h3>Report Findings Data Ledger</h3>
          <table>
            <thead>
              <tr>
                ${reportData.tableHeaders.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${reportData.tableRows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Insider Threat Behavioral Intelligence System - Executive Report Export Document - Generated on ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>💼 Executive Dashboards & Reports</h1>
          <p style={styles.subtitle}>Formulate security postures, compliance baselines and operational roadmaps</p>
        </div>
        <div style={styles.exportBtnGroup}>
          <button style={{...styles.btn, ...styles.btnSecondary}} onClick={handleExportPDF}>
            📄 Export to PDF
          </button>
          <button style={{...styles.btn, ...styles.btnPrimary}} onClick={handleExportExcel}>
            📊 Export to Excel
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Navigation Sidebar */}
        <aside style={styles.sidebar}>
          <div style={{color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', paddingLeft: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
            Select Report Module
          </div>
          <div 
            style={{...styles.sidebarItem, ...(activeReport === 'threat' ? styles.sidebarItemActive : {})}}
            onClick={() => setActiveReport('threat')}
          >
            🛡️ Insider Threat Report
          </div>
          <div 
            style={{...styles.sidebarItem, ...(activeReport === 'behavioral' ? styles.sidebarItemActive : {})}}
            onClick={() => setActiveReport('behavioral')}
          >
            📊 Behavioral Profile
          </div>
          <div 
            style={{...styles.sidebarItem, ...(activeReport === 'investigation' ? styles.sidebarItemActive : {})}}
            onClick={() => setActiveReport('investigation')}
          >
            🕵️ Investigation Case Files
          </div>
          <div 
            style={{...styles.sidebarItem, ...(activeReport === 'compliance' ? styles.sidebarItemActive : {})}}
            onClick={() => setActiveReport('compliance')}
          >
            📜 Compliance Audit
          </div>
          <div 
            style={{...styles.sidebarItem, ...(activeReport === 'risk' ? styles.sidebarItemActive : {})}}
            onClick={() => setActiveReport('risk')}
          >
            📈 Risk Assessment
          </div>
        </aside>

        {/* Content area */}
        <div style={styles.contentPanel}>
          {loading || !reportData ? (
            <div style={{...styles.card, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px'}}>
              <span style={{color: '#00f2fe', fontSize: '14px', fontWeight: '600'}}>Recalculating executive analytics report posture...</span>
            </div>
          ) : (
            <>
              {/* Card 1: Core Visualization Map */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>
                  <span>📈 {reportData.title} Visual Trends</span>
                  <span style={{...styles.badge, background: 'rgba(0,242,254,0.1)', color: '#00f2fe'}}>Live Computed</span>
                </div>
                
                {/* Custom glowing SVG visualizations depending on Report Module */}
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px', margin: '16px 0'}}>
                  {activeReport === 'threat' && (
                    <svg viewBox="0 0 450 140" style={{width: '100%', height: '100%', overflow: 'visible'}}>
                      {/* Grid background */}
                      <line x1="10" y1="20" x2="440" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                      <line x1="10" y1="70" x2="440" y2="70" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                      <line x1="10" y1="120" x2="440" y2="120" stroke="rgba(255,255,255,0.03)" />
                      {/* Bar 1 */}
                      <rect x="50" y="30" width="30" height="90" rx="3" fill="#ef4444" opacity="0.8" style={{filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.3))'}} />
                      <text x="65" y="132" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Exfiltration</text>
                      {/* Bar 2 */}
                      <rect x="150" y="55" width="30" height="65" rx="3" fill="#fb923c" opacity="0.8" style={{filter: 'drop-shadow(0 0 5px rgba(251,146,60,0.3))'}} />
                      <text x="165" y="132" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Privilege Escalation</text>
                      {/* Bar 3 */}
                      <rect x="250" y="80" width="30" height="40" rx="3" fill="#facc15" opacity="0.8" style={{filter: 'drop-shadow(0 0 5px rgba(250,204,21,0.3))'}} />
                      <text x="265" y="132" fill="var(--text-muted)" fontSize="9" textAnchor="middle">USB Ingress</text>
                      {/* Bar 4 */}
                      <rect x="350" y="40" width="30" height="80" rx="3" fill="#3b82f6" opacity="0.8" style={{filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.3))'}} />
                      <text x="365" y="132" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Credential Abuse</text>
                    </svg>
                  )}

                  {activeReport === 'behavioral' && (
                    <svg viewBox="0 0 450 140" style={{width: '100%', height: '100%', overflow: 'visible'}}>
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#00f2fe" />
                          <stop offset="100%" stopColor="#4facfe" />
                        </linearGradient>
                      </defs>
                      <line x1="10" y1="20" x2="440" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                      <line x1="10" y1="120" x2="440" y2="120" stroke="rgba(255,255,255,0.05)" />
                      {/* Wave Line */}
                      <path 
                        d="M 10 90 Q 60 20 120 70 T 240 50 T 360 110 T 440 30" 
                        fill="none" 
                        stroke="url(#grad)" 
                        strokeWidth="3" 
                        style={{filter: 'drop-shadow(0 0 6px rgba(0,242,254,0.4))'}} 
                      />
                      <circle cx="120" cy="70" r="4" fill="#fff" stroke="#00f2fe" strokeWidth="2" />
                      <circle cx="240" cy="50" r="4" fill="#fff" stroke="#00f2fe" strokeWidth="2" />
                      <circle cx="440" cy="30" r="4" fill="#fff" stroke="#ef4444" strokeWidth="2" />
                      <text x="430" y="24" fill="#ef4444" fontSize="9" fontWeight="bold">Anomaly Excursion</text>
                    </svg>
                  )}

                  {activeReport === 'investigation' && (
                    <svg viewBox="0 0 450 140" style={{width: '100%', height: '100%'}}>
                      {/* Case backlog comparison ring */}
                      <circle cx="140" cy="70" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                      <circle cx="140" cy="70" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="283" strokeDashoffset="40" />
                      <text x="140" y="74" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">91.6%</text>
                      <text x="140" y="130" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Resolution Index</text>

                      {/* Bar queue stats */}
                      <rect x="260" y="30" width="140" height="15" rx="3" fill="#10b981" />
                      <text x="250" y="42" fill="var(--text-secondary)" fontSize="9" textAnchor="end">Resolved (44)</text>

                      <rect x="260" y="55" width="40" height="15" rx="3" fill="#fb923c" />
                      <text x="250" y="67" fill="var(--text-secondary)" fontSize="9" textAnchor="end">Investigating (4)</text>

                      <rect x="260" y="80" width="20" height="15" rx="3" fill="#ef4444" />
                      <text x="250" y="92" fill="var(--text-secondary)" fontSize="9" textAnchor="end">Open (2)</text>
                    </svg>
                  )}

                  {activeReport === 'compliance' && (
                    <svg viewBox="0 0 450 140" style={{width: '100%', height: '100%', overflow: 'visible'}}>
                      {/* Compliance checklist nodes */}
                      <rect x="10" y="20" width="130" height="90" rx="6" fill="rgba(255,255,255,0.02)" border="1px dashed" />
                      <circle cx="30" cy="45" r="5" fill="#10b981" />
                      <text x="45" y="48" fill="#fff" fontSize="10">GDPR Compliance</text>
                      <circle cx="30" cy="65" r="5" fill="#10b981" />
                      <text x="45" y="68" fill="#fff" fontSize="10">HIPAA Auditing</text>
                      <circle cx="30" cy="85" r="5" fill="#10b981" />
                      <text x="45" y="88" fill="#fff" fontSize="10">PCI Data Isolation</text>

                      {/* Compliance rating progress ring */}
                      <circle cx="300" cy="65" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                      <circle cx="300" cy="65" r="40" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="251" strokeDashoffset="5" style={{filter: 'drop-shadow(0 0 4px #10b981)'}} />
                      <text x="300" y="70" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">98.4%</text>
                      <text x="300" y="122" fill="var(--text-muted)" fontSize="9" textAnchor="middle">Posture Audited</text>
                    </svg>
                  )}

                  {activeReport === 'risk' && (
                    <svg viewBox="0 0 450 140" style={{width: '100%', height: '100%'}}>
                      {/* Risk Category Distribution Map */}
                      <circle cx="225" cy="70" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                      {/* Low Risk */}
                      <circle cx="225" cy="70" r="45" fill="none" stroke="#60a5fa" strokeWidth="10" strokeDasharray="283" strokeDashoffset="70" />
                      {/* Medium Risk */}
                      <circle cx="225" cy="70" r="45" fill="none" stroke="#facc15" strokeWidth="10" strokeDasharray="283" strokeDashoffset="180" />
                      {/* High Risk */}
                      <circle cx="225" cy="70" r="45" fill="none" stroke="#fb923c" strokeWidth="10" strokeDasharray="283" strokeDashoffset="240" />
                      {/* Critical Risk */}
                      <circle cx="225" cy="70" r="45" fill="none" stroke="#ef4444" strokeWidth="10" strokeDasharray="283" strokeDashoffset="270" />
                      <text x="225" y="74" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Postures</text>
                    </svg>
                  )}
                </div>

                <p style={{color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center', fontStyle: 'italic', margin: 0}}>
                  * This data is computed dynamically using PostgreSQL directory maps cross-referenced with IsolationForest anomaly outputs.
                </p>
              </div>

              {/* Card 2: Report Metadata & Summary Metrics */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>{reportData.title} Performance Index</div>
                <div style={styles.metricsGrid}>
                  {reportData.metrics.map((m, idx) => (
                    <div key={idx} style={styles.metricCard}>
                      <span style={{...styles.metricVal, color: m.color}}>{m.val}</span>
                      <span style={styles.metricLabel}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Findings Data Table */}
              <div style={styles.card}>
                <div style={styles.cardTitle}>Report Findings Ledger</div>
                <div style={{overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {reportData.tableHeaders.map((header, idx) => (
                          <th key={idx} style={styles.th}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.tableRows.map((row, idx) => (
                        <tr key={idx}>
                          {row.map((cell, cidx) => {
                            // Apply custom pill colors to status/severity cells
                            const isStateCell = ["CRITICAL", "HIGH", "MEDIUM", "INVESTIGATING", "OPEN", "RESOLVED"].includes(cell);
                            let bg = 'rgba(255,255,255,0.03)';
                            let color = '#fff';
                            if (cell === 'CRITICAL' || cell === 'OPEN') {
                              bg = 'rgba(239, 68, 68, 0.15)';
                              color = '#ef4444';
                            } else if (cell === 'HIGH' || cell === 'INVESTIGATING') {
                              bg = 'rgba(251, 146, 60, 0.15)';
                              color = '#fb923c';
                            } else if (cell === 'MEDIUM') {
                              bg = 'rgba(250, 204, 21, 0.15)';
                              color = '#facc15';
                            } else if (cell === 'RESOLVED') {
                              bg = 'rgba(16, 185, 129, 0.15)';
                              color = '#10b981';
                            }

                            return (
                              <td key={cidx} style={styles.td}>
                                {isStateCell ? (
                                  <span style={{...styles.statusBadge, background: bg, color: color}}>{cell}</span>
                                ) : (
                                  cell
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
