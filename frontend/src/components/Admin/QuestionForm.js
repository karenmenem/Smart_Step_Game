import React, { useState, useEffect } from 'react';

const QuestionForm = ({ question, onSave, onCancel, activities }) => {
  const [formData, setFormData] = useState({
    activityId: '',
    questionText: '',
    questionType: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 10,
    aslSigns: [],
    aslVideoUrl: '',
    aslType: 'numbers'
  });

  useEffect(() => {
    if (question) {
      // Editing existing question
      setFormData({
        activityId: question.activity_id || '',
        questionText: question.question_text || '',
        questionType: question.question_type || 'multiple-choice',
        options: question.options ? JSON.parse(question.options) : ['', '', '', ''],
        correctAnswer: question.correct_answer || '',
        points: question.points || 10,
        aslSigns: question.asl_signs ? JSON.parse(question.asl_signs) : [],
        aslVideoUrl: question.asl_video_url || '',
        aslType: question.asl_type || 'numbers'
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAslSignsChange = (e) => {
    const value = e.target.value;
    // Parse comma-separated numbers into array
    const signs = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setFormData(prev => ({
      ...prev,
      aslSigns: signs
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.activityId || !formData.questionText || !formData.correctAnswer) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.questionType === 'multiple-choice' && formData.options.some(opt => !opt)) {
      alert('Please fill in all options');
      return;
    }

    // Prepare data for API
    const questionData = {
      activityId: parseInt(formData.activityId),
      questionText: formData.questionText,
      questionType: formData.questionType,
      options: JSON.stringify(formData.options),
      correctAnswer: formData.correctAnswer,
      points: parseInt(formData.points),
      aslSigns: formData.aslSigns.length > 0 ? JSON.stringify(formData.aslSigns) : null,
      aslVideoUrl: formData.aslVideoUrl || null,
      aslType: formData.aslType
    };

    onSave(questionData);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{question ? 'Edit Question' : 'Add New Question'}</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Activity *</label>
            <select
              name="activityId"
              value={formData.activityId}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Activity</option>
              {activities.map(activity => (
                <option key={activity.activity_id} value={activity.activity_id}>
                  {activity.activity_name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Question Text *</label>
            <textarea
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
              style={styles.textarea}
              rows="3"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Question Type</label>
            <select
              name="questionType"
              value={formData.questionType}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="fill-blank">Fill in the Blank</option>
            </select>
          </div>

          {formData.questionType === 'multiple-choice' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Options *</label>
              {formData.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  style={styles.input}
                  placeholder={`Option ${index + 1}`}
                  required
                />
              ))}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Correct Answer *</label>
            <input
              type="text"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Points</label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleChange}
              style={styles.input}
              min="1"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>ASL Type</label>
            <select
              name="aslType"
              value={formData.aslType}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="numbers">Numbers Only</option>
              <option value="video">Video Only</option>
              <option value="both">Both (Numbers + Video)</option>
            </select>
          </div>

          {(formData.aslType === 'numbers' || formData.aslType === 'both') && (
            <div style={styles.formGroup}>
              <label style={styles.label}>ASL Signs (comma-separated numbers)</label>
              <input
                type="text"
                value={formData.aslSigns.join(', ')}
                onChange={handleAslSignsChange}
                style={styles.input}
                placeholder="e.g., 5, 3, 8 for 5+3=8"
              />
              <small style={styles.hint}>Enter the numbers that need ASL hand signs</small>
            </div>
          )}

          {(formData.aslType === 'video' || formData.aslType === 'both') && (
            <div style={styles.formGroup}>
              <label style={styles.label}>ASL Video URL</label>
              <input
                type="url"
                name="aslVideoUrl"
                value={formData.aslVideoUrl}
                onChange={handleChange}
                style={styles.input}
                placeholder="https://www.youtube.com/embed/..."
              />
              <small style={styles.hint}>Use YouTube embed URL or other video platform</small>
              {formData.aslVideoUrl && (
                <div style={styles.videoPreview}>
                  <iframe
                    src={formData.aslVideoUrl}
                    title="ASL Video Preview"
                    style={styles.iframe}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveButton}>
              {question ? 'Update Question' : 'Create Question'}
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
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
    fontSize: '14px',
    marginBottom: '5px'
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical'
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
    color: '#666',
    marginTop: '-3px'
  },
  videoPreview: {
    marginTop: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  iframe: {
    width: '100%',
    height: '250px',
    border: 'none'
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

export default QuestionForm;
