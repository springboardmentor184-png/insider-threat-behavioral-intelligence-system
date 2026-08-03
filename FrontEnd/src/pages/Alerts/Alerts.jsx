import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle
} from "lucide-react";
import "./Alerts.css";

const API_URL = "http://127.0.0.1:8000";

function Alerts() {

  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeSeverity = (severity) => {
    return String(severity || "")
      .trim()
      .toLowerCase();
  };

  const loadAlerts = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/alerts/`
      );

      const responseData = Array.isArray(response.data)
        ? response.data
        : response.data?.alerts || [];

      const filtered = responseData.filter(
        (alert) => {

          const severity = normalizeSeverity(
            alert.severity
          );

          return (
            severity === "critical" ||
            severity === "high" ||
            severity === "medium"
          );

        }
      );

      setAlerts(filtered);

    } catch (err) {

      setError(
        err.response?.data?.detail ||
        "Unable to load alerts"
      );

      setAlerts([]);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadAlerts();

  }, []);


  const filteredAlerts = useMemo(() => {

    const query = search
      .trim()
      .toLowerCase();


    return alerts.filter(
      (alert) => {

        const text = `
          ${alert.title || ""}
          ${alert.description || ""}
          ${alert.alert_type || ""}
          ${alert.severity || ""}
        `.toLowerCase();


        const searchMatch =
          !query ||
          text.includes(query);


        const severityMatch =
          severityFilter === "All" ||
          normalizeSeverity(alert.severity) ===
          severityFilter.toLowerCase();


        return (
          searchMatch &&
          severityMatch
        );

      }
    );


  }, [
    alerts,
    search,
    severityFilter
  ]);


  const stats = useMemo(() => {

    return {

      total: alerts.length,

      critical: alerts.filter(
        (alert) =>
          normalizeSeverity(alert.severity) === "critical"
      ).length,

      high: alerts.filter(
        (alert) =>
          normalizeSeverity(alert.severity) === "high"
      ).length,

      medium: alerts.filter(
        (alert) =>
          normalizeSeverity(alert.severity) === "medium"
      ).length

    };

  }, [alerts]);


  if (loading) {

    return (

      <div className="alerts-page">

        <div className="alerts-loading">
          Loading alerts...
        </div>

      </div>

    );

  }
    return (

    <div className="alerts-page">

      <div className="alerts-header">

        <div>

          <h1>
            Security Alerts
          </h1>

          <p>
            Monitor Critical, High,
            and Medium insider threat alerts
          </p>

        </div>

        <button
          className="alerts-refresh-button"
          onClick={loadAlerts}
        >

          <RefreshCw size={16} />

          Refresh

        </button>

      </div>


      {error && (

        <div className="alerts-error">

          {error}

        </div>

      )}



      <div className="alerts-summary">

        <div className="alert-summary-card">

          <div className="alert-summary-icon total">

            <AlertTriangle size={22} />

          </div>

          <div>

            <span>
              Total Alerts
            </span>

            <strong>
              {stats.total}
            </strong>

          </div>

        </div>


        <div className="alert-summary-card">

          <div className="alert-summary-icon critical">

            <AlertTriangle size={22} />

          </div>

          <div>

            <span>
              Critical
            </span>

            <strong>
              {stats.critical}
            </strong>

          </div>

        </div>


        <div className="alert-summary-card">

          <div className="alert-summary-icon high">

            <AlertTriangle size={22} />

          </div>

          <div>

            <span>
              High
            </span>

            <strong>
              {stats.high}
            </strong>

          </div>

        </div>


        <div className="alert-summary-card">

          <div className="alert-summary-icon medium">

            <AlertTriangle size={22} />

          </div>

          <div>

            <span>
              Medium
            </span>

            <strong>
              {stats.medium}
            </strong>

          </div>

        </div>

      </div>


      <div className="alerts-content">


        <div className="alerts-toolbar">


          <div className="alerts-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>



          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Severity
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

          </select>


        </div>



        {filteredAlerts.length === 0 ? (

          <div className="alerts-empty">

            <CheckCircle size={45} />

            <h3>
              No alerts found
            </h3>

            <p>
              No Critical, High, or Medium
              alerts available.
            </p>

          </div>


        ) : (


          <div className="alerts-table-wrapper">

            <table className="alerts-table">


              <thead>

                <tr>

                  <th>
                    Alert
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Severity
                  </th>

                  <th>
                    Risk Score
                  </th>

                </tr>

              </thead>


              <tbody>


                {filteredAlerts.map((alert) => (

                  <tr key={alert.id}>


                    <td>

                      <div className="alert-title-cell">


                        <div
                          className={`alert-icon ${normalizeSeverity(
                            alert.severity
                          )}`}
                        >

                          <AlertTriangle size={17} />

                        </div>



                        <div>


                          <strong>

                            {alert.title ||
                              "Security Alert"}

                          </strong>



                          <span>

                            {alert.description ||
                              "No description"}

                          </span>


                        </div>


                      </div>


                    </td>



                    <td>

                      {alert.alert_type || "-"}

                    </td>



                    <td>


                      <span
                        className={`alert-severity ${normalizeSeverity(
                          alert.severity
                        )}`}
                      >

                        {alert.severity || "Medium"}

                      </span>


                    </td>



                    <td>

                      <strong>

                        {alert.risk_score ?? 0}

                      </strong>


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


export default Alerts;