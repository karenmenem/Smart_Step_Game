import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles/AdminStyles.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function AdminActivityForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    section_id: '',
    name: '',
    description: '',
    order_index: 1
  });

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    loadSections();
    if (isEditMode) {
      loadActivity();
    }
  }, [id, navigate]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  const loadSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sections`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSections(data.data);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const loadActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/activities`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        const activity = data.data.find(a => a.activity_id === parseInt(id));
        if (activity) {
          setFormData({
            section_id: activity.section_id || '',
            name: activity.name || '',
            description: activity.description || '',
            order_index: activity.order_index || 1
          });
        }
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'section_id' || name === 'order_index' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/admin/activities/${id}`
        : `${API_BASE_URL}/admin/activities`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Activity ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/admin/dashboard', { state: { activeTab: 'activities' } });
      } else {
        setError(data.message || 'Failed to save activity');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      setError('Failed to save activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          <h1>{isEditMode ? 'Edit Activity' : 'Add New Activity'}</h1>
          <button 
            className="admin-back-btn" 
            onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'activities' } })}
          >
            ← Back to Dashboard
          </button>
        </div>

      {error && <div className="admin-error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-question-form">
        <div className="form-section">
          <h3>Activity Information</h3>
          
          <div className="form-group">
            <label htmlFor="section_id">Section/Level *</label>
            <select
              id="section_id"
              name="section_id"
              value={formData.section_id}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select a Section --</option>
              {sections.map(section => (
                <option key={section.section_id} value={section.section_id}>
                  {section.subject_name} - {section.name} (Level {section.level_number})
                </option>
              ))}
            </select>
            <small>Choose which subject section/level this activity belongs to</small>
          </div>

          <div className="form-group">
            <label htmlFor="name">Activity Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Addition Level 1, Grammar Basics"
              required
            />
            <small>The name of the activity that will be displayed to students</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Brief description of this activity"
            />
            <small>Optional description to explain what this activity covers</small>
          </div>

          <div className="form-group">
            <label htmlFor="order_index">Display Order *</label>
            <input
              type="number"
              id="order_index"
              name="order_index"
              value={formData.order_index}
              onChange={handleInputChange}
              min="1"
              required
            />
            <small>The order in which this activity appears (lower numbers appear first)</small>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="admin-cancel-btn"
            onClick={() => navigate('/admin/dashboard', { state: { activeTab: 'activities' } })}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Activity' : 'Create Activity')}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

export default AdminActivityForm;
