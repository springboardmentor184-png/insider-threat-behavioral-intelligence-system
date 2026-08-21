import api from "./api";

// ==========================================
// Executive Security Dashboard
// ==========================================

export const getExecutiveDashboard = async () => {
  const response = await api.get(
    "/analytics/executive-dashboard"
  );

  return response.data;
};