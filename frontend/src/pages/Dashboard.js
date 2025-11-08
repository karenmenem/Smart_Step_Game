import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api } from "../api/auth";

function Dashboard() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    achievementsUnlocked: 0,
    totalAchievements: 0,
    activitiesCompleted: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    bestScore: 0,
    recentActivities: []
  });
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentChild = auth.getCurrentChild();
    if (currentChild?.id) {
      setChild(currentChild);
      loadDashboardData(currentChild);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const loadDashboardData = async (childData) => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [achievementsRes, progressRes] = await Promise.all([
        api.getAchievements(childData.id),
        api.getAllProgress(childData.id)
      ]);

      // Process achievements
      if (achievementsRes.success) {
        const unlockedAchievements = achievementsRes.data.achievements.filter(a => a.earned);
        setAchievements(unlockedAchievements.slice(0, 3)); // Show latest 3
        setStats(prev => ({
          ...prev,
          achievementsUnlocked: achievementsRes.data.totalEarned,
          totalAchievements: achievementsRes.data.totalAvailable
        }));
      }

      // Process progress
      if (progressRes.success && progressRes.data) {
        const progressData = progressRes.data;
        setProgress(progressData);
        
        // Calculate stats
        const completed = progressData.filter(p => p.completed).length;
        const totalTime = progressData.reduce((sum, p) => sum + (p.time_spent || 0), 0);
        const bestScore = Math.max(...progressData.map(p => p.percentage || 0), 0);
        
        // Get recent activities (last 5)
        const recent = progressData
          .sort((a, b) => new Date(b.last_attempt) - new Date(a.last_attempt))
          .slice(0, 5);
        
        setStats(prev => ({
          ...prev,
          activitiesCompleted: completed,
          totalTimeSpent: Math.round(totalTime / 60), // Convert to minutes
          bestScore: Math.round(bestScore),
          recentActivities: recent,
          totalPoints: childData.total_points || 0
        }));
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const getLevelBadge = (percentage) => {
    if (percentage >= 90) return { text: "Expert", color: "#ffd700", emoji: "👑" };
    if (percentage >= 80) return { text: "Advanced", color: "#ef4444", emoji: "🏆" };
    if (percentage >= 60) return { text: "Intermediate", color: "#fbbf24", emoji: "⭐" };
    return { text: "Beginner", color: "#43e97b", emoji: "🌱" };
  };

  const getActivityName = (activityId) => {
    const activityNames = {
      7: "Addition Beginner L1", 8: "Addition Beginner L2",
      10: "Addition Intermediate L1", 11: "Addition Intermediate L2",
      13: "Addition Advanced L1", 14: "Addition Advanced L2",
      16: "Subtraction Beginner L1", 17: "Subtraction Beginner L2",
      19: "Subtraction Intermediate L1", 20: "Subtraction Intermediate L2",
      22: "Subtraction Advanced L1", 23: "Subtraction Advanced L2",
      25: "Multiplication Beginner L1", 26: "Multiplication Beginner L2",
      28: "Multiplication Intermediate L1", 29: "Multiplication Intermediate L2",
      31: "Multiplication Advanced L1", 32: "Multiplication Advanced L2",
      34: "Division Beginner L1", 35: "Division Beginner L2",
      37: "Division Intermediate L1", 38: "Division Intermediate L2",
      40: "Division Advanced L1", 41: "Division Advanced L2"
    };
    return activityNames[activityId] || `Activity ${activityId}`;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="loading-message">Loading your dashboard...</div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="dashboard-layout">
        <div className="loading-message">Please log in to view your dashboard</div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <h1>Smart<span className="logo-accent">Step</span></h1>
          </div>
          
          <nav className="dashboard-nav">
            <button className="dashboard-nav-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
            <button className="dashboard-nav-btn" onClick={() => navigate("/achievements")}>
              🏆 Achievements
            </button>
            <button className="dashboard-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="welcome-card">
            <div className="welcome-avatar">
              {child.profile_picture ? (
                <img src={`http://localhost:5000/${child.profile_picture}`} alt={child.name} />
              ) : (
                <div className="avatar-placeholder">{child.name.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="welcome-info">
              <h2>Welcome back, {child.name}! 🎉</h2>
              <p className="welcome-subtitle">Ready to continue your learning adventure?</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card points-card">
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalPoints}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>

          <div className="stat-card achievements-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-number">{stats.achievementsUnlocked}/{stats.totalAchievements}</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>

          <div className="stat-card activities-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{stats.activitiesCompleted}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>

          <div className="stat-card time-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalTimeSpent}</div>
              <div className="stat-label">Minutes Played</div>
            </div>
          </div>

          <div className="stat-card score-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{stats.bestScore}%</div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>

          <div className="stat-card streak-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.currentStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="dashboard-content-grid">
          {/* Recent Achievements */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>🏆 Recent Achievements</h3>
              <button className="view-all-btn" onClick={() => navigate("/achievements")}>
                View All →
              </button>
            </div>
            <div className="achievements-list">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.achievement_id} className="achievement-item">
                    <div className="achievement-icon-mini">{achievement.icon || "🏆"}</div>
                    <div className="achievement-info-mini">
                      <div className="achievement-name-mini">{achievement.name}</div>
                      <div className="achievement-date-mini">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="achievement-points-mini">+{achievement.points || 10}</div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>🎯 Complete activities to earn achievements!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>📚 Recent Activity</h3>
            </div>
            <div className="recent-activities-list">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, index) => {
                  const badge = getLevelBadge(activity.percentage || 0);
                  return (
                    <div key={index} className="activity-item">
                      <div className="activity-badge" style={{ backgroundColor: badge.color }}>
                        {badge.emoji}
                      </div>
                      <div className="activity-details">
                        <div className="activity-name">{getActivityName(activity.activity_id)}</div>
                        <div className="activity-meta">
                          <span>{activity.percentage || 0}% Score</span>
                          <span>•</span>
                          <span>{new Date(activity.last_attempt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="activity-status">
                        {activity.completed ? "✅" : "🔄"}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data">
                  <p>🚀 Start learning to see your activity here!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h3>📊 Learning Progress</h3>
          </div>
          <div className="progress-overview">
            <div className="progress-subject">
              <h4>➕ Addition</h4>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(progress.filter(p => p.activity_id >= 7 && p.activity_id <= 14 && p.completed).length / 6) * 100}%` }}></div>
              </div>
              <div className="progress-text">
                {progress.filter(p => p.activity_id >= 7 && p.activity_id <= 14 && p.completed).length} / 6 levels completed
              </div>
            </div>

            <div className="progress-subject">
              <h4>➖ Subtraction</h4>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(progress.filter(p => p.activity_id >= 16 && p.activity_id <= 23 && p.completed).length / 6) * 100}%` }}></div>
              </div>
              <div className="progress-text">
                {progress.filter(p => p.activity_id >= 16 && p.activity_id <= 23 && p.completed).length} / 6 levels completed
              </div>
            </div>

            <div className="progress-subject">
              <h4>✖️ Multiplication</h4>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(progress.filter(p => p.activity_id >= 25 && p.activity_id <= 32 && p.completed).length / 6) * 100}%` }}></div>
              </div>
              <div className="progress-text">
                {progress.filter(p => p.activity_id >= 25 && p.activity_id <= 32 && p.completed).length} / 6 levels completed
              </div>
            </div>

            <div className="progress-subject">
              <h4>➗ Division</h4>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${(progress.filter(p => p.activity_id >= 34 && p.activity_id <= 41 && p.completed).length / 6) * 100}%` }}></div>
              </div>
              <div className="progress-text">
                {progress.filter(p => p.activity_id >= 34 && p.activity_id <= 41 && p.completed).length} / 6 levels completed
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn" onClick={() => navigate("/subjects")}>
            📚 Continue Learning
          </button>
          <button className="action-btn" onClick={() => navigate("/achievements")}>
            🏆 View All Achievements
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
