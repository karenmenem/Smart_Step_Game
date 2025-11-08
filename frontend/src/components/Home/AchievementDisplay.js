import { useState, useEffect } from 'react';
import { auth, api } from '../../api/auth';

function AchievementDisplay() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ totalEarned: 0, totalAvailable: 0, totalPoints: 0 });
  const [loading, setLoading] = useState(true);
  const user = auth.getCurrentUser();
  const child = auth.getCurrentChild();

  useEffect(() => {
    if (child?.id) {
      loadAchievements();
    } else {
      setLoading(false);
    }
  }, [child?.id]); // Only depend on the ID, not the whole object

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.getAchievements(child.id);
      
      if (response.success && response.data) {
        setAchievements(response.data.achievements || []);
        setStats({
          totalEarned: response.data.totalEarned || 0,
          totalAvailable: response.data.totalAvailable || 0,
          totalPoints: child.total_points || 0
        });
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    "Getting Started": "#4CAF50",
    "Amazing Speed": "#FF9800", 
    "Math Champion": "#2196F3",
    "English Star": "#9C27B0",
    "Excellence": "#FFD700",
    "Daily Learning": "#FF5722",
    "Super Strong": "#E91E63",
    "Adventure": "#00BCD4",
    "Speed Star": "#FF6B35",
    "Super Collector": "#FFC107",
    "Weekend Fun": "#8E44AD",
    "Brain Power": "#1ABC9C",
    "Beginner": "#43e97b",
    "Intermediate": "#fbbf24",
    "Advanced": "#ef4444"
  };

  if (loading) {
    return (
      <div className="achievement-display">
        <div className="loading-message">Loading your achievements...</div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="achievement-display">
        <div className="loading-message">Please log in to view achievements</div>
      </div>
    );
  }

  return (
    <div className="achievement-display">
      <div className="achievement-header">
        <div className="header-icons">
          <span className="header-icon">🌟</span>
          <span className="header-icon">🏆</span>
          <span className="header-icon">⭐</span>
        </div>
        <h2>Your Amazing Badge Collection!</h2>
        <p className="achievement-subtitle">✨ Complete fun activities to unlock cool badges and earn points! ✨</p>
        <div className="achievement-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.totalEarned}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.totalAvailable}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.totalPoints}</span>
            <span className="stat-label">Points</span>
          </div>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="no-achievements">
          <p>🎯 Complete activities to start earning achievements!</p>
        </div>
      ) : (
        <div className="achievement-grid">
          {achievements.map((achievement) => {
            const category = achievement.category || "Adventure";
            const icon = achievement.icon || "🏆";
            const isEarned = achievement.earned || false;
            
            return (
              <div 
                key={achievement.achievement_id} 
                className={`achievement-card ${isEarned ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-card-header">
                  <div 
                    className="achievement-category-tag"
                    style={{ backgroundColor: categoryColors[category] || "#4CAF50" }}
                  >
                    ⭐ {category}
                  </div>
                  
                  {isEarned && (
                    <div className="achievement-unlocked-badge">
                      🎉 UNLOCKED!
                    </div>
                  )}
                </div>
                
                <div className="achievement-main">
                  <div className="achievement-icon-container">
                    <div className="achievement-icon">
                      {isEarned ? icon : '🔒'}
                    </div>
                    {isEarned && (
                      <div className="achievement-glow"></div>
                    )}
                  </div>
                  
                  <div className="achievement-content">
                    <h3 className="achievement-name">
                      {isEarned ? `${icon} ${achievement.name}` : `🔒 ${achievement.name}`}
                    </h3>
                    <p className="achievement-description">
                      {achievement.description}
                    </p>
                    <div className="achievement-points">
                      <span className="points-icon">💎</span>
                      {achievement.points || 10} points
                    </div>
                    {isEarned && achievement.earnedAt && (
                      <div className="achievement-earned-date">
                        Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AchievementDisplay;