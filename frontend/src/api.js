const API_BASE = "http://127.0.0.1:8000";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export function login(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getEmployees() {
  return apiRequest("/employees/");
}

export function getLogs() {
  return apiRequest("/logs/");
}

export function ingestSampleLogs() {
  return apiRequest("/logs/ingest-sample", { method: "POST" });
}

export function createEmployee(data) {
  return apiRequest("/employees/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export function getAnomalies() {
  return apiRequest("/logs/anomalies");
}

export function computeBaselines() {
  return apiRequest("/employees/compute-baselines", { method: "POST" });
}

export function detectAnomalies() {
  return apiRequest("/employees/detect-anomalies", { method: "POST" });
}

export function computeRiskScores() {
  return apiRequest("/employees/compute-risk-scores", { method: "POST" });
}

export function runPeerComparison() {
  return apiRequest("/investigations/peer-comparison", { method: "POST" });
}

export function generateInvestigations() {
  return apiRequest("/investigations/generate", { method: "POST" });
}

export function getInvestigations() {
  return apiRequest("/investigations/");
}

export function getInvestigationDetail(id) {
  return apiRequest(`/investigations/${id}`);
}