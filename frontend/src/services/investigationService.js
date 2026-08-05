import axiosClient from './axiosClient';

export const getInvestigationDashboardStats = async () => {
  const response = await axiosClient.get('/investigation/dashboard');
  return response.data;
};

export const getInvestigations = async (params = {}) => {
  const response = await axiosClient.get('/investigation', { params });
  return response.data;
};

export const getInvestigationDetail = async (id) => {
  const response = await axiosClient.get(`/investigation/${id}`);
  return response.data;
};

export const createInvestigation = async (data) => {
  const response = await axiosClient.post('/investigation', data);
  return response.data;
};

export const updateInvestigation = async (id, data) => {
  const response = await axiosClient.put(`/investigation/${id}`, data);
  return response.data;
};

export const assignAnalyst = async (id, analystId) => {
  const response = await axiosClient.post(`/investigation/${id}/assign`, { analyst_id: analystId });
  return response.data;
};

export const addInvestigationNote = async (id, noteData) => {
  const response = await axiosClient.post(`/investigation/${id}/note`, noteData);
  return response.data;
};

export const updateInvestigationStatus = async (id, statusData) => {
  const response = await axiosClient.post(`/investigation/${id}/status`, statusData);
  return response.data;
};

export const closeInvestigation = async (id, closeData) => {
  const response = await axiosClient.post(`/investigation/${id}/close`, closeData);
  return response.data;
};

export const getInvestigationTimeline = async (id) => {
  const response = await axiosClient.get(`/investigation/${id}/timeline`);
  return response.data;
};

export const getInvestigationEvidence = async (id) => {
  const response = await axiosClient.get(`/investigation/${id}/evidence`);
  return response.data;
};
