import axiosClient from './axiosClient';

export const getHighRiskEmployees = async () => {
  const response = await axiosClient.get('/threat/high-risk');
  return response.data;
};

export const getThreatAssessment = async (employeeId) => {
  const response = await axiosClient.get(`/threat/${employeeId}`);
  return response.data;
};

export const getThreatHistory = async (employeeId) => {
  const response = await axiosClient.get(`/threat/history/${employeeId}`);
  return response.data;
};

export const analyzeThreat = async (employeeId) => {
  const response = await axiosClient.post(`/threat/analyze/${employeeId}`);
  return response.data;
};
