import axiosClient from './axiosClient';

export const getCurrentRisk = async (employeeId) => {
  const response = await axiosClient.get(`/risk/current/${employeeId}`);
  return response.data;
};

export const getRiskHistory = async (employeeId, limit = 30) => {
  const response = await axiosClient.get(`/risk/history/${employeeId}`, {
    params: { limit },
  });
  return response.data;
};

export const getTopRiskEmployees = async (limit = 10) => {
  const response = await axiosClient.get('/risk/top', {
    params: { limit },
  });
  return response.data;
};

export const getRiskDashboardStats = async () => {
  const response = await axiosClient.get('/risk/dashboard');
  return response.data;
};

export const getDepartmentRisk = async () => {
  const response = await axiosClient.get('/risk/department');
  return response.data;
};

export const recalculateRisk = async (employeeId) => {
  const response = await axiosClient.post(`/risk/recalculate/${employeeId}`);
  return response.data;
};
