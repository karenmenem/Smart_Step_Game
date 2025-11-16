import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, api } from "../api/auth";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  // Fetch homepage settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/homepage');
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
          applyCustomStyles(data.data);
        }
      } catch (error) {
        console.error('Error fetching homepage settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Apply custom CSS and dynamic styles
  const applyCustomStyles = (settings) => {
    const style = document.createElement('style');
    style.id = 'homepage-dynamic-styles';
    
    // Remove existing dynamic styles
    const existing = document.getElementById('homepage-dynamic-styles');
    if (existing) {
      existing.remove();
    }

    style.textContent = `
      .ma-header {
        background-color: ${settings.header_background_color || '#ffffff'} !important;
        color: ${settings.header_text_color || '#333333'} !important;
      }
      
      .logo-accent {
        color: ${settings.logo_accent_color || '#ff6b6b'} !important;
      }
      
      .ma-nav-btn {
        background-color: ${settings.nav_button_bg_color || '#f0f0f0'} !important;
        color: ${settings.nav_button_text_color || '#333333'} !important;
      }
      
      .ma-nav-btn:hover {
        background-color: ${settings.nav_button_hover_bg || '#e0e0e0'} !important;
      }
      
      .ma-main {
        background-color: ${settings.main_background_color || '#f8f9fa'} !important;
      }
      
      .ma-main-title {
        color: ${settings.main_title_color || '#2c3e50'} !important;
      }
      
      .ma-subtitle {
        color: ${settings.main_subtitle_color || '#7f8c8d'} !important;
      }
      
      .ma-btn-primary {
        background-color: ${settings.primary_button_bg || '#4CAF50'} !important;
        color: ${settings.primary_button_text || '#ffffff'} !important;
      }
      
      .ma-btn-primary:hover {
        background-color: ${settings.primary_button_hover_bg || '#45a049'} !important;
      }
      
      .ma-btn-secondary {
        background-color: ${settings.secondary_button_bg || '#2196F3'} !important;
        color: ${settings.secondary_button_text || '#ffffff'} !important;
      }
      
      .ma-btn-secondary:hover {
        background-color: ${settings.secondary_button_hover_bg || '#0b7dda'} !important;
      }
      
      .ma-bubble {
        background-color: ${settings.bubble_color || '#ff6b6b'} !important;
        color: ${settings.bubble_text_color || '#ffffff'} !important;
      }
      
      ${settings.custom_css || ''}
    `;
    
    document.head.appendChild(style);
  };

  useEffect(() => {
    const updateUserData = async () => {
      if (auth.isAuthenticated()) {
        const userData = auth.getCurrentUser();
        const currentChild = auth.getCurrentChild();
        
        console.log('User data:', userData);
        console.log('Current child:', currentChild);
        
        // Ensure the user data has the current child
        if (userData && currentChild) {
          userData.child = currentChild;
          
          // Fetch child's progress and achievements from database
          await fetchChildData(currentChild.id);
        }
        
        setUser(userData);
        setLoading(false);
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
    const updateUserData = async () => {
      if (auth.isAuthenticated()) {
        const userData = auth.getCurrentUser();
        const currentChild = auth.getCurrentChild();
        
        if (userData && currentChild) {
          userData.child = currentChild;
          // Refresh progress when navigating back to home
          await fetchChildData(currentChild.id);
        }
        
        setUser(userData);
      }
    };

    updateUserData();
  }, [location.pathname]);

  const fetchChildData = async (childId) => {
    try {
      const [progressResponse, achievementsResponse] = await Promise.all([
        api.getChildProgress(childId),
        api.getChildAchievements(childId)
      ]);

      if (progressResponse.success) {
        setProgress(progressResponse.data);
        console.log('Child progress:', progressResponse.data);
      }

      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.data);
        console.log('Child achievements:', achievementsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
    }
  };

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
            <button className="ma-nav-btn" onClick={() => navigate("/achievements")}>Achievements</button>
            <div className="ma-user-section">
              {user ? (
                <>
                  <div className="ma-user-info">
                    {user.child?.profile_picture ? (
                      <img 
                        src={`http://localhost:5001/${user.child.profile_picture}`}
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
        {settings.show_math_bubbles !== false && (
          <div className="ma-right-bubbles">
            {(settings.math_bubbles && settings.math_bubbles.length > 0 ? settings.math_bubbles : [
              {symbol: '+', position: 1},
              {symbol: 'A', position: 2},
              {symbol: '÷', position: 3},
              {symbol: 'B', position: 4},
              {symbol: '=', position: 5},
              {symbol: 'C', position: 6}
            ]).map((bubble, index) => (
              <div key={index} className={`ma-bubble ma-bubble-${bubble.position}`}>
                {bubble.symbol}
              </div>
            ))}
          </div>
        )}

        {settings.show_english_items !== false && (
          <div className="ma-english-designs">
            {(settings.english_items && settings.english_items.length > 0 ? settings.english_items : [
              {symbol: 'ABC', position: 1},
              {symbol: '📖', position: 2},
              {symbol: '✏️', position: 3},
              {symbol: '123', position: 4}
            ]).map((item, index) => (
              <div key={index} className={`ma-english-item ma-item-${item.position}`}>
                {item.symbol}
              </div>
            ))}
          </div>
        )}

        <div className="ma-content">
          <h1 
            className="ma-main-title"
            dangerouslySetInnerHTML={{ 
              __html: settings.main_title || 'Make Learning Fun<br/>with Smart Step!' 
            }}
          />
          <p className="ma-subtitle">
            {settings.main_subtitle || "Let's learn with words, numbers, and signs!"}
          </p>
          
          <div className="ma-buttons">
            {(settings.cta_buttons && settings.cta_buttons.length > 0 ? settings.cta_buttons : [
              {text: '📊 Go to Dashboard', action: 'dashboard', type: 'secondary'},
              {text: 'Play Now', action: 'subjects', type: 'primary'}
            ]).map((btn, index) => (
              <button 
                key={index}
                className={`ma-btn ma-btn-${btn.type}`} 
                onClick={() => navigate(`/${btn.action}`)}
              >
                {btn.text}
              </button>
            ))}
          </div>

          {user && (
            <div className="ma-family-section">
              <div className="ma-current-child">
                {user.child ? (
                  <div className="ma-child-display">
                    <div className="ma-child-avatar">
                      {user.child.profile_picture ? (
                        <img 
                          src={`http://localhost:5001/${user.child.profile_picture}`} 
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
          <h2 className="ma-features-title">
            {settings.features_title || 'Why Kids Love Smart Step'}
          </h2>
          
          {(settings.features_list && settings.features_list.length > 0 ? settings.features_list : [
            {icon: '🎮', title: 'Interactive Learning', description: 'Learn math and English through fun, engaging games that make education enjoyable!', color: 'orange'},
            {icon: '📚', title: 'Multiple Subjects', description: 'Master both mathematics and English language skills in one comprehensive platform!', color: 'blue'},
            {icon: '🏆', title: 'Earn Achievements', description: 'Collect badges and unlock rewards as you progress and improve your skills!', color: 'green'},
            {icon: '📊', title: 'Track Progress', description: 'Monitor your learning journey with detailed progress tracking and personalized feedback!', color: 'purple'}
          ]).map((feature, index) => (
            <div key={index} className="ma-feature-item">
              <div className={`ma-feature-separator ma-separator-${feature.color}`}></div>
              <div className="ma-feature-icon">{feature.icon}</div>
              <h3 className="ma-feature-heading">{feature.title}</h3>
              <p className="ma-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        {settings.show_progress_bar !== false && (
          <div className="ma-progress-section">
            <div className="ma-emoji">{settings.progress_bar_emoji || '😊'}</div>
            <div className="ma-progress-bar">
              <div className="ma-progress-fill"></div>
            </div>
            <p className="ma-progress-text">
              {settings.progress_bar_text || 'What We Learn in Smart Step!'}
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

export default Home;
