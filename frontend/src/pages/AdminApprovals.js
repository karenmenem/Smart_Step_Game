import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminApprovals.css';

function AdminApprovals() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('teachers');
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [pendingContent, setPendingContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        
        fetchPendingTeachers();
        fetchPendingContent();
    }, [navigate]);

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
    });

    const fetchPendingTeachers = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/teachers/pending', {
                headers: getHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setPendingTeachers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching pending teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingContent = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admin/content/pending', {
                headers: getHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setPendingContent(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching pending content:', error);
        }
    };

    const handleApproveTeacher = async (teacherId) => {
        if (!window.confirm('Are you sure you want to approve this teacher?')) return;

        try {
            const response = await fetch(`http://localhost:5001/api/admin/teachers/${teacherId}/approve`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (response.ok) {
                alert('Teacher approved successfully!');
                fetchPendingTeachers();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to approve teacher');
            }
        } catch (error) {
            console.error('Error approving teacher:', error);
            alert('An error occurred');
        }
    };

    const handleRejectTeacher = (teacher) => {
        setSelectedItem({ type: 'teacher', id: teacher.id, name: teacher.name });
        setShowRejectModal(true);
    };

    const handleApproveContent = async (contentId) => {
        if (!window.confirm('Are you sure you want to approve this content?')) return;

        try {
            const response = await fetch(`http://localhost:5001/api/admin/content/${contentId}/approve`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (response.ok) {
                alert('Content approved successfully!');
                fetchPendingContent();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to approve content');
            }
        } catch (error) {
            console.error('Error approving content:', error);
            alert('An error occurred');
        }
    };

    const handleRejectContent = (content) => {
        setSelectedItem({ type: 'content', id: content.id, preview: content.content_preview });
        setShowRejectModal(true);
    };

    const submitRejection = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const endpoint = selectedItem.type === 'teacher'
                ? `http://localhost:5001/api/admin/teachers/${selectedItem.id}/reject`
                : `http://localhost:5001/api/admin/content/${selectedItem.id}/reject`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ reason: rejectReason })
            });

            if (response.ok) {
                alert(`${selectedItem.type === 'teacher' ? 'Teacher' : 'Content'} rejected successfully!`);
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedItem(null);
                
                if (selectedItem.type === 'teacher') {
                    fetchPendingTeachers();
                } else {
                    fetchPendingContent();
                }
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to reject');
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('An error occurred');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { className: 'badge-pending', text: 'Pending Review' },
            'pending_asl': { className: 'badge-asl', text: 'Needs ASL Videos' }
        };
        const badge = badges[status] || badges['pending'];
        return <span className={`status-badge ${badge.className}`}>{badge.text}</span>;
    };

    return (
        <div className="admin-approvals">
            <div className="approvals-header">
                <h1>Pending Approvals</h1>
                <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
            </div>

            <div className="tabs">
                <button 
                    className={activeTab === 'teachers' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('teachers')}
                >
                    Teachers ({pendingTeachers.length})
                </button>
                <button 
                    className={activeTab === 'content' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('content')}
                >
                    Questions & Passages ({pendingContent.length})
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'teachers' && (
                    <div className="teachers-section">
                        {loading ? (
                            <p className="loading">Loading...</p>
                        ) : pendingTeachers.length === 0 ? (
                            <p className="no-items">No pending teacher approvals</p>
                        ) : (
                            <div className="items-grid">
                                {pendingTeachers.map(teacher => (
                                    <div key={teacher.id} className="approval-card">
                                        <div className="card-header">
                                            <h3>{teacher.name}</h3>
                                            <span className="badge badge-pending">Pending</span>
                                        </div>
                                        <div className="card-body">
                                            <p><strong>Email:</strong> {teacher.email}</p>
                                            <p><strong>Registered:</strong> {new Date(teacher.created_at).toLocaleDateString()}</p>
                                            
                                            {teacher.certificate_path && (
                                                <div className="certificate-section">
                                                    <p><strong>Certificate:</strong></p>
                                                    <a 
                                                        href={`http://localhost:5001${teacher.certificate_path}`}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="view-certificate-btn"
                                                    >
                                                        📄 View Certificate
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-actions">
                                            <button 
                                                onClick={() => handleApproveTeacher(teacher.id)}
                                                className="btn-approve"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button 
                                                onClick={() => handleRejectTeacher(teacher)}
                                                className="btn-reject"
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="content-section">
                        {loading ? (
                            <p className="loading">Loading...</p>
                        ) : pendingContent.length === 0 ? (
                            <p className="no-items">No pending content approvals</p>
                        ) : (
                            <div className="items-grid">
                                {pendingContent.map(content => (
                                    <div key={content.id} className="approval-card">
                                        <div className="card-header">
                                            <span className="content-type-badge">{content.content_type}</span>
                                            {getStatusBadge(content.approval_status)}
                                        </div>
                                        <div className="card-body">
                                            <p><strong>Teacher:</strong> {content.teacher_name} ({content.teacher_email})</p>
                                            <p><strong>Submitted:</strong> {new Date(content.submitted_at).toLocaleDateString()}</p>
                                            <div className="content-preview">
                                                <strong>Preview:</strong>
                                                <p>{content.content_preview?.substring(0, 200)}...</p>
                                            </div>
                                            {content.approval_status === 'pending_asl' && (
                                                <div className="asl-warning">
                                                    ⚠️ This question needs ASL videos to be added in ASL Manager
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-actions">
                                            <button 
                                                onClick={() => handleApproveContent(content.id)}
                                                className="btn-approve"
                                                disabled={content.approval_status === 'pending_asl'}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button 
                                                onClick={() => handleRejectContent(content)}
                                                className="btn-reject"
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Reject {selectedItem?.type === 'teacher' ? 'Teacher' : 'Content'}</h2>
                        <p>Please provide a reason for rejection:</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows="4"
                        />
                        <div className="modal-actions">
                            <button onClick={submitRejection} className="btn-confirm">
                                Submit Rejection
                            </button>
                            <button onClick={() => {
                                setShowRejectModal(false);
                                setRejectReason('');
                                setSelectedItem(null);
                            }} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminApprovals;
