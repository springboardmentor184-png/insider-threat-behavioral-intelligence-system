import axiosClient from './axiosClient';

export const getBehaviorBaseline = async (employeeId) => {
  const response = await axiosClient.get(`/behavior/baseline/${employeeId}`);
  return response.data;
};

export const getBehaviorProfile = async (employeeId) => {
  const response = await axiosClient.get(`/behavior/${employeeId}`);
  return response.data;
};

export const getLoginPattern = async (employeeId) => {
  const response = await axiosClient.get(`/behavior/login-pattern/${employeeId}`);
  return response.data;
};

export const getWorkPattern = async (employeeId) => {
  const response = await axiosClient.get(`/behavior/work-pattern/${employeeId}`);
  return response.data;
};

export const getDeviceUsage = async (employeeId) => {
  const response = await axiosClient.get(`/behavior/device-usage/${employeeId}`);
  return response.data;
};

export const getResourceAccess = async (employeeId) => {
  const response = await axiosClient.get(`/behavior/resource-access/${employeeId}`);
  return response.data;
};
