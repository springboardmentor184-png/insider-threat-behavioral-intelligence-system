import axiosClient from './axiosClient';

export const getEmployeeReport = async (employeeId) => {
  const response = await axiosClient.get(`/reports/employee/${employeeId}`);
  return response.data;
};

export const getDepartmentReport = async (departmentId) => {
  const response = await axiosClient.get(`/reports/department/${departmentId}`);
  return response.data;
};

export const getRecentAnomalies = async ({ page = 1, limit = 10 } = {}) => {
  const response = await axiosClient.get('/reports/recent-anomalies', { params: { page, limit } });
  return response.data;
};

export const getHighRiskReports = async () => {
  const response = await axiosClient.get('/reports/high-risk');
  return response.data;
};

export const exportReport = async () => {
  const response = await axiosClient.get('/reports/export', { responseType: 'blob' });
  return response;
};
