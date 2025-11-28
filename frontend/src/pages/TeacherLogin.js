import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/TeacherAuth.css';

function TeacherLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please enter email and password');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/teacher/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and teacher info
                localStorage.setItem('teacherToken', data.token);
                localStorage.setItem('teacherInfo', JSON.stringify(data.teacher));
                
                // Navigate to teacher dashboard
                navigate('/teacher/dashboard');
            } else {
                if (data.error === 'Account pending approval') {
                    setError('Your account is pending admin approval. Please wait for approval before logging in.');
                } else if (data.error === 'Account rejected') {
                    setError(`Your account was rejected. Reason: ${data.reason || 'No reason provided'}`);
                } else {
                    setError(data.error || 'Login failed');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="teacher-auth-container">
            <div className="teacher-auth-card">
                <div className="auth-header">
                    <h1>Teacher Login</h1>
                    <p>Access your educator dashboard</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="teacher@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/teacher/register">Register here</Link></p>
                    <p><Link to="/">Back to Home</Link></p>
                </div>
            </div>
        </div>
    );
}

export default TeacherLogin;
