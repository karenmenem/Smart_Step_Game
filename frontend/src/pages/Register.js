import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/auth";

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

  const handleParentSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (parentData.password !== parentData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    if (parentData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }
    
    // Move to next step
    setCurrentStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Validate child data
      if (!childData.name.trim()) {
        setError("Please enter your child's name!");
        return;
      }
      
      if (!childData.age || childData.age < 3 || childData.age > 18) {
        setError("Please enter a valid age (3-18)!");
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('email', parentData.email);
      formData.append('password', parentData.password);
      formData.append('childName', childData.name);
      formData.append('childAge', childData.age);
      if (childData.profilePicture) {
        formData.append('profilePicture', childData.profilePicture);
      }
      
      // Make API call to register
      const result = await api.register(formData);
      
      if (result.success) {
        alert("🎉 Account created successfully! Welcome to Smart Step!");
        navigate("/login");
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

        {currentStep === 1 ? (
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

            <button type="submit" className="auth-submit-btn">
              Next: Child Profile →
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Child's Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={childData.name}
                onChange={handleChildChange}
                className="form-input"
                placeholder="Enter your child's name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">Child's Age</label>
              <select
                id="age"
                name="age"
                value={childData.age}
                onChange={handleChildChange}
                className="form-input"
                required
              >
                <option value="">Select age</option>
                {[...Array(16)].map((_, i) => (
                  <option key={i + 3} value={i + 3}>
                    {i + 3} years old
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profilePicture" className="form-label">Profile Picture (Optional)</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleChildChange}
                  className="file-input"
                  accept="image/*"
                />
                <label htmlFor="profilePicture" className="file-input-label">
                  {childData.profilePicture ? childData.profilePicture.name : "Choose a fun profile picture! 📸"}
                </label>
              </div>
            </div>

            <div className="form-buttons">
              <button 
                type="button" 
                onClick={() => setCurrentStep(1)}
                className="auth-back-btn"
                disabled={loading}
              >
                ← Back
              </button>
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account! 🎉"}
              </button>
            </div>
          </form>
        )}

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
