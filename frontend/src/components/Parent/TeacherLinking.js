import { useState, useEffect } from 'react';
import { api } from '../../api/auth';
import './TeacherLinking.css';

function TeacherLinking({ child }) {
  const [classCode, setClassCode] = useState('');
  const [teacherLinks, setTeacherLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('TeacherLinking - child prop:', child);
    if (child?.child_id || child?.id) {
      loadTeacherLinks();
    }
  }, [child]);

  const loadTeacherLinks = async () => {
    const childId = child?.child_id || child?.id;
    console.log('Loading teacher links for child ID:', childId);
    const result = await api.getChildTeacherLinks(childId);
    console.log('Teacher links result:', result);
    if (result.success) {
      setTeacherLinks(result.links || []);
    }
  };

  const handleLinkToTeacher = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setMessage('Please enter a class code');
      return;
    }

    setLoading(true);
    setMessage('');

    const childId = child?.child_id || child?.id;
    const result = await api.linkChildToTeacher(childId, classCode.trim().toUpperCase());
    
    if (result.success) {
      setMessage(`✅ Successfully linked to ${result.teacher.name}'s class!`);
      setClassCode('');
      loadTeacherLinks();
    } else {
      setMessage(`❌ ${result.message}`);
    }
    
    setLoading(false);
  };

  const handlePermissionChange = async (linkId, permission, value) => {
    const result = await api.updateTeacherPermissions(linkId, { [permission]: value });
    if (result.success) {
      loadTeacherLinks();
    }
  };

  const handleRemoveLink = async (linkId) => {
    if (!window.confirm('Are you sure you want to remove this teacher connection?')) {
      return;
    }

    const result = await api.removeTeacherLink(linkId);
    if (result.success) {
      setMessage('✅ Teacher link removed');
      loadTeacherLinks();
    }
  };

  return (
    <div className="teacher-linking-container">
      <div className="teacher-linking-header">
        <h2>👨‍🏫 Connect with Teachers</h2>
        <p>Let teachers track {child?.name}'s progress</p>
      </div>

      {/* Link New Teacher */}
      <div className="link-teacher-section">
        <h3>🔗 Add Teacher</h3>
        <form onSubmit={handleLinkToTeacher}>
          <div className="input-group">
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit class code"
              maxLength={6}
              className="class-code-input"
              disabled={loading}
            />
            <button type="submit" className="link-btn" disabled={loading}>
              {loading ? '⏳' : '➕'} Link
            </button>
          </div>
          {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
        </form>
      </div>

      {/* Connected Teachers */}
      <div className="connected-teachers-section">
        <h3>📚 Connected Teachers ({teacherLinks.length})</h3>
        
        {teacherLinks.length === 0 ? (
          <div className="no-teachers">
            <p>👋 No teachers connected yet</p>
            <p className="hint">Ask your child's teacher for their class code to get started!</p>
          </div>
        ) : (
          <div className="teachers-list">
            {teacherLinks.map((link) => (
              <div key={link.id} className={`teacher-card ${!link.parent_approved ? 'pending' : ''}`}>
                <div className="teacher-info">
                  <div className="teacher-icon">👨‍🏫</div>
                  <div className="teacher-details">
                    <h4>{link.teacher_name}</h4>
                    <p className="teacher-email">{link.teacher_email}</p>
                    <p className="class-info">Class: {link.class_name} ({link.class_code})</p>
                    <p className="linked-date">
                      Linked: {new Date(link.linked_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {!link.parent_approved && (
                  <div className="approval-section">
                    <div className="approval-notice">
                      ⚠️ Pending your approval
                    </div>
                    <button
                      className="approve-btn"
                      onClick={() => handlePermissionChange(link.id, 'parentApproved', true)}
                    >
                      ✅ Approve Access
                    </button>
                  </div>
                )}

                {link.parent_approved && (
                  <div className="permissions-section">
                    <h5>🔒 Privacy Settings</h5>
                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={link.share_progress}
                          onChange={(e) => handlePermissionChange(link.id, 'shareProgress', e.target.checked)}
                        />
                        <span>Share completed activities</span>
                      </label>
                    </div>
                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={link.share_scores}
                          onChange={(e) => handlePermissionChange(link.id, 'shareScores', e.target.checked)}
                        />
                        <span>Share scores and statistics</span>
                      </label>
                    </div>
                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={link.share_time_spent}
                          onChange={(e) => handlePermissionChange(link.id, 'shareTimeSpent', e.target.checked)}
                        />
                        <span>Share time spent learning</span>
                      </label>
                    </div>
                  </div>
                )}

                <button
                  className="remove-btn"
                  onClick={() => handleRemoveLink(link.id)}
                >
                  🗑️ Remove Teacher
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherLinking;
