import React, { useState, useEffect } from 'react';

const SubjectForm = ({ subject, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    subjectName: '',
    description: ''
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        subjectName: subject.subject_name || '',
        description: subject.description || ''
      });
    }
  }, [subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subjectName) {
      alert('Please enter a subject name');
      return;
    }

    onSave(formData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{subject ? 'Edit Subject' : 'Add New Subject'}</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Subject Name *</label>
            <input
              type="text"
              name="subjectName"
              value={formData.subjectName}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Math, English"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              rows="4"
              placeholder="Brief description of the subject"
            />
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveButton}>
              {subject ? 'Update Subject' : 'Create Subject'}
            </button>
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};

export default SubjectForm;
