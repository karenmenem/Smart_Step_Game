const API_BASE_URL = 'http://localhost:5000/api';

// Get admin token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ==================== READING PASSAGES ====================

export const getReadingPassages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reading-passages`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error('Get reading passages error:', error);
    throw error;
  }
};

export const createReadingPassage = async (passageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reading-passages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passageData)
    });
    return await response.json();
  } catch (error) {
    console.error('Create reading passage error:', error);
    throw error;
  }
};

export const updateReadingPassage = async (id, passageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reading-passages/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passageData)
    });
    return await response.json();
  } catch (error) {
    console.error('Update reading passage error:', error);
    throw error;
  }
};

export const deleteReadingPassage = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reading-passages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error('Delete reading passage error:', error);
    throw error;
  }
};

// ==================== QUESTIONS ====================

export const getAllQuestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/all-questions`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error('Get all questions error:', error);
    throw error;
  }
};

export const getPassageQuestions = async (passageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/passage-questions/${passageId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error('Get passage questions error:', error);
    throw error;
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
    return await response.json();
  } catch (error) {
    console.error('Create question error:', error);
    throw error;
  }
};

export const updateQuestion = async (id, questionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
    return await response.json();
  } catch (error) {
    console.error('Update question error:', error);
    throw error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error('Delete question error:', error);
    throw error;
  }
};

// ==================== ADMIN AUTH ====================

export const adminLogin = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    return await response.json();
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw error;
  }
};