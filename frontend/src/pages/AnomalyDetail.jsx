import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getAnomalyDetail } from "../api/axios";

export default function AnomalyDetail() {
  const { user } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnomalyDetail(user)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <p style={{ color: "var(--text-secondary)" }}>No data found for {user}</p>
      </Layout>
    );
  }

  const metrics = [
    { label: "Total logons", value: data["metrics.total_logons"] },
    { label: "After-hours logons", value: data["metrics.after_hours_logons"] },
    { label: "Sensitive file access", value: data["metrics.sensitive_file_access"] },
    { label: "External emails", value: data["metrics.external_emails"] },
    { label: "Suspicious HTTP hits", value: data["metrics.suspicious_http_hits"] },
  ];

  return (
    <Layout>
      <Link to="/anomalies" style={{ color: "var(--text-secondary)", fontSize: 13, textDecoration: "none" }}>
        ← Back to anomaly reports
      </Link>

      <div style={{ margin: "16px 0 28px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{data.user}</h1>
        <span
          className="badge badge-accent"
          style={data.flagged ? { background: "#e0555522", color: "#e05555", marginTop: 8, display: "inline-block" } : { marginTop: 8, display: "inline-block" }}
        >
          {data.flagged ? "Flagged as risky" : "Normal behavior"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="field-label" style={{ marginBottom: 8 }}>Risk Score</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{data.risk_score}</div>
        </div>
        <div className="card">
          <div className="field-label" style={{ marginBottom: 8 }}>RF Malicious Probability</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{data.rf_malicious_prob}</div>
        </div>
        <div className="card">
          <div className="field-label" style={{ marginBottom: 8 }}>Isolation Forest</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 500 }}>
            {data.iso_forest_flag ? "Anomaly" : "Normal"}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="field-label" style={{ marginBottom: 12 }}>Behavioral triggers</div>
        {data.reasons && data.reasons.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8 }}>
            {data.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>No specific triggers.</p>
        )}
      </div>

      <div className="card">
        <div className="field-label" style={{ marginBottom: 12 }}>Activity metrics</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-hairline)" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{m.label}</span>
              <span className="mono" style={{ fontSize: 13 }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}