import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import '../styles/AdminStyles.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function AdminQuestionForm({ isTeacher = false, onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = !!id;
  
  // Get activity_id from URL query params
  const queryParams = new URLSearchParams(location.search);
  const returnActivityId = queryParams.get('activity_id');

  const [formData, setFormData] = useState({
    activity_id: '',
    passage_id: '',
    question_text: '',
    question_type: 'multiple_choice',
    correct_answer: '',
    options: '',
    asl_signs: '',
    asl_video_url: '',
    asl_image_url: '',
    asl_type: 'none',
    explanation: '',
    difficulty_level: 1,
    points_value: 10,
    order_index: 1,
    is_active: !isTeacher  // Teachers can't set active, defaults to false for them
  });

  // Separate state for MCQ options for easier input
  const [mcqOptions, setMcqOptions] = useState({
    option1: '',
    option2: '',
    option3: '',
    option4: ''
  });

  const [activities, setActivities] = useState([]);
  const [passages, setPassages] = useState([]);
  const [filteredPassages, setFilteredPassages] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState({ num1: null, num2: null });

  useEffect(() => {
    const token = isTeacher ? localStorage.getItem('teacherToken') : localStorage.getItem('adminToken');
    if (!token) {
      navigate(isTeacher ? '/teacher/login' : '/admin/login');
      return;
    }
    
    loadActivities();
    loadPassages();
    
    if (isEditMode) {
      loadQuestion();
    }
  }, [id, navigate, isTeacher]);

  // Auto-select passage and filter passages when activity changes
  useEffect(() => {
    if (formData.activity_id && selectedActivity) {
      // Check if it's a comprehension activity
      const activityName = selectedActivity.name?.toLowerCase() || '';
      if (activityName.includes('comprehension')) {
        autoSelectPassage(selectedActivity);
        filterPassagesByActivity(selectedActivity);
      }
    } else {
      setFilteredPassages([]);
    }
  }, [formData.activity_id, selectedActivity, passages]);

  const getHeaders = () => {
    const token = isTeacher ? localStorage.getItem('teacherToken') : localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadActivities = async () => {
    try {
      const endpoint = isTeacher ? '/teacher/activities' : '/admin/activities';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders()
      });
      const data = await response.json();
      // Handle both response formats
      if (data.success) {
        setActivities(data.data);
      } else if (data.activities) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadPassages = async () => {
    try {
      const endpoint = isTeacher ? '/teacher/reading-passages' : '/admin/reading-passages';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders()
      });
      const data = await response.json();
      // Handle both response formats
      if (data.success) {
        setPassages(data.data);
      } else if (data.passages) {
        setPassages(data.passages);
      }
    } catch (error) {
      console.error('Error loading passages:', error);
    }
  };

  const autoSelectPassage = (activity) => {
    // Extract level and sublevel from activity name
    // Example: "Comprehension Beginner - Level 1"
    const activityName = activity.name || '';
    const sectionName = activity.section_name || '';
    
    // Determine level (1=Beginner, 2=Intermediate, 3=Advanced)
    let level = 1;
    if (sectionName.includes('Intermediate')) level = 2;
    else if (sectionName.includes('Advanced')) level = 3;
    
    // Extract sublevel from activity name (Level 1, Level 2)
    const sublevelMatch = activityName.match(/Level (\d+)/i);
    const sublevel = sublevelMatch ? parseInt(sublevelMatch[1]) : 1;
    
    // Find matching passage
    const matchingPassage = passages.find(p => 
      p.level === level && p.sublevel === sublevel && p.topic?.toLowerCase() === 'comprehension'
    );
    
    if (matchingPassage) {
      setFormData(prev => ({
        ...prev,
        passage_id: matchingPassage.id
      }));
      console.log('Auto-selected passage:', matchingPassage.title, `(Level ${level}, Sublevel ${sublevel})`);
    } else {
      console.log(`No matching passage found for Level ${level}, Sublevel ${sublevel}`);
    }
  };

  const filterPassagesByActivity = (activity) => {
    // Extract level and sublevel from activity
    const activityName = activity.name || '';
    const sectionName = activity.section_name || '';
    
    // Determine level (1=Beginner, 2=Intermediate, 3=Advanced)
    let level = 1;
    if (sectionName.includes('Intermediate')) level = 2;
    else if (sectionName.includes('Advanced')) level = 3;
    
    // Extract sublevel from activity name (Level 1, Level 2)
    const sublevelMatch = activityName.match(/Level (\d+)/i);
    const sublevel = sublevelMatch ? parseInt(sublevelMatch[1]) : 1;
    
    // Filter passages to only show matching level and sublevel
    const filtered = passages.filter(p => 
      p.level === level && p.sublevel === sublevel && p.topic?.toLowerCase() === 'comprehension'
    );
    
    setFilteredPassages(filtered);
    console.log(`Filtered passages: ${filtered.length} for Level ${level}, Sublevel ${sublevel}`);
  };

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/questions/${id}`, {
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        const q = data.data;
        setFormData({
          activity_id: q.activity_id || '',
          passage_id: q.passage_id || '',
          question_text: q.question_text || '',
          question_type: q.question_type || 'multiple_choice',
          correct_answer: q.correct_answer || '',
          options: q.options || '',
          asl_signs: q.asl_signs || '',
          asl_video_url: q.asl_video_url || '',
          asl_image_url: q.asl_image_url || '',
          asl_type: q.asl_type || 'none',
          explanation: q.explanation || '',
          difficulty_level: q.difficulty_level || 1,
          points_value: q.points_value || 10,
          order_index: q.order_index || 1,
          is_active: q.is_active !== 0  // Convert to boolean
        });
        
        // Parse existing options into separate fields
        if (q.options) {
          try {
            const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            if (Array.isArray(parsedOptions)) {
              setMcqOptions({
                option1: parsedOptions[0] || '',
                option2: parsedOptions[1] || '',
                option3: parsedOptions[2] || '',
                option4: parsedOptions[3] || ''
              });
            }
          } catch (e) {
            console.error('Error parsing options:', e);
          }
        }
        
        // Set selected activity for edit mode
        const activity = activities.find(a => a.activity_id === q.activity_id);
        if (activity) {
          setSelectedActivity(activity);
        }
      }
    } catch (error) {
      console.error('Error loading question:', error);
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If activity changes, find and set the selected activity
    if (name === 'activity_id') {
      const activity = activities.find(a => a.activity_id === parseInt(value));
      setSelectedActivity(activity);
    }
  };

  const handleMcqOptionChange = (e) => {
    const { name, value } = e.target;
    setMcqOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Build options array from separate inputs
    const optionsArray = [
      mcqOptions.option1.trim(),
      mcqOptions.option2.trim(),
      mcqOptions.option3.trim(),
      mcqOptions.option4.trim()
    ].filter(opt => opt !== ''); // Remove empty options
    
    // Validate required fields
    if (!formData.activity_id) {
      setError('Please select an activity');
      return;
    }
    if (!formData.question_text || formData.question_text.trim() === '') {
      setError('Please enter question text');
      return;
    }
    if (!formData.correct_answer || formData.correct_answer.trim() === '') {
      setError('Please enter the correct answer');
      return;
    }
    if (optionsArray.length < 2) {
      setError('Please enter at least 2 options');
      return;
    }
    
    setLoading(true);

    try {
      const baseUrl = isTeacher ? `${API_BASE_URL}/teacher` : `${API_BASE_URL}/admin`;
      const url = isEditMode 
        ? `${baseUrl}/questions/${id}`
        : `${baseUrl}/questions`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      // Prepare submission data with options as JSON string
      const submissionData = {
        ...formData,
        options: JSON.stringify(optionsArray)
      };

      console.log('Submitting form data:', submissionData);

      const response = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(submissionData)
      });

      const data = await response.json();
      console.log('Server response:', data);
      console.log('Full server response as string:', JSON.stringify(data, null, 2));
      
      if (data.debug) {
        console.log('Server debug info:', data.debug);
        alert('DEBUG INFO:\n' + JSON.stringify(data.debug, null, 2));
      }

      if (data.success) {
        alert(isEditMode ? 'Question updated successfully!' : (data.message || 'Question added successfully!'));
        
        // For teachers, call onSuccess callback if provided
        if (isTeacher && onSuccess) {
          onSuccess();
          return;
        }
        
        // When adding a new question, stay on the form and reset it
        if (!isEditMode) {
          // Reset form for next question
          setFormData({
            activity_id: formData.activity_id, // Keep same activity
            passage_id: formData.passage_id,   // Keep same passage if comprehension
            question_text: '',
            question_type: 'multiple_choice',
            correct_answer: '',
            options: '',
            asl_signs: '',
            asl_video_url: '',
            asl_image_url: '',
            asl_type: 'none',
            explanation: '',
            difficulty_level: 1,
            points_value: 10,
            order_index: 1,
            is_active: true
          });
          
          // Reset MCQ options
          setMcqOptions({
            option1: '',
            option2: '',
            option3: '',
            option4: ''
          });
          
          // Scroll to top
          window.scrollTo(0, 0);
          
        } else {
          // When editing, navigate back to questions tab with activity filter
          if (returnActivityId) {
            navigate(`/admin/dashboard?tab=questions&activity=${returnActivityId}`);
          } else {
            navigate('/admin/dashboard');
          }
        }
      } else {
        const errorMsg = data.message || 'Failed to save question';
        const errorDetails = data.error || '';
        const debugInfo = data.debug ? JSON.stringify(data.debug, null, 2) : '';
        console.error('Error details:', errorMsg, 'Error:', errorDetails, debugInfo);
        alert('ERROR: ' + errorMsg + (errorDetails ? '\n\nDetails: ' + errorDetails : '') + (debugInfo ? '\n\nDebug:\n' + debugInfo : ''));
        setError(errorMsg + (errorDetails ? ' - ' + errorDetails : ''));
      }
    } catch (error) {
      console.error('Error saving question:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError('Failed to save question: ' + error.message);
      alert('ERROR: Failed to save question\n\n' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="admin-loading">Loading question...</div>;
  }

  return (
    <div className="admin-form-page">
      <div className="admin-form-container">
        <div className="admin-form-header">
          {!isTeacher && (
            <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
          )}
          <h1>{isEditMode ? 'Edit Question' : 'Add New Question'}</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Activity *</label>
              <select
                name="activity_id"
                value={formData.activity_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Activity</option>
                {activities.map(activity => (
                  <option key={activity.activity_id} value={activity.activity_id}>
                    {activity.name} - {activity.subject_name} (Level {activity.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Question Type *</label>
              <select
                name="question_type"
                value={formData.question_type}
                onChange={handleChange}
                required
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="fill_blank">Fill in the Blank</option>
                <option value="drag_drop">Drag & Drop</option>
              </select>
            </div>
          </div>

          {selectedActivity?.name?.toLowerCase().includes('comprehension') && (
            <div className="form-group">
              <label>Reading Passage {formData.passage_id && '✓'}</label>
              <select
                name="passage_id"
                value={formData.passage_id}
                onChange={handleChange}
              >
                <option value="">No Passage</option>
                {filteredPassages.map(passage => (
                  <option key={passage.id} value={passage.id}>
                    {passage.title} (Level {passage.level}, Sublevel {passage.sublevel})
                  </option>
                ))}
              </select>
              {formData.passage_id && (
                <small style={{ color: 'green' }}>
                  ✓ Passage auto-selected based on activity level
                </small>
              )}
              {filteredPassages.length === 0 && (
                <small style={{ color: 'red' }}>
                  ⚠️ No passages available for this activity level
                </small>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Question Text *</label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              required
              rows={3}
              placeholder="e.g., What is 15 + 12?"
            />
          </div>

          <div className="form-section">
            <h3>📝 Multiple Choice Options</h3>
            <small style={{color: '#667eea', marginBottom: '10px', display: 'block'}}>
              💡 Select the correct answer by clicking the radio button next to it
            </small>
            
            <div className="form-row">
              <div className="form-group">
                <label>Option 1 *</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correct_answer === mcqOptions.option1}
                    onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}
                    style={{width: '20px', height: '20px', margin: 0, cursor: 'pointer'}}
                  />
                  <input
                    type="text"
                    name="option1"
                    value={mcqOptions.option1}
                    onChange={handleMcqOptionChange}
                    required
                    placeholder="First option"
                    style={{flex: 1}}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Option 2 *</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correct_answer === mcqOptions.option2}
                    onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option2 })}
                    style={{width: '20px', height: '20px', margin: 0, cursor: 'pointer'}}
                  />
                  <input
                    type="text"
                    name="option2"
                    value={mcqOptions.option2}
                    onChange={handleMcqOptionChange}
                    required
                    placeholder="Second option"
                    style={{flex: 1}}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Option 3</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correct_answer === mcqOptions.option3}
                    onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option3 })}
                    style={{width: '20px', height: '20px', margin: 0, cursor: 'pointer'}}
                    disabled={!mcqOptions.option3}
                  />
                  <input
                    type="text"
                    name="option3"
                    value={mcqOptions.option3}
                    onChange={handleMcqOptionChange}
                    placeholder="Third option (optional)"
                    style={{flex: 1}}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Option 4</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correct_answer === mcqOptions.option4}
                    onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option4 })}
                    style={{width: '20px', height: '20px', margin: 0, cursor: 'pointer'}}
                    disabled={!mcqOptions.option4}
                  />
                  <input
                    type="text"
                    name="option4"
                    value={mcqOptions.option4}
                    onChange={handleMcqOptionChange}
                    placeholder="Fourth option (optional)"
                    style={{flex: 1}}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty Level</label>
              <input
                type="number"
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>

            <div className="form-group">
              <label>Points Value</label>
              <input
                type="number"
                name="points_value"
                value={formData.points_value}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Order Index</label>
              <input
                type="number"
                name="order_index"
                value={formData.order_index}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Explanation (optional)</label>
            <textarea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              rows={3}
              placeholder="Explanation shown after answering..."
            />
          </div>

          <div className="form-group">
            <label>ASL Type</label>
            <select
              name="asl_type"
              value={formData.asl_type}
              onChange={handleChange}
            >
              <option value="none">None (No ASL)</option>
              <option value="sentence">Sentence (Auto-translate question text)</option>
              <option value="words">Words (Specific word signs)</option>
              <option value="numbers">Numbers (For math questions)</option>
            </select>
            <small style={{color: '#667eea', marginTop: '5px', display: 'block'}}>
              💡 For English questions, select "Sentence". For math, select "Numbers" or "Words".
            </small>
          </div>

          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              ASL Signs
              <button 
                type="button"
                onClick={() => {
                  const questionText = formData.question_text;
                  const aslType = formData.asl_type;
                  let extracted = [];

                  if (aslType === 'numbers') {
                    // Determine operation based on selected activity
                    const activityName = selectedActivity?.name?.toLowerCase() || '';
                    let defaultOperation = null;
                    
                    if (activityName.includes('addition') || activityName.includes('add')) {
                      defaultOperation = 'plus';
                    } else if (activityName.includes('subtraction') || activityName.includes('subtract')) {
                      defaultOperation = 'minus';
                    } else if (activityName.includes('multiplication') || activityName.includes('multiply')) {
                      defaultOperation = 'multiply';
                    } else if (activityName.includes('division') || activityName.includes('divide')) {
                      defaultOperation = 'divide';
                    }
                    
                    // Extract numbers AND operation words from math questions IN ORDER
                    const lowerText = questionText.toLowerCase();
                    
                    // Map of operation symbols/words to ASL-friendly words
                    const operations = {
                      '+': 'plus',
                      'plus': 'plus',
                      'add': 'plus',
                      '-': 'minus',
                      'minus': 'minus',
                      'subtract': 'minus',
                      '×': 'multiply',
                      '*': 'multiply',
                      'multiply': 'multiply',
                      'times': 'multiply',
                      '÷': 'divide',
                      '/': 'divide',
                      'divide': 'divide',
                      '=': 'equals',
                      'equals': 'equals'
                    };
                    
                    // Common math question words
                    const mathWords = ['what', 'is', 'how', 'many', 'sum', 'difference', 'product', 'quotient'];
                    
                    // Parse question word by word in order
                    const words = questionText.split(/\s+/);
                    const structured = [];
                    let operationFound = false;
                    
                    words.forEach(word => {
                      const cleanWord = word.toLowerCase().replace(/[^\w\d+\-×÷*/=]/g, '');
                      
                      // Check if it's a number
                      if (/^\d+$/.test(cleanWord)) {
                        structured.push({type: 'number', value: cleanWord});
                      }
                      // Check if it's an operation
                      else if (operations[cleanWord]) {
                        structured.push({type: 'operation', value: operations[cleanWord]});
                        operationFound = true;
                      }
                      // Check if it's a math question word
                      else if (mathWords.includes(cleanWord)) {
                        structured.push({type: 'word', value: cleanWord});
                      }
                      // Check for operation symbols in the word (e.g., "10+1")
                      else if (cleanWord.includes('+') || cleanWord.includes('-') || cleanWord.includes('×') || cleanWord.includes('*') || cleanWord.includes('÷') || cleanWord.includes('/')) {
                        // Split by operation symbols
                        const parts = cleanWord.split(/([+\-×÷*/])/);
                        parts.forEach(part => {
                          if (part && /^\d+$/.test(part)) {
                            structured.push({type: 'number', value: part});
                          } else if (part && operations[part]) {
                            structured.push({type: 'operation', value: operations[part]});
                            operationFound = true;
                          }
                        });
                      }
                    });
                    
                    // If no operation was found in the text but we have a default operation based on activity,
                    // insert it between the first two numbers
                    if (!operationFound && defaultOperation) {
                      const numberIndices = [];
                      structured.forEach((item, index) => {
                        if (item.type === 'number') {
                          numberIndices.push(index);
                        }
                      });
                      
                      // Insert operation between first and second number
                      if (numberIndices.length >= 2) {
                        structured.splice(numberIndices[1], 0, {type: 'operation', value: defaultOperation});
                      } else if (numberIndices.length === 1) {
                        // Just add at the end if only one number
                        structured.push({type: 'operation', value: defaultOperation});
                      }
                    }
                    
                    extracted = structured;
                  } else if (aslType === 'words' || aslType === 'sentence') {
                    // Extract meaningful words (remove common stop words)
                    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'she', 'he', 'it', 'they', 'them', 'their', 'what', 'when', 'where', 'who', 'which', 'how', 'many', 'much'];
                    
                    // Remove emojis and special characters, split into words
                    const cleaned = questionText.replace(/[^\w\s]/g, '').toLowerCase();
                    const words = cleaned.split(/\s+/)
                      .filter(w => w.length > 2 && !stopWords.includes(w))
                      .slice(0, 15); // Limit to 15 words
                    
                    extracted = words;
                  }

                  if (extracted.length > 0) {
                    setFormData({...formData, asl_signs: JSON.stringify(extracted)});
                    const displayText = extracted.map(item => 
                      typeof item === 'object' ? `${item.value}(${item.type})` : item
                    ).join(', ');
                    alert(`✓ Extracted ${extracted.length} items:\n${displayText}`);
                  } else {
                    alert('⚠️ No content found to extract. Make sure question text is filled and ASL type is selected.');
                  }
                }}
                style={{
                  padding: '5px 12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                🪄 Auto-Extract
              </button>
            </label>
            <textarea
              name="asl_signs"
              value={formData.asl_signs}
              onChange={handleChange}
              rows={3}
              placeholder='Auto-extracted JSON array like ["word1","word2"] or click Auto-Extract button'
              style={{fontFamily: 'monospace', fontSize: '0.9rem'}}
            />
            <small style={{color: '#666', marginTop: '5px', display: 'block'}}>
              Click "Auto-Extract" to automatically get words/numbers from your question, or manually enter JSON array
            </small>
          </div>

          {!isTeacher && (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  ✓ Active (Show in quiz)
                </span>
              </label>
              <small style={{ color: '#666', marginLeft: '30px', display: 'block', marginTop: '5px' }}>
                Uncheck to disable this question without deleting it. Only 10 active questions will show in quiz.
              </small>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => {
                console.log('Current form data:', formData);
                console.log('Activity ID:', formData.activity_id);
                console.log('Question Text:', formData.question_text);
                console.log('Question Type:', formData.question_type);
                console.log('Correct Answer:', formData.correct_answer);
                alert('Check console for form data');
              }} 
              className="cancel-btn"
              style={{background: '#17a2b8'}}
            >
              Debug Form
            </button>
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (isEditMode ? 'Update Question' : 'Add Question')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .admin-form-page {
          min-height: 100vh;
          background: #f5f7fa;
          padding: 2rem;
        }

        .admin-form-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .admin-form-header {
          margin-bottom: 2rem;
        }

        .back-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: #5a6268;
        }

        .admin-form-header h1 {
          margin: 0;
          color: #333;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .form-section h3 {
          margin: 0 0 1rem 0;
          color: #667eea;
          font-size: 1.1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #495057;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group small {
          color: #6c757d;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #dee2e6;
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .submit-btn {
          background: #667eea;
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .admin-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
          color: #667eea;
        }
      `}</style>
    </div>
  );
}

export default AdminQuestionForm;
