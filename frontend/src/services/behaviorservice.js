import API_URL from "./api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAnomalies() {
  const res = await fetch(`${API_URL}/behavior/anomalies`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch anomalies");
  return res.json();
}

export async function fetchRiskSummary() {
  const res = await fetch(`${API_URL}/behavior/risk_summary`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch risk summary");
  return res.json();
}