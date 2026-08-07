import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEmployees = () => api.get("/employees/");
export const createEmployee = (data) => api.post("/employees/", data);
export const getAnomalies = () => api.get("/api/anomalies");
export const getAnomalyDetail = (user) => api.get(`/api/anomalies/${user}`);
export const flagEmployee = (employeeId, reason) =>
  api.post(`/employees/${employeeId}/flag`, { employee_id: employeeId, reason });

export default api;