import React, { useState, useEffect } from 'react';
import '../styles/ASLManager.css';

const ASLManager = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    type: 'word',
    value: '',
    aliases: '',
    video: null
  });
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/asl/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      setMessage('Failed to load ASL resources');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.value || !uploadForm.video) {
      setMessage('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('type', uploadForm.type);
    formData.append('value', uploadForm.value);
    formData.append('aliases', uploadForm.aliases);
    formData.append('video', uploadForm.video);

    try {
      const response = await fetch('http://localhost:5001/api/asl/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setMessage('✅ Video uploaded successfully!');
        setUploadForm({ type: 'word', value: '', aliases: '', video: null });
        document.getElementById('video-upload').value = '';
        loadResources();
      } else {
        const error = await response.json();
        setMessage(`❌ Upload failed: ${error.error}`);
      }
    } catch (error) {
      setMessage('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ASL video?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/asl/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('✅ Video deleted successfully!');
        loadResources();
      } else {
        setMessage('❌ Failed to delete video');
      }
    } catch (error) {
      setMessage('❌ Delete failed: ' + error.message);
    }
  };

  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(r => r.type === filter);

  // Helper to get video file URL
  const getVideoUrl = (resource) => {
    // Videos are stored in public/asl/{type}s/{filename}
    return `/asl/${resource.type}s/${resource.filename}`;
  };

  return (
    <div className="asl-manager">
      <div className="asl-header">
        <h1>🤟 ASL Video Manager</h1>
        <p>Upload and manage ASL sign language videos</p>
      </div>

      {message && (
        <div className={`asl-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Upload Form */}
      <div className="asl-upload-section">
        <h2>Upload New ASL Video</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-row">
            <div className="form-group">
              <label>Type:</label>
              <select 
                value={uploadForm.type}
                onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
              >
                <option value="word">Word</option>
                <option value="number">Number</option>
                <option value="operation">Operation</option>
              </select>
            </div>

            <div className="form-group">
              <label>Value: *</label>
              <input
                type="text"
                placeholder="e.g., hello, 5, plus"
                value={uploadForm.value}
                onChange={(e) => setUploadForm({ ...uploadForm, value: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Aliases (comma separated):</label>
              <input
                type="text"
                placeholder="e.g., +, add (for plus)"
                value={uploadForm.aliases}
                onChange={(e) => setUploadForm({ ...uploadForm, aliases: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Video File: *</label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={(e) => setUploadForm({ ...uploadForm, video: e.target.files[0] })}
              required
            />
          </div>

          <button type="submit" disabled={uploading} className="upload-btn">
            {uploading ? '⏳ Uploading...' : '⬆️ Upload Video'}
          </button>
        </form>
      </div>

      {/* Resources Table */}
      <div className="asl-resources-section">
        <div className="resources-header">
          <h2>ASL Resources ({filteredResources.length})</h2>
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'word' ? 'active' : ''}
              onClick={() => setFilter('word')}
            >
              Words
            </button>
            <button 
              className={filter === 'number' ? 'active' : ''}
              onClick={() => setFilter('number')}
            >
              Numbers
            </button>
            <button 
              className={filter === 'operation' ? 'active' : ''}
              onClick={() => setFilter('operation')}
            >
              Operations
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table className="resources-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Value</th>
                <th>Filename</th>
                <th>Aliases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <span className={`type-badge ${resource.type}`}>
                      {resource.type}
                    </span>
                  </td>
                  <td>{resource.value}</td>
                  <td>
                    {resource.filename ? (
                      <a href={getVideoUrl(resource)} target="_blank" rel="noopener noreferrer">
                        {resource.filename}
                      </a>
                    ) : '-'}
                  </td>
                  <td>
                    {resource.aliases ? JSON.parse(resource.aliases).join(', ') : '-'}
                  </td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(resource.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ASLManager;
