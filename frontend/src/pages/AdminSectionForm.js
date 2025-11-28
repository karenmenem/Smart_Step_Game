import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles/AdminStyles.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function AdminSectionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    subject_id: '',
    name: '',
    description: '',
    level: 1
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    loadSubjects();
    if (isEditMode) {
      loadSection();
    }
  }, [id, navigate]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  const loadSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/subjects`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadSection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sections`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        const section = data.data.find(s => s.section_id === parseInt(id));
        if (section) {
          setFormData({
            subject_id: section.subject_id || '',
            name: section.name || '',
            description: section.description || '',
            level: section.level || 1
          });
        }
      }
    } catch (error) {
      console.error('Error loading section:', error);
      setError('Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'subject_id' || name === 'level' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/admin/sections/${id}`
        : `${API_BASE_URL}/admin/sections`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Section ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/admin/dashboard', { state: { activeTab: 'sections' } });
      } else {
        setError(data.message || 'Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      setError('Failed to save section. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h1>{isEditMode ? 'Edit Section/Level' : 'Add New Section/Level'}</h1>
          <button 
            className="admin-back-btn" 
            onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'sections' } })}
          >
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="admin-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-section">
            <h3>Section/Level Information</h3>
            
            <div className="form-group">
              <label htmlFor="subject_id">Subject *</label>
              <select
                id="subject_id"
                name="subject_id"
                value={formData.subject_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select a Subject --</option>
                {subjects.map(subject => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <small>Choose which subject this section/level belongs to</small>
            </div>

            <div className="form-group">
              <label htmlFor="level">Level Number *</label>
              <input
                type="number"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
              />
              <small>The difficulty level (1 = Beginner, 2 = Intermediate, 3 = Advanced, etc.)</small>
            </div>

            <div className="form-group">
              <label htmlFor="name">Section Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Beginner, Intermediate, Advanced"
                required
              />
              <small>The name of this section/level</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Brief description of this section"
              />
              <small>Optional description to explain what this level covers</small>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="admin-cancel-btn"
              onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'sections' } })}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-submit-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Section' : 'Create Section')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSectionForm;
