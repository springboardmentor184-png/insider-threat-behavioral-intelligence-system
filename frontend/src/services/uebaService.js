import axiosClient from './axiosClient';

export const getUEBADashboardStats = async () => {
  const response = await axiosClient.get('/ueba/dashboard');
  return response.data;
};

export const getBehaviorBaseline = async (employeeId) => {
  const response = await axiosClient.get(`/ueba/baseline/${employeeId}`);
  return response.data;
};

export const getPeerComparison = async (employeeId) => {
  const response = await axiosClient.get(`/ueba/peer/${employeeId}`);
  return response.data;
};

export const getBehaviorDeviations = async (employeeId) => {
  const response = await axiosClient.get(`/ueba/deviation/${employeeId}`);
  return response.data;
};

export const getBehaviorDrift = async (employeeId) => {
  const response = await axiosClient.get(`/ueba/drift/${employeeId}`);
  return response.data;
};

export const getRiskPrediction = async (employeeId) => {
  const response = await axiosClient.get(`/ueba/prediction/${employeeId}`);
  return response.data;
};

export const getMonitoredEntities = async () => {
  const response = await axiosClient.get('/ueba/entities');
  return response.data;
};

export const getEntityDetail = async (entityType, entityName) => {
  const response = await axiosClient.get(`/ueba/entities/${entityType}/${encodeURIComponent(entityName)}`);
  return response.data;
};

export const recalculateUEBA = async (employeeId) => {
  const response = await axiosClient.post(`/ueba/recalculate/${employeeId}`);
  return response.data;
};
