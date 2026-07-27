import api from "./api";

// Get JWT Token
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get All Alerts
export const getAlerts = async () => {
  const response = await api.get("/alerts", getAuthHeader());
  return response.data;
};