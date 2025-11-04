import React, { useState, useEffect } from 'react';

const ActivityForm = ({ activity, sections, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sectionId: '',
    activityName: '',
    activityType: 'quiz',
    orderIndex: 1
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        sectionId: activity.section_id || '',
        activityName: activity.activity_name || '',
        activityType: activity.activity_type || 'quiz',
        orderIndex: activity.order_index || 1
      });
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.sectionId || !formData.activityName) {
      alert('Please fill in all required fields');
      return;
    }

    const activityData = {
      sectionId: parseInt(formData.sectionId),
      activityName: formData.activityName,
      activityType: formData.activityType,
      orderIndex: parseInt(formData.orderIndex)
    };

    onSave(activityData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{activity ? 'Edit Activity' : 'Add New Activity'}</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Section *</label>
            <select
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section.section_id} value={section.section_id}>
                  {section.section_name} ({section.subject_name})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Activity Name *</label>
            <input
              type="text"
              name="activityName"
              value={formData.activityName}
              onChange={handleChange}
              style={styles.input}
              placeholder="e.g., Addition Quiz, Subtraction Practice"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Activity Type</label>
            <select
              name="activityType"
              value={formData.activityType}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="quiz">Quiz</option>
              <option value="practice">Practice</option>
              <option value="lesson">Lesson</option>
              <option value="game">Game</option>
            </select>
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
              {activity ? 'Update Activity' : 'Create Activity'}
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

export default ActivityForm;
