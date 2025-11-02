import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, auth } from "../api/auth";

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [parentData, setParentData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [childData, setChildData] = useState({
    name: "",
    age: "",
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleParentChange = (e) => {
    setParentData({
      ...parentData,
      [e.target.name]: e.target.value
    });
  };

  const handleChildChange = (e) => {
    if (e.target.name === 'profilePicture') {
      setChildData({
        ...childData,
        [e.target.name]: e.target.files[0]
      });
    } else {
      setChildData({
        ...childData,
        [e.target.name]: e.target.value
      });
    }
  };

    const handleParentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (!parentData.email.includes('@') || !parentData.email.includes('.')) {
        setError("Please enter a valid email address!");
        return;
      }
      
      if (parentData.password.length < 6) {
        setError("Password must be at least 6 characters long!");
        return;
      }

      if (parentData.password !== parentData.confirmPassword) {
        setError("Passwords do not match!");
        return;
      }

      // Register parent only
      const formData = new FormData();
      formData.append('email', parentData.email);
      formData.append('password', parentData.password);
      
      console.log('Sending registration data:', {
        email: parentData.email,
        password: '[PROVIDED]'
      });
      
      const result = await api.register(formData);
      
      if (result.success) {
        // Auto-login the parent
        auth.login(result);
        alert("🎉 Parent account created successfully! Add your children in the profile page.");
        navigate("/profile");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
      
    } catch (error) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove the child registration step - this is now handled in family setup

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Join Smart Step!</h1>
          <p className="auth-subtitle">
            {currentStep === 1 
              ? "Create your parent account" 
              : "Set up your child's profile"
            }
          </p>
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleParentSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Parent Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={parentData.email}
              onChange={handleParentChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={parentData.password}
              onChange={handleParentChange}
              className="form-input"
              placeholder="Create a password (min 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={parentData.confirmPassword}
              onChange={handleParentChange}
              className="form-input"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account & Add Family →"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="auth-link"
            >
              Sign In
            </button>
          </p>
          <button 
            onClick={() => navigate("/")}
            className="auth-back-btn"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
