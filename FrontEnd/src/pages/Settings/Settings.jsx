import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import "./Settings.css";

const defaultSettings = {
  email_alerts: true,
  critical_alerts: true,
  anomaly_alerts: true,
  weekly_reports: false,
  auto_refresh: true,
  refresh_interval: "30",
  risk_threshold: "70"
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(
        "insider_ai_settings"
      );

      if (savedSettings) {
        const parsedSettings = JSON.parse(
          savedSettings
        );

        setSettings({
          ...defaultSettings,
          ...parsedSettings
        });
      }
    } catch {
      localStorage.removeItem(
        "insider_ai_settings"
      );

      setSettings(defaultSettings);
    }
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setSettings((previousSettings) => ({
      ...previousSettings,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  };

  const saveSettings = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(
        "insider_ai_settings",
        JSON.stringify(settings)
      );

      window.dispatchEvent(
        new CustomEvent(
          "insider-ai-settings-updated",
          {
            detail: settings
          }
        )
      );

      setError("");
      setMessage(
        "Settings saved successfully"
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch {
      setError(
        "Unable to save settings"
      );
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);

    localStorage.setItem(
      "insider_ai_settings",
      JSON.stringify(defaultSettings)
    );

    window.dispatchEvent(
      new CustomEvent(
        "insider-ai-settings-updated",
        {
          detail: defaultSettings
        }
      )
    );

    setError("");
    setMessage(
      "Settings reset successfully"
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>
            Configure your Insider AI security intelligence system
          </p>
        </div>

        <button
          className="settings-reset-button"
          onClick={resetSettings}
        >
          <RefreshCw size={16} />
          Reset
        </button>
      </div>

      {message && (
        <div className="settings-message success">
          <CheckCircle size={17} />
          {message}
        </div>
      )}

      {error && (
        <div className="settings-message error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <form
        className="settings-container"
        onSubmit={saveSettings}
      >
        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon notifications">
              <Bell size={20} />
            </div>

            <div>
              <h2>Notifications</h2>
              <p>
                Control security alerts and notifications
              </p>
            </div>
          </div>

          <div className="settings-options">
            <div className="setting-option">
              <div>
                <strong>Email Notifications</strong>
                <span>
                  Receive security notifications through email
                </span>
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  name="email_alerts"
                  checked={settings.email_alerts}
                  onChange={handleChange}
                />

                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-option">
              <div>
                <strong>Critical Risk Alerts</strong>
                <span>
                  Receive immediate notifications for critical-risk users
                </span>
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  name="critical_alerts"
                  checked={settings.critical_alerts}
                  onChange={handleChange}
                />

                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-option">
              <div>
                <strong>Anomaly Detection Alerts</strong>
                <span>
                  Receive notifications when unusual behavior is detected
                </span>
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  name="anomaly_alerts"
                  checked={settings.anomaly_alerts}
                  onChange={handleChange}
                />

                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-option">
              <div>
                <strong>Weekly Security Reports</strong>
                <span>
                  Receive a weekly summary of security activity
                </span>
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  name="weekly_reports"
                  checked={settings.weekly_reports}
                  onChange={handleChange}
                />

                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon security">
              <Shield size={20} />
            </div>

            <div>
              <h2>Risk Detection</h2>
              <p>
                Configure behavioral risk detection settings
              </p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label>
                High Risk Threshold
              </label>

              <select
                name="risk_threshold"
                value={settings.risk_threshold}
                onChange={handleChange}
              >
                <option value="50">50</option>
                <option value="60">60</option>
                <option value="70">70</option>
                <option value="80">80</option>
                <option value="90">90</option>
              </select>

              <span>
                Users above this score are classified as high risk
              </span>
            </div>

            <div className="settings-field">
              <label>
                Automatic Data Refresh
              </label>

              <select
                name="refresh_interval"
                value={settings.refresh_interval}
                onChange={handleChange}
              >
                <option value="15">
                  Every 15 seconds
                </option>

                <option value="30">
                  Every 30 seconds
                </option>

                <option value="60">
                  Every 1 minute
                </option>

                <option value="300">
                  Every 5 minutes
                </option>
              </select>

              <span>
                Refresh interval for dashboard intelligence data
              </span>
            </div>

            <div className="setting-option standalone">
              <div>
                <strong>
                  Enable Automatic Refresh
                </strong>

                <span>
                  Automatically update dashboard intelligence data
                </span>
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  name="auto_refresh"
                  checked={settings.auto_refresh}
                  onChange={handleChange}
                />

                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon database">
              <Database size={20} />
            </div>

            <div>
              <h2>System Information</h2>
              <p>
                Current application configuration
              </p>
            </div>
          </div>

          <div className="system-info-grid">
            <div className="system-info-item">
              <span>Application</span>
              <strong>Insider AI</strong>
            </div>

            <div className="system-info-item">
              <span>Version</span>
              <strong>1.0.0</strong>
            </div>

            <div className="system-info-item">
              <span>Detection Engine</span>
              <strong>
                Isolation Forest
              </strong>
            </div>

            <div className="system-info-item">
              <span>System Status</span>
              <strong className="system-active">
                Operational
              </strong>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="submit"
            className="settings-save-button"
          >
            <Save size={17} />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;