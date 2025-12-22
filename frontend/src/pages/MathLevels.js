import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, api } from "../api/auth";

function MathLevels() {
  const navigate = useNavigate();
  const { operation } = useParams(); // addition, subtraction, multiplication, division
  const [user, setUser] = useState(null);
  const [levelAccess, setLevelAccess] = useState({
    beginner: {
      level1: true,
      level2: { allowed: false, reason: '', percentage: 0 }
    },
    intermediate: {
      level1: { allowed: false, reason: '', percentage: 0 },
      level2: { allowed: false, reason: '', percentage: 0 }
    },
    advanced: {
      level1: { allowed: false, reason: '', percentage: 0 },
      level2: { allowed: false, reason: '', percentage: 0 }
    }
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
      // Structure: Beginner (L1, L2), Intermediate (L1, L2), Advanced (L1, L2)
      const operationBase = {
        'addition': 7,      // 7, 8, 10, 11, 13, 14
        'subtraction': 16,  // 16, 17, 19, 20, 22, 23
        'multiplication': 70, // 70, 71, 73, 74, 76, 77
        'division': 34      // 34, 35, 37, 38, 40, 41
      };
      
      const baseId = operationBase[operation] || 7;
      
      // Check access for all levels
      // Beginner Level 2 (baseId + 1)
      // Intermediate Level 1 (baseId + 3)
      // Intermediate Level 2 (baseId + 4)
      // Advanced Level 1 (baseId + 6)
      // Advanced Level 2 (baseId + 7)
      
      const [
        beginnerL2,
        intermediateL1,
        intermediateL2,
        advancedL1,
        advancedL2
      ] = await Promise.all([
        api.checkLevelAccess(userData.child.id, baseId + 1),
        api.checkLevelAccess(userData.child.id, baseId + 3),
        api.checkLevelAccess(userData.child.id, baseId + 4),
        api.checkLevelAccess(userData.child.id, baseId + 6),
        api.checkLevelAccess(userData.child.id, baseId + 7)
      ]);

      setLevelAccess({
        beginner: {
          level1: true, // Always accessible
          level2: beginnerL2.success && beginnerL2.allowed ? beginnerL2 : { allowed: false, reason: beginnerL2.reason || 'Complete Level 1 first' }
        },
        intermediate: {
          level1: intermediateL1.success && intermediateL1.allowed ? intermediateL1 : { allowed: false, reason: intermediateL1.reason || 'Complete Beginner Level 2 first' },
          level2: intermediateL2.success && intermediateL2.allowed ? intermediateL2 : { allowed: false, reason: intermediateL2.reason || 'Complete Intermediate Level 1 first' }
        },
        advanced: {
          level1: advancedL1.success && advancedL1.allowed ? advancedL1 : { allowed: false, reason: advancedL1.reason || 'Complete Intermediate Level 2 first' },
          level2: advancedL2.success && advancedL2.allowed ? advancedL2 : { allowed: false, reason: advancedL2.reason || 'Complete Advanced Level 1 first' }
        }
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
                      src={`http://localhost:5001/${user.child.profile_picture}`} 
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
                  <span className="stat-text">2 sublevels to complete</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="level-btn start-btn"
                  onClick={() => navigate(`/math/${operation}/quiz/beginner/1`)}
                  style={{ backgroundColor: '#43e97b' }}
                  disabled={loading}
                >
                  📊 Sublevel 1: {operationInfo.title} (1-10)
                </button>
                <button 
                  className={`level-btn ${levelAccess.beginner.level2.allowed ? 'start-btn' : 'locked-btn'}`}
                  onClick={() => {
                    if (levelAccess.beginner.level2.allowed) {
                      navigate(`/math/${operation}/quiz/beginner/2`);
                    } else {
                      alert(levelAccess.beginner.level2.reason || 'Complete Level 1 with 80% or higher to unlock');
                    }
                  }}
                  style={{ backgroundColor: levelAccess.beginner.level2.allowed ? '#4facfe' : '#ccc' }}
                  disabled={loading || !levelAccess.beginner.level2.allowed}
                >
                  {levelAccess.beginner.level2.allowed ? '🎬' : '🔒'} Sublevel 2:{operationInfo.title} (10-50)
                  {!levelAccess.beginner.level2.allowed && levelAccess.beginner.level2.progress && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      Current: {levelAccess.beginner.level2.progress.percentage}% (Need 80%)
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Intermediate Level */}
          <div className={`level-card intermediate-card ${levelAccess.intermediate.level1.allowed ? 'active' : 'locked'}`}>
            {!levelAccess.intermediate.level1.allowed && (
              <div className="lock-overlay">
                <div className="lock-icon">🔒</div>
              </div>
            )}
            
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
                  <span className="stat-text">Numbers 10-100</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🏆</span>
                  <span className="stat-text">More challenging problems</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <button 
                  className={`level-btn ${levelAccess.intermediate.level1.allowed ? 'start-btn' : 'locked-btn'}`}
                  onClick={() => {
                    if (levelAccess.intermediate.level1.allowed) {
                      navigate(`/math/${operation}/quiz/intermediate/1`);
                    } else {
                      alert(levelAccess.intermediate.level1.reason || 'Complete Beginner Level 2 with 80% or higher to unlock');
                    }
                  }}
                  style={{ backgroundColor: levelAccess.intermediate.level1.allowed ? '#fa709a' : '#ccc' }}
                  disabled={loading || !levelAccess.intermediate.level1.allowed}
                >
                  {levelAccess.intermediate.level1.allowed ? '📊' : '🔒'} Sublevel 1: Intermediate Problems
                </button>
                <button 
                  className={`level-btn ${levelAccess.intermediate.level2.allowed ? 'start-btn' : 'locked-btn'}`}
                  onClick={() => {
                    if (levelAccess.intermediate.level2.allowed) {
                      navigate(`/math/${operation}/quiz/intermediate/2`);
                    } else {
                      alert(levelAccess.intermediate.level2.reason || 'Complete Intermediate Level 1 with 80% or higher to unlock');
                    }
                  }}
                  style={{ backgroundColor: levelAccess.intermediate.level2.allowed ? '#fa709a' : '#ccc' }}
                  disabled={loading || !levelAccess.intermediate.level2.allowed}
                >
                  {levelAccess.intermediate.level2.allowed ? '🎬' : '🔒'} Sublevel 2: Intermediate Word Problems
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Level */}
          <div className={`level-card advanced-card ${levelAccess.advanced.level1.allowed ? 'active' : 'locked'}`}>
            {!levelAccess.advanced.level1.allowed && (
              <div className="lock-overlay">
                <div className="lock-icon">🔒</div>
              </div>
            )}
            
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
                  <span className="stat-text">Expert level problems</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">👑</span>
                  <span className="stat-text">Become a champion</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <button 
                  className={`level-btn ${levelAccess.advanced.level1.allowed ? 'start-btn' : 'locked-btn'}`}
                  onClick={() => {
                    if (levelAccess.advanced.level1.allowed) {
                      navigate(`/math/${operation}/quiz/advanced/1`);
                    } else {
                      alert(levelAccess.advanced.level1.reason || 'Complete Intermediate Level 2 with 80% or higher to unlock');
                    }
                  }}
                  style={{ backgroundColor: levelAccess.advanced.level1.allowed ? '#667eea' : '#ccc' }}
                  disabled={loading || !levelAccess.advanced.level1.allowed}
                >
                  {levelAccess.advanced.level1.allowed ? '📊' : '🔒'} Sublevel 1: Expert Problems
                </button>
                <button 
                  className={`level-btn ${levelAccess.advanced.level2.allowed ? 'start-btn' : 'locked-btn'}`}
                  onClick={() => {
                    if (levelAccess.advanced.level2.allowed) {
                      navigate(`/math/${operation}/quiz/advanced/2`);
                    } else {
                      alert(levelAccess.advanced.level2.reason || 'Complete Advanced Level 1 with 80% or higher to unlock');
                    }
                  }}
                  style={{ backgroundColor: levelAccess.advanced.level2.allowed ? '#667eea' : '#ccc' }}
                  disabled={loading || !levelAccess.advanced.level2.allowed}
                >
                  {levelAccess.advanced.level2.allowed ? '🎬' : '🔒'} Sublevel 2: Master Problems
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MathLevels;