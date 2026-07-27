import api from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getActivityLogs = async () => {
  const response = await api.get("/activity/dashboard", getAuthHeader());
  return response.data;
};