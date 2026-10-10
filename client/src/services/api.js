const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    register: (userData) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(handleResponse),

    login: (credentials) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Projects
  projects: {
    getAll: () =>
      fetch(`${API_BASE}/projects`, {
        method: 'GET',
        headers: getAuthHeaders()
      }).then(handleResponse),

    getById: (id) =>
      fetch(`${API_BASE}/projects/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      }).then(handleResponse),

    create: (data) =>
      fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),

    update: (id, data) =>
      fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),

    delete: (id) =>
      fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Files
  files: {
    create: (projectId, fileData) =>
      fetch(`${API_BASE}/projects/${projectId}/files`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(fileData)
      }).then(handleResponse),

    update: (fileId, updateData) =>
      fetch(`${API_BASE}/files/${fileId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      }).then(handleResponse),

    delete: (fileId) =>
      fetch(`${API_BASE}/files/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Execution
  execution: {
    run: (language, code) =>
      fetch(`${API_BASE}/execute`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ language, code })
      }).then(handleResponse)
  }
};
