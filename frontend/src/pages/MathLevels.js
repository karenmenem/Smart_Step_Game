import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../api/auth";

function MathLevels() {
  const navigate = useNavigate();
  const { operation } = useParams(); // addition, subtraction, multiplication, division
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const userData = auth.getCurrentUser();
      setUser(userData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const getOperationDetails = () => {
    const operations = {
      addition: {
        title: "Addition",
        emoji: "➕",
        description: "Learn to add numbers together!",
        color: "#43e97b"
      },
      subtraction: {
        title: "Subtraction",
        emoji: "➖", 
        description: "Learn to take numbers away!",
        color: "#fa709a"
      },
      multiplication: {
        title: "Multiplication",
        emoji: "✖️",
        description: "Learn to multiply numbers!",
        color: "#4facfe"
      },
      division: {
        title: "Division",
        emoji: "➗",
        description: "Learn to divide numbers!",
        color: "#667eea"
      }
    };
    return operations[operation] || operations.addition;
  };

  const operationInfo = getOperationDetails();

  return (
    <div className="math-levels-layout">
      {/* Header */}
      <header className="math-levels-header">
        <div className="math-levels-header-content">
          <div className="math-levels-logo">
            <h1>Smart<span className="logo-accent">Step</span></h1>
          </div>
          
          <nav className="math-levels-nav">
            <button className="math-levels-nav-btn" onClick={() => navigate("/subjects")}>
              ← Back to Subjects
            </button>
            <button className="math-levels-nav-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
            {user && (
              <>
                <div className="math-levels-user-info">
                  {user.child?.profile_picture ? (
                    <img 
                      src={`http://localhost:5000/${user.child.profile_picture}`} 
                      alt="Profile" 
                      className="math-levels-profile-avatar"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="math-levels-avatar">
                      {(user.child?.name || user.parent?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="math-levels-welcome-text">Hi, {user.child?.name || user.parent?.email}!</span>
                </div>
                <button className="math-levels-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="math-levels-main">
        <div className="math-levels-title-section">
          <div className="operation-header">
            <div className="operation-icon" style={{color: operationInfo.color}}>
              {operationInfo.emoji}
            </div>
            <div>
              <h1 className="math-levels-main-title">{operationInfo.title} Adventure! 🎯</h1>
              <p className="math-levels-subtitle">{operationInfo.description}</p>
            </div>
          </div>
        </div>

        <div className="levels-container">
          {/* Beginner Level */}
          <div className="level-card beginner-card active">
            <div className="level-header">
              <div className="level-icon">🌱</div>
              <div className="level-info">
                <h2 className="level-title">Beginner</h2>
                <p className="level-description">Perfect for starting your {operationInfo.title.toLowerCase()} journey!</p>
              </div>
            </div>
            
            <div className="level-content">
              <div className="level-stats">
                <div className="stat-item">
                  <span className="stat-icon">🧮</span>
                  <span className="stat-text">Add numbers step-by-step</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-text">Earn stars for every correct answer</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-text">Get over 80% to unlock intermediate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📚</span>
                  <span className="stat-text">3 levels each 10 questions</span>
                </div>
              </div>
              
              <button 
                className="level-btn start-btn"
                onClick={() => navigate(`/math/${operation}/quiz/beginner/1`)}
              >
                Start Learning
              </button>
            </div>
          </div>

          {/* Intermediate Level */}
          <div className="level-card intermediate-card locked">
            <div className="lock-overlay">
              <div className="lock-icon">🔒</div>
            </div>
            
            <div className="level-header">
              <div className="level-icon">⚡</div>
              <div className="level-info">
                <h2 className="level-title">Intermediate</h2>
                <p className="level-description">Challenge yourself with harder problems!</p>
              </div>
            </div>
            
            <div className="level-content">
              <div className="level-stats">
                <div className="stat-item">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-text">Challenge activities</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🏆</span>
                  <span className="stat-text">More rewards</span>
                </div>
              </div>
              
              <button className="level-btn locked-btn" disabled>
                Complete Beginner First
              </button>
            </div>
          </div>

          {/* Advanced Level */}
          <div className="level-card advanced-card locked">
            <div className="lock-overlay">
              <div className="lock-icon">🔒</div>
            </div>
            
            <div className="level-header">
              <div className="level-icon">🏆</div>
              <div className="level-info">
                <h2 className="level-title">Advanced</h2>
                <p className="level-description">Master the toughest challenges!</p>
              </div>
            </div>
            
            <div className="level-content">
              <div className="level-stats">
                <div className="stat-item">
                  <span className="stat-icon">🚀</span>
                  <span className="stat-text">Expert challenges</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👑</span>
                  <span className="stat-text">Become a champion</span>
                </div>
              </div>
              
              <button className="level-btn locked-btn" disabled>
                Complete Intermediate First
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MathLevels;