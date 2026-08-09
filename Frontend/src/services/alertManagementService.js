import api from "./api";

// JWT Header
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ===============================
// Dashboard
// ===============================
export const getAlertDashboard = async () => {
  const response = await api.get(
    "/alert-management/dashboard",
    getAuthHeader()
  );

  return response.data;
};

// ===============================
// Assign Analyst
// ===============================
export const assignAlert = async (id, assigned_analyst) => {
  const response = await api.put(
    `/alert-management/${id}/assign`,
    {
      assigned_analyst,
    },
    getAuthHeader()
  );

  return response.data;
};

// ===============================
// Escalate Alert
// ===============================
export const escalateAlert = async (id) => {
  const response = await api.put(
    `/alert-management/${id}/escalate`,
    {},
    getAuthHeader()
  );

  return response.data;
};

// ===============================
// Resolve Alert
// ===============================
export const resolveAlert = async (
  id,
  resolution_notes
) => {
  const response = await api.put(
    `/alert-management/${id}/resolve`,
    {
      resolution_notes,
    },
    getAuthHeader()
  );

  return response.data;
};