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

// Get UEBA Intelligence
export const getUEBAIntelligence = async (employeeId) => {
  const response = await api.get(
    `/ueba/${employeeId}`,
    getAuthHeader()
  );

  return response.data;
};