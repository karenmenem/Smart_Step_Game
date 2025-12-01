import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/TeacherAuth.css';

function TeacherRegister() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        certificate: null
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [certificatePreview, setCertificatePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a valid certificate (JPEG, PNG, or PDF)');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('Certificate file must be less than 5MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                certificate: file
            }));

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setCertificatePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setCertificatePreview('pdf');
            }

            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!formData.certificate) {
            setError('Please upload your teaching certificate');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('certificate', formData.certificate);

            const response = await fetch('http://localhost:5001/api/teacher/register', {
                method: 'POST',
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Your account is pending admin approval. You will be notified once approved.');
                navigate('/teacher/login');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="teacher-auth-container">
            <div className="teacher-auth-card">
                <div className="auth-header">
                    <h1>Teacher Registration</h1>
                    <p>Join SmartStep as an educator</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Full Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
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
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="certificate">Teaching Certificate * (JPEG, PNG, or PDF - Max 5MB)</label>
                        <input
                            type="file"
                            id="certificate"
                            name="certificate"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf"
                            required
                        />
                        {certificatePreview && (
                            <div className="certificate-preview">
                                {certificatePreview === 'pdf' ? (
                                    <div className="pdf-indicator">
                                        📄 PDF Certificate Uploaded
                                    </div>
                                ) : (
                                    <img src={certificatePreview} alt="Certificate preview" />
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Register as Teacher'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/teacher/login">Login here</Link></p>
                </div>
            </div>
        </div>
    );
}

export default TeacherRegister;
