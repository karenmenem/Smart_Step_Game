import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../api/auth";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const updateUserData = () => {
      if (auth.isAuthenticated()) {
        const userData = auth.getCurrentUser();
        const currentChild = auth.getCurrentChild();
        
        console.log('User data:', userData);
        console.log('Current child:', currentChild);
        
        // Ensure the user data has the current child
        if (userData && currentChild) {
          userData.child = currentChild;
        }
        
        setUser(userData);
      }
    };

    updateUserData();

    // Listen for storage changes to update when child is switched
    const handleStorageChange = (e) => {
      if (e.key === 'userData' || e.key === 'currentChild') {
        updateUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for focus events (when returning to the page)
    window.addEventListener('focus', updateUserData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', updateUserData);
    };
  }, []);

  // Update user data when returning to the home page
  useEffect(() => {
    const updateUserData = () => {
      if (auth.isAuthenticated()) {
        const userData = auth.getCurrentUser();
        const currentChild = auth.getCurrentChild();
        
        if (userData && currentChild) {
          userData.child = currentChild;
        }
        
        setUser(userData);
      }
    };

    updateUserData();
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="math-adventure-layout">
      <header className="ma-header">
        <div className="ma-header-content">
          <div className="ma-logo">
            <h1>Smart<span className="logo-accent">Step</span></h1>
          </div>
          
          <nav className="ma-nav ma-nav-desktop">
            <button className="ma-nav-btn" onClick={() => navigate("/")}>🏠</button>
            <button className="ma-nav-btn">Dashboard</button>
            <button className="ma-nav-btn" onClick={() => navigate("/achievements")}>Achievements</button>
            <div className="ma-user-section">
              {user ? (
                <>
                  <div className="ma-user-info">
                    {user.child?.profile_picture ? (
                      <img 
                        src={`http://localhost:5000/${user.child.profile_picture}`} 
                        alt="Profile" 
                        className="ma-profile-avatar"
                        onError={(e) => {
                          console.log('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="ma-avatar">
                        {(user.child?.name || user.parent?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="ma-welcome-text">Welcome, {user.child?.name || user.parent?.email}!</span>
                  </div>
                  <button className="ma-profile-btn" onClick={() => navigate("/profile")}>Profile</button>
                  <button className="ma-logout-btn" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <button className="ma-signin-btn" onClick={() => navigate("/login")}>Sign In</button>
                  <button className="ma-signup-btn" onClick={() => navigate("/register")}>Sign Up</button>
                </>
              )}
            </div>
          </nav>

          <button className="ma-mobile-menu-btn" onClick={toggleMobileMenu}>
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        <div className={`ma-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <button className="ma-mobile-nav-btn" onClick={() => setIsMobileMenuOpen(false)}>
            🏠 Home
          </button>
          <button className="ma-mobile-nav-btn" onClick={() => setIsMobileMenuOpen(false)}>
            📊 Dashboard
          </button>
          <button className="ma-mobile-nav-btn" onClick={() => { navigate("/achievements"); setIsMobileMenuOpen(false); }}>
            🏆 Achievements
          </button>
          {user ? (
            <>
              <div className="ma-mobile-user-info">
                {user.child?.profile_picture ? (
                  <img 
                    src={`http://localhost:5000/${user.child.profile_picture}`} 
                    alt="Profile" 
                    className="ma-mobile-profile-avatar"
                    onError={(e) => {
                      console.log('Mobile image failed to load:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="ma-mobile-avatar">
                    {(user.child?.name || user.parent?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span>Welcome, {user.child?.name || user.parent?.email}!</span>
              </div>
              <button className="ma-mobile-nav-btn" onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }}>
                👤 Profile
              </button>
              <button className="ma-mobile-nav-btn" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <button className="ma-mobile-nav-btn" onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}>
                🔐 Sign In
              </button>
              <button className="ma-mobile-nav-btn" onClick={() => { navigate("/register"); setIsMobileMenuOpen(false); }}>
                ✨ Sign Up
              </button>
            </>
          )}
        </div>

        {isMobileMenuOpen && <div className="ma-mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      </header>

      <main className="ma-main">
        <div className="ma-right-bubbles">
          <div className="ma-bubble ma-bubble-1">+</div>
          <div className="ma-bubble ma-bubble-2">A</div>
          <div className="ma-bubble ma-bubble-3">÷</div>
          <div className="ma-bubble ma-bubble-4">B</div>
          <div className="ma-bubble ma-bubble-5">=</div>
          <div className="ma-bubble ma-bubble-6">C</div>
        </div>

        <div className="ma-english-designs">
          <div className="ma-english-item ma-item-1">ABC</div>
          <div className="ma-english-item ma-item-2">📖</div>
          <div className="ma-english-item ma-item-3">✏️</div>
          <div className="ma-english-item ma-item-4">123</div>
        </div>

        <div className="ma-content">
          <h1 className="ma-main-title">Make Learning Fun<br/>with Smart Step!</h1>
          <p className="ma-subtitle">Let's learn with words, numbers, and signs!</p>
          
          <div className="ma-buttons">
            <button className="ma-btn ma-btn-secondary" onClick={() => navigate("/dashboard")}>
              📊 Go to Dashboard
            </button>
            <button className="ma-btn ma-btn-primary" onClick={() => navigate("/subjects")}>
              Play Now
            </button>
          </div>

          {/* Family Management Section for Authenticated Users */}
          {user && (
            <div className="ma-family-section">
              <div className="ma-current-child">
                {user.child ? (
                  <div className="ma-child-display">
                    <div className="ma-child-avatar">
                      {user.child.profile_picture ? (
                        <img 
                          src={`http://localhost:5000/${user.child.profile_picture}`} 
                          alt={user.child.name}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="ma-avatar-placeholder">
                          {user.child.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ma-child-info">
                      <h3>Playing as: {user.child.name}</h3>
                      <p>Age: {user.child.age} • Math Level: {user.child.mathLevel} • English Level: {user.child.englishLevel}</p>
                    </div>
                  </div>
                ) : (
                  <div className="ma-no-child">
                    <p>No child selected</p>
                  </div>
                )}
              </div>
              
              <div className="ma-family-buttons">
                <button className="ma-family-btn" onClick={() => navigate("/profile")}>
                  👨‍👩‍👧‍👦 Manage Children
                </button>
                {user.children && user.children.length > 1 && (
                  <button className="ma-family-btn" onClick={() => navigate("/profile")}>
                    🔄 Switch Child
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="ma-features-section">
          <h2 className="ma-features-title">Why Kids Love Smart Step</h2>
          
          <div className="ma-feature-item">
            <div className="ma-feature-separator ma-separator-orange"></div>
            <div className="ma-feature-icon">🎮</div>
            <h3 className="ma-feature-heading">Interactive Learning</h3>
            <p className="ma-feature-description">Learn math and English through fun, engaging games that make education enjoyable!</p>
          </div>

          <div className="ma-feature-item">
            <div className="ma-feature-separator ma-separator-blue"></div>
            <div className="ma-feature-icon">📚</div>
            <h3 className="ma-feature-heading">Multiple Subjects</h3>
            <p className="ma-feature-description">Master both mathematics and English language skills in one comprehensive platform!</p>
          </div>

          <div className="ma-feature-item">
            <div className="ma-feature-separator ma-separator-green"></div>
            <div className="ma-feature-icon">🏆</div>
            <h3 className="ma-feature-heading">Earn Achievements</h3>
            <p className="ma-feature-description">Collect badges and unlock rewards as you progress and improve your skills!</p>
          </div>

          <div className="ma-feature-item">
            <div className="ma-feature-separator ma-separator-purple"></div>
            <div className="ma-feature-icon">📊</div>
            <h3 className="ma-feature-heading">Track Progress</h3>
            <p className="ma-feature-description">Monitor your learning journey with detailed progress tracking and personalized feedback!</p>
          </div>
        </div>

        <div className="ma-progress-section">
          <div className="ma-emoji">😊</div>
          <div className="ma-progress-bar">
            <div className="ma-progress-fill"></div>
          </div>
          <p className="ma-progress-text">What We Learn in Smart Step!</p>
        </div>

      </main>
    </div>
  );
}

export default Home;
