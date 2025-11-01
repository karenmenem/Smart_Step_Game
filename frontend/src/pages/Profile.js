import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, api } from "../api/auth";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newChild, setNewChild] = useState({
    name: "",
    age: "",
    profilePicture: null
  });

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const userData = auth.getCurrentUser();
      setUser(userData);
      setChildren(userData.children || []);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('parentId', user.parent.id);
      formData.append('childName', newChild.name);
      formData.append('childAge', newChild.age);
      if (newChild.profilePicture) {
        formData.append('profilePicture', newChild.profilePicture);
      }

      const response = await api.addChild(formData);

      if (response.success) {
        // Add new child to the list
        const newChildren = [...children, response.data];
        setChildren(newChildren);
        
        // Reset form
        setNewChild({ name: "", age: "", profilePicture: null });
        setShowAddChild(false);
        
        // Update user data with new children list
        const updatedUserData = {
          ...user,
          children: newChildren
        };
        setUser(updatedUserData);
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        console.log('Child added successfully:', response.data);
      } else {
        setError(response.message || "Failed to add child");
      }
    } catch (error) {
      console.error('Add child error:', error);
      setError("Failed to add child. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectChild = (child) => {
    console.log('Switching to child:', child);
    
    // Update current child in auth system
    auth.setCurrentChild(child);
    
    // Update user data with the new active child
    const updatedUserData = {
      ...user,
      child: child,
      currentChild: child
    };
    setUser(updatedUserData);
    
    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'currentChild',
      newValue: JSON.stringify(child)
    }));
    
    // Navigate back to home
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-layout">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <div className="profile-logo">
            <h1>Smart<span className="logo-accent">Step</span> - Family Profile</h1>
          </div>
          
          <nav className="profile-nav">
            <button className="profile-nav-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
            <button className="profile-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="profile-content">
          <div className="parent-info">
            <h2>Parent Account</h2>
            <p><strong>Email:</strong> {user.parent.email}</p>
            <p><strong>Children:</strong> {children.length}</p>
          </div>

          <div className="children-section">
            <div className="children-header">
              <h3>Your Children ({children.length})</h3>
              <button 
                className="add-child-btn"
                onClick={() => setShowAddChild(true)}
              >
                + Add Child
              </button>
            </div>

            <div className="children-grid">
              {children.map((child) => {
                const currentChild = auth.getCurrentChild();
                const isActive = currentChild && currentChild.id === child.id;
                
                return (
                  <div 
                    key={child.id} 
                    className={`child-card ${isActive ? 'active-child' : ''}`} 
                    onClick={() => selectChild(child)}
                  >
                    {isActive && (
                      <div className="active-badge">
                        ✅ Currently Playing
                      </div>
                    )}
                    <div className="child-avatar">
                      {child.profile_picture ? (
                        <img 
                          src={`http://localhost:5000/${child.profile_picture}`} 
                          alt={child.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="child-avatar-placeholder" style={{display: child.profile_picture ? 'none' : 'flex'}}>
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="child-info">
                      <h4>{child.name}</h4>
                      <p>Age: {child.age}</p>
                      <div className="child-progress">
                        <span>Math Level: {child.mathLevel}</span>
                        <span>English Level: {child.englishLevel}</span>
                        <span>Points: {child.totalPoints || 0}</span>
                      </div>
                    </div>
                    <div className="select-child-btn">
                      {isActive ? 'Currently Active' : `Click to Play as ${child.name}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {children.length === 0 && (
              <div className="no-children">
                <p>No children added yet.</p>
                <button 
                  className="add-first-child-btn"
                  onClick={() => setShowAddChild(true)}
                >
                  Add Your First Child
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="modal-overlay" onClick={() => setShowAddChild(false)}>
          <div className="add-child-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Child</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowAddChild(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddChild} className="add-child-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="childName">Child's Name</label>
                <input
                  type="text"
                  id="childName"
                  value={newChild.name}
                  onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                  required
                  placeholder="Enter child's name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="childAge">Child's Age</label>
                <select
                  id="childAge"
                  value={newChild.age}
                  onChange={(e) => setNewChild({...newChild, age: e.target.value})}
                  required
                >
                  <option value="">Select age</option>
                  {[...Array(16)].map((_, i) => (
                    <option key={i + 3} value={i + 3}>{i + 3} years old</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture (Optional)</label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={(e) => setNewChild({...newChild, profilePicture: e.target.files[0]})}
                />
              </div>

              <div className="form-buttons">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddChild(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Child"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
