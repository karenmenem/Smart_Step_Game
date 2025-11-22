import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles/AdminStyles.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function AdminSubjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (isEditMode) {
      loadSubject();
    }
  }, [id, navigate]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  const loadSubject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        const subject = data.data.find(s => s.subject_id === parseInt(id));
        if (subject) {
          setFormData({
            name: subject.name || '',
            description: subject.description || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading subject:', error);
      setError('Failed to load subject');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/admin/subjects/${id}`
        : `${API_BASE_URL}/admin/subjects`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Subject ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/admin/dashboard', { state: { activeTab: 'subjects' } });
      } else {
        setError(data.message || 'Failed to save subject');
      }
    } catch (error) {
      console.error('Error saving subject:', error);
      setError('Failed to save subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h1>{isEditMode ? 'Edit Subject' : 'Add New Subject'}</h1>
          <button 
            className="admin-back-btn" 
            onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'subjects' } })}
          >
            ← Back to Dashboard
          </button>
        </div>

      {error && <div className="admin-error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-question-form">
        <div className="form-section">
          <h3>Subject Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Subject Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Science, History, Art"
              required
            />
            <small>The name of the subject that will be displayed to students</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Brief description of this subject"
            />
            <small>Optional description to explain what this subject covers</small>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="admin-cancel-btn"
            onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'subjects' } })}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Subject' : 'Create Subject')}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default AdminSubjectForm;
