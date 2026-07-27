import api from "./api";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// AI Prediction
export const predictRisk = async (predictionData) => {
  const response = await api.post(
    "/ai/predict",
    predictionData,
    getAuthHeader()
  );

  return response.data;
};

// Download AI Report
export const downloadReport = async (employeeId) => {
  const response = await api.get(
    `/ai/report/${employeeId}`,
    {
      ...getAuthHeader(),
      responseType: "blob",
    }
  );

  return response.data;
};