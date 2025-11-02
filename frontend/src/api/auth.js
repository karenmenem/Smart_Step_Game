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
  login: (response) => {
    // Handle both response formats (token at root or in data)
    const token = response.token || response.data?.token;
    const userData = response.data || response;
    
    console.log('Login response:', response);
    console.log('Extracted token:', token);
    console.log('Extracted userData:', userData);
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
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
    console.log('Setting current child:', child);
    localStorage.setItem('currentChild', JSON.stringify(child));
    
    // Also update the userData to include activeChild
    const userData = auth.getCurrentUser();
    if (userData) {
      userData.activeChild = child;
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  },

  getCurrentChild: () => {
    const childData = localStorage.getItem('currentChild');
    if (childData) {
      return JSON.parse(childData);
    }
    
    // Only fallback to activeChild if explicitly set, not to first child
    const userData = auth.getCurrentUser();
    const activeChild = userData?.activeChild || userData?.child;
    
    return activeChild || null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!(token && userData);
  },

  saveProgress: async (progressData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/save-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(progressData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Save progress request failed:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  getProgress: async (childId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/progress/${childId}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get progress request failed:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  }
};