# Complete Action Flows - Every Button, Login, and Action

## 🎯 How to Use This Guide

For each action, you'll see:
1. **Component** - Which React component
2. **Function** - Which function handles it
3. **API Route** - Which endpoint it calls
4. **Backend Controller** - Which controller processes it
5. **Database Operation** - Which SQL query runs
6. **Code Snippets** - Exact code with line numbers
7. **Navigation Path** - How to find it quickly

---

## ACTION 1: USER LOGIN

### **Component:**
**File:** `frontend/src/pages/Login.js`

### **Function:**
**Line 21:** `handleSubmit`
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const response = await api.login(formData);
    
    if (response.success) {
      auth.login(response);
      navigate("/");
    } else {
      setError(response.message || "Login failed. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    setError("Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
};
```

### **API Call:**
**File:** `frontend/src/api/auth.js`  
**Line 21:** `api.login`
```javascript
login: async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  return data;
}
```

### **API Route:**
**File:** `backend/routes/auth.js`  
**Line 185:** `POST /api/auth/login`
```javascript
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Find parent by email
  const parents = await query('SELECT * FROM parent WHERE email = ?', [email]);
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, parent.password);
  
  // Generate JWT token
  const token = jwt.sign(
    { parentId: parent.parent_id, email: parent.email, childId: children[0]?.child_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({ success: true, data: { token, parent, children } });
});
```

### **Backend Controller:**
**No separate controller** - Logic is directly in the route handler

### **Database Operation:**
**Line 199:** Query parent
```sql
SELECT * FROM parent WHERE email = ?
```

**Line 221:** Query children
```sql
SELECT * FROM child WHERE parent_id = ? ORDER BY created_at ASC
```

### **Token Storage:**
**File:** `frontend/src/api/auth.js`  
**Line 345:** `auth.login`
```javascript
login: (tokenData) => {
  sessionStorage.setItem('authToken', tokenData.token);
  sessionStorage.setItem('userData', JSON.stringify(tokenData.data));
}
```

### **Navigation Path:**
1. User types email/password → `Login.js` line 65-84
2. Clicks "Sign In" → `Login.js` line 87 → `handleSubmit` line 21
3. Calls `api.login` → `auth.js` line 21
4. POST to `/api/auth/login` → `auth.js` route line 185
5. Database queries → lines 199, 221
6. Returns token → stored in sessionStorage line 346
7. Navigates to home → `Login.js` line 32

---

## ACTION 2: ADMIN LOGIN

### **Component:**
**File:** `frontend/src/pages/AdminLogin.js` (similar structure to Login.js)

### **Function:**
Similar to user login, but calls admin endpoint

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 45:** `POST /api/admin/login`
```javascript
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const admins = await query('SELECT * FROM admin WHERE username = ?', [username]);
  const admin = admins[0];
  const isValid = await bcrypt.compare(password, admin.password);
  
  // Generate token
  const token = jwt.sign(
    { adminId: admin.admin_id, username: admin.username, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  res.json({ success: true, data: { token, admin } });
});
```

### **Database Operation:**
**Line 56:**
```sql
SELECT * FROM admin WHERE username = ?
```

**Line 76:**
```sql
UPDATE admin SET last_login = CURRENT_TIMESTAMP WHERE admin_id = ?
```

---

## ACTION 3: ADD QUESTION (Admin)

### **Component:**
**File:** `frontend/src/pages/AdminQuestionForm.js`

### **Button:**
**File:** `frontend/src/pages/AdminDashboard.js`  
**Line 547:**
```javascript
<button className="admin-add-btn" onClick={() => navigate('/admin/questions/add')}>
  + Add Question
</button>
```

### **Form Submit Function:**
**File:** `frontend/src/pages/AdminQuestionForm.js`  
**Line 259:** `handleSubmit`
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  // Build options array
  const optionsArray = [
    mcqOptions.option1.trim(),
    mcqOptions.option2.trim(),
    mcqOptions.option3.trim(),
    mcqOptions.option4.trim()
  ].filter(opt => opt !== '');
  
  // Prepare submission data
  const submissionData = {
    ...formData,
    options: JSON.stringify(optionsArray)
  };
  
  // Make API call
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(submissionData)
  });
  
  const data = await response.json();
  if (data.success) {
    alert('Question added successfully!');
    // Reset form
  }
};
```

### **API Call:**
**File:** `frontend/src/pages/AdminQuestionForm.js`  
**Line 307:** Direct fetch call
```javascript
const response = await fetch(`${API_BASE_URL}/admin/questions`, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify(submissionData)
});
```

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 158:**
```javascript
router.post('/questions', adminAuth, createQuestion);
```

### **Backend Controller:**
**File:** `backend/controllers/adminController.js`  
**Line 51:** `createQuestion`
```javascript
const createQuestion = async (req, res) => {
  const {
    activity_id,
    question_text,
    correct_answer,
    options,
    asl_signs,
    // ... other fields
  } = req.body;
  
  // Validate
  if (!actId || !qText || !qType || !correctAns) {
    return res.status(400).json({
      success: false,
      message: 'Required fields missing'
    });
  }
  
  // Parse JSON strings
  let optionsData = options;
  if (typeof options === 'string') {
    optionsData = JSON.parse(options);
  }
  
  // Insert into database
  const result = await query(
    `INSERT INTO question 
    (activity_id, question_text, question_type, correct_answer, options, asl_signs, ...) 
    VALUES (?, ?, ?, ?, ?, ?, ...)`,
    [actId, qText, qType, correctAns, JSON.stringify(optionsData), ...]
  );
  
  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: { questionId: result.insertId }
  });
};
```

### **Database Operation:**
**Line 141:**
```sql
INSERT INTO question 
(activity_id, passage_id, question_text, question_type, correct_answer, options, asl_signs, 
 asl_video_url, asl_image_url, asl_type, explanation, difficulty_level, points_value, order_index) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

### **Navigation Path:**
1. Click "Add Question" → `AdminDashboard.js` line 547
2. Navigate to form → `AdminQuestionForm.js`
3. Fill form → lines 17-49 (state management)
4. Click "Add Question" button → line 841 → `handleSubmit` line 259
5. Validate → lines 272-287
6. POST to `/api/admin/questions` → line 307
7. Route → `admin.js` line 158
8. Controller → `adminController.js` line 51
9. Database INSERT → line 141
10. Success response → line 164

---

## ACTION 4: SUBMIT QUIZ (Student)

### **Component:**
**File:** `frontend/src/pages/MathQuiz.js`

### **Function:**
**Line 402:** `saveQuizResults`
```javascript
const saveQuizResults = async (finalScore, allAnswers) => {
  const maxScore = questions.length;
  
  // Save quiz attempt
  const result = await api.saveQuizAttempt({
    childId: user.child.id,
    activityId: activityId,
    score: finalScore,
    maxScore: maxScore,
    answers: allAnswers
  });
  
  // Save progress
  const progressResult = await api.saveProgress({
    childId: user.child.id,
    activityId: activityId,
    score: finalScore,
    maxScore: maxScore
  });
};
```

### **API Call:**
**File:** `frontend/src/api/auth.js`  
**Line 131:** `saveQuizAttempt`
```javascript
saveQuizAttempt: async (quizData) => {
  const response = await fetch(`${API_BASE_URL}/quiz/attempt`, {
    method: 'POST',
    headers: api.getAuthHeaders(),
    body: JSON.stringify(quizData)
  });
  return await response.json();
}
```

**Line 189:** `saveProgress`
```javascript
saveProgress: async (progressData) => {
  const response = await fetch(`${API_BASE_URL}/progress/save`, {
    method: 'POST',
    headers: api.getAuthHeaders(),
    body: JSON.stringify(progressData)
  });
  return await response.json();
}
```

### **API Route:**
**File:** `backend/routes/quiz.js`  
**Line 156:**
```javascript
router.post('/attempt', saveQuizAttempt);
```

**File:** `backend/routes/progress.js`  
**Line (check file):**
```javascript
router.post('/save', saveQuizProgress);
```

### **Backend Controller:**
**File:** `backend/controllers/quizController.js`  
**Line 90:** `saveQuizAttempt`
```javascript
const saveQuizAttempt = async (req, res) => {
  const { childId, activityId, score, maxScore, answers } = req.body;
  
  const passed = (score / maxScore) >= 0.8;
  
  // Save to child_progress
  await query(
    `INSERT INTO child_progress 
    (child_id, activity_id, score, max_score, completed, attempts, last_attempt, completed_at) 
    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?)
    ON DUPLICATE KEY UPDATE
      score = GREATEST(score, VALUES(score)),
      attempts = attempts + 1,
      completed = VALUES(completed)`,
    [childId, activityId, score, maxScore, passed, passed ? new Date() : null]
  );
  
  // Save individual answers
  if (answers && Array.isArray(answers)) {
    for (const answer of answers) {
      await query(
        `INSERT INTO attempt 
        (child_id, question_id, selected_answer, is_correct, points_earned, time_taken) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [childId, answer.questionId, answer.selectedAnswer, answer.isCorrect ? 1 : 0, 
         answer.pointsEarned || 0, answer.timeTaken || null]
      );
    }
  }
  
  // Update points
  if (passed) {
    await query(
      'UPDATE child SET total_points = total_points + ? WHERE child_id = ?',
      [activity[0].points_value, childId]
    );
  }
  
  // Check achievements
  await checkAchievements(childId);
  
  res.json({ success: true, message: 'Quiz completed successfully!' });
};
```

**File:** `backend/controllers/progressController.js`  
**Line 203:** `saveQuizProgress`
```javascript
const saveQuizProgress = async (req, res) => {
  const { childId, activityId, score, maxScore } = req.body;
  
  const percentage = (score / maxScore) * 100;
  const completed = percentage >= 80;
  
  // Update or insert progress
  await query(`
    INSERT INTO child_progress 
    (child_id, activity_id, score, max_score, completed, attempts, last_attempt, completed_at) 
    VALUES (?, ?, ?, ?, ?, 1, NOW(), ?)
    ON DUPLICATE KEY UPDATE
      score = GREATEST(score, ?),
      max_score = ?,
      completed = ?,
      attempts = attempts + 1,
      last_attempt = NOW(),
      completed_at = CASE 
        WHEN ? = 1 AND completed = 0 THEN NOW() 
        ELSE completed_at 
      END
  `, [childId, activityId, score, maxScore, completed ? 1 : 0, 
      completed ? new Date() : null, score, maxScore, completed ? 1 : 0, completed ? 1 : 0]);
  
  // Award achievements
  const newAchievements = await checkAndAwardAchievements(childId, activityId, score, maxScore);
  
  res.json({
    success: true,
    completed,
    percentage: Math.round(percentage),
    newAchievements
  });
};
```

### **Database Operations:**

**1. Save Progress (quizController.js line 103):**
```sql
INSERT INTO child_progress 
(child_id, activity_id, score, max_score, completed, attempts, last_attempt, completed_at) 
VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?)
ON DUPLICATE KEY UPDATE
  score = GREATEST(score, VALUES(score)),
  attempts = attempts + 1,
  completed = VALUES(completed)
```

**2. Save Individual Answers (line 122):**
```sql
INSERT INTO attempt 
(child_id, question_id, selected_answer, is_correct, points_earned, time_taken) 
VALUES (?, ?, ?, ?, ?, ?)
```

**3. Update Points (line 139):**
```sql
UPDATE child SET total_points = total_points + ? WHERE child_id = ?
```

### **Navigation Path:**
1. Student answers questions → `MathQuiz.js` line 358 (`handleAnswerSelect`)
2. Clicks "Next Question" → line 362 (`handleNextQuestion`)
3. Quiz completes → line 395 calls `saveQuizResults` line 402
4. Calls `api.saveQuizAttempt` → `auth.js` line 131
5. POST to `/api/quiz/attempt` → `quiz.js` line 156
6. Controller → `quizController.js` line 90
7. Database INSERT/UPDATE → lines 103, 122, 139
8. Calls `api.saveProgress` → `auth.js` line 189
9. POST to `/api/progress/save` → `progressController.js` line 203
10. Awards achievements → `achievementController.js` line 6

---

## ACTION 5: CHECK LEVEL ACCESS

### **Component:**
**File:** `frontend/src/pages/MathQuiz.js`

### **Function:**
**Line 132:** Check before loading quiz
```javascript
if (user?.child?.id) {
  const accessCheck = await api.checkLevelAccess(user.child.id, activityId);
  if (accessCheck.success && !accessCheck.allowed) {
    alert(accessCheck.reason || 'You need to complete the previous level first with 80% or higher!');
    navigate(`/math/${operation}`);
    return;
  }
}
```

### **API Call:**
**File:** `frontend/src/api/auth.js`  
**Line 175:** `checkLevelAccess`
```javascript
checkLevelAccess: async (childId, activityId) => {
  const response = await fetch(`${API_BASE_URL}/progress/check-access/${childId}/${activityId}`, {
    method: 'GET',
    headers: api.getAuthHeaders()
  });
  return await response.json();
}
```

### **API Route:**
**File:** `backend/routes/progress.js`  
**Line (check file):**
```javascript
router.get('/check-access/:childId/:activityId', checkLevelAccess);
```

### **Backend Controller:**
**File:** `backend/controllers/progressController.js`  
**Line 4:** `checkLevelAccess`
```javascript
const checkLevelAccess = async (req, res) => {
  const { childId, activityId } = req.params;
  
  // Get previous level's progress
  const progress = await query(`
    SELECT * FROM child_progress 
    WHERE child_id = ? AND activity_id = ?
    ORDER BY last_attempt DESC
    LIMIT 1
  `, [childId, requiredActivityId]);
  
  if (!progress || progress.length === 0) {
    return res.json({
      success: true,
      allowed: false,
      reason: 'Complete previous level first'
    });
  }
  
  const lastProgress = progress[0];
  const percentage = (lastProgress.score / lastProgress.max_score) * 100;
  
  if (percentage >= 80) {
    return res.json({
      success: true,
      allowed: true,
      reason: 'Previous level completed with 80%+'
    });
  } else {
    return res.json({
      success: true,
      allowed: false,
      reason: `Need 80% or higher on previous level (you got ${Math.round(percentage)}%)`
    });
  }
};
```

### **Database Operation:**
**Line 149:**
```sql
SELECT * FROM child_progress 
WHERE child_id = ? AND activity_id = ?
ORDER BY last_attempt DESC
LIMIT 1
```

### **Navigation Path:**
1. Student tries to start quiz → `MathQuiz.js` line 132
2. Calls `api.checkLevelAccess` → `auth.js` line 175
3. GET `/api/progress/check-access/:childId/:activityId` → `progress.js` route
4. Controller → `progressController.js` line 4
5. Database SELECT → line 149
6. Calculate percentage → line 166
7. Check if >= 80% → line 168
8. Return allowed/not allowed → lines 169-191

---

## ACTION 6: AWARD ACHIEVEMENTS

### **Component:**
**File:** `frontend/src/pages/MathQuiz.js` (displays achievements)

### **Function:**
**File:** `backend/controllers/achievementController.js`  
**Line 6:** `checkAndAwardAchievements`
```javascript
const checkAndAwardAchievements = async (childId, activityId, score, maxScore) => {
  const percentage = (score / maxScore) * 100;
  const newAchievements = [];
  
  // Get child's stats
  const childProgress = await query(`
    SELECT COUNT(*) as completed_count,
           SUM(score) as total_points
    FROM child_progress 
    WHERE child_id = ? AND completed = 1
  `, [childId]);
  
  const completedCount = childProgress[0].completed_count || 0;
  
  // Achievement 1: First Steps
  if (completedCount === 1) {
    await awardAchievement(childId, 1, 'Completed first activity!');
    newAchievements.push({ id: 1, name: 'First Steps' });
  }
  
  // Achievement 2: Quick Learner (5 activities in one day)
  const today = new Date().toISOString().split('T')[0];
  const todayCount = await query(`
    SELECT COUNT(*) as count 
    FROM child_progress 
    WHERE child_id = ? 
    AND DATE(last_attempt) = ? 
    AND completed = 1
  `, [childId, today]);
  
  if (todayCount[0].count >= 5) {
    const hasAchievement = await query(
      'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
      [childId, 2]
    );
    if (hasAchievement.length === 0) {
      await awardAchievement(childId, 2, 'Completed 5 activities today!');
      newAchievements.push({ id: 2, name: 'Quick Learner' });
    }
  }
  
  // Achievement 5: Perfect Score
  if (percentage === 100) {
    const perfectAchievement = await query(
      'SELECT * FROM achievement WHERE name = ?',
      ['Perfect Score']
    );
    if (perfectAchievement.length > 0) {
      const hasAchievement = await query(
        'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
        [childId, perfectAchievement[0].achievement_id]
      );
      if (hasAchievement.length === 0) {
        await awardAchievement(childId, perfectAchievement[0].achievement_id, 'Got 100%!');
        newAchievements.push({ id: perfectAchievement[0].achievement_id, name: 'Perfect Score' });
      }
    }
  }
  
  return newAchievements;
};
```

**Line 119:** `awardAchievement`
```javascript
const awardAchievement = async (childId, achievementId, earnedFor) => {
  // Check if already awarded
  const existing = await query(
    'SELECT * FROM child_achievement WHERE child_id = ? AND achievement_id = ?',
    [childId, achievementId]
  );
  
  if (existing.length > 0) {
    return false; // Already has it
  }
  
  // Award the achievement
  await query(
    'INSERT INTO child_achievement (child_id, achievement_id, earned_at) VALUES (?, ?, NOW())',
    [childId, achievementId]
  );
  
  return true;
};
```

### **Database Operations:**

**1. Check completed count (line 12):**
```sql
SELECT COUNT(*) as completed_count,
       SUM(score) as total_points
FROM child_progress 
WHERE child_id = ? AND completed = 1
```

**2. Check today's completions (line 31):**
```sql
SELECT COUNT(*) as count 
FROM child_progress 
WHERE child_id = ? 
AND DATE(last_attempt) = ? 
AND completed = 1
```

**3. Award achievement (line 133):**
```sql
INSERT INTO child_achievement (child_id, achievement_id, earned_at) VALUES (?, ?, NOW())
```

### **Navigation Path:**
1. Quiz completes → `quizController.js` line 146 calls `checkAchievements`
2. Calls `checkAndAwardAchievements` → `achievementController.js` line 6
3. Queries child progress → line 12
4. Checks each achievement condition → lines 24, 30, 51, 71, 89
5. Calls `awardAchievement` → line 119
6. Database INSERT → line 133
7. Returns new achievements → line 108
8. Frontend displays → `MathQuiz.js` lines 698-719

---

## ACTION 7: LOAD QUIZ QUESTIONS

### **Component:**
**File:** `frontend/src/pages/MathQuiz.js`

### **Function:**
**Line 90:** `loadQuizData`
```javascript
const loadQuizData = async () => {
  try {
    setLoading(true);
    
    // Calculate activity ID from URL params
    let activityId = 7; // Default
    if (operation === 'addition') {
      if (level === 'beginner') {
        activityId = sublevel === '2' ? 8 : 7;
      }
      // ... more mapping
    }
    
    // Fetch questions and activity
    const [questionsResponse, activityResponse] = await Promise.all([
      api.getQuestions(activityId),
      api.getActivity(activityId)
    ]);
    
    if (questionsResponse.success && questionsResponse.data.length > 0) {
      const shuffledQuestions = shuffleArray(questionsResponse.data);
      setQuestions(shuffledQuestions);
    }
    
    setLoading(false);
  } catch (error) {
    console.error('Error loading quiz data:', error);
    setLoading(false);
  }
};
```

### **API Call:**
**File:** `frontend/src/api/auth.js`  
**Line 89:** `getQuestions`
```javascript
getQuestions: async (activityId) => {
  const response = await fetch(`${API_BASE_URL}/quiz/questions/${activityId}`, {
    method: 'GET',
    headers: api.getAuthHeaders()
  });
  return await response.json();
}
```

### **API Route:**
**File:** `backend/routes/quiz.js`  
**Line 14:**
```javascript
router.get('/questions/:activityId', getQuestions);
```

### **Backend Controller:**
**File:** `backend/controllers/quizController.js`  
**Line 4:** `getQuestions`
```javascript
const getQuestions = async (req, res) => {
  const { activityId } = req.params;
  
  const questions = await query(
    `SELECT 
      question_id as id,
      question_text as question,
      question_type as type,
      correct_answer as correct,
      options,
      asl_signs as aslSigns,
      asl_video_url as aslVideoUrl,
      asl_type as aslType,
      explanation,
      difficulty_level as difficulty,
      points_value as points
    FROM question 
    WHERE activity_id = ? AND is_active = 1 AND (asl_complete = 1 OR asl_complete IS NULL)
    ORDER BY order_index ASC
    LIMIT 10`,
    [activityId]
  );
  
  const parsedQuestions = questions.map(q => ({
    ...q,
    options: JSON.parse(q.options || '[]'),
    aslSigns: JSON.parse(q.aslSigns || '[]')
  }));
  
  res.json({
    success: true,
    data: parsedQuestions
  });
};
```

### **Database Operation:**
**Line 8:**
```sql
SELECT 
  question_id as id,
  question_text as question,
  question_type as type,
  correct_answer as correct,
  options,
  asl_signs as aslSigns,
  asl_video_url as aslVideoUrl,
  asl_type as aslType,
  explanation,
  difficulty_level as difficulty,
  points_value as points
FROM question 
WHERE activity_id = ? AND is_active = 1 AND (asl_complete = 1 OR asl_complete IS NULL)
ORDER BY order_index ASC
LIMIT 10
```

### **Navigation Path:**
1. Component mounts → `MathQuiz.js` line 70 (`useEffect`)
2. Calls `loadQuizData` → line 90
3. Calls `api.getQuestions` → `auth.js` line 89
4. GET `/api/quiz/questions/:activityId` → `quiz.js` line 14
5. Controller → `quizController.js` line 4
6. Database SELECT → line 8
7. Parse JSON options → line 28
8. Return questions → line 34
9. Shuffle questions → `MathQuiz.js` line 150
10. Set state → line 154

---

## ACTION 8: ASL EXTRACT BUTTON

### **Component:**
**File:** `frontend/src/pages/AdminQuestionForm.js`

### **Button:**
**Line 649:**
```javascript
<button 
  type="button"
  onClick={() => {
    // Extraction logic
  }}
>
  🪄 Auto-Extract
</button>
```

### **Function:**
**Line 651:** Inline onClick handler
```javascript
onClick={() => {
  const questionText = formData.question_text;
  const aslType = formData.asl_type;
  let extracted = [];
  
  if (aslType === 'numbers') {
    // Extract numbers and operations
    const words = questionText.split(/\s+/);
    const structured = [];
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w\d+\-×÷*/=]/g, '');
      
      if (/^\d+$/.test(cleanWord)) {
        structured.push({type: 'number', value: cleanWord});
      }
      else if (operations[cleanWord]) {
        structured.push({type: 'operation', value: operations[cleanWord]});
      }
    });
    
    extracted = structured;
  } else if (aslType === 'words' || aslType === 'sentence') {
    // Extract words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', ...];
    const cleaned = questionText.replace(/[^\w\s]/g, '').toLowerCase();
    const words = cleaned.split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w))
      .slice(0, 15);
    
    extracted = words;
  }
  
  if (extracted.length > 0) {
    setFormData({...formData, asl_signs: JSON.stringify(extracted)});
    alert(`✓ Extracted ${extracted.length} items`);
  }
}}
```

### **No API Call:**
This is **purely frontend** - no backend involved

### **State Update:**
**Line 766:**
```javascript
setFormData({...formData, asl_signs: JSON.stringify(extracted)});
```

### **Navigation Path:**
1. Admin types question text → `AdminQuestionForm.js` line 473
2. Selects ASL type → line 630
3. Clicks "Auto-Extract" → line 649
4. Extraction logic runs → lines 651-774
5. Updates `formData.asl_signs` → line 766
6. Shows alert → line 770
7. Form ready to submit with ASL data

---

## ACTION 9: DELETE QUESTION

### **Component:**
**File:** `frontend/src/pages/AdminDashboard.js`

### **Button:**
**Line 684:**
```javascript
<button
  className="admin-delete-btn"
  onClick={() => deleteItem('question', q.question_id)}
>
  Delete
</button>
```

### **Function:**
**Line 271:** `deleteItem`
```javascript
const deleteItem = async (type, id) => {
  if (!window.confirm('Are you sure you want to delete this item?')) return;
  
  try {
    const endpoints = {
      question: `/admin/questions/${id}`,
      subject: `/admin/subjects/${id}`,
      section: `/admin/sections/${id}`,
      activity: `/admin/activities/${id}`,
      achievement: `/admin/achievements/${id}`
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoints[type]}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Item deleted successfully!');
      loadQuestions(); // Reload list
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Failed to delete item');
  }
};
```

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 160:**
```javascript
router.delete('/questions/:questionId', adminAuth, deleteQuestion);
```

### **Backend Controller:**
**File:** `backend/controllers/adminController.js`  
**Line (find deleteQuestion function):**
```javascript
const deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  
  // Check if question exists
  const existing = await query('SELECT * FROM question WHERE question_id = ?', [questionId]);
  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }
  
  // Delete question
  await query('DELETE FROM question WHERE question_id = ?', [questionId]);
  
  res.json({
    success: true,
    message: 'Question deleted successfully'
  });
};
```

### **Database Operation:**
```sql
DELETE FROM question WHERE question_id = ?
```

### **Navigation Path:**
1. Admin clicks "Delete" → `AdminDashboard.js` line 684
2. Calls `deleteItem` → line 271
3. Confirms → line 272
4. DELETE to `/api/admin/questions/:id` → line 283
5. Route → `admin.js` line 160
6. Controller → `adminController.js` deleteQuestion
7. Database DELETE → SQL query
8. Reload questions list → `AdminDashboard.js` line 294

---

## ACTION 10: TOGGLE QUESTION ACTIVE STATUS

### **Component:**
**File:** `frontend/src/pages/AdminDashboard.js`

### **Button:**
**Line 637:**
```javascript
<input
  type="checkbox"
  checked={q.is_active === 1}
  onChange={(e) => toggleQuestionActive(q.question_id, e.target.checked)}
/>
```

### **Function:**
**Line 343:** `toggleQuestionActive`
```javascript
const toggleQuestionActive = async (questionId, isActive) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_active: isActive })
    });
    
    const data = await response.json();
    if (data.success) {
      // Update local state
      setQuestions(questions.map(q => 
        q.question_id === questionId ? { ...q, is_active: isActive ? 1 : 0 } : q
      ));
    }
  } catch (error) {
    console.error('Error toggling question active:', error);
    alert('Failed to update question status');
  }
};
```

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 159:**
```javascript
router.put('/questions/:questionId', adminAuth, updateQuestion);
```

### **Backend Controller:**
**File:** `backend/controllers/adminController.js`  
**Line 176:** `updateQuestion`
```javascript
const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { is_active, ...otherFields } = req.body;
  
  // Update question
  await query(
    `UPDATE question 
    SET is_active = ?, 
        question_text = ?,
        correct_answer = ?,
        ...
    WHERE question_id = ?`,
    [is_active, ...otherFields, questionId]
  );
  
  res.json({
    success: true,
    message: 'Question updated successfully'
  });
};
```

### **Database Operation:**
```sql
UPDATE question 
SET is_active = ?, 
    question_text = ?,
    ...
WHERE question_id = ?
```

### **Navigation Path:**
1. Admin clicks checkbox → `AdminDashboard.js` line 640
2. Calls `toggleQuestionActive` → line 343
3. PUT to `/api/admin/questions/:id` → line 346
4. Route → `admin.js` line 159
5. Controller → `adminController.js` line 176
6. Database UPDATE → SQL query
7. Update local state → `AdminDashboard.js` line 359

---

---

## ACTION 11: ASL VIDEO UPLOAD

### **Component:**
**File:** `frontend/src/pages/ASLManager.js`

### **Button:**
**Line 177:**
```javascript
<button type="submit" disabled={uploading} className="upload-btn">
  {uploading ? '⏳ Uploading...' : '⬆️ Upload Video'}
</button>
```

### **Function:**
**Line 36:** `handleUpload`
```javascript
const handleUpload = async (e) => {
  e.preventDefault();
  
  if (!uploadForm.value || !uploadForm.video) {
    setMessage('Please fill in all required fields');
    return;
  }

  setUploading(true);
  setMessage('');

  const formData = new FormData();
  formData.append('type', uploadForm.type);
  formData.append('value', uploadForm.value);
  formData.append('aliases', uploadForm.aliases);
  formData.append('video', uploadForm.video);

  try {
    const response = await fetch('http://localhost:5001/api/asl/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      setMessage('✅ Video uploaded successfully!');
      setUploadForm({ type: 'word', value: '', aliases: '', video: null });
      document.getElementById('video-upload').value = '';
      loadResources();
    } else {
      const error = await response.json();
      setMessage(`❌ Upload failed: ${error.error}`);
    }
  } catch (error) {
    setMessage('❌ Upload failed: ' + error.message);
  } finally {
    setUploading(false);
  }
};
```

### **API Route:**
**File:** `backend/routes/asl.js`  
**Line 74:** `POST /api/asl/upload`
```javascript
router.post('/upload', upload.single('video'), async (req, res) => {
  const { type, value, aliases } = req.body;
  
  if (!type || !value || !req.file) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const filename = req.file.filename;
  const aliasesJson = aliases ? JSON.stringify(aliases.split(',').map(a => a.trim())) : null;

  await db.query(
    `INSERT INTO asl_resources (type, value, filename, aliases) 
     VALUES (?, ?, ?, ?) 
     ON DUPLICATE KEY UPDATE filename = ?, aliases = ?`,
    [type, value, filename, aliasesJson, filename, aliasesJson]
  );

  // Check if any questions can now be marked as ASL complete
  const { checkAndUpdateASLComplete } = require('../utils/aslChecker');
  await checkAndUpdateASLComplete();

  res.json({ 
    message: 'ASL video uploaded successfully',
    resource: { type, value, filename, aliases: aliasesJson }
  });
});
```

### **Database Operation:**
**Line 85:**
```sql
INSERT INTO asl_resources (type, value, filename, aliases) 
VALUES (?, ?, ?, ?) 
ON DUPLICATE KEY UPDATE filename = ?, aliases = ?
```

### **File Storage:**
**File:** `backend/routes/asl.js`  
**Line 9-26:** Multer configuration
- Stores in `frontend/public/asl/{type}s/` directory
- Filename format: `{value}{ext}` (e.g., `hello.mp4`, `5.mp4`, `plus.mp4`)

### **Navigation Path:**
1. Navigate to `/admin/asl` → `ASLManager.js`
2. Fill upload form (type, value, aliases, video file) → lines 130-180
3. Click "Upload Video" → line 177 → `handleUpload` line 36
4. FormData created → line 47-51
5. POST to `/api/asl/upload` → line 54
6. Route → `asl.js` line 74
7. Multer saves file → line 9-26
8. Database INSERT → line 85
9. Check ASL complete → line 94
10. Success message → `ASLManager.js` line 60
11. Reload resources list → line 63

---

## ACTION 12: DELETE ASL VIDEO

### **Component:**
**File:** `frontend/src/pages/ASLManager.js`

### **Button:**
**Line 268:**
```javascript
<button 
  className="delete-btn"
  onClick={() => handleDelete(resource.id)}
>
  🗑️ Delete
</button>
```

### **Function:**
**Line 75:** `handleDelete`
```javascript
const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this ASL video?')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:5001/api/asl/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      setMessage('✅ Video deleted successfully!');
      loadResources();
    } else {
      setMessage('❌ Failed to delete video');
    }
  } catch (error) {
    setMessage('❌ Delete failed: ' + error.message);
  }
};
```

### **API Route:**
**File:** `backend/routes/asl.js`  
**Line 127:** `DELETE /api/asl/:id`
```javascript
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Get the resource details before deleting
  const resources = await db.query('SELECT * FROM asl_resources WHERE id = ?', [id]);
  
  if (resources.length === 0) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const resource = resources[0];
  
  // Delete the file
  const filePath = path.join(__dirname, `../../frontend/public/asl/${resource.type}s/${resource.filename}`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Delete from database
  await db.query('DELETE FROM asl_resources WHERE id = ?', [id]);

  res.json({ message: 'ASL resource deleted successfully' });
});
```

### **Database Operation:**
**Line 147:**
```sql
DELETE FROM asl_resources WHERE id = ?
```

### **File Deletion:**
**Line 141-144:** Physical file removed from filesystem

### **Navigation Path:**
1. View ASL resources table → `ASLManager.js` line 238-278
2. Click "🗑️ Delete" → line 268 → `handleDelete` line 75
3. Confirm deletion → line 76
4. DELETE to `/api/asl/:id` → line 81
5. Route → `asl.js` line 127
6. Query resource → line 132
7. Delete physical file → line 141-144
8. Database DELETE → line 147
9. Success message → `ASLManager.js` line 86
10. Reload resources → line 87

---

## ACTION 13: FILTER ASL RESOURCES BY TYPE

### **Component:**
**File:** `frontend/src/pages/ASLManager.js`

### **Buttons:**
**Lines 206-230:**
```javascript
<button 
  className={filter === 'all' ? 'active' : ''}
  onClick={() => setFilter('all')}
>
  All
</button>
<button 
  className={filter === 'word' ? 'active' : ''}
  onClick={() => setFilter('word')}
>
  Words
</button>
<button 
  className={filter === 'number' ? 'active' : ''}
  onClick={() => setFilter('number')}
>
  Numbers
</button>
<button 
  className={filter === 'operation' ? 'active' : ''}
  onClick={() => setFilter('operation')}
>
  Operations
</button>
```

### **Function:**
**Line 16:** State management
```javascript
const [filter, setFilter] = useState('all');
```

**Lines 96-98:** Filter logic
```javascript
const filteredResources = filter === 'all' 
  ? resources 
  : resources.filter(r => r.type === filter);
```

### **No API Call:**
This is **purely frontend** - client-side filtering

### **Navigation Path:**
1. View ASL Manager → `ASLManager.js`
2. Click filter button (All/Words/Numbers/Operations) → lines 206-230
3. Updates `filter` state → line 16
4. Resources filtered → lines 96-98
5. Table re-renders with filtered results → line 249

---

## ACTION 14: SEARCH ASL RESOURCES

### **Component:**
**File:** `frontend/src/pages/ASLManager.js`

### **Input:**
**Lines 189-195:**
```javascript
<input
  type="text"
  placeholder="🔍 Search by word or operation..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="search-input"
/>
```

### **Clear Button:**
**Lines 196-204:**
```javascript
{searchTerm && (
  <button 
    className="clear-search"
    onClick={() => setSearchTerm('')}
    title="Clear search"
  >
    ✕
  </button>
)}
```

### **Function:**
**Line 17:** State management
```javascript
const [searchTerm, setSearchTerm] = useState('');
```

**Lines 101-106:** Search logic
```javascript
const searchedResources = searchTerm 
  ? filteredResources.filter(r => 
      r.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.aliases && r.aliases.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  : filteredResources;
```

### **No API Call:**
This is **purely frontend** - client-side search

### **Navigation Path:**
1. View ASL Manager → `ASLManager.js`
2. Type in search box → lines 189-195
3. Updates `searchTerm` state → line 17
4. Resources filtered → lines 101-106
5. Table re-renders with search results → line 249
6. Click "✕" to clear → lines 196-204

---

## ACTION 15: TEACHER REGISTRATION

### **Component:**
**File:** `frontend/src/pages/TeacherRegister.js`

### **Button:**
**Line 105:** Submit button
```javascript
<button type="submit" className="submit-btn" disabled={loading}>
  {loading ? 'Registering...' : 'Register'}
</button>
```

### **Function:**
**Line 62:** `handleSubmit`
```javascript
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
```

### **File Upload Handler:**
**Line 26:** `handleFileChange`
```javascript
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
```

### **API Route:**
**File:** `backend/routes/teacherRoutes.js`  
**Line 45:** `POST /api/teacher/register`
```javascript
router.post('/register', upload.single('certificate'), registerTeacher);
```

### **Backend Controller:**
**File:** `backend/controllers/teacherController.js`  
**Line (find registerTeacher function):**
```javascript
const registerTeacher = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if email exists
  const existing = await query('SELECT * FROM teachers WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Save certificate file
  const certificatePath = req.file ? `/uploads/certificates/${req.file.filename}` : null;
  
  // Insert teacher with pending status
  await query(
    `INSERT INTO teachers (name, email, password, certificate_path, approval_status) 
     VALUES (?, ?, ?, ?, 'pending')`,
    [name, email, hashedPassword, certificatePath]
  );
  
  res.json({ 
    success: true, 
    message: 'Registration successful. Pending admin approval.' 
  });
};
```

### **Database Operation:**
```sql
INSERT INTO teachers (name, email, password, certificate_path, approval_status) 
VALUES (?, ?, ?, ?, 'pending')
```

### **Navigation Path:**
1. Navigate to `/teacher/register` → `TeacherRegister.js`
2. Fill form (name, email, password, confirm password, certificate) → lines 128-222
3. Upload certificate file → line 26 (`handleFileChange`)
4. Click "Register" → line 105 → `handleSubmit` line 62
5. Validation → lines 67-85
6. FormData created → lines 90-94
7. POST to `/api/teacher/register` → line 96
8. Route → `teacherRoutes.js` line 45
9. Controller → `teacherController.js` registerTeacher
10. Database INSERT → SQL query
11. Success alert → `TeacherRegister.js` line 104
12. Navigate to login → line 105

---

## ACTION 16: TEACHER LOGIN

### **Component:**
**File:** `frontend/src/pages/TeacherLogin.js`

### **Button:**
**Line 105:** Submit button
```javascript
<button type="submit" className="submit-btn" disabled={loading}>
  {loading ? 'Logging in...' : 'Login to Dashboard'}
</button>
```

### **Function:**
**Line 22:** `handleSubmit`
```javascript
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
```

### **API Route:**
**File:** `backend/routes/teacherRoutes.js`  
**Line 46:** `POST /api/teacher/login`
```javascript
router.post('/login', loginTeacher);
```

### **Backend Controller:**
**File:** `backend/controllers/teacherController.js`  
**Line (find loginTeacher function):**
```javascript
const loginTeacher = async (req, res) => {
  const { email, password } = req.body;
  
  // Find teacher
  const teachers = await query('SELECT * FROM teachers WHERE email = ?', [email]);
  if (teachers.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const teacher = teachers[0];
  
  // Check approval status
  if (teacher.approval_status === 'pending') {
    return res.status(403).json({ error: 'Account pending approval' });
  }
  
  if (teacher.approval_status === 'rejected') {
    return res.status(403).json({ 
      error: 'Account rejected',
      reason: teacher.rejection_reason 
    });
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, teacher.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate token
  const token = jwt.sign(
    { teacherId: teacher.id, email: teacher.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ 
    success: true, 
    token, 
    teacher: { id: teacher.id, name: teacher.name, email: teacher.email } 
  });
};
```

### **Database Operation:**
```sql
SELECT * FROM teachers WHERE email = ?
```

### **Token Storage:**
**Line 46:** Stored in localStorage (not sessionStorage like parent login)
```javascript
localStorage.setItem('teacherToken', data.token);
localStorage.setItem('teacherInfo', JSON.stringify(data.teacher));
```

### **Navigation Path:**
1. Navigate to `/teacher/login` → `TeacherLogin.js`
2. Enter email/password → lines 79-103
3. Click "Login to Dashboard" → line 105 → `handleSubmit` line 22
4. POST to `/api/teacher/login` → line 34
5. Route → `teacherRoutes.js` line 46
6. Controller → `teacherController.js` loginTeacher
7. Database SELECT → SQL query
8. Check approval status → lines (pending/rejected check)
9. Verify password → bcrypt.compare
10. Generate JWT token → jwt.sign
11. Store in localStorage → line 46
12. Navigate to dashboard → line 50

---

## ACTION 17: TEACHER SUBMIT QUESTION

### **Component:**
**File:** `frontend/src/pages/TeacherDashboard.js` (uses `AdminQuestionForm` component)

### **Tab Button:**
**Line 194:**
```javascript
<button 
  className={activeTab === 'questions' ? 'tab active' : 'tab'}
  onClick={() => setActiveTab('questions')}
>
  Add Questions
</button>
```

### **Form Component:**
**Lines 228-234:**
```javascript
<AdminQuestionForm 
  isTeacher={true}
  onSuccess={() => {
    fetchMyContent();
    setActiveTab('my-content');
  }}
/>
```

### **Function:**
**File:** `frontend/src/pages/AdminQuestionForm.js`  
**Line 259:** `handleSubmit` (same as admin, but uses teacher endpoint)

**Lines 292-311:**
```javascript
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

const response = await fetch(url, {
  method: method,
  headers: getHeaders(),
  body: JSON.stringify(submissionData)
});
```

### **Headers:**
**Line (getHeaders function):**
```javascript
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`
});
```

### **API Route:**
**File:** `backend/routes/teacherRoutes.js`  
**Line 51:** `POST /api/teacher/questions`
```javascript
router.post('/questions', teacherAuth, createQuestion);
```

### **Backend Controller:**
**File:** `backend/controllers/teacherController.js`  
**Line (find createQuestion function):**
```javascript
const createQuestion = async (req, res) => {
  const teacherId = req.teacher.id;
  const questionData = req.body;
  
  // Insert question with pending approval status
  const result = await query(
    `INSERT INTO question 
     (activity_id, question_text, question_type, correct_answer, options, ...) 
     VALUES (?, ?, ?, ?, ?, ...)`,
    [...questionData]
  );
  
  // Link question to teacher submission
  await query(
    `INSERT INTO teacher_content_submissions 
     (teacher_id, content_type, content_id, approval_status) 
     VALUES (?, 'question', ?, 'pending')`,
    [teacherId, result.insertId]
  );
  
  res.json({ 
    success: true, 
    message: 'Question submitted for review' 
  });
};
```

### **Database Operations:**
```sql
-- Insert question
INSERT INTO question (...) VALUES (...);

-- Link to teacher submission
INSERT INTO teacher_content_submissions 
(teacher_id, content_type, content_id, approval_status) 
VALUES (?, 'question', ?, 'pending')
```

### **Navigation Path:**
1. Teacher logs in → `TeacherDashboard.js`
2. Click "Add Questions" tab → line 194
3. Form renders → `AdminQuestionForm.js` with `isTeacher={true}`
4. Fill question form → (same as admin form)
5. Click "Submit" → `handleSubmit` line 259
6. Uses teacher endpoint → line 292 (`baseUrl = /teacher`)
7. POST to `/api/teacher/questions` → line 307
8. Route → `teacherRoutes.js` line 51 (with `teacherAuth` middleware)
9. Controller → `teacherController.js` createQuestion
10. Insert question → SQL INSERT
11. Link to teacher submission → SQL INSERT
12. Status set to 'pending'
13. Success callback → `TeacherDashboard.js` line 230
14. Switch to "My Submissions" tab → line 232

---

## ACTION 18: TEACHER COPY CLASS CODE

### **Component:**
**File:** `frontend/src/pages/TeacherDashboard.js`

### **Button:**
**Line 303:**
```javascript
<button 
  className="copy-btn"
  onClick={() => copyClassCode(cls.class_code)}
>
  {copiedCode === cls.class_code ? '✅ Copied!' : '📋 Copy'}
</button>
```

### **Function:**
**Line 110:** `copyClassCode`
```javascript
const copyClassCode = (code) => {
  navigator.clipboard.writeText(code);
  setCopiedCode(code);
  setTimeout(() => setCopiedCode(null), 2000);
};
```

### **No API Call:**
This is **purely frontend** - uses browser Clipboard API

### **Navigation Path:**
1. Navigate to "My Students" tab → `TeacherDashboard.js` line 213
2. View class code section → lines 290-314
3. Click "📋 Copy" button → line 303 → `copyClassCode` line 110
4. Code copied to clipboard → `navigator.clipboard.writeText`
5. Button shows "✅ Copied!" → line 307
6. Resets after 2 seconds → line 113

---

## ACTION 19: ADMIN APPROVE TEACHER

### **Component:**
**File:** `frontend/src/pages/AdminApprovals.js`

### **Button:**
**Line 241:**
```javascript
<button 
  onClick={() => handleApproveTeacher(teacher.id)}
  className="btn-approve"
>
  ✓ Approve
</button>
```

### **Function:**
**Line 61:** `handleApproveTeacher`
```javascript
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
```

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 550:** `POST /api/admin/teachers/:teacherId/approve`
```javascript
router.post('/teachers/:teacherId/approve', adminAuth, approveTeacher);
```

### **Backend Controller:**
**File:** `backend/controllers/adminController.js`  
**Line (find approveTeacher function):**
```javascript
const approveTeacher = async (req, res) => {
  const { teacherId } = req.params;
  
  // Update teacher approval status
  await query(
    `UPDATE teachers 
     SET approval_status = 'approved', 
         approved_at = NOW() 
     WHERE id = ?`,
    [teacherId]
  );
  
  res.json({ 
    success: true, 
    message: 'Teacher approved successfully' 
  });
};
```

### **Database Operation:**
```sql
UPDATE teachers 
SET approval_status = 'approved', 
    approved_at = NOW() 
WHERE id = ?
```

### **Navigation Path:**
1. Navigate to `/admin/approvals` → `AdminApprovals.js`
2. Click "Teachers" tab → line 195
3. View pending teachers list → lines 209-258
4. Click "✓ Approve" button → line 241 → `handleApproveTeacher` line 61
5. Confirm approval → line 62
6. POST to `/api/admin/teachers/:teacherId/approve` → line 65
7. Route → `admin.js` line 550
8. Controller → `adminController.js` approveTeacher
9. Database UPDATE → SQL query
10. Success alert → line 71
11. Refresh pending list → line 72

---

## ACTION 20: ADMIN REJECT TEACHER

### **Component:**
**File:** `frontend/src/pages/AdminApprovals.js`

### **Button:**
**Line 247:**
```javascript
<button 
  onClick={() => handleRejectTeacher(teacher)}
  className="btn-reject"
>
  ✗ Reject
</button>
```

### **Function:**
**Line 83:** `handleRejectTeacher`
```javascript
const handleRejectTeacher = (teacher) => {
  setSelectedItem({ type: 'teacher', id: teacher.id, name: teacher.name });
  setShowRejectModal(true);
};
```

### **Rejection Modal:**
**Lines 312-336:**
```javascript
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
```

### **Submit Rejection:**
**Line 115:** `submitRejection`
```javascript
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
```

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 551:** `POST /api/admin/teachers/:teacherId/reject`
```javascript
router.post('/teachers/:teacherId/reject', adminAuth, rejectTeacher);
```

### **Backend Controller:**
**File:** `backend/controllers/adminController.js`  
**Line (find rejectTeacher function):**
```javascript
const rejectTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { reason } = req.body;
  
  // Update teacher approval status
  await query(
    `UPDATE teachers 
     SET approval_status = 'rejected', 
         rejection_reason = ?,
         rejected_at = NOW() 
     WHERE id = ?`,
    [reason, teacherId]
  );
  
  res.json({ 
    success: true, 
    message: 'Teacher rejected successfully' 
  });
};
```

### **Database Operation:**
```sql
UPDATE teachers 
SET approval_status = 'rejected', 
    rejection_reason = ?,
    rejected_at = NOW() 
WHERE id = ?
```

### **Navigation Path:**
1. Navigate to `/admin/approvals` → `AdminApprovals.js`
2. Click "Teachers" tab → line 195
3. View pending teachers list → lines 209-258
4. Click "✗ Reject" button → line 247 → `handleRejectTeacher` line 83
5. Modal opens → line 84 (`setShowRejectModal(true)`)
6. Enter rejection reason → lines 317-322
7. Click "Submit Rejection" → line 324 → `submitRejection` line 115
8. POST to `/api/admin/teachers/:teacherId/reject` → line 123
9. Route → `admin.js` line 551
10. Controller → `adminController.js` rejectTeacher
11. Database UPDATE → SQL query (sets rejection_reason)
12. Success alert → line 133
13. Close modal → line 134
14. Refresh pending list → line 139

---

## ACTION 21: HOMEPAGE CUSTOMIZER SAVE SETTINGS

### **Component:**
**File:** `frontend/src/pages/HomepageCustomizer.js`

### **Button:**
**Line 298:**
```javascript
<button className="hc-btn hc-btn-save" onClick={handleSave} disabled={saving}>
  {saving ? '💾 Saving...' : '💾 Save Changes'}
</button>
```

### **Function:**
**Line 81:** `handleSave`
```javascript
const handleSave = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5001/api/admin/homepage-settings/bulk-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        settings: settings.map(s => ({ id: s.id, setting_value: s.setting_value }))
      })
    });

    const data = await response.json();
    if (data.success) {
      showMessage('success', '✅ Settings saved! Refresh the homepage (F5) to see changes.');
      fetchSettings();
    } else {
      showMessage('error', 'Failed to save settings');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showMessage('error', 'Error saving settings');
  } finally {
    setSaving(false);
  }
};
```

### **Setting Change Handler:**
**Line 62:** `handleSettingChange`
```javascript
const handleSettingChange = (id, value) => {
  setSettings(prevSettings =>
    prevSettings.map(setting =>
      setting.id === id ? { ...setting, setting_value: value } : setting
    )
  );
  
  // Also update grouped settings to reflect changes immediately
  setGroupedSettings(prevGrouped => {
    const newGrouped = { ...prevGrouped };
    Object.keys(newGrouped).forEach(category => {
      newGrouped[category] = newGrouped[category].map(setting =>
        setting.id === id ? { ...setting, setting_value: value } : setting
      );
    });
    return newGrouped;
  });
};
```

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 544:** `POST /api/admin/homepage-settings/bulk-update`
```javascript
router.post('/homepage-settings/bulk-update', adminAuth, bulkUpdateHomepageSettings);
```

### **Backend Controller:**
**File:** `backend/controllers/adminController.js`  
**Line (find bulkUpdateHomepageSettings function):**
```javascript
const bulkUpdateHomepageSettings = async (req, res) => {
  const { settings } = req.body;
  
  // Update all settings in transaction
  for (const setting of settings) {
    await query(
      'UPDATE homepage_settings SET setting_value = ? WHERE id = ?',
      [setting.setting_value, setting.id]
    );
  }
  
  res.json({ 
    success: true, 
    message: 'Settings updated successfully' 
  });
};
```

### **Database Operation:**
```sql
UPDATE homepage_settings SET setting_value = ? WHERE id = ?
-- (Multiple updates in loop)
```

### **Navigation Path:**
1. Navigate to `/admin/homepage-customizer` → `HomepageCustomizer.js`
2. Select category (General/Header/Navigation/etc.) → lines 313-325
3. Change setting value → `handleSettingChange` line 62
4. Updates local state → lines 63-78
5. Click "💾 Save Changes" → line 298 → `handleSave` line 81
6. Prepare settings array → line 92
7. POST to `/api/admin/homepage-settings/bulk-update` → line 85
8. Route → `admin.js` line 544
9. Controller → `adminController.js` bulkUpdateHomepageSettings
10. Database UPDATE loop → SQL UPDATE
11. Success message → line 98
12. Refresh settings → line 99

---

## ACTION 22: HOMEPAGE CUSTOMIZER RESET TO DEFAULTS

### **Component:**
**File:** `frontend/src/pages/HomepageCustomizer.js`

### **Button:**
**Line 295:**
```javascript
<button className="hc-btn hc-btn-reset" onClick={handleReset} disabled={saving}>
  🔄 Reset to Defaults
</button>
```

### **Function:**
**Line 111:** `handleReset`
```javascript
const handleReset = async () => {
  if (!window.confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }

  setSaving(true);
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch('http://localhost:5001/api/admin/homepage-settings/reset', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      showMessage('success', 'Settings reset to defaults!');
      fetchSettings();
    } else {
      showMessage('error', 'Failed to reset settings');
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    showMessage('error', 'Error resetting settings');
  } finally {
    setSaving(false);
  }
};
```

### **API Route:**
**File:** `backend/routes/admin.js`  
**Line 545:** `POST /api/admin/homepage-settings/reset`
```javascript
router.post('/homepage-settings/reset', adminAuth, resetHomepageSettings);
```

### **Backend Controller:**
**File:** `backend/controllers/adminController.js`  
**Line (find resetHomepageSettings function):**
```javascript
const resetHomepageSettings = async (req, res) => {
  // Reset all settings to their default values
  await query(
    `UPDATE homepage_settings 
     SET setting_value = default_value`
  );
  
  res.json({ 
    success: true, 
    message: 'Settings reset to defaults' 
  });
};
```

### **Database Operation:**
```sql
UPDATE homepage_settings 
SET setting_value = default_value
```

### **Navigation Path:**
1. Navigate to `/admin/homepage-customizer` → `HomepageCustomizer.js`
2. Click "🔄 Reset to Defaults" → line 295 → `handleReset` line 111
3. Confirm reset → line 112
4. POST to `/api/admin/homepage-settings/reset` → line 119
5. Route → `admin.js` line 545
6. Controller → `adminController.js` resetHomepageSettings
7. Database UPDATE (all settings) → SQL UPDATE
8. Success message → line 128
9. Refresh settings → line 129

---

## ACTION 23: MESSAGE CENTER SEND MESSAGE

### **Component:**
**File:** `frontend/src/components/MessageCenter.js`

### **Button:**
**Line 241:**
```javascript
<button 
  onClick={sendMessage} 
  disabled={!newMessage.trim() || sending}
  className="send-btn"
>
  {sending ? 'Sending...' : '📤 Send'}
</button>
```

### **Function:**
**Line 82:** `sendMessage`
```javascript
const sendMessage = async () => {
  if (!newMessage.trim() || !activeConversation) {
    console.log('Cannot send: missing message or conversation');
    return;
  }

  setSending(true);
  try {
    const response = await fetch('http://localhost:5001/api/messages/send', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        recipientId: activeConversation.partner_id,
        recipientType: activeConversation.partner_type,
        message: newMessage
      })
    });

    const data = await response.json();

    if (response.ok) {
      setNewMessage('');
      loadMessages(activeConversation.partner_id, activeConversation.partner_type);
      loadConversations(); // Update last message
    } else {
      console.error('Failed to send message:', data);
      alert('Failed to send message: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please try again.');
  } finally {
    setSending(false);
  }
};
```

### **Headers:**
**Line 25:** `getHeaders`
```javascript
const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem(userType === 'admin' ? 'adminToken' : 'teacherToken')}`,
  'Content-Type': 'application/json'
});
```

### **Text Area:**
**Lines 228-240:**
```javascript
<textarea
  value={newMessage}
  onChange={(e) => setNewMessage(e.target.value)}
  placeholder="Type your message..."
  rows="3"
  onKeyPress={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }}
/>
```

### **API Route:**
**File:** `backend/routes/messageRoutes.js`  
**Line 52:** `POST /api/messages/send`
```javascript
router.post('/send', sendMessage);
```

### **Backend Controller:**
**File:** `backend/controllers/messageController.js`  
**Line (find sendMessage function):**
```javascript
const sendMessage = async (req, res) => {
  const { recipientId, recipientType, message } = req.body;
  const senderType = req.userType; // 'admin' or 'teacher'
  const senderId = req.userId;
  
  // Insert message
  const result = await query(
    `INSERT INTO messages 
     (sender_type, sender_id, recipient_type, recipient_id, message) 
     VALUES (?, ?, ?, ?, ?)`,
    [senderType, senderId, recipientType, recipientId, message]
  );
  
  // Create notification for recipient
  await query(
    `INSERT INTO notifications 
     (user_type, user_id, type, message, related_id) 
     VALUES (?, ?, 'message', ?, ?)`,
    [recipientType, recipientId, `New message from ${senderType}`, result.insertId]
  );
  
  res.json({ 
    success: true, 
    message: 'Message sent successfully',
    data: { id: result.insertId } 
  });
};
```

### **Database Operations:**
```sql
-- Insert message
INSERT INTO messages 
(sender_type, sender_id, recipient_type, recipient_id, message) 
VALUES (?, ?, ?, ?, ?)

-- Create notification
INSERT INTO notifications 
(user_type, user_id, type, message, related_id) 
VALUES (?, ?, 'message', ?, ?)
```

### **Navigation Path:**
1. Open Message Center → Click 💬 icon in Teacher/Admin dashboard
2. Select conversation → `MessageCenter.js` line 187
3. Type message in textarea → lines 228-240
4. Press Enter or click "📤 Send" → line 241 → `sendMessage` line 82
5. Prepare payload → lines 99-103
6. POST to `/api/messages/send` → line 96
7. Route → `messageRoutes.js` line 52
8. Controller → `messageController.js` sendMessage
9. Insert message → SQL INSERT
10. Create notification → SQL INSERT
11. Clear message input → line 110
12. Reload messages → line 111
13. Reload conversations → line 112

---

## ACTION 24: PARENT LINK CHILD TO TEACHER (CLASS CODE)

### **Component:**
**File:** `frontend/src/components/Parent/TeacherLinking.js`

### **Button:**
**Line 87:**
```javascript
<button type="submit" className="link-btn" disabled={loading}>
  {loading ? '⏳' : '➕'} Link
</button>
```

### **Function:**
**Line 24:** `handleLinkToTeacher`
```javascript
const handleLinkToTeacher = async (e) => {
  e.preventDefault();
  if (!classCode.trim()) {
    setMessage('Please enter a class code');
    return;
  }

  setLoading(true);
  setMessage('');

  const result = await api.linkChildToTeacher(child.child_id, classCode.trim().toUpperCase());
  
  if (result.success) {
    setMessage(`✅ Successfully linked to ${result.teacher.name}'s class!`);
    setClassCode('');
    loadTeacherLinks();
  } else {
    setMessage(`❌ ${result.message}`);
  }
  
  setLoading(false);
};
```

### **Input Field:**
**Lines 78-86:**
```javascript
<input
  type="text"
  value={classCode}
  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
  placeholder="Enter 6-digit class code"
  maxLength={6}
  className="class-code-input"
  disabled={loading}
/>
```

### **API Call:**
**File:** `frontend/src/api/auth.js`  
**Line 234:** `linkChildToTeacher`
```javascript
linkChildToTeacher: async (childId, classCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parent-teacher/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, classCode })
    });
    return await response.json();
  } catch (error) {
    console.error('Error linking to teacher:', error);
    return { success: false, message: error.message };
  }
}
```

### **API Route:**
**File:** `backend/routes/parentTeacherRoutes.js`  
**Line 11:** `POST /api/parent-teacher/link`
```javascript
router.post('/link', linkChildToTeacher);
```

### **Backend Controller:**
**File:** `backend/controllers/teacherStudentController.js`  
**Line 260:** `linkChildToTeacher`
```javascript
const linkChildToTeacher = async (req, res) => {
  const { childId, classCode } = req.body;
  
  // Find class by code
  const classData = await query(
    `SELECT tc.*, t.name as teacher_name, t.email as teacher_email
     FROM teacher_classes tc
     JOIN teachers t ON tc.teacher_id = t.id
     WHERE tc.class_code = ? AND tc.is_active = TRUE`,
    [classCode]
  );
  
  if (!classData || classData.length === 0) {
    return res.status(404).json({ success: false, message: 'Invalid class code' });
  }
  
  const cls = classData[0];
  
  // Check if already linked
  const existing = await query(
    `SELECT * FROM child_teacher_access 
     WHERE child_id = ? AND teacher_id = ?`,
    [childId, cls.teacher_id]
  );
  
  if (existing && existing.length > 0) {
    // Update existing link
    await query(
      `UPDATE child_teacher_access 
       SET class_id = ?, is_active = TRUE, parent_approved = FALSE, approved_at = NULL
       WHERE child_id = ? AND teacher_id = ?`,
      [cls.id, childId, cls.teacher_id]
    );
  } else {
    // Create new link
    await query(
      `INSERT INTO child_teacher_access 
       (child_id, teacher_id, class_id, parent_approved, is_active)
       VALUES (?, ?, ?, FALSE, TRUE)`,
      [childId, cls.teacher_id, cls.id]
    );
  }
  
  res.json({
    success: true,
    message: 'Successfully linked to teacher - pending parent approval',
    teacher: {
      name: cls.teacher_name,
      email: cls.teacher_email,
      class_name: cls.class_name
    }
  });
};
```

### **Database Operations:**
```sql
-- Find class by code
SELECT tc.*, t.name as teacher_name, t.email as teacher_email
FROM teacher_classes tc
JOIN teachers t ON tc.teacher_id = t.id
WHERE tc.class_code = ? AND tc.is_active = TRUE

-- Check existing link
SELECT * FROM child_teacher_access 
WHERE child_id = ? AND teacher_id = ?

-- Insert or Update link
INSERT INTO child_teacher_access (...) VALUES (...)
-- OR
UPDATE child_teacher_access SET ... WHERE ...
```

### **Navigation Path:**
1. Navigate to Parent Dashboard → `ParentDashboard.js`
2. Click "Teachers" tab → line 195
3. Enter class code → `TeacherLinking.js` lines 78-86
4. Click "➕ Link" → line 87 → `handleLinkToTeacher` line 24
5. API call → `api.linkChildToTeacher` line 234
6. POST to `/api/parent-teacher/link` → line 236
7. Route → `parentTeacherRoutes.js` line 11
8. Controller → `teacherStudentController.js` line 260
9. Find class by code → SQL SELECT
10. Check/Insert/Update link → SQL INSERT/UPDATE
11. Success message → `TeacherLinking.js` line 37
12. Reload teacher links → line 39

---

## ACTION 25: PARENT ADD CHILD

### **Component:**
**File:** `frontend/src/pages/Profile.js`

### **Button:**
**Line 183:**
```javascript
<button 
  className="add-child-btn"
  onClick={() => setShowAddChild(true)}
>
  + Add Child
</button>
```

### **Modal Form Submit:**
**Line 326:**
```javascript
<button 
  type="submit" 
  className="submit-btn"
  disabled={loading}
>
  {loading ? "Adding..." : "Add Child"}
</button>
```

### **Function:**
**Line 85:** `handleAddChild`
```javascript
const handleAddChild = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const formData = new FormData();
    formData.append('parentId', user.parent.id);
    formData.append('childName', newChild.name);
    formData.append('childAge', newChild.age);
    if (newChild.profilePicture) {
      formData.append('profilePicture', newChild.profilePicture);
    }

    const response = await api.addChild(formData);

    if (response.success) {
      const newChildren = [...children, response.data];
      setChildren(newChildren);
      
      setNewChild({ name: "", age: "", profilePicture: null });
      setShowAddChild(false);
      
      const updatedUserData = {
        ...user,
        children: newChildren
      };
      setUser(updatedUserData);
      sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      console.log('Child added successfully:', response.data);
    } else {
      setError(response.message || "Failed to add child");
    }
  } catch (error) {
    console.error('Add child error:', error);
    setError("Failed to add child. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

### **API Call:**
**File:** `frontend/src/api/auth.js`  
**Line (find addChild function):**
```javascript
addChild: async (formData) => {
  const response = await fetch(`${API_BASE_URL}/auth/add-child`, {
    method: 'POST',
    headers: api.getAuthHeaders(),
    body: formData
  });
  return await response.json();
}
```

### **API Route:**
**File:** `backend/routes/auth.js`  
**Line 274:** `POST /api/auth/add-child`
```javascript
router.post('/add-child', upload.single('profilePicture'), async (req, res) => {
  const { parentId, childName, childAge } = req.body;
  
  // Save profile picture if provided
  const profilePicturePath = req.file 
    ? `/uploads/profile-pictures/${req.file.filename}` 
    : null;
  
  // Insert child
  const resu

## 📊 QUICK REFERENCE TABLE

| Action | Component | Function | API Route | Controller | Database |
|--------|-----------|----------|-----------|------------|----------|
| **1. Login** | `Login.js` | `handleSubmit` (21) | `POST /auth/login` | `auth.js` (185) | `SELECT parent` |
| **2. Admin Login** | `AdminLogin.js` | `handleSubmit` | `POST /admin/login` | `admin.js` (45) | `SELECT admin` |
| **3. Add Question** | `AdminQuestionForm.js` | `handleSubmit` (259) | `POST /admin/questions` | `adminController.js` (51) | `INSERT question` |
| **4. Submit Quiz** | `MathQuiz.js` | `saveQuizResults` (402) | `POST /quiz/attempt` | `quizController.js` (90) | `INSERT child_progress` |
| **5. Check Access** | `MathQuiz.js` | Check (132) | `GET /progress/check-access` | `progressController.js` (4) | `SELECT child_progress` |
| **6. Award Achievement** | Auto | `checkAndAwardAchievements` | N/A (internal) | `achievementController.js` (6) | `INSERT child_achievement` |
| **7. Load Questions** | `MathQuiz.js` | `loadQuizData` (90) | `GET /quiz/questions/:id` | `quizController.js` (4) | `SELECT question` |
| **8. ASL Extract** | `AdminQuestionForm.js` | onClick (649) | N/A (frontend only) | N/A | N/A |
| **9. Delete Question** | `AdminDashboard.js` | `deleteItem` (271) | `DELETE /admin/questions/:id` | `adminController.js` | `DELETE question` |
| **10. Toggle Active** | `AdminDashboard.js` | `toggleQuestionActive` (343) | `PUT /admin/questions/:id` | `adminController.js` (176) | `UPDATE question` |
| **11. ASL Video Upload** | `ASLManager.js` | `handleUpload` (36) | `POST /api/asl/upload` | `asl.js` (74) | `INSERT asl_resources` |
| **12. Delete ASL Video** | `ASLManager.js` | `handleDelete` (75) | `DELETE /api/asl/:id` | `asl.js` (127) | `DELETE asl_resources` |
| **13. Filter ASL Resources** | `ASLManager.js` | `setFilter` (16) | N/A (frontend only) | N/A | N/A |
| **14. Search ASL Resources** | `ASLManager.js` | `setSearchTerm` (17) | N/A (frontend only) | N/A | N/A |
| **15. Teacher Register** | `TeacherRegister.js` | `handleSubmit` (62) | `POST /api/teacher/register` | `teacherController.js` | `INSERT teachers` |
| **16. Teacher Login** | `TeacherLogin.js` | `handleSubmit` (22) | `POST /api/teacher/login` | `teacherController.js` | `SELECT teachers` |
| **17. Teacher Submit Question** | `TeacherDashboard.js` | `handleSubmit` (259) | `POST /api/teacher/questions` | `teacherController.js` | `INSERT question` |
| **18. Copy Class Code** | `TeacherDashboard.js` | `copyClassCode` (110) | N/A (Clipboard API) | N/A | N/A |
| **19. Admin Approve Teacher** | `AdminApprovals.js` | `handleApproveTeacher` (61) | `POST /admin/teachers/:id/approve` | `adminController.js` | `UPDATE teachers` |
| **20. Admin Reject Teacher** | `AdminApprovals.js` | `submitRejection` (115) | `POST /admin/teachers/:id/reject` | `adminController.js` | `UPDATE teachers` |
| **21. Homepage Save Settings** | `HomepageCustomizer.js` | `handleSave` (81) | `POST /admin/homepage-settings/bulk-update` | `adminController.js` | `UPDATE homepage_settings` |
| **22. Homepage Reset Settings** | `HomepageCustomizer.js` | `handleReset` (111) | `POST /admin/homepage-settings/reset` | `adminController.js` | `UPDATE homepage_settings` |
| **23. Send Message** | `MessageCenter.js` | `sendMessage` (82) | `POST /api/messages/send` | `messageController.js` | `INSERT messages` |
| **24. Link Child to Teacher** | `TeacherLinking.js` | `handleLinkToTeacher` (24) | `POST /api/parent-teacher/link` | `teacherStudentController.js` (260) | `INSERT child_teacher_access` |
| **25. Add Child** | `Profile.js` | `handleAddChild` (85) | `POST /auth/add-child` | `auth.js` (274) | `INSERT child` |

---

## 🎯 PRACTICE NAVIGATION

For each action, practice:
1. Finding the component file
2. Finding the function
3. Finding the API call
4. Finding the route
5. Finding the controller
6. Finding the database query

**You're ready! This covers all major actions in your app! 🚀**


