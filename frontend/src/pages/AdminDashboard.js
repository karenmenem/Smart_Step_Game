import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (!token || !adminData) {
      navigate('/admin/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    loadDashboardData();
  }, [navigate]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

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

  const loadActivities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/activities`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/achievements`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setAchievements(data.data);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  useEffect(() => {
    if (!admin) return;

    switch (activeTab) {
      case 'questions':
        loadQuestions();
        break;
      case 'subjects':
        loadSubjects();
        break;
      case 'sections':
        loadSections();
        break;
      case 'activities':
        loadActivities();
        break;
      case 'achievements':
        loadAchievements();
        break;
      default:
        break;
    }
  }, [activeTab, admin]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const endpoints = {
        question: `/admin/questions/${id}`,
        subject: `/admin/subjects/${id}`,
        section: `/admin/sections/${id}`,
        activity: `/admin/activities/${id}`,
        achievement: `/admin/achievements/${id}`
      };

      const response = await fetch(`${API_BASE_URL}${endpoints[type]}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();
      if (data.success) {
        alert('Item deleted successfully!');
        // Reload the current tab's data
        switch (type) {
          case 'question':
            loadQuestions();
            break;
          case 'subject':
            loadSubjects();
            break;
          case 'section':
            loadSections();
            break;
          case 'activity':
            loadActivities();
            break;
          case 'achievement':
            loadAchievements();
            break;
        }
        loadDashboardData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  if (loading || !admin) {
    return <div className="admin-loading">Loading Admin Panel...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🎓 SmartStep Admin Panel</h1>
          <div className="admin-user-info">
            <span>Welcome, {admin.fullName || admin.username}</span>
            <button onClick={handleLogout} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-sidebar">
          <button
            className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            ❓ Questions
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            📚 Subjects
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            📖 Levels/Sections
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            🎯 Activities
          </button>
          <button
            className={`admin-nav-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements
          </button>
        </nav>

        <main className="admin-main">
          {activeTab === 'dashboard' && stats && (
            <div className="admin-dashboard-content">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.questions}</h3>
                  <p>Total Questions</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.activities}</h3>
                  <p>Activities</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.sections}</h3>
                  <p>Levels/Sections</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.subjects}</h3>
                  <p>Subjects</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.children}</h3>
                  <p>Registered Children</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.achievements}</h3>
                  <p>Achievements</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="admin-content">
              <div className="admin-content-header">
                <h2>Manage Questions</h2>
                <button className="admin-add-btn" onClick={() => navigate('/admin/questions/add')}>
                  + Add Question
                </button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Question</th>
                      <th>Subject</th>
                      <th>Level</th>
                      <th>Activity</th>
                      <th>ASL Type</th>
                      <th>ASL Data</th>
                      <th>Points</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q) => (
                      <tr key={q.question_id}>
                        <td>{q.question_id}</td>
                        <td>{q.question_text}</td>
                        <td>{q.subject_name}</td>
                        <td>{q.level}</td>
                        <td>{q.activity_name}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: q.asl_type === 'video' ? '#e3f2fd' : 
                                       q.asl_type === 'both' ? '#fff3e0' : '#e8f5e9',
                            fontSize: '0.85rem'
                          }}>
                            {q.asl_type || 'numbers'}
                          </span>
                        </td>
                        <td>
                          {q.asl_type === 'video' || q.asl_type === 'both' ? (
                            <a href={q.asl_video_url} target="_blank" rel="noopener noreferrer" 
                               style={{color: '#667eea', textDecoration: 'none'}}>
                              🎥 Video
                            </a>
                          ) : (
                            q.asl_signs
                          )}
                        </td>
                        <td>{q.points_value}</td>
                        <td>
                          <button
                            className="admin-edit-btn"
                            onClick={() => navigate(`/admin/questions/edit/${q.question_id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => deleteItem('question', q.question_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="admin-content">
              <div className="admin-content-header">
                <h2>Manage Subjects</h2>
                <button className="admin-add-btn" onClick={() => navigate('/admin/subjects/add')}>
                  + Add Subject
                </button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => (
                      <tr key={s.subject_id}>
                        <td>{s.subject_id}</td>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.description}</td>
                        <td>{new Date(s.created_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="admin-edit-btn"
                            onClick={() => navigate(`/admin/subjects/edit/${s.subject_id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => deleteItem('subject', s.subject_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="admin-content">
              <div className="admin-content-header">
                <h2>Manage Levels/Sections</h2>
                <button className="admin-add-btn" onClick={() => navigate('/admin/sections/add')}>
                  + Add Section
                </button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Subject</th>
                      <th>Level</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((s) => (
                      <tr key={s.section_id}>
                        <td>{s.section_id}</td>
                        <td>{s.subject_name}</td>
                        <td><strong>Level {s.level}</strong></td>
                        <td>{s.name}</td>
                        <td>{s.description}</td>
                        <td>
                          <button
                            className="admin-edit-btn"
                            onClick={() => navigate(`/admin/sections/edit/${s.section_id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => deleteItem('section', s.section_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="admin-content">
              <div className="admin-content-header">
                <h2>Manage Activities</h2>
                <button className="admin-add-btn" onClick={() => navigate('/admin/activities/add')}>
                  + Add Activity
                </button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Subject</th>
                      <th>Level</th>
                      <th>Type</th>
                      <th>Points</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((a) => (
                      <tr key={a.activity_id}>
                        <td>{a.activity_id}</td>
                        <td><strong>{a.name}</strong></td>
                        <td>{a.subject_name}</td>
                        <td>Level {a.level}</td>
                        <td>{a.activity_type}</td>
                        <td>{a.points_value}</td>
                        <td>
                          <button
                            className="admin-edit-btn"
                            onClick={() => navigate(`/admin/activities/edit/${a.activity_id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => deleteItem('activity', a.activity_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="admin-content">
              <div className="admin-content-header">
                <h2>Manage Achievements</h2>
                <button className="admin-add-btn" onClick={() => navigate('/admin/achievements/add')}>
                  + Add Achievement
                </button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Icon</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Points Required</th>
                      <th>Level Required</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.map((a) => (
                      <tr key={a.achievement_id}>
                        <td>{a.achievement_id}</td>
                        <td style={{fontSize: '24px'}}>{a.icon}</td>
                        <td><strong>{a.name}</strong></td>
                        <td>{a.description}</td>
                        <td>{a.points_required}</td>
                        <td>{a.level_required}</td>
                        <td>
                          <button
                            className="admin-edit-btn"
                            onClick={() => navigate(`/admin/achievements/edit/${a.achievement_id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => deleteItem('achievement', a.achievement_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f5f7fa;
        }
        
        .admin-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .admin-header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .admin-header h1 {
          margin: 0;
          font-size: 1.8rem;
        }
        
        .admin-user-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .admin-logout-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid white;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .admin-logout-btn:hover {
          background: white;
          color: #667eea;
        }
        
        .admin-container {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 100px);
        }
        
        .admin-sidebar {
          width: 250px;
          background: white;
          padding: 2rem 0;
          box-shadow: 2px 0 8px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .admin-nav-btn {
          background: none;
          border: none;
          padding: 1rem 2rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
        }
        
        .admin-nav-btn:hover {
          background: #f0f2f5;
        }
        
        .admin-nav-btn.active {
          background: #667eea;
          color: white;
          border-right: 4px solid #764ba2;
        }
        
        .admin-main {
          flex: 1;
          padding: 2rem;
        }
        
        .admin-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .admin-content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .admin-content-header h2 {
          margin: 0;
        }
        
        .admin-add-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }
        
        .admin-add-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .admin-table-container {
          overflow-x: auto;
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .admin-table th {
          background: #f8f9fa;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }
        
        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
        }
        
        .admin-table tbody tr:hover {
          background: #f8f9fa;
        }
        
        .admin-edit-btn, .admin-delete-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 0.5rem;
          transition: all 0.3s;
        }
        
        .admin-edit-btn {
          background: #ffc107;
          color: white;
        }
        
        .admin-edit-btn:hover {
          background: #e0a800;
        }
        
        .admin-delete-btn {
          background: #dc3545;
          color: white;
        }
        
        .admin-delete-btn:hover {
          background: #c82333;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          text-align: center;
          transition: transform 0.3s;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .stat-card h3 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
          color: #667eea;
        }
        
        .stat-card p {
          margin: 0;
          color: #6c757d;
        }
        
        .admin-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
          color: #667eea;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
