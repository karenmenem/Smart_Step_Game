import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomepageCustomizer.css';

function HomepageCustomizer() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState([]);
  const [groupedSettings, setGroupedSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('header');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('📌 Homepage Customizer - Token exists:', !!token);
      
      if (!token) {
        showMessage('error', 'Please login to admin panel first');
        navigate('/admin/login');
        return;
      }
      
      console.log('📌 Fetching homepage settings from API...');
      const response = await fetch('http://localhost:5001/api/admin/homepage-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📌 Response status:', response.status);
      const data = await response.json();
      console.log('📌 Response data:', data);
      
      if (response.status === 401) {
        showMessage('error', 'Session expired. Please login again');
        navigate('/admin/login');
        return;
      }
      
      if (data.success) {
        console.log('📌 Settings loaded successfully. Count:', data.data.settings?.length);
        setSettings(data.data.settings);
        setGroupedSettings(data.data.grouped);
      } else {
        console.error('📌 Failed to load settings:', data.message);
        showMessage('error', data.message || 'Failed to load settings');
      }
    } catch (error) {
      console.error('📌 Error fetching settings:', error);
      showMessage('error', 'Error loading settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (id, value) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, setting_value: value } : setting
      )
    );
    
    // Also update grouped settings to reflect changes immediately
    setGroupedSettings(prevGrouped => {
      const newGrouped = { ...prevGrouped };
      Object.keys(newGrouped).forEach(category => {
        newGrouped[category] = newGrouped[category].map(setting =>
          setting.id === id ? { ...setting, setting_value: value } : setting
        );
      });
      return newGrouped;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/admin/homepage-settings/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: settings.map(s => ({ id: s.id, setting_value: s.setting_value }))
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', '✅ Settings saved! Refresh the homepage (F5) to see changes.');
        fetchSettings();
      } else {
        showMessage('error', 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5001/api/admin/homepage-settings/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Settings reset to defaults!');
        fetchSettings();
      } else {
        showMessage('error', 'Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      showMessage('error', 'Error resetting settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const renderSettingInput = (setting) => {
    const { id, setting_key, setting_value, setting_type, description } = setting;

    switch (setting_type) {
      case 'color':
        return (
          <div className="hc-setting-item">
            <label className="hc-setting-label">
              {description}
              <span className="hc-setting-key">{setting_key}</span>
            </label>
            <div className="hc-color-input-wrapper">
              <input
                type="color"
                value={setting_value || '#000000'}
                onChange={(e) => handleSettingChange(id, e.target.value)}
                className="hc-color-input"
              />
              <input
                type="text"
                value={setting_value || ''}
                onChange={(e) => handleSettingChange(id, e.target.value)}
                className="hc-text-input hc-color-text"
                placeholder="#000000"
              />
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div className="hc-setting-item">
            <label className="hc-setting-label">
              {description}
              <span className="hc-setting-key">{setting_key}</span>
            </label>
            <label className="hc-toggle">
              <input
                type="checkbox"
                checked={setting_value === 'true'}
                onChange={(e) => handleSettingChange(id, e.target.checked ? 'true' : 'false')}
              />
              <span className="hc-toggle-slider"></span>
            </label>
          </div>
        );

      case 'number':
        return (
          <div className="hc-setting-item">
            <label className="hc-setting-label">
              {description}
              <span className="hc-setting-key">{setting_key}</span>
            </label>
            <input
              type="number"
              value={setting_value || ''}
              onChange={(e) => handleSettingChange(id, e.target.value)}
              className="hc-text-input"
            />
          </div>
        );

      case 'css':
        return (
          <div className="hc-setting-item hc-full-width">
            <label className="hc-setting-label">
              {description}
              <span className="hc-setting-key">{setting_key}</span>
            </label>
            <textarea
              value={setting_value || ''}
              onChange={(e) => handleSettingChange(id, e.target.value)}
              className="hc-textarea"
              rows="10"
              placeholder="/* Add custom CSS here */"
            />
          </div>
        );

      case 'json':
        return (
          <div className="hc-setting-item hc-full-width">
            <label className="hc-setting-label">
              {description}
              <span className="hc-setting-key">{setting_key}</span>
            </label>
            <textarea
              value={setting_value || ''}
              onChange={(e) => handleSettingChange(id, e.target.value)}
              className="hc-textarea hc-json-input"
              rows="6"
              placeholder='[{"key": "value"}]'
            />
            <small className="hc-hint">JSON format - be careful with syntax</small>
          </div>
        );

      default: // text
        return (
          <div className="hc-setting-item">
            <label className="hc-setting-label">
              {description}
              <span className="hc-setting-key">{setting_key}</span>
            </label>
            <input
              type="text"
              value={setting_value || ''}
              onChange={(e) => handleSettingChange(id, e.target.value)}
              className="hc-text-input"
              placeholder={description}
            />
          </div>
        );
    }
  };

  const categories = [
    { key: 'general', label: 'General', icon: '⚙️' },
    { key: 'header', label: 'Header', icon: '📋' },
    { key: 'navigation', label: 'Navigation', icon: '🧭' },
    { key: 'main', label: 'Main Content', icon: '📄' },
    { key: 'buttons', label: 'Buttons', icon: '🔘' },
    { key: 'animations', label: 'Animations', icon: '✨' },
    { key: 'features', label: 'Features', icon: '🌟' },
    { key: 'advanced', label: 'Advanced', icon: '🔧' }
  ];

  if (loading) {
    return (
      <div className="hc-container">
        <div className="hc-loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="hc-container">
      <div className="hc-header">
        <div className="hc-header-left">
          <button className="hc-back-btn" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className="hc-title">🎨 Homepage Customizer</h1>
        </div>
        <div className="hc-header-actions">
          <button className="hc-btn hc-btn-preview" onClick={() => window.open('/', '_blank')}>
            👁️ Preview Homepage
          </button>
          <button className="hc-btn hc-btn-reset" onClick={handleReset} disabled={saving}>
            🔄 Reset to Defaults
          </button>
          <button className="hc-btn hc-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`hc-message hc-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="hc-content">
        <div className="hc-sidebar">
          <h3 className="hc-sidebar-title">Categories</h3>
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`hc-category-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className="hc-category-icon">{cat.icon}</span>
              <span className="hc-category-label">{cat.label}</span>
              <span className="hc-category-count">
                {groupedSettings[cat.key]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="hc-main">
          <div className="hc-category-header">
            <h2>{categories.find(c => c.key === activeCategory)?.label || 'Settings'}</h2>
            <p className="hc-category-description">
              Customize the {activeCategory} section of your homepage
            </p>
          </div>

          <div className="hc-settings-grid">
            {groupedSettings[activeCategory]?.map(setting => (
              <div key={setting.id}>
                {renderSettingInput(setting)}
              </div>
            ))}
            {(!groupedSettings[activeCategory] || groupedSettings[activeCategory].length === 0) && (
              <div className="hc-no-settings">
                No settings available in this category
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomepageCustomizer;
