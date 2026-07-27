import api from "./api";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

export const getBaseline = async (employeeId) => {
  const response = await api.get(
    `/baseline/${employeeId}`,
    getAuthHeader()
  );

  return response.data;
};