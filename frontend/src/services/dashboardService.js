import axiosClient from './axiosClient';

export const getDashboardOverview = async () => {
  const response = await axiosClient.get('/dashboard/overview');
  return response.data;
};

export const getRiskSummary = async () => {
  const response = await axiosClient.get('/dashboard/risk-summary');
  return response.data;
};

export const getActivitySummary = async () => {
  const response = await axiosClient.get('/dashboard/activity-summary');
  return response.data;
};

export const getRecentAlerts = async () => {
  const response = await axiosClient.get('/dashboard/recent-alerts');
  return response.data;
};

export const getTopRiskEmployees = async () => {
  const response = await axiosClient.get('/dashboard/top-risk-employees');
  return response.data;
};

export const getDashboardCharts = async () => {
  const response = await axiosClient.get('/dashboard/charts');
  return response.data;
};

export const getRiskOverview = async () => {
  const response = await axiosClient.get('/dashboard/risk-overview');
  return response.data;
};

export const getRiskTrend = async () => {
  const response = await axiosClient.get('/dashboard/risk-trend');
  return response.data;
};

export const getRecentActivities = async () => {
  const response = await axiosClient.get('/dashboard/recent-activities');
  return response.data;
};
