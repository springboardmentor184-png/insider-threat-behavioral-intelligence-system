import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Activity,
  FileText,
  Smartphone,
  Mail,
  AlertTriangle,
  ShieldAlert,
  RefreshCw
} from "lucide-react";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/dashboard/summary`
      );

      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-state">
        <RefreshCw
          size={25}
          className="dashboard-spinner"
        />
        <p>Loading security intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-state error">
        <AlertTriangle size={28} />
        <p>{error}</p>

        <button
          onClick={loadDashboard}
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const risk = data?.riskDistribution || {};

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees || 0,
      icon: Users,
      className: "blue"
    },
    {
      title: "Login Activities",
      value: stats.loginActivities || 0,
      icon: Activity,
      className: "purple"
    },
    {
      title: "File Access Events",
      value: stats.fileAccessEvents || 0,
      icon: FileText,
      className: "orange"
    },
    {
      title: "Device Activities",
      value: stats.deviceActivities || 0,
      icon: Smartphone,
      className: "cyan"
    },
    {
      title: "Email Activities",
      value: stats.emailActivities || 0,
      icon: Mail,
      className: "green"
    },
    {
      title: "Detected Anomalies",
      value: stats.totalAnomalies || 0,
      icon: AlertTriangle,
      className: "red"
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Security Dashboard</h1>

          <p>
            Insider threat behavioral intelligence overview
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={loadDashboard}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="dashboard-stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="dashboard-stat-card"
              key={card.title}
            >
              <div
                className={`dashboard-stat-icon ${card.className}`}
              >
                <Icon size={21} />
              </div>

              <div className="dashboard-stat-content">
                <span>{card.title}</span>

                <strong>
                  {Number(card.value).toLocaleString()}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Risk Distribution</h2>

              <p>
                Current behavioral risk classification
              </p>
            </div>

            <ShieldAlert size={21} />
          </div>

          <div className="risk-list">
            <div className="risk-row">
              <div className="risk-label">
                <span className="risk-dot critical" />
                Critical
              </div>

              <strong>
                {Number(
                  risk.critical || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div className="risk-progress">
              <div
                className="risk-progress-bar critical"
                style={{
                  width: `${risk.critical ? 100 : 0}%`
                }}
              />
            </div>

            <div className="risk-row">
              <div className="risk-label">
                <span className="risk-dot high" />
                High
              </div>

              <strong>
                {Number(
                  risk.high || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div className="risk-progress">
              <div
                className="risk-progress-bar high"
                style={{
                  width: `${risk.high ? 100 : 0}%`
                }}
              />
            </div>

            <div className="risk-row">
              <div className="risk-label">
                <span className="risk-dot medium" />
                Medium
              </div>

              <strong>
                {Number(
                  risk.medium || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div className="risk-progress">
              <div
                className="risk-progress-bar medium"
                style={{
                  width: `${risk.medium ? 100 : 0}%`
                }}
              />
            </div>

            <div className="risk-row">
              <div className="risk-label">
                <span className="risk-dot low" />
                Low
              </div>

              <strong>
                {Number(
                  risk.low || 0
                ).toLocaleString()}
              </strong>
            </div>

            <div className="risk-progress">
              <div
                className="risk-progress-bar low"
                style={{
                  width: `${risk.low ? 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Security Overview</h2>

              <p>
                System activity monitoring status
              </p>
            </div>

            <Activity size={21} />
          </div>

          <div className="overview-list">
            <div className="overview-item">
              <span>Login Monitoring</span>
              <strong className="status-active">
                Active
              </strong>
            </div>

            <div className="overview-item">
              <span>File Monitoring</span>
              <strong className="status-active">
                Active
              </strong>
            </div>

            <div className="overview-item">
              <span>Device Monitoring</span>
              <strong className="status-active">
                Active
              </strong>
            </div>

            <div className="overview-item">
              <span>Email Monitoring</span>
              <strong className="status-active">
                Active
              </strong>
            </div>

            <div className="overview-item">
              <span>ML Detection Engine</span>
              <strong className="status-active">
                Ready
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-panel dashboard-data-summary">
        <div className="dashboard-panel-header">
          <div>
            <h2>Activity Data Summary</h2>

            <p>
              Total behavioral telemetry processed by the system
            </p>
          </div>

          <Activity size={21} />
        </div>

        <div className="data-summary-grid">
          <div className="data-summary-item">
            <span>Login Records</span>
            <strong>
              {Number(
                stats.loginActivities || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="data-summary-item">
            <span>File Records</span>
            <strong>
              {Number(
                stats.fileAccessEvents || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="data-summary-item">
            <span>Device Records</span>
            <strong>
              {Number(
                stats.deviceActivities || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div className="data-summary-item">
            <span>Email Records</span>
            <strong>
              {Number(
                stats.emailActivities || 0
              ).toLocaleString()}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;