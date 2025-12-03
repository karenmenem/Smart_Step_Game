import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../api/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function SubjectDetail() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [user, setUser] = useState(null);
  const [sections, setSections] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const userData = auth.getCurrentUser();
      setUser(userData);
      loadSections();
    } else {
      navigate("/login");
    }
  }, [navigate, subjectId]);

  const loadSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/subjects/${subjectId}/sections`);
      const data = await response.json();
      
      if (data.success) {
        setSections(data.data || []);
        if (data.data.length > 0) {
          // Get subject name from first section
          const subjectResponse = await fetch(`${API_BASE_URL}/quiz/subjects`);
          const subjectData = await subjectResponse.json();
          if (subjectData.success) {
            const subject = subjectData.data.find(s => s.subject_id === parseInt(subjectId));
            setSubjectName(subject?.name || 'Subject');
          }
        }
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (sectionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/sections/${sectionId}/activities`);
      const data = await response.json();
      
      if (data.success) {
        setActivities(data.data || []);
        setSelectedSection(sectionId);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <div className="subjects-layout">
      {/* Header */}
      <header className="subjects-header">
        <div className="subjects-header-content">
          <div className="subjects-logo">
            <h1>Smart<span className="logo-accent">Step</span></h1>
          </div>
          
          <nav className="subjects-nav">
            <button className="subjects-nav-btn" onClick={() => navigate("/subjects")}>
              ← Back to Subjects
            </button>
            <button className="subjects-nav-btn" onClick={() => navigate("/achievements")}>
              🏆 Achievements
            </button>
            {user && (
              <>
                <div className="subjects-user-info">
                  {user.child?.profile_picture ? (
                    <img 
                      src={`http://localhost:5001/${user.child.profile_picture}`} 
                      alt="Profile" 
                      className="subjects-profile-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="subjects-avatar">
                      {(user.child?.name || user.parent?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="subjects-welcome-text">Hi, {user.child?.name || user.parent?.email}!</span>
                </div>
                <button className="subjects-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="subjects-main">
        <div className="subjects-title-section">
          <h1 className="subjects-main-title">{subjectName} Levels 📚</h1>
          <p className="subjects-subtitle">Choose a level and start learning!</p>
        </div>

        {loading ? (
          <div className="subjects-loading">Loading levels...</div>
        ) : (
          <div className="subject-detail-container">
            <div className="sections-grid">
              {sections.map((section) => (
                <div 
                  key={section.section_id} 
                  className={`section-card ${selectedSection === section.section_id ? 'selected' : ''}`}
                  onClick={() => loadActivities(section.section_id)}
                >
                  <div className="section-level">Level {section.level}</div>
                  <h3 className="section-name">{section.name}</h3>
                  <p className="section-description">{section.description || 'Start this level'}</p>
                  <div className="section-stats">
                    {section.activity_count} {section.activity_count === 1 ? 'activity' : 'activities'}
                  </div>
                </div>
              ))}
            </div>

            {selectedSection && activities.length > 0 && (
              <div className="activities-section">
                <h2 className="activities-title">Activities</h2>
                <div className="activities-grid">
                  {activities.map((activity) => (
                    <div 
                      key={activity.activity_id} 
                      className="activity-card"
                      onClick={() => navigate(`/quiz/${activity.activity_id}`)}
                    >
                      <div className="activity-type-badge">{activity.activity_type}</div>
                      <h3 className="activity-name">{activity.name}</h3>
                      <p className="activity-description">{activity.description || 'Click to start'}</p>
                      <div className="activity-footer">
                        <span className="activity-questions">{activity.question_count} questions</span>
                        <span className="activity-points">{activity.points_value} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        .subject-detail-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .section-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 25px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .section-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.2);
        }

        .section-card.selected {
          border: 3px solid #ffd700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .section-level {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .section-name {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .section-description {
          font-size: 14px;
          margin-bottom: 15px;
          opacity: 0.9;
        }

        .section-stats {
          font-size: 13px;
          opacity: 0.8;
        }

        .activities-section {
          margin-top: 40px;
        }

        .activities-title {
          font-size: 28px;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .activity-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 2px solid transparent;
        }

        .activity-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
          border-color: #667eea;
        }

        .activity-type-badge {
          display: inline-block;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: capitalize;
          margin-bottom: 12px;
        }

        .activity-name {
          font-size: 18px;
          color: #333;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .activity-description {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
        }

        .activity-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #eee;
          font-size: 13px;
        }

        .activity-questions {
          color: #667eea;
          font-weight: 500;
        }

        .activity-points {
          background: #ffd700;
          color: #333;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: bold;
        }

        .subjects-loading {
          text-align: center;
          padding: 60px 20px;
          font-size: 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default SubjectDetail;
