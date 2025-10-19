import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="logo-text">
          Smart Step
        </h1>
        <nav className="nav-buttons">
          <button
            className="nav-btn profile-btn"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
          <button
            className="nav-btn login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="nav-btn dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="nav-btn achievements-btn"
            onClick={() => navigate("/achievements")}
          >
            Achievements
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
