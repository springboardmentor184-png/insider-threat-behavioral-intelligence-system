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

// Get Investigation Dashboard
export const getInvestigations = async () => {
  const response = await api.get(
    "/investigations/dashboard",
    getAuthHeader()
  );

  return response.data;
};

// Get Investigation Details
export const getInvestigationDetails = async (id) => {
  const response = await api.get(
    `/investigations/${id}/details`,
    getAuthHeader()
  );

  return response.data;
};

// ==============================
// Investigation Timeline
// ==============================
export const getInvestigationTimeline = async (id) => {

  const response = await api.get(
    `/investigations/${id}/timeline`,
    getAuthHeader()
  );

  return response.data;

};
// ======================================
// Threat Evidence
// ======================================

export const getThreatEvidence = async (id) => {

    const response = await api.get(
        `/investigations/${id}/evidence`,
        getAuthHeader()
    );

    return response.data;

};

// ======================================
// Device Analysis
// ======================================

export const getDeviceAnalysis = async (id) => {

    const response = await api.get(
        `/investigations/${id}/device-analysis`,
        getAuthHeader()
    );

    return response.data;

};

// ======================================
// User Risk History
// ======================================

export const getRiskHistory = async (id) => {

    const response = await api.get(
        `/investigations/${id}/risk-history`,
        getAuthHeader()
    );

    return response.data;

};

// ======================================
// Event Correlation
// ======================================

export const getEventCorrelation = async (id) => {

    const response = await api.get(
        `/investigations/${id}/correlation`,
        getAuthHeader()
    );

    return response.data;

};

// ======================================
// Investigation Workflow Details
// ======================================

export const getWorkflow = async (id) => {

    const response = await api.get(
        `/investigations/${id}/details`,
        getAuthHeader()
    );

    return response.data;

};
// ======================================
// Update Investigation Workflow
// ======================================

export const updateWorkflow = async (id, workflow) => {

    const response = await api.put(
        `/investigations/${id}/workflow`,
        workflow,
        getAuthHeader()
    );

    return response.data;

};

// =====================================================
// Download Investigation Report
// =====================================================

export const downloadInvestigationReport = async (
  investigationId
) => {

  const token = localStorage.getItem(
    "access_token"
  );

  const response = await api.get(
    `/investigations/${investigationId}/report`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  return response.data;
};