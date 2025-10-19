import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="math-adventure-layout">
      <header className="ma-header">
        <div className="ma-header-content">
          <div className="ma-logo">
            <h1>Smart<span className="logo-accent">Step</span></h1>
          </div>
          <nav className="ma-nav">
            <button className="ma-nav-btn">🏠</button>
            <button className="ma-nav-btn">Dashboard</button>
            <button className="ma-nav-btn">Achievements</button>
            <div className="ma-user-section">
              <button className="ma-signin-btn" onClick={() => navigate("/login")}>Sign In</button>
              <button className="ma-signup-btn" onClick={() => navigate("/register")}>Sign Up</button>
            </div>
          </nav>
        </div>
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
          <p className="ma-subtitle">Welcome back! Ready to continue your learning journey?</p>
          
          <div className="ma-buttons">
            <button className="ma-btn ma-btn-secondary" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>
            <button className="ma-btn ma-btn-primary" onClick={() => navigate("/subjects")}>
              Play Now
            </button>
          </div>
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
