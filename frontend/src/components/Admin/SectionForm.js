import React, { useState, useEffect } from 'react';

const SectionForm = ({ section, subjects, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    sectionName: '',
    orderIndex: 1
  });

  useEffect(() => {
    if (section) {
      setFormData({
        subjectId: section.subject_id || '',
        sectionName: section.section_name || '',
        orderIndex: section.order_index || 1
      });
    }
  }, [section]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subjectId || !formData.sectionName) {
      alert('Please fill in all required fields');
      return;
    }

    const sectionData = {
      subjectId: parseInt(formData.subjectId),
      sectionName: formData.sectionName,
      orderIndex: parseInt(formData.orderIndex)
    };

    onSave(sectionData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{section ? 'Edit Section' : 'Add New Section'}</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Subject *</label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.subject_id} value={subject.subject_id}>
                  {subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Section Name *</label>
            <input
              type="text"
              name="sectionName"
              value={formData.sectionName}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Level 1, Beginner"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Order Index</label>
            <input
              type="number"
              name="orderIndex"
              value={formData.orderIndex}
              onChange={handleChange}
              style={styles.input}
              min="1"
            />
            <small style={styles.hint}>Lower numbers appear first</small>
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveButton}>
              {section ? 'Update Section' : 'Create Section'}
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
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  hint: {
    fontSize: '12px',
    color: '#666'
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

export default SectionForm;
