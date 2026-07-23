import axiosClient from './axiosClient';

export const getEmployees = async ({ page = 1, limit = 10, search = '', department = '', role = '', status = '' } = {}) => {
  const params = { page, limit };

  if (search) params.search = search;
  if (department) params.department = department;
  if (role) params.role = role;

  if (status === 'Active') {
    params.is_active = true;
  } else if (status === 'Inactive') {
    params.is_active = false;
  }

  const response = await axiosClient.get('/employees', { params });
  return response.data;
};

export const getEmployeeById = async (employeeId) => {
  const response = await axiosClient.get(`/employees/${employeeId}`);
  return response.data;
};

export const getEmployeeActivities = async (employeeId) => {
  const response = await axiosClient.get(`/activities/employee/${employeeId}`);
  return response.data;
};

export const getRecentAlerts = async () => {
  const response = await axiosClient.get('/dashboard/recent-alerts');
  return response.data;
};
