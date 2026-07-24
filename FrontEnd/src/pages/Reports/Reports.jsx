import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  RefreshCw,
  BarChart3,
  ShieldAlert,
  Users,
  Activity,
  Calendar,
  Search
} from "lucide-react";
import "./Reports.css";

const API_URL = "http://127.0.0.1:8000";

function Reports() {
  const [summary, setSummary] = useState({
    total_users: 0,
    total_anomalies: 0,
    risk_distribution: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }
  });

  const [riskUsers, setRiskUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState(
    "Security Risk Report"
  );
  const [dateRange, setDateRange] = useState(
    "Last 30 Days"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        riskResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/risk/summary`),
        axios.get(`${API_URL}/risk/top`)
      ]);

      const backendSummary =
        summaryResponse.data;

      const distribution =
        backendSummary.riskDistribution || {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        };

      const totalUsers =
        backendSummary.totalEmployees || 0;

      const totalAnomalies =
        distribution.critical +
        distribution.high;

      setSummary({
        total_users: totalUsers,
        total_anomalies: totalAnomalies,
        risk_distribution: distribution
      });

      const users = Array.isArray(
        riskResponse.data
      )
        ? riskResponse.data
        : [];

      const formattedUsers = users.map(
        (user) => ({
          id: user.id,
          user: user.user,
          risk_score:
            user.riskScore || 0,
          risk_level:
            user.riskLevel || "Low",
          anomaly_score:
            user.anomalyScore || 0
        })
      );

      setRiskUsers(formattedUsers);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load report data"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = riskUsers.filter(
    (user) =>
      String(user.user || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalUsers =
    summary.total_users || 0;

  const totalAnomalies =
    summary.total_anomalies || 0;

  const critical =
    summary.risk_distribution?.critical || 0;

  const high =
    summary.risk_distribution?.high || 0;

  const medium =
    summary.risk_distribution?.medium || 0;

  const low =
    summary.risk_distribution?.low || 0;

  const generateReport = () => {
    const reportContent = `
INSIDER AI
SECURITY INTELLIGENCE REPORT

Report Type: ${reportType}
Date Range: ${dateRange}
Generated: ${new Date().toLocaleString()}

SUMMARY
Total Analyzed Users: ${totalUsers}
Total Detected Anomalies: ${totalAnomalies}
Critical Risk Users: ${critical}
High Risk Users: ${high}
Medium Risk Users: ${medium}
Low Risk Users: ${low}

TOP RISK USERS
${riskUsers
  .map(
    (user, index) =>
      `${index + 1}. ${
        user.user || "Unknown"
      } | Risk Score: ${
        user.risk_score || 0
      } | Risk Level: ${
        user.risk_level || "Unknown"
      }`
  )
  .join("\n")}
`;

    const blob = new Blob(
      [reportContent],
      {
        type: "text/plain"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `insider-ai-report-${Date.now()}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>Reports</h1>

          <p>
            Generate and review security intelligence reports
          </p>
        </div>

        <button
          className="reports-refresh"
          onClick={loadReportData}
        >
          <RefreshCw size={16} />

          Refresh
        </button>
      </div>

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      <div className="report-generator-card">
        <div className="report-generator-heading">
          <div className="report-generator-icon">
            <FileText size={23} />
          </div>

          <div>
            <h2>
              Generate Security Report
            </h2>

            <p>
              Select your report configuration and generate a report
            </p>
          </div>
        </div>

        <div className="report-generator-form">
          <div className="report-form-group">
            <label>
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(event) =>
                setReportType(
                  event.target.value
                )
              }
            >
              <option>
                Security Risk Report
              </option>

              <option>
                Anomaly Detection Report
              </option>

              <option>
                Executive Summary
              </option>

              <option>
                User Behavior Report
              </option>
            </select>
          </div>

          <div className="report-form-group">
            <label>
              Date Range
            </label>

            <select
              value={dateRange}
              onChange={(event) =>
                setDateRange(
                  event.target.value
                )
              }
            >
              <option>
                Last 7 Days
              </option>

              <option>
                Last 30 Days
              </option>

              <option>
                Last 90 Days
              </option>

              <option>
                All Time
              </option>
            </select>
          </div>

          <button
            className="generate-report-button"
            onClick={generateReport}
          >
            <Download size={17} />

            Generate Report
          </button>
        </div>
      </div>

      <div className="reports-summary-grid">
        <div className="report-summary-card">
          <div className="report-summary-icon users">
            <Users size={21} />
          </div>

          <span>
            Analyzed Users
          </span>

          <strong>
            {totalUsers}
          </strong>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon anomalies">
            <Activity size={21} />
          </div>

          <span>
            Total Anomalies
          </span>

          <strong>
            {totalAnomalies}
          </strong>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon critical">
            <ShieldAlert size={21} />
          </div>

          <span>
            Critical Risk
          </span>

          <strong>
            {critical}
          </strong>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon high">
            <BarChart3 size={21} />
          </div>

          <span>
            High Risk
          </span>

          <strong>
            {high}
          </strong>
        </div>
      </div>

      <div className="reports-content-grid">
        <div className="report-distribution-card">
          <div className="report-section-heading">
            <div>
              <h2>
                Risk Distribution
              </h2>

              <p>
                Current distribution of behavioral risk levels
              </p>
            </div>

            <ShieldAlert size={21} />
          </div>

          <div className="report-chart">
            <div
              className="risk-donut"
              style={{
                background: `conic-gradient(
                  #dc2626 0% ${
                    totalUsers
                      ? (critical /
                          totalUsers) *
                        100
                      : 0
                  }%,

                  #ea580c ${
                    totalUsers
                      ? (critical /
                          totalUsers) *
                        100
                      : 0
                  }% ${
                    totalUsers
                      ? ((critical +
                          high) /
                          totalUsers) *
                        100
                      : 0
                  }%,

                  #d97706 ${
                    totalUsers
                      ? ((critical +
                          high) /
                          totalUsers) *
                        100
                      : 0
                  }% ${
                    totalUsers
                      ? ((critical +
                          high +
                          medium) /
                          totalUsers) *
                        100
                      : 0
                  }%,

                  #16a34a ${
                    totalUsers
                      ? ((critical +
                          high +
                          medium) /
                          totalUsers) *
                        100
                      : 0
                  }% 100%
                )`
              }}
            >
              <div className="risk-donut-center">
                <strong>
                  {totalUsers}
                </strong>

                <span>
                  Users
                </span>
              </div>
            </div>
          </div>

          <div className="report-legend">
            <div>
              <span className="legend-dot critical" />

              <span>
                Critical
              </span>

              <strong>
                {critical}
              </strong>
            </div>

            <div>
              <span className="legend-dot high" />

              <span>
                High
              </span>

              <strong>
                {high}
              </strong>
            </div>

            <div>
              <span className="legend-dot medium" />

              <span>
                Medium
              </span>

              <strong>
                {medium}
              </strong>
            </div>

            <div>
              <span className="legend-dot low" />

              <span>
                Low
              </span>

              <strong>
                {low}
              </strong>
            </div>
          </div>
        </div>

        <div className="report-activity-card">
          <div className="report-section-heading">
            <div>
              <h2>
                Report Overview
              </h2>

              <p>
                Current security intelligence status
              </p>
            </div>

            <Calendar size={21} />
          </div>

          <div className="overview-list">
            <div className="overview-item">
              <span>
                Report Type
              </span>

              <strong>
                {reportType}
              </strong>
            </div>

            <div className="overview-item">
              <span>
                Selected Period
              </span>

              <strong>
                {dateRange}
              </strong>
            </div>

            <div className="overview-item">
              <span>
                Detection Status
              </span>

              <strong className="active-status">
                Active
              </strong>
            </div>

            <div className="overview-item">
              <span>
                Last Updated
              </span>

              <strong>
                {new Date().toLocaleDateString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="top-risk-report-card">
        <div className="top-risk-header">
          <div>
            <h2>
              Top Risk Users
            </h2>

            <p>
              Users with the highest calculated behavioral risk
            </p>
          </div>

          <div className="top-risk-search">
            <Search size={16} />

            <input
              placeholder="Search user..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="reports-empty">
            No risk users found.
          </div>
        ) : (
          <div className="top-risk-table-wrapper">
            <table className="top-risk-table">
              <thead>
                <tr>
                  <th>
                    #
                  </th>

                  <th>
                    User
                  </th>

                  <th>
                    Risk Score
                  </th>

                  <th>
                    Risk Level
                  </th>

                  <th>
                    Anomaly Score
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user, index) => (
                    <tr
                      key={
                        user.id ||
                        user.user ||
                        index
                      }
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {user.user ||
                            "Unknown User"}
                        </strong>
                      </td>

                      <td>
                        <strong className="report-risk-score">
                          {Number(
                            user.risk_score ||
                              0
                          ).toFixed(1)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`report-risk-level ${String(
                            user.risk_level ||
                              "Low"
                          ).toLowerCase()}`}
                        >
                          {user.risk_level ||
                            "Low"}
                        </span>
                      </td>

                      <td>
                        {Number(
                          user.anomaly_score ||
                            0
                        ).toFixed(1)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;