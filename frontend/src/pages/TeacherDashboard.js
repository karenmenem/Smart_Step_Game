import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminQuestionForm from './AdminQuestionForm';
import '../styles/TeacherDashboard.css';

function TeacherDashboard() {
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');
    const [myContent, setMyContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Check if teacher is logged in
        const teacherInfo = localStorage.getItem('teacherInfo');
        const token = localStorage.getItem('teacherToken');

        if (!teacherInfo || !token) {
            navigate('/teacher/login');
            return;
        }

        setTeacher(JSON.parse(teacherInfo));
        fetchMyContent();
        fetchNotifications();
    }, [navigate]);

    const fetchMyContent = async () => {
        try {
            const token = localStorage.getItem('teacherToken');
            const response = await fetch('http://localhost:5001/api/teacher/content', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMyContent(data);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('teacherToken');
            const response = await fetch('http://localhost:5001/api/messages/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.data || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('teacherToken');
        localStorage.removeItem('teacherInfo');
        navigate('/teacher/login');
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { className: 'status-pending', text: 'Pending Review' },
            'pending_asl': { className: 'status-pending-asl', text: 'Needs ASL Videos' },
            'approved': { className: 'status-approved', text: 'Approved' },
            'rejected': { className: 'status-rejected', text: 'Rejected' }
        };
        const badge = badges[status] || badges['pending'];
        return <span className={`status-badge ${badge.className}`}>{badge.text}</span>;
    };

    if (!teacher) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="teacher-dashboard">
            <div className="teacher-navbar">
                <div className="navbar-left">
                    <h1>SmartStep Teacher Portal</h1>
                </div>
                <div className="navbar-right">
                    <div className="notification-icon">
                        🔔
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </div>
                    <div className="teacher-info">
                        <span>Welcome, {teacher.name}</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="tabs">
                    <button 
                        className={activeTab === 'questions' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('questions')}
                    >
                        Add Questions
                    </button>
                    <button 
                        className={activeTab === 'passages' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('passages')}
                    >
                        Add Passages
                    </button>
                    <button 
                        className={activeTab === 'my-content' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('my-content')}
                    >
                        My Submissions ({myContent.length})
                    </button>
                    <button 
                        className={activeTab === 'messages' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('messages')}
                    >
                        Messages {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'questions' && (
                        <div className="add-question-section">
                            <h2>Add New Question</h2>
                            <p className="info-text">
                                Your questions will be reviewed by an admin before being published.
                                If your question requires ASL videos, the admin will add them before approval.
                            </p>
                            <AdminQuestionForm 
                                isTeacher={true}
                                onSuccess={() => {
                                    fetchMyContent();
                                    setActiveTab('my-content');
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'passages' && (
                        <div className="add-passage-section">
                            <h2>Add Reading Passage</h2>
                            <p className="info-text">
                                Your passages will be reviewed by an admin before being published.
                            </p>
                            <PassageForm onSuccess={() => {
                                fetchMyContent();
                                setActiveTab('my-content');
                            }} />
                        </div>
                    )}

                    {activeTab === 'my-content' && (
                        <div className="my-content-section">
                            <h2>My Submissions</h2>
                            {loading ? (
                                <p>Loading...</p>
                            ) : myContent.length === 0 ? (
                                <p className="no-content">You haven't submitted any content yet.</p>
                            ) : (
                                <div className="content-list">
                                    {myContent.map((item) => (
                                        <div key={item.id} className="content-item">
                                            <div className="content-header">
                                                <span className="content-type">{item.content_type}</span>
                                                {getStatusBadge(item.approval_status)}
                                            </div>
                                            <div className="content-preview">
                                                {item.content_preview?.substring(0, 100)}...
                                            </div>
                                            <div className="content-footer">
                                                <span className="content-date">
                                                    Submitted: {new Date(item.submitted_at).toLocaleDateString()}
                                                </span>
                                                {item.rejection_reason && (
                                                    <div className="rejection-reason">
                                                        Reason: {item.rejection_reason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="messages-section">
                            <h2>Messages</h2>
                            <p className="coming-soon">Messaging feature - Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Simple Passage Form Component
function PassageForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        subject: 'English',
        topic: 'comprehension',
        level: 'beginner',
        sublevel: '1',
        title: '',
        author: '',
        content: '',
        difficulty: 'medium'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('teacherToken');
            const response = await fetch('http://localhost:5001/api/teacher/passages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Passage submitted successfully!');
                setFormData({
                    subject: 'English',
                    topic: 'comprehension',
                    level: 'beginner',
                    sublevel: '1',
                    title: '',
                    author: '',
                    content: '',
                    difficulty: 'medium'
                });
                if (onSuccess) onSuccess();
            } else {
                setError(data.error || 'Failed to submit passage');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while submitting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="passage-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-row">
                <div className="form-group">
                    <label>Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleChange}>
                        <option value="English">English</option>
                        <option value="Math">Math</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Topic</label>
                    <select name="topic" value={formData.topic} onChange={handleChange}>
                        <option value="comprehension">Comprehension</option>
                        <option value="vocabulary">Vocabulary</option>
                        <option value="grammar">Grammar</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Level</label>
                    <select name="level" value={formData.level} onChange={handleChange}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Sublevel</label>
                    <select name="sublevel" value={formData.sublevel} onChange={handleChange}>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Title *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Author</label>
                <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Passage Content *</label>
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="10"
                    required
                />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Passage for Review'}
            </button>
        </form>
    );
}

export default TeacherDashboard;
