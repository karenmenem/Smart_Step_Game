import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, api } from "../api/auth";

function MathLevels() {
  const navigate = useNavigate();
  const { operation } = useParams(); // addition, subtraction, multiplication, division
  const [user, setUser] = useState(null);
  const [levelAccess, setLevelAccess] = useState({
    level1: true,
    level2: { allowed: false, reason: '', percentage: 0 },
    level3: { allowed: false, reason: '', percentage: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const userData = auth.getCurrentUser();
      setUser(userData);
      checkLevelAccess(userData);
    } else {
      navigate("/login");
    }
  }, [navigate, operation]);

  const checkLevelAccess = async (userData) => {
    if (!userData?.child?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get activity IDs for this operation
      const operationBase = {
        'addition': 7,
        'subtraction': 16,
        'multiplication': 25,
        'division': 34
      };
      
      const baseId = operationBase[operation] || 7;
      
      // Check access for levels 2 and 3
      const [level2Access, level3Access] = await Promise.all([
        api.checkLevelAccess(userData.child.id, baseId + 1), // Level 2
        api.checkLevelAccess(userData.child.id, baseId + 2)  // Level 3
      ]);

      setLevelAccess({
        level1: true, // Always accessible
        level2: level2Access.success ? level2Access : { allowed: false, reason: 'Complete Level 1 first' },
        level3: level3Access.success ? level3Access : { allowed: false, reason: 'Complete Level 2 first' }
      });
    } catch (error) {
      console.error('Error checking level access:', error);
    } finally {
      setLoading(false);
    }
  };

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
                  <span className="stat-text">Numbers 1-10 with ASL signs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-text">10 questions per sublevel</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🎯</span>
                  <span className="stat-text">Get over 80% to unlock next level</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📚</span>
                  <span className="stat-text">3 sublevels to complete</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="level-btn start-btn"
                  onClick={() => navigate(`/math/${operation}/quiz/beginner/1`)}
                  style={{ backgroundColor: '#43e97b' }}
                  disabled={loading}
                >
                  📊 Sublevel 1: Simple {operationInfo.title} (1-10)
                </button>
                <button 
                  className={`level-btn ${levelAccess.level2.allowed ? 'start-btn' : 'locked-btn'}`}
                  onClick={() => {
                    if (levelAccess.level2.allowed) {
                      navigate(`/math/${operation}/quiz/beginner/2`);
                    } else {
                      alert(levelAccess.level2.reason || 'Complete Level 1 with 80% or higher to unlock');
                    }
                  }}
                  style={{ backgroundColor: levelAccess.level2.allowed ? '#4facfe' : '#ccc' }}
                  disabled={loading || !levelAccess.level2.allowed}
                >
                  {levelAccess.level2.allowed ? '🎬' : '🔒'} Sublevel 2: Intermediate {operationInfo.title} (10-50)
                  {!levelAccess.level2.allowed && levelAccess.level2.progress && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      Current: {levelAccess.level2.progress.percentage}% (Need 80%)
                    </div>
                  )}
                </button>
                <button 
                  className={`level-btn ${levelAccess.level3.allowed ? 'start-btn' : 'locked-btn'}`}
                  onClick={() => {
                    if (levelAccess.level3.allowed) {
                      navigate(`/math/${operation}/quiz/beginner/3`);
                    } else {
                      alert(levelAccess.level3.reason || 'Complete Level 2 with 80% or higher to unlock');
                    }
                  }}
                  style={{ backgroundColor: levelAccess.level3.allowed ? '#667eea' : '#ccc' }}
                  disabled={loading || !levelAccess.level3.allowed}
                >
                  {levelAccess.level3.allowed ? '🚀' : '🔒'} Sublevel 3: Advanced {operationInfo.title} (100+)
                  {!levelAccess.level3.allowed && levelAccess.level3.progress && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      Current: {levelAccess.level3.progress.percentage}% (Need 80%)
                    </div>
                  )}
                </button>
              </div>
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