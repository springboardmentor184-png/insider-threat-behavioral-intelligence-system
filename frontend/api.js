/**
 * API Client Module
 * Handles all backend API communication
 */

const API = {
  BASE_URL: 'http://localhost:5000/api',
  
  // Store auth token
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  
  /**
   * Set authorization token
   */
  setToken(accessToken, refreshToken = null) {
    this.token = accessToken;
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refresh_token', refreshToken);
    }
  },
  
  /**
   * Clear auth tokens
   */
  clearToken() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  /**
   * Get authorization headers
   */
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  },
  
  /**
   * Make fetch request
   */
  async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(),
    };
    
    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          config.headers = this.getHeaders();
          return fetch(url, config);
        } else {
          this.handleUnauthorized();
          throw new Error('Authentication failed');
        }
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.setToken(data.data.access_token, this.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },
  
  /**
   * Handle unauthorized access
   */
  handleUnauthorized() {
    this.clearToken();
    window.location.href = '/login';
  },
  
  // ==========================================
  // AUTH ENDPOINTS
  // ==========================================
  
  auth: {
    login: async (username, password) => {
      return API.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    },
    
    register: async (username, email, password) => {
      return API.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
      });
    },
    
    logout: async () => {
      return API.request('/auth/logout', { method: 'POST' });
    },
    
    getProfile: async () => {
      return API.request('/auth/profile', { method: 'GET' });
    },
    
    getDashboardUrl: async () => {
      return API.request('/auth/dashboard-url', { method: 'GET' });
    }
  },
  
  // ==========================================
  // EMPLOYEE ENDPOINTS
  // ==========================================
  
  employees: {
    getAll: async () => {
      return API.request('/employees', { method: 'GET' });
    },
    
    getById: async (id) => {
      return API.request(`/employees/${id}`, { method: 'GET' });
    },
    
    create: async (data) => {
      return API.request('/employees', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    
    update: async (id, data) => {
      return API.request(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    
    delete: async (id) => {
      return API.request(`/employees/${id}`, { method: 'DELETE' });
    }
  },
  
  // ==========================================
  // ACTIVITY ENDPOINTS
  // ==========================================
  
  activity: {
    getAll: async () => {
      return API.request('/activity', { method: 'GET' });
    },
    
    getByEmployee: async (employeeId) => {
      return API.request(`/activity/employee/${employeeId}`, { method: 'GET' });
    }
  },
  
  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================
  
  admin: {
    getSystemSummary: async () => {
      return API.request('/admin/system-summary', { method: 'GET' });
    }
  },

  // ==========================================
  // RISK ENDPOINTS
  // ==========================================
  risk: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return API.request(`/risk?${qs}`, { method: 'GET' });
    },
    getByEmployee: async (employeeCode) => {
      return API.request(`/risk/${employeeCode}`, { method: 'GET' });
    },
    calculate: async (employeeCode = null) => {
      return API.request('/risk/calculate', {
        method: 'POST',
        body: JSON.stringify(employeeCode ? { employee_code: employeeCode } : {})
      });
    }
  },

  // ==========================================
  // ALERTS ENDPOINTS
  // ==========================================
  alerts: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return API.request(`/alerts?${qs}`, { method: 'GET' });
    },
    create: async (data) => {
      return API.request('/alerts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (alertId, data) => {
      return API.request(`/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  },

  // ==========================================
  // INVESTIGATION ENDPOINTS
  // ==========================================
  investigations: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return API.request(`/investigations?${qs}`, { method: 'GET' });
    },
    getById: async (caseId) => {
      return API.request(`/investigations/${caseId}`, { method: 'GET' });
    },
    create: async (data) => {
      return API.request('/investigations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (caseId, data) => {
      return API.request(`/investigations/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    addNote: async (caseId, note) => {
      return API.request(`/investigations/${caseId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note })
      });
    },
    addEvidence: async (caseId, filename, filepath = 'ManualReference', fileSize = 0) => {
      return API.request(`/investigations/${caseId}/evidence`, {
        method: 'POST',
        body: JSON.stringify({ filename, filepath, file_size: fileSize })
      });
    }
  },

  // ==========================================
  // NOTIFICATIONS ENDPOINTS
  // ==========================================
  notifications: {
    getAll: async () => {
      return API.request('/analytics/notifications', { method: 'GET' });
    },
    read: async (notificationId) => {
      return API.request(`/analytics/notifications/${notificationId}`, { method: 'PUT' });
    }
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
