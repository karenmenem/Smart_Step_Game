import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../api/auth";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function Subjects() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const userData = auth.getCurrentUser();
      setUser(userData);
      loadSubjects();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/subjects`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSubjects(data.data); // array of all men db
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const getSubjectIcon = (subjectName) => {
    const icons = {
      'Math': '🔢',
      'English': '🎨',
      'History': '📜',
      'Science': '🔬',
      'Geography': '🌍',
      'Art': '🎭',
      'Music': '🎵'
    };
    return icons[subjectName] || '📚';
  };

  // Get topics/activities for each subject
  const getSubjectTopics = (subjectName, subjectId) => {
    const topicMap = {
      'English': [
        { icon: '✏️', title: 'Grammar', desc: 'Master sentence structure', path: '/english/grammar' },
        { icon: '📖', title: 'Comprehension', desc: 'Understand reading passages', path: '/english/comprehension' },
        { icon: '🌟', title: 'Vocabulary', desc: 'Expand your word power', path: '/english/vocabulary' },
        { icon: '🎯', title: 'Picture Match', desc: 'Match images with words', path: '/english/picture_match' }
      ],
      'Math': [
        { icon: '➕', title: 'Addition', desc: 'Add numbers together', path: '/math/addition' },
        { icon: '➖', title: 'Subtraction', desc: 'Take numbers away', path: '/math/subtraction' },
        { icon: '✖️', title: 'Multiplication', desc: 'Multiply numbers', path: '/math/multiplication' },
        { icon: '➗', title: 'Division', desc: 'Divide numbers', path: '/math/division' }
      ]
    };

    // Return predefined topics for Math/English, or generic button for other subjects
    return topicMap[subjectName] || [
      { icon: '📚', title: 'Explore Levels', desc: 'View all activities', path: `/subject/${subjectId}` }
    ];
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
            <button className="subjects-nav-btn" onClick={() => navigate("/")}>
              🏠 Home
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
          <h1 className="subjects-main-title">Choose Your Learning Adventure! 🚀</h1>
          <p className="subjects-subtitle">Pick a subject and start your fun learning journey!</p>
        </div>

        {loading ? (
          <div className="subjects-loading">Loading subjects...</div>
        ) : (
          <div className="subjects-container">
            {subjects.map((subject) => {
              const topics = getSubjectTopics(subject.name, subject.subject_id);
              return (
                <div key={subject.subject_id} className="subject-section">
                  <div className={`subject-header ${subject.name.toLowerCase()}-header`}>
                    <h2 className="subject-title">
                      {getSubjectIcon(subject.name)} {subject.name}
                    </h2>
                  </div>
                  
                  <div className="subject-buttons">
                    {topics.map((topic, index) => (
                      <button 
                        key={index}
                        className={`subject-btn ${subject.name.toLowerCase()}-btn`} 
                        onClick={() => navigate(topic.path)}
                      >
                        <div className="btn-icon">{topic.icon}</div>
                        <div className="btn-content">
                          <h3>{topic.title}</h3>
                          <p>{topic.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Subjects;