import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api } from "../api/auth";
import TeacherLinking from "../components/Parent/TeacherLinking";
import '../styles/ParentDashboard.css';

function ParentDashboard() {
  const navigate = useNavigate();
  const [parent, setParent] = useState(null);
  const [child, setChild] = useState(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    achievementsUnlocked: 0,
    totalAchievements: 0,
    activitiesCompleted: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    bestScore: 0,
    averageScore: 0,
    recentActivities: []
  });
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'teachers'

  useEffect(() => {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const userData = auth.getCurrentUser();
    if (userData?.parent && userData?.child) {
      setParent(userData.parent);
      setChild(userData.child);
      loadChildProgress(userData.child.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadChildProgress = async (childId) => {
    try {
      setLoading(true);

      // Fetch fresh child data
      const childResponse = await fetch(`http://localhost:5001/api/children/${childId}`);
      const childRes = await childResponse.json();
      const freshChildData = childRes.success ? childRes.data : null;

      if (freshChildData) {
        setChild(freshChildData);
      }

      // Fetch all data in parallel
      const [achievementsRes, progressRes] = await Promise.all([
        api.getAchievements(childId),
        api.getAllProgress(childId)
      ]);

      // Process achievements
      if (achievementsRes.success) {
        const unlockedAchievements = achievementsRes.data.achievements.filter(a => a.earned);
        setAchievements(unlockedAchievements);
        setStats(prev => ({
          ...prev,
          achievementsUnlocked: achievementsRes.data.totalEarned,
          totalAchievements: achievementsRes.data.totalAvailable
        }));
      }

      // Process progress
      if (progressRes.success && progressRes.data) {
        const progressData = progressRes.data;
        const childStats = progressRes.stats || {};
        setProgress(progressData);

        // Calculate stats
        const completed = progressData.filter(p => p.completed).length;
        const totalTime = childStats.minutes_played || 0;
        const scores = progressData.map(p => p.percentage || 0).filter(s => s > 0);
        const avgScore = scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
        const bestScore = Math.max(...scores, 0);

        // Get recent activities (last 10)
        const recent = progressData
          .filter(p => p.last_attempt)
          .sort((a, b) => new Date(b.last_attempt) - new Date(a.last_attempt))
          .slice(0, 10);

        setStats(prev => ({
          ...prev,
          activitiesCompleted: completed,
          totalTimeSpent: totalTime,
          currentStreak: childStats.day_streak || 0,
          bestScore: Math.round(bestScore),
          averageScore: avgScore,
          recentActivities: recent,
          totalPoints: freshChildData?.total_points || 0
        }));
      }

    } catch (error) {
      console.error('Error loading child progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return '#10b981'; // green
    if (percentage >= 80) return '#3b82f6'; // blue
    if (percentage >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getSubjectIcon = (subjectName) => {
    const icons = {
      'Math': '🔢',
      'English': '📚',
      'History': '📜',
      'Science': '🔬'
    };
    return icons[subjectName] || '📖';
  };

  if (loading) {
    return (
      <div className="parent-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-dashboard">
      {/* Header */}
      <header className="parent-header">
        <div className="parent-header-content">
          <div className="parent-logo">
            <h1>Smart<span className="logo-accent">Step</span></h1>
            <span className="parent-badge">Parent Portal</span>
          </div>

          <nav className="parent-nav">
            <button className="parent-nav-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
            <button className="parent-nav-btn" onClick={() => navigate("/dashboard")}>
              👶 Child's View
            </button>
            <button className="parent-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="parent-main">
        {/* Tab Navigation */}
        <div className="parent-tabs">
          <button 
            className={`parent-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`parent-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            👨‍🏫 Teachers
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
        {/* Welcome Section */}
        <div className="parent-welcome">
          <div className="welcome-text">
            <h1>Welcome, {parent?.email?.split('@')[0] || 'Parent'}! 👋</h1>
            <p>Here's how <strong>{child?.name || 'your child'}</strong> is doing in their learning journey</p>
          </div>
          {child?.profile_picture && (
            <img 
              src={`http://localhost:5001/${child.profile_picture}`}
              alt={child.name}
              className="child-avatar-large"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>

        {/* Stats Grid */}
        <div className="parent-stats-grid">
          <div className="stat-card points">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{stats.totalPoints.toLocaleString()}</h3>
              <p>Total Points</p>
            </div>
          </div>

          <div className="stat-card activities">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.activitiesCompleted}</h3>
              <p>Activities Completed</p>
            </div>
          </div>

          <div className="stat-card achievements">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{stats.achievementsUnlocked} / {stats.totalAchievements}</h3>
              <p>Achievements</p>
            </div>
          </div>

          <div className="stat-card average">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.averageScore}%</h3>
              <p>Average Score</p>
            </div>
          </div>

          <div className="stat-card best">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{stats.bestScore}%</h3>
              <p>Best Score</p>
            </div>
          </div>

          <div className="stat-card level">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Level {Math.floor(stats.totalPoints / 100) + 1}</h3>
              <p>Current Level</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="parent-content-grid">
          {/* Recent Activities */}
          <div className="parent-section">
            <h2 className="section-title">📝 Recent Activities</h2>
            <div className="activities-list">
              {stats.recentActivities.length === 0 ? (
                <div className="empty-state">
                  <p>No activities completed yet</p>
                  <button 
                    className="start-learning-btn"
                    onClick={() => navigate("/subjects")}
                  >
                    Start Learning
                  </button>
                </div>
              ) : (
                stats.recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-header">
                      <div className="activity-info">
                        <span className="activity-icon">
                          {getSubjectIcon(activity.subject_name)}
                        </span>
                        <div className="activity-details">
                          <h4>{activity.activity_name}</h4>
                          <p className="activity-meta">
                            {activity.subject_name} - {activity.section_name}
                          </p>
                        </div>
                      </div>
                      <div 
                        className="activity-score"
                        style={{ color: getScoreColor(activity.percentage) }}
                      >
                        {Math.round(activity.percentage)}%
                      </div>
                    </div>
                    <div className="activity-footer">
                      <span className="activity-date">
                        📅 {formatDate(activity.last_attempt)}
                      </span>
                      <span className="activity-attempts">
                        🔄 {activity.total_attempts} {activity.total_attempts === 1 ? 'attempt' : 'attempts'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="parent-section">
            <h2 className="section-title">🏆 Recent Achievements</h2>
            <div className="achievements-list">
              {achievements.length === 0 ? (
                <div className="empty-state">
                  <p>No achievements earned yet</p>
                  <p className="hint">Complete activities to earn badges!</p>
                </div>
              ) : (
                achievements.slice(0, 6).map((achievement) => (
                  <div key={achievement.achievement_id} className="achievement-item">
                    <div className="achievement-badge">{achievement.badge_icon}</div>
                    <div className="achievement-info">
                      <h4>{achievement.achievement_name}</h4>
                      <p>{achievement.description}</p>
                      {achievement.earned_at && (
                        <span className="earned-date">
                          Earned on {formatDate(achievement.earned_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {achievements.length > 6 && (
                <button 
                  className="view-all-btn"
                  onClick={() => navigate("/achievements")}
                >
                  View All {achievements.length} Achievements →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress by Subject */}
        {progress.length > 0 && (
          <div className="parent-section full-width">
            <h2 className="section-title">📊 Progress by Subject</h2>
            <div className="subject-progress-grid">
              {Object.entries(
                progress.reduce((acc, p) => {
                  const subject = p.subject_name || 'Other';
                  if (!acc[subject]) {
                    acc[subject] = { total: 0, completed: 0, avgScore: 0, scores: [] };
                  }
                  acc[subject].total++;
                  if (p.completed) acc[subject].completed++;
                  if (p.percentage) acc[subject].scores.push(p.percentage);
                  return acc;
                }, {})
              ).map(([subject, data]) => {
                const completionRate = Math.round((data.completed / data.total) * 100);
                const avgScore = data.scores.length > 0
                  ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
                  : 0;
                
                return (
                  <div key={subject} className="subject-card">
                    <div className="subject-header">
                      <span className="subject-icon-large">{getSubjectIcon(subject)}</span>
                      <h3>{subject}</h3>
                    </div>
                    <div className="subject-stats">
                      <div className="subject-stat">
                        <span className="stat-label">Completed</span>
                        <span className="stat-value">{data.completed} / {data.total}</span>
                      </div>
                      <div className="subject-stat">
                        <span className="stat-label">Average Score</span>
                        <span className="stat-value" style={{ color: getScoreColor(avgScore) }}>
                          {avgScore}%
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <p className="completion-text">{completionRate}% Complete</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Encouragement Section */}
        <div className="parent-section full-width encouragement">
          <h2 className="section-title">💡 Tips for Parents</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">🎯</div>
              <h4>Set Goals Together</h4>
              <p>Encourage {child?.name} to complete at least 2 activities per day</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⏰</div>
              <h4>Consistent Schedule</h4>
              <p>Regular learning times help build habits and maintain streaks</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🎉</div>
              <h4>Celebrate Progress</h4>
              <p>Recognize achievements and improvements, not just perfect scores</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🤝</div>
              <h4>Learn Together</h4>
              <p>Try learning ASL signs together to support your child's education</p>
            </div>
          </div>
        </div>
        </>
        ) : (
          <TeacherLinking child={child} />
        )}
      </main>
    </div>
  );
}

export default ParentDashboard;
