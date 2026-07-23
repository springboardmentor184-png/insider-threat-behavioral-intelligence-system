import axiosClient from './axiosClient';

export const getActivities = async ({ page = 1, limit = 10, search = '', activityType = '', severity = '', status = '', department = '', startDate = '', endDate = '', sortBy = 'timestamp', sortOrder = 'desc' } = {}) => {
  const params = { page, limit, sort_by: sortBy, sort_order: sortOrder };

  if (search) params.search = search;
  if (activityType) params.activity_type = activityType;
  if (severity) params.severity = severity;
  if (status) params.status = status;
  if (department) params.department_id = department;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await axiosClient.get('/activities', { params });
  return response.data;
};

export const getActivityById = async (activityId) => {
  const response = await axiosClient.get(`/activities/${activityId}`);
  return response.data;
};
