import api from "./api";

// Get JWT Token
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get All Employees
export const getEmployees = async () => {
  const response = await api.get("/employees/", getAuthHeader());
  return response.data;
};

// Get Employee By ID
export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`, getAuthHeader());
  return response.data;
};

// Create Employee
export const createEmployee = async (employee) => {
  const response = await api.post(
    "/employees/",
    employee,
    getAuthHeader()
  );
  return response.data;
};

// Update Employee
export const updateEmployee = async (id, employee) => {
  const response = await api.put(
    `/employees/${id}`,
    employee,
    getAuthHeader()
  );
  return response.data;
};

// Delete Employee
export const deleteEmployee = async (id) => {
  const response = await api.delete(
    `/employees/${id}`,
    getAuthHeader()
  );
  return response.data;
};