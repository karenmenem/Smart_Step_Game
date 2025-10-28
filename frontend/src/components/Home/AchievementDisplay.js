import { useState, useEffect } from 'react';
import { auth } from '../../api/auth';

function AchievementDisplay() {
  const [userAchievements, setUserAchievements] = useState([]);
  const user = auth.getCurrentUser();

  const achievements = [
    {
      id: 1,
      name: "Welcome to Smart Step!",
      description: "Start your learning adventure by completing your very first activity",
      icon: "🌟",
      points: 10,
      category: "Getting Started",
      unlocked: false
    },
    {
      id: 2,
      name: "Super Fast Learner",
      description: "Wow! Complete 5 fun activities in just one day",
      icon: "⚡",
      points: 50,
      category: "Amazing Speed",
      unlocked: false
    },
    {
      id: 3,
      name: "Math Superhero",
      description: "Become a math champion by finishing all beginner math activities",
      icon: "🧙‍♂️",
      points: 100,
      category: "Math Champion",
      unlocked: false
    },
    {
      id: 4,
      name: "Reading Star",
      description: "Show your English skills by completing all beginner English activities",
      icon: "📚",
      points: 100,
      category: "English Star",
      unlocked: false
    },
    {
      id: 5,
      name: "Perfect Player",
      description: "Amazing! Get every single answer right in any activity",
      icon: "💯",
      points: 25,
      category: "Excellence",
      unlocked: false
    },
    {
      id: 6,
      name: "Learning Streak Champion",
      description: "Keep learning every single day for a whole week!",
      icon: "🔥",
      points: 75,
      category: "Daily Learning",
      unlocked: false
    },
    {
      id: 7,
      name: "Never Give Up Hero",
      description: "Keep trying until you succeed! Complete any activity after trying 3 times",
      icon: "💪",
      points: 30,
      category: "Super Strong",
      unlocked: false
    },
    {
      id: 8,
      name: "Subject Explorer",
      description: "Try learning both Math AND English - you're so curious!",
      icon: "�️",
      points: 40,
      category: "Adventure",
      unlocked: false
    },
    {
      id: 9,
      name: "Lightning Fast",
      description: "Complete any activity super quickly in under 30 seconds",
      icon: "🏃‍♂️",
      points: 35,
      category: "Speed Star",
      unlocked: false
    },
    {
      id: 10,
      name: "Badge Collector",
      description: "Collect 10 different achievement badges - you're amazing!",
      icon: "🏆",
      points: 150,
      category: "Super Collector",
      unlocked: false
    },
    {
      id: 11,
      name: "Weekend Warrior",
      description: "Keep learning even on weekends - Saturday AND Sunday!",
      icon: "�",
      points: 30,
      category: "Weekend Fun",
      unlocked: false
    },
    {
      id: 12,
      name: "Question Master",
      description: "Answer 50 questions correctly - you're so smart!",
      icon: "🧠",
      points: 60,
      category: "Brain Power",
      unlocked: false
    }
  ];

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
    "Brain Power": "#1ABC9C"
  };

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
            <span className="stat-number">0</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{achievements.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Points</span>
          </div>
        </div>
      </div>

      <div className="achievement-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-card-header">
              <div 
                className="achievement-category-tag"
                style={{ backgroundColor: categoryColors[achievement.category] }}
              >
                ⭐ {achievement.category}
              </div>
              
              {achievement.unlocked && (
                <div className="achievement-unlocked-badge">
                  🎉 UNLOCKED!
                </div>
              )}
            </div>
            
            <div className="achievement-main">
              <div className="achievement-icon-container">
                <div className="achievement-icon">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                {achievement.unlocked && (
                  <div className="achievement-glow"></div>
                )}
              </div>
              
              <div className="achievement-content">
                <h3 className="achievement-name">
                  {achievement.unlocked ? `${achievement.icon} ${achievement.name}` : `🔒 ${achievement.name}`}
                </h3>
                <p className="achievement-description">
                  {achievement.description}
                </p>
                <div className="achievement-points">
                  <span className="points-icon">💎</span>
                  {achievement.points} points
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AchievementDisplay;