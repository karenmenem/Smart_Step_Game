import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../api/auth";

function Subjects() {
  const navigate = useNavigate();
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
                      src={`http://localhost:5000/${user.child.profile_picture}`} 
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

        <div className="subjects-container">
          {/* English Section */}
          <div className="subject-section">
            <div className="subject-header english-header">
              <h2 className="subject-title">🎨 English</h2>
              <p className="subject-description">Learn words, grammar, and have fun with language!</p>
            </div>
            
            <div className="subject-buttons">
              <button className="subject-btn english-btn grammar-btn">
                <div className="btn-icon">✏️</div>
                <div className="btn-content">
                  <h3>Grammar</h3>
                  <p>Master sentence structure</p>
                </div>
              </button>
              
              <button className="subject-btn english-btn vocabulary-btn">
                <div className="btn-icon">🌟</div>
                <div className="btn-content">
                  <h3>Vocabulary</h3>
                  <p>Expand your word power</p>
                </div>
              </button>
              
              <button className="subject-btn english-btn picture-match-btn">
                <div className="btn-icon">🎯</div>
                <div className="btn-content">
                  <h3>Picture Match</h3>
                  <p>Match images with words</p>
                </div>
              </button>
            </div>
          </div>

          {/* Math Section */}
          <div className="subject-section">
            <div className="subject-header math-header">
              <h2 className="subject-title">🔢 Math</h2>
              <p className="subject-description">Explore numbers and solve fun problems!</p>
            </div>
            
            <div className="subject-buttons">
              <button className="subject-btn math-btn addition-btn" onClick={() => navigate("/math/addition")}>
                <div className="btn-icon">➕</div>
                <div className="btn-content">
                  <h3>Addition</h3>
                  <p>Add numbers together</p>
                </div>
              </button>
              
              <button className="subject-btn math-btn subtraction-btn" onClick={() => navigate("/math/subtraction")}>
                <div className="btn-icon">➖</div>
                <div className="btn-content">
                  <h3>Subtraction</h3>
                  <p>Take numbers away</p>
                </div>
              </button>
              
              <button className="subject-btn math-btn multiplication-btn" onClick={() => navigate("/math/multiplication")}>
                <div className="btn-icon">✖️</div>
                <div className="btn-content">
                  <h3>Multiplication</h3>
                  <p>Multiply numbers</p>
                </div>
              </button>
              
              <button className="subject-btn math-btn division-btn" onClick={() => navigate("/math/division")}>
                <div className="btn-icon">➗</div>
                <div className="btn-content">
                  <h3>Division</h3>
                  <p>Divide numbers</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Subjects;