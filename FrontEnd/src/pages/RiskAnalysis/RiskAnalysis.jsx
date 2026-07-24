import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldAlert,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  AlertTriangle,
  Activity,
  Eye
} from "lucide-react";
import "./RiskAnalysis.css";

const API_URL = "http://127.0.0.1:8000";

function RiskAnalysis() {
  const [riskUsers, setRiskUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

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

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRiskData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [riskUsers, search, riskFilter]);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resultsResponse, summaryResponse] =
        await Promise.all([
          axios.get(`${API_URL}/risk/top`),
          axios.get(`${API_URL}/risk/summary`)
        ]);

      const results = Array.isArray(
        resultsResponse.data
      )
        ? resultsResponse.data
        : [];

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

      const formattedUsers = results.map(
        (user) => ({
          id: user.id,
          user: user.user,
          risk_score: user.riskScore || 0,
          risk_level: user.riskLevel || "Low",
          anomaly_score:
            user.anomalyScore || 0,
          anomaly:
            user.riskLevel === "High" ||
            user.riskLevel === "Critical"
              ? 1
              : 0,
          login_count:
            user.login_count || 0,
          unique_devices:
            user.unique_devices || 0,
          after_hours_logins:
            user.after_hours_logins || 0,
          weekend_logins:
            user.weekend_logins || 0
        })
      );

      setRiskUsers(formattedUsers);

      setSummary({
        total_users: totalUsers,
        total_anomalies: totalAnomalies,
        risk_distribution: distribution
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load risk analysis data"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = [...riskUsers];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((user) =>
        String(user.user || "")
          .toLowerCase()
          .includes(query)
      );
    }

    if (riskFilter !== "All") {
      result = result.filter(
        (user) =>
          String(user.risk_level || "")
            .toLowerCase() ===
          riskFilter.toLowerCase()
      );
    }

    setFilteredUsers(result);
  };

  const getRiskClass = (level) => {
    return String(
      level || "Low"
    ).toLowerCase();
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 35) return "medium";
    return "low";
  };

  if (loading) {
    return (
      <div className="risk-analysis-page">
        <div className="risk-loading">
          Loading risk analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="risk-analysis-page">
      <div className="risk-header">
        <div>
          <h1>Risk Analysis</h1>
          <p>
            AI-powered behavioral risk analysis and anomaly detection
          </p>
        </div>

        <button
          className="risk-refresh-button"
          onClick={loadRiskData}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="risk-error">
          <span>{error}</span>

          <button onClick={loadRiskData}>
            Try Again
          </button>
        </div>
      )}

      <div className="risk-summary-grid">
        <div className="risk-summary-card">
          <div className="risk-summary-icon users">
            <Users size={22} />
          </div>

          <div>
            <span>Analyzed Users</span>

            <strong>
              {summary.total_users || 0}
            </strong>
          </div>
        </div>

        <div className="risk-summary-card">
          <div className="risk-summary-icon anomaly">
            <Activity size={22} />
          </div>

          <div>
            <span>Detected Anomalies</span>

            <strong>
              {summary.total_anomalies || 0}
            </strong>
          </div>
        </div>

        <div className="risk-summary-card">
          <div className="risk-summary-icon critical">
            <ShieldAlert size={22} />
          </div>

          <div>
            <span>Critical Risk</span>

            <strong>
              {summary.risk_distribution?.critical || 0}
            </strong>
          </div>
        </div>

        <div className="risk-summary-card">
          <div className="risk-summary-icon high">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>High Risk</span>

            <strong>
              {summary.risk_distribution?.high || 0}
            </strong>
          </div>
        </div>
      </div>

      <div className="risk-distribution-card">
        <div className="risk-card-heading">
          <div>
            <h2>Risk Distribution</h2>

            <p>
              Distribution of employees by calculated risk level
            </p>
          </div>

          <TrendingUp size={21} />
        </div>

        <div className="risk-distribution">
          <div className="distribution-item critical">
            <div className="distribution-label">
              <span>Critical</span>

              <strong>
                {summary.risk_distribution?.critical || 0}
              </strong>
            </div>

            <div className="distribution-bar">
              <div
                style={{
                  width: `${
                    summary.total_users
                      ? (
                          summary.risk_distribution.critical /
                          summary.total_users
                        ) *
                        100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>

          <div className="distribution-item high">
            <div className="distribution-label">
              <span>High</span>

              <strong>
                {summary.risk_distribution?.high || 0}
              </strong>
            </div>

            <div className="distribution-bar">
              <div
                style={{
                  width: `${
                    summary.total_users
                      ? (
                          summary.risk_distribution.high /
                          summary.total_users
                        ) *
                        100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>

          <div className="distribution-item medium">
            <div className="distribution-label">
              <span>Medium</span>

              <strong>
                {summary.risk_distribution?.medium || 0}
              </strong>
            </div>

            <div className="distribution-bar">
              <div
                style={{
                  width: `${
                    summary.total_users
                      ? (
                          summary.risk_distribution.medium /
                          summary.total_users
                        ) *
                        100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>

          <div className="distribution-item low">
            <div className="distribution-label">
              <span>Low</span>

              <strong>
                {summary.risk_distribution?.low || 0}
              </strong>
            </div>

            <div className="distribution-bar">
              <div
                style={{
                  width: `${
                    summary.total_users
                      ? (
                          summary.risk_distribution.low /
                          summary.total_users
                        ) *
                        100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="risk-table-card">
        <div className="risk-table-toolbar">
          <div>
            <h2>User Risk Analysis</h2>

            <p>
              Behavioral risk scores generated by the anomaly detection engine
            </p>
          </div>

          <div className="risk-filters">
            <div className="risk-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(event.target.value)
              }
            >
              <option value="All">
                All Risk Levels
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
        </div>

        {filteredUsers.length === 0 ? (
          <div className="risk-empty">
            <ShieldAlert size={44} />

            <h3>
              No risk data found
            </h3>

            <p>
              No users match the selected filters.
            </p>
          </div>
        ) : (
          <div className="risk-table-wrapper">
            <table className="risk-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Anomaly Score</th>
                  <th>Anomaly</th>
                  <th>Logins</th>
                  <th>Devices</th>
                  <th>After-Hours</th>
                  <th>Weekend</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={
                      user.id ||
                      user.user
                    }
                  >
                    <td>
                      <div className="risk-user">
                        <div className="risk-user-avatar">
                          {String(
                            user.user || "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {user.user ||
                            "Unknown User"}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <div className="score-wrapper">
                        <strong
                          className={`score ${getScoreClass(
                            user.risk_score
                          )}`}
                        >
                          {Number(
                            user.risk_score || 0
                          ).toFixed(1)}
                        </strong>

                        <div className="mini-score-bar">
                          <div
                            className={getScoreClass(
                              user.risk_score
                            )}
                            style={{
                              width: `${Math.min(
                                100,
                                user.risk_score || 0
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`risk-level ${getRiskClass(
                          user.risk_level
                        )}`}
                      >
                        {user.risk_level ||
                          "Low"}
                      </span>
                    </td>

                    <td>
                      {Number(
                        user.anomaly_score || 0
                      ).toFixed(1)}
                    </td>

                    <td>
                      {user.anomaly === 1 ? (
                        <span className="anomaly-badge detected">
                          Detected
                        </span>
                      ) : (
                        <span className="anomaly-badge normal">
                          Normal
                        </span>
                      )}
                    </td>

                    <td>
                      {user.login_count || 0}
                    </td>

                    <td>
                      {user.unique_devices || 0}
                    </td>

                    <td>
                      {user.after_hours_logins || 0}
                    </td>

                    <td>
                      {user.weekend_logins || 0}
                    </td>

                    <td>
                      <button className="risk-view-button">
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RiskAnalysis;