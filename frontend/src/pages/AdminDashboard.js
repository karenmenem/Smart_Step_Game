import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getReadingPassages, createReadingPassage, updateReadingPassage, deleteReadingPassage,
  getDashboardStats
} from '../api/admin';

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
  const [readingPassages, setReadingPassages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [editingPassage, setEditingPassage] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  
  // Question filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');

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

  const loadReadingPassages = async () => {
    try {
      const response = await getReadingPassages();
      if (response.success) {
        setReadingPassages(response.data);
      } else {
        // Initialize with default passages if none exist
        setReadingPassages([
          {
            id: 'temp-1',
            subject: 'English',
            topic: 'comprehension',
            level: 'easy',
            sublevel: '1',
            title: 'The Cat and the Dog',
            author: 'Sample Author',
            content: 'Once upon a time, there was a friendly cat named Whiskers and a playful dog named Buddy...',
            is_default: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading reading passages:', error);
      // Initialize with defaults on error
      setReadingPassages([]);
    }
  };

  useEffect(() => {
    if (!admin) return;

    switch (activeTab) {
      case 'questions':
        loadQuestions();
        loadReadingPassages(); // Also load passages for dropdown
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
      case 'reading-passages':
        loadReadingPassages();
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

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = searchTerm === '' || 
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.question_id.toString().includes(searchTerm);
    
    const matchesSubject = filterSubject === 'all' || 
      q.subject_name === filterSubject;
    
    const matchesActivity = filterActivity === 'all' || 
      q.activity_id.toString() === filterActivity;
    
    return matchesSearch && matchesSubject && matchesActivity;
  });

  // Get unique subjects and activities for filter dropdowns
  const uniqueSubjects = [...new Set(questions.map(q => q.subject_name))];
  
  // Get unique activities
  const activityMap = new Map();
  questions.forEach(q => {
    if (!activityMap.has(q.activity_id)) {
      activityMap.set(q.activity_id, q.activity_name);
    }
  });
  const uniqueActivities = Array.from(activityMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.id - b.id);

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

  const handleDeleteReadingPassage = async (id) => {
    if (!id) {
      alert('Invalid passage ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this reading passage?')) return;

    try {
      console.log('Attempting to delete passage with ID:', id);
      
      const response = await deleteReadingPassage(id);
      console.log('Delete response data:', response);

      if (response.success) {
        alert('Reading passage deleted successfully!');
        loadReadingPassages();
      } else {
        alert(response.message || 'Failed to delete reading passage');
      }
    } catch (error) {
      console.error('Error deleting reading passage:', error);
      alert('Network error: Failed to delete reading passage - ' + error.message);
    }
  };

  const saveReadingPassage = async (passageData) => {
    try {
      let response;
      if (editingPassage) {
        response = await updateReadingPassage(editingPassage.id, passageData);
      } else {
        response = await createReadingPassage(passageData);
      }

      if (response.success) {
        alert(editingPassage ? 'Reading passage updated successfully!' : 'Reading passage created successfully!');
        setShowPassageModal(false);
        setEditingPassage(null);
        loadReadingPassages();
      } else {
        alert(response.message || 'Failed to save reading passage');
      }
    } catch (error) {
      console.error('Error saving reading passage:', error);
      alert('Failed to save reading passage');
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
            className={`admin-nav-btn ${activeTab === 'reading-passages' ? 'active' : ''}`}
            onClick={() => setActiveTab('reading-passages')}
          >
            📖 Reading Passages
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
                <h2>Manage Questions ({filteredQuestions.length} of {questions.length})</h2>
                <button className="admin-add-btn" onClick={() => navigate('/admin/questions/add')}>
                  + Add Question
                </button>
              </div>
              
              {/* Filters Section */}
              <div className="filters-section">
                <div className="filter-group">
                  <label>🔍 Search</label>
                  <input
                    type="text"
                    placeholder="Search by question text or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label>📚 Subject</label>
                  <select 
                    value={filterSubject} 
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Subjects</option>
                    {uniqueSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>🎯 Activity</label>
                  <select 
                    value={filterActivity} 
                    onChange={(e) => setFilterActivity(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Activities</option>
                    {uniqueActivities.map(activity => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSubject('all');
                      setFilterActivity('all');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
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
                      <th>ASL Content</th>
                      <th>Points</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{textAlign: 'center', padding: '2rem', color: '#6c757d'}}>
                          No questions found matching your filters
                        </td>
                      </tr>
                    ) : (
                      filteredQuestions.map((q) => (
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
                      ))
                    )}
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

          {activeTab === 'reading-passages' && (
            <div className="admin-content">
              <div className="admin-content-header">
                <h2>📖 Manage Reading Passages</h2>
                <button className="admin-add-btn" onClick={() => {
                  setEditingPassage(null);
                  setShowPassageModal(true);
                }}>
                  + Add Reading Passage
                </button>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Topic</th>
                      <th>Level</th>
                      <th>Sublevel</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Content Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readingPassages.map((passage, index) => (
                      <tr key={passage.id || index}>
                        <td><strong>{passage.subject}</strong></td>
                        <td>{passage.topic}</td>
                        <td>{passage.level}</td>
                        <td>{passage.sublevel}</td>
                        <td><strong>{passage.title}</strong></td>
                        <td>{passage.author || 'Not specified'}</td>
                        <td>
                          <div style={{
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {passage.content}
                          </div>
                        </td>
                        <td>
                          <button
                            className="admin-edit-btn"
                            onClick={() => {
                              setEditingPassage(passage);
                              setShowPassageModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDeleteReadingPassage(passage.id)}
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

      {/* Reading Passage Modal */}
      {showPassageModal && (
        <ReadingPassageModal
          passage={editingPassage}
          onSave={saveReadingPassage}
          onClose={() => {
            setShowPassageModal(false);
            setEditingPassage(null);
          }}
        />
      )}

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

        /* Filters Section */
        .filters-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 1rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .filter-input,
        .filter-select {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s;
          background: white;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-input::placeholder {
          color: #9ca3af;
        }

        .clear-filters-btn {
          padding: 0.75rem 1.5rem;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .clear-filters-btn:hover {
          background: #4b5563;
          transform: translateY(-2px);
        }

        @media (max-width: 1024px) {
          .filters-section {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .filters-section {
            grid-template-columns: 1fr;
          }
        }

        /* Reading Passage Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 15px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 15px 15px 0 0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: white;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .passage-form {
          padding: 2rem;
        }

        .question-form {
          padding: 2rem;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 200px;
          font-family: inherit;
          line-height: 1.5;
        }

        .char-count {
          text-align: right;
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid #e9ecef;
          margin-top: 1.5rem;
        }

        .btn-cancel,
        .btn-save {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          min-width: 120px;
        }

        .btn-cancel {
          background: #6b7280;
          color: white;
        }

        .btn-cancel:hover {
          background: #4b5563;
        }

        .btn-save {
          background: #667eea;
          color: white;
        }

        .btn-save:hover {
          background: #5563d1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 1rem;
          }

          .passage-form {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Reading Passage Modal Component
function ReadingPassageModal({ passage, onSave, onClose }) {
  const [formData, setFormData] = useState({
    subject: passage?.subject || 'English',
    topic: passage?.topic || 'comprehension',
    level: passage?.level || 1,
    sublevel: passage?.sublevel || 1,
    title: passage?.title || '',
    author: passage?.author || '',
    content: passage?.content || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in the title and content fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{passage ? '✏️ Edit Reading Passage' : '📖 Add New Reading Passage'}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="passage-form">
          <div className="form-row">
            <div className="form-group">
              <label>Subject</label>
              <select 
                value={formData.subject} 
                onChange={e => setFormData({...formData, subject: e.target.value})}
              >
                <option value="English">English</option>
                <option value="Math">Math</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Topic</label>
              <select 
                value={formData.topic} 
                onChange={e => setFormData({...formData, topic: e.target.value})}
              >
                <option value="comprehension">Comprehension</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Level</label>
              <select 
                value={formData.level} 
                onChange={e => setFormData({...formData, level: parseInt(e.target.value)})}
              >
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Intermediate</option>
                <option value="3">3 - Advanced</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Sublevel</label>
              <select 
                value={formData.sublevel} 
                onChange={e => setFormData({...formData, sublevel: parseInt(e.target.value)})}
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Enter passage title"
              required
            />
          </div>

          <div className="form-group">
            <label>Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={e => setFormData({...formData, author: e.target.value})}
              placeholder="Enter author name (optional)"
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="Enter the reading passage content..."
              rows="10"
              required
            />
            <div className="char-count">{formData.content.length} characters</div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {passage ? 'Update Passage' : 'Create Passage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
