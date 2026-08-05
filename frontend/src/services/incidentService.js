import axiosClient from './axiosClient';

export const getIncidentDashboardStats = async () => {
  const response = await axiosClient.get('/incidents/dashboard');
  return response.data;
};

export const getIncidents = async (params = {}) => {
  const response = await axiosClient.get('/incidents', { params });
  return response.data;
};

export const getIncidentDetail = async (id) => {
  const response = await axiosClient.get(`/incidents/${id}`);
  return response.data;
};

export const getAlerts = async (params = {}) => {
  const response = await axiosClient.get('/incidents/alerts', { params });
  return response.data;
};

export const getSOARPlaybooks = async () => {
  const response = await axiosClient.get('/incidents/playbooks');
  return response.data;
};

export const getSOARExecutionLogs = async (params = {}) => {
  const response = await axiosClient.get('/incidents/playbooks/logs', { params });
  return response.data;
};

export const executeSOARPlaybook = async (data) => {
  const response = await axiosClient.post('/incidents/playbooks/execute', data);
  return response.data;
};
