const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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
      const token = sessionStorage.getItem('authToken');
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
      const token = sessionStorage.getItem('authToken');
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
    const token = sessionStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  // Quiz-related API calls
  getQuestions: async (activityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/questions/${activityId}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get questions request failed:', error);
      return { success: false, message: 'Failed to fetch questions' };
    }
  },

  getActivity: async (activityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/activity/${activityId}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get activity request failed:', error);
      return { success: false, message: 'Failed to fetch activity' };
    }
  },

  getActivitiesByLevel: async (subject, level) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/activities/${subject}/${level}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get activities request failed:', error);
      return { success: false, message: 'Failed to fetch activities' };
    }
  },

  saveQuizAttempt: async (quizData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/attempt`, {
        method: 'POST',
        headers: api.getAuthHeaders(),
        body: JSON.stringify(quizData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Save quiz attempt failed:', error);
      return { success: false, message: 'Failed to save quiz attempt' };
    }
  },

  getChildProgress: async (childId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/progress/${childId}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get progress request failed:', error);
      return { success: false, message: 'Failed to fetch progress' };
    }
  },

  getChildAchievements: async (childId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/achievements/${childId}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get achievements request failed:', error);
      return { success: false, message: 'Failed to fetch achievements' };
    }
  },

  // Progress/Level Locking API calls
  checkLevelAccess: async (childId, activityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/check-access/${childId}/${activityId}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Check level access failed:', error);
      return { success: false, allowed: true }; // Fail open to avoid blocking users
    }
  },

  saveProgress: async (progressData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/save`, {
        method: 'POST',
        headers: api.getAuthHeaders(),
        body: JSON.stringify(progressData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Save progress failed:', error);
      return { success: false, message: 'Failed to save progress' };
    }
  },

  getAllProgress: async (childId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/progress/child/${childId}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get all progress failed:', error);
      return { success: false, message: 'Failed to fetch progress' };
    }
  },

  // Achievements API calls
  getAchievements: async (childId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements/child/${childId}`, {
        method: 'GET',
        headers: api.getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get achievements failed:', error);
      return { success: false, message: 'Failed to fetch achievements' };
    }
  },

  // Teacher-Student Tracking APIs
  linkChildToTeacher: async (childId, classCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-teacher/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, classCode })
      });
      return await response.json();
    } catch (error) {
      console.error('Error linking to teacher:', error);
      return { success: false, message: error.message };
    }
  },

  getChildTeacherLinks: async (childId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-teacher/child/${childId}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting teacher links:', error);
      return { success: false, message: error.message };
    }
  },

  updateTeacherPermissions: async (linkId, permissions) => {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-teacher/permissions/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating permissions:', error);
      return { success: false, message: error.message };
    }
  },

  removeTeacherLink: async (linkId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-teacher/link/${linkId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error removing teacher link:', error);
      return { success: false, message: error.message };
    }
  },

  // Teacher APIs
  getTeacherClasses: async (teacherId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-students/classes/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting classes:', error);
      return { success: false, message: error.message };
    }
  },

  createTeacherClass: async (teacherId, className, description, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher-students/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teacherId, className, description })
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating class:', error);
      return { success: false, message: error.message };
    }
  },

  getTeacherStudents: async (teacherId, classId, token) => {
    try {
      const url = classId 
        ? `${API_BASE_URL}/teacher-students/students/${teacherId}?classId=${classId}`
        : `${API_BASE_URL}/teacher-students/students/${teacherId}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting students:', error);
      return { success: false, message: error.message };
    }
  },

  getStudentProgress: async (teacherId, childId, token) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher-students/student-progress/${teacherId}/${childId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return await response.json();
    } catch (error) {
      console.error('Error getting student progress:', error);
      return { success: false, message: error.message };
    }
  }
};

export const auth = {
  login: (tokenData) => {
    sessionStorage.setItem('authToken', tokenData.token);
    sessionStorage.setItem('userData', JSON.stringify(tokenData.data));
    console.log('User logged in successfully');
  },

  logout: () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('currentChild');
    console.log('User logged out');
  },

  getCurrentUser: () => {
    const userData = sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentChild: (child) => {
    sessionStorage.setItem('currentChild', JSON.stringify(child));
  },

  getCurrentChild: () => {
    const childData = sessionStorage.getItem('currentChild');
    if (childData) {
      return JSON.parse(childData);
    }
    // Fallback to first child from user data
    const userData = auth.getCurrentUser();
    return userData?.child || userData?.children?.[0] || null;
  },

  isAuthenticated: () => {
    const token = sessionStorage.getItem('authToken');
    const userData = sessionStorage.getItem('userData');
    return !!(token && userData);
  }
};