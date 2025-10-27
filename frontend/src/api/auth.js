const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API utility functions
export const api = {
  // Authentication endpoints
  register: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData // FormData for file upload
    });
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  // Helper function to get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }
};

// Auth utility functions
export const auth = {
  // Store token and user data
  login: (tokenData) => {
    localStorage.setItem('authToken', tokenData.token);
    localStorage.setItem('userData', JSON.stringify(tokenData.data));
  },

  // Remove token and user data
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  // Get current user data
  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};