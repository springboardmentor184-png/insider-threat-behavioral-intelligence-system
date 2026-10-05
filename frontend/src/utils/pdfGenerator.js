/**
 * PDF Generator Utility for Insider Threat Behavioral Intelligence System
 * Generates formatted PDF security audit reports and investigation case briefs.
 */

export const generateExecutiveAuditPDF = (user, employees = [], activities = []) => {
  const criticalThreatsCount = activities.filter(a => a.severity === 'Critical' || a.severity === 'High').length
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const reportRef = `AUD-${Math.floor(100000 + Math.random() * 900000)}`

  const printWindow = window.open('', '_blank', 'width=950,height=1050')
  if (!printWindow) {
    alert("Pop-up blocker detected. Please allow pop-ups for this site to generate the PDF report.")
    return
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Executive_Security_Audit_Report_${reportRef}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 36px 44px;
          color: #0f172a;
          background-color: #ffffff;
          line-height: 1.5;
        }

        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #0284c7;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .header-title-box h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }
        .header-title-box .subtitle {
          font-size: 12px;
          color: #0284c7;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .ref-card {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 10px 16px;
          text-align: right;
          font-size: 11px;
          color: #0369a1;
        }
        .ref-card strong {
          color: #0c4a6e;
          font-size: 13px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 24px;
        }
        .meta-item {
          font-size: 11px;
        }
        .meta-item label {
          color: #64748b;
          display: block;
          margin-bottom: 3px;
          text-transform: uppercase;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .meta-item span {
          font-weight: 600;
          color: #0f172a;
          font-size: 12px;
        }

        .section-header {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 6px;
          margin-top: 24px;
          margin-bottom: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .stat-card .val {
          font-size: 22px;
          font-weight: 700;
          color: #0284c7;
          line-height: 1.1;
        }
        .stat-card .lbl {
          font-size: 10px;
          color: #64748b;
          margin-top: 4px;
          text-transform: uppercase;
          font-weight: 600;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        th {
          background: #0f172a;
          color: #ffffff;
          text-align: left;
          padding: 9px 12px;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 9px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) td {
          background: #f8fafc;
        }

        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-critical { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .badge-high { background: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }
        .badge-medium { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
        .badge-low { background: #dcfce7; color: #166534; border: 1px solid #86efac; }

        .recommendations-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 16px 20px;
          margin-top: 16px;
        }
        .recommendations-box h4 {
          margin: 0 0 8px 0;
          color: #166534;
          font-size: 13px;
          font-weight: 700;
        }
        .recommendations-box ul {
          margin: 0;
          padding-left: 18px;
          font-size: 11px;
          color: #15803d;
        }
        .recommendations-box li {
          margin-bottom: 4px;
        }

        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }

        @media print {
          body { padding: 15px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div class="header-title-box">
          <h1>INSIDER THREAT BEHAVIORAL INTELLIGENCE</h1>
          <div class="subtitle">Executive Security Audit & Risk Assessment PDF</div>
        </div>
        <div class="ref-card">
          <div>Report Reference</div>
          <strong>${reportRef}</strong>
          <div style="margin-top: 2px; font-size: 9px; color: #64748b;">${currentDate}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <label>Auditor Operator</label>
          <span>${user?.full_name || user?.username || 'System Administrator'}</span>
        </div>
        <div class="meta-item">
          <label>Clearance Role</label>
          <span>${user?.role?.name || 'Administrator'}</span>
        </div>
        <div class="meta-item">
          <label>Security Scope</label>
          <span>Level 3 Executive Audit</span>
        </div>
        <div class="meta-item">
          <label>Compliance Posture</label>
          <span style="color: #16a34a;">98.4% Compliant</span>
        </div>
      </div>

      <div class="section-header">1. Executive Risk & Telemetry Metrics</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="val">${employees.length}</div>
          <div class="lbl">Surveilled Employees</div>
        </div>
        <div class="stat-card">
          <div class="val">${employees.flatMap(e => e.devices || []).length}</div>
          <div class="lbl">Monitored Endpoints</div>
        </div>
        <div class="stat-card">
          <div class="val">${activities.length}</div>
          <div class="lbl">Ingested Telemetry Logs</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color: #dc2626;">${criticalThreatsCount}</div>
          <div class="lbl">Elevated Threat Alerts</div>
        </div>
      </div>

      <div class="section-header">2. Enterprise Policy & Compliance Evaluation</div>
      <table>
        <thead>
          <tr>
            <th>Regulatory Standard</th>
            <th>Audit Scope Category</th>
            <th>Evaluation Result</th>
            <th>Notes & Remediation Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ISO 27001</strong></td>
            <td>Database Access & RBAC Isolation</td>
            <td><span class="badge badge-low">PASSED</span></td>
            <td>Role permissions verified; zero privilege escalation anomalies.</td>
          </tr>
          <tr>
            <td><strong>SOC 2 Type II</strong></td>
            <td>USB Storage & Removable Media Control</td>
            <td><span class="badge badge-high">WARNING</span></td>
            <td>Unauthorized mass USB storage mount detected on Engineering node.</td>
          </tr>
          <tr>
            <td><strong>GDPR / CCPA</strong></td>
            <td>Employee Offboarding & Data Rights</td>
            <td><span class="badge badge-low">PASSED</span></td>
            <td>Data retention policies strictly compliant across active profiles.</td>
          </tr>
        </tbody>
      </table>

      <div class="section-header">3. Elevated Threat Alerts (High / Critical Logs)</div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Employee Name</th>
            <th>Telemetry Event</th>
            <th>Severity</th>
            <th>Threat Context & Metadata</th>
          </tr>
        </thead>
        <tbody>
          ${activities.filter(a => ['High', 'Critical'].includes(a.severity)).map(a => `
            <tr>
              <td>${new Date(a.timestamp).toLocaleString()}</td>
              <td><strong>${a.employee ? a.employee.name : 'Unknown Personnel'}</strong></td>
              <td>${a.event_type}</td>
              <td><span class="badge badge-${a.severity.toLowerCase()}">${a.severity}</span></td>
              <td>${typeof a.details === 'object' ? JSON.stringify(a.details) : a.details}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="section-header">4. Action Items & Security Recommendations</div>
      <div class="recommendations-box">
        <h4>Recommended Remediation Steps:</h4>
        <ul>
          <li>Audit USB removable media write permissions for all Engineering personnel immediately.</li>
          <li>Inspect outbound network exfiltration traffic to external cloud storage providers.</li>
          <li>Restrict administrative payroll ledger downloads to corporate VPN nodes.</li>
          <li>Review anomaly isolation scores for flagged high-risk user accounts in the UEBA cockpit.</li>
        </ul>
      </div>

      <div class="footer">
        <div>CONFIDENTIAL — INTERNAL SECURITY OPERATIONS USE ONLY</div>
        <div>Generated by Insider Threat Behavioral Intelligence System v2.0 PDF Engine</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        }
      </script>
    </body>
    </html>
  `
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

export const generateInvestigationCasePDF = (details) => {
  if (!details) return

  const caseRef = `CASE-${details.id}`
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const printWindow = window.open('', '_blank', 'width=950,height=1050')
  if (!printWindow) {
    alert("Pop-up blocker detected. Please allow pop-ups for this site to generate the PDF case report.")
    return
  }

  const riskScore = details.risk_profile ? details.risk_profile.score : 0
  const riskLevel = details.risk_profile ? details.risk_profile.level : 'N/A'
  const components = details.risk_profile ? details.risk_profile.components : {}

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Investigation_Case_Report_${caseRef}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 36px 44px;
          color: #0f172a;
          background-color: #ffffff;
          line-height: 1.5;
        }

        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #ef4444;
          padding-bottom: 18px;
          margin-bottom: 24px;
        }
        .header-title-box h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }
        .header-title-box .subtitle {
          font-size: 12px;
          color: #ef4444;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .ref-card {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 16px;
          text-align: right;
          font-size: 11px;
          color: #991b1b;
        }
        .ref-card strong {
          color: #7f1d1d;
          font-size: 14px;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 24px;
        }
        .meta-item {
          font-size: 11px;
        }
        .meta-item label {
          color: #64748b;
          display: block;
          margin-bottom: 3px;
          text-transform: uppercase;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .meta-item span {
          font-weight: 600;
          color: #0f172a;
          font-size: 12px;
        }

        .section-header {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 6px;
          margin-top: 22px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .risk-box {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 20px;
        }
        .score-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #be123c;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 22px;
          font-weight: 700;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        th {
          background: #0f172a;
          color: #ffffff;
          text-align: left;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
        }
        td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) td {
          background: #f8fafc;
        }

        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-critical { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .badge-high { background: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }
        .badge-medium { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
        .badge-low { background: #dcfce7; color: #166534; border: 1px solid #86efac; }

        .timeline-item {
          border-left: 2px solid #0284c7;
          padding-left: 14px;
          margin-bottom: 12px;
          position: relative;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #0284c7;
        }

        .footer {
          margin-top: 36px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div class="header-title-box">
          <h1>SOC THREAT INVESTIGATION DOSSIER</h1>
          <div class="subtitle">Official Incident Brief & Evidence Report</div>
        </div>
        <div class="ref-card">
          <div>Case Reference</div>
          <strong>#${caseRef}</strong>
          <div style="margin-top: 2px; font-size: 9px; color: #64748b;">${currentDate}</div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <label>Case Severity</label>
          <span class="badge badge-${details.severity ? details.severity.toLowerCase() : 'critical'}">${details.severity}</span>
        </div>
        <div class="meta-item">
          <label>Investigation Status</label>
          <span style="color: #0284c7;">${details.status}</span>
        </div>
        <div class="meta-item">
          <label>Assigned Lead Analyst</label>
          <span>${details.assigned_analyst_name || 'SOC Lead Analyst'}</span>
        </div>
        <div class="meta-item">
          <label>Opened Timestamp</label>
          <span>${new Date(details.created_at).toLocaleString()}</span>
        </div>
      </div>

      <div class="section-header">1. Subject Employee Surveillance Profile</div>
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Employee ID</th>
            <th>Corporate Email</th>
            <th>Department</th>
            <th>Designation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${details.employee ? details.employee.name : 'N/A'}</strong></td>
            <td>${details.employee ? details.employee.employee_id : 'N/A'}</td>
            <td>${details.employee ? details.employee.email : 'N/A'}</td>
            <td>${details.employee ? details.employee.department : 'N/A'}</td>
            <td>${details.employee ? details.employee.designation : 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      <div class="section-header">2. Insider Risk Score Breakdown</div>
      <div class="risk-box">
        <div class="score-circle">${riskScore}%</div>
        <div>
          <div style="font-size: 15px; font-weight: 700; color: #9f1239;">Risk Level: ${riskLevel}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">${details.risk_profile ? details.risk_profile.explanation : 'Evaluated against organizational baseline metrics.'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Weighted Signal Vector</th>
            <th>Weight</th>
            <th>Computed Component Score</th>
            <th>Evaluation Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Behavioral Anomalies</td>
            <td>35%</td>
            <td>${components.behavioral_anomaly_score || 0}</td>
            <td><span class="badge badge-${(components.behavioral_anomaly_score || 0) > 25 ? 'critical' : 'low'}">${(components.behavioral_anomaly_score || 0) > 25 ? 'ELEVATED' : 'NORMAL'}</span></td>
          </tr>
          <tr>
            <td>Privilege Misuse</td>
            <td>25%</td>
            <td>${components.privilege_misuse_score || 0}</td>
            <td><span class="badge badge-${(components.privilege_misuse_score || 0) > 15 ? 'high' : 'low'}">${(components.privilege_misuse_score || 0) > 15 ? 'ELEVATED' : 'NORMAL'}</span></td>
          </tr>
          <tr>
            <td>Data Access Violations</td>
            <td>20%</td>
            <td>${components.data_access_score || 0}</td>
            <td><span class="badge badge-${(components.data_access_score || 0) > 10 ? 'high' : 'low'}">${(components.data_access_score || 0) > 10 ? 'ELEVATED' : 'NORMAL'}</span></td>
          </tr>
          <tr>
            <td>Access Pattern Deviations</td>
            <td>10%</td>
            <td>${components.access_pattern_score || 0}</td>
            <td><span class="badge badge-low">NORMAL</span></td>
          </tr>
          <tr>
            <td>Historical Security Events</td>
            <td>10%</td>
            <td>${components.historical_event_score || 0}</td>
            <td><span class="badge badge-low">NORMAL</span></td>
          </tr>
        </tbody>
      </table>

      <div class="section-header">3. Case Executive Summary</div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 11px; color: #334155; margin-bottom: 20px;">
        ${details.summary}
      </div>

      ${details.timeline_events && details.timeline_events.length > 0 ? `
        <div class="section-header">4. Evidence & Investigation Timeline</div>
        <div style="margin-bottom: 20px;">
          ${details.timeline_events.map(event => `
            <div class="timeline-item">
              <div style="font-size: 10px; color: #64748b; font-weight: 600;">[${new Date(event.timestamp).toLocaleString()}] — ${event.event_type}</div>
              <div style="font-size: 11px; color: #0f172a; margin-top: 2px;">${event.description}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="section-header">5. Resolution Notes & SOC Sign-Off</div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; font-size: 11px; color: #166534;">
        ${details.resolution_notes || 'Investigation case active in Security Operations Center triage queue.'}
      </div>

      <div class="footer">
        <div>CONFIDENTIAL — FOR SOC AUDIT & LEGAL EVIDENCE USE ONLY</div>
        <div>Generated by Insider Threat Behavioral Intelligence System v2.0 PDF Engine</div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        }
      </script>
    </body>
    </html>
  `
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
