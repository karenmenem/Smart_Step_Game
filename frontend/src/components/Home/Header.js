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
        <h1
          style={{
            margin: 0,
            fontSize: "2.5rem",
            color: "#fff",
            letterSpacing: "2px",
          }}
        >
          Smart Step
        </h1>
        <div>
          <button
            style={{
              marginRight: "1rem",
              padding: "0.7rem 1.5rem",
              borderRadius: "12px",
              border: "2px solid #fff",
              background: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "1rem",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.4)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Profile
          </button>
          <button
            style={{
              padding: "0.7rem 1.5rem",
              borderRadius: "12px",
              border: "none",
              background: "#fff",
              color: "#ff6b9d",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
