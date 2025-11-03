const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  register: async (formData) => {
    try {
      console.log('Registration request to:', `${API_BASE_URL}/auth/register`);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      return data;
    } catch (error) {
      console.error('Registration request failed:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  login: async (credentials) => {
    try {
      console.log('Login request to:', `${API_BASE_URL}/auth/login`);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      return data;
    } catch (error) {
      console.error('Login request failed:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  addChild: async (childData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/add-child`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: childData
      });
      
      const data = await response.json();
      console.log('Add child response:', data);
      return data;
    } catch (error) {
      console.error('Add child request failed:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  getChildren: async (parentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/children/${parentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get children request failed:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }
};

export const auth = {
  login: (tokenData) => {
    localStorage.setItem('authToken', tokenData.token);
    localStorage.setItem('userData', JSON.stringify(tokenData.data));
    console.log('User logged in successfully');
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('currentChild');
    console.log('User logged out');
  },

  getCurrentUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentChild: (child) => {
    localStorage.setItem('currentChild', JSON.stringify(child));
  },

  getCurrentChild: () => {
    const childData = localStorage.getItem('currentChild');
    if (childData) {
      return JSON.parse(childData);
    }
    // Fallback to first child from user data
    const userData = auth.getCurrentUser();
    return userData?.child || userData?.children?.[0] || null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
  }
};