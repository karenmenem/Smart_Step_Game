# All React Concepts in Your Code - Complete Guide

## 🎯 React Hooks You Use

### **1. useState** - Store Data That Can Change

**What it does:** Stores data that can change, and when it changes, React re-renders the component.

**Your code examples:**

```javascript
// Simple value
const [score, setScore] = useState(0);
// score = current value (starts at 0)
// setScore = function to update it

// Object
const [formData, setFormData] = useState({
  question_text: '',
  correct_answer: ''
});

// Array
const [questions, setQuestions] = useState([]);
// Starts as empty array

// Boolean
const [loading, setLoading] = useState(false);
// Starts as false
```

**How to update:**
```javascript
setScore(10);  // Updates score to 10
setFormData({ ...formData, question_text: 'New text' });  // Updates object
setQuestions([...questions, newQuestion]);  // Adds to array
setLoading(true);  // Changes boolean
```

**Where you use it:**
- `MathQuiz.js` - lines 50-68 (18 different useState hooks!)
- `AdminQuestionForm.js` - lines 17-49
- Every component that needs to remember data

---

### **2. useEffect** - Run Code After Component Renders

**What it does:** Runs code after the component appears on screen, or when certain values change.

**Your code examples:**

```javascript
// Run once when component loads
useEffect(() => {
  loadActivities();
  loadPassages();
}, []);  // Empty array = run once

// Run when 'id' changes
useEffect(() => {
  if (isEditMode) {
    loadQuestion();
  }
}, [id]);  // Re-run if 'id' changes

// Run when multiple things change
useEffect(() => {
  // Check authentication
  if (!token) {
    navigate('/login');
  }
}, [id, navigate, isTeacher]);  // Re-run if any of these change
```

**Common uses in your code:**
- Loading data when component mounts
- Checking authentication
- Setting up timers
- Cleaning up (like clearing timers)

**Where you use it:**
- `MathQuiz.js` - lines 70, 263, 275
- `AdminQuestionForm.js` - lines 51, 67
- `ASLPlayer.js` - lines 11, 21, 31

---

### **3. useNavigate** - Navigate to Different Pages

**What it does:** Lets you programmatically go to different routes (pages).

**Your code:**
```javascript
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();
  
  // Navigate to a page
  navigate('/admin/dashboard');
  navigate('/math/addition');
  navigate(-1);  // Go back
}
```

**Where you use it:**
- `MathQuiz.js` - line 18
- `AdminQuestionForm.js` - line 8
- `AdminDashboard.js` - line 13

**Example from your code:**
```javascript
// AdminQuestionForm.js line 399
<button onClick={() => navigate('/admin/dashboard')}>
  ← Back to Dashboard
</button>
```

---

### **4. useParams** - Get URL Parameters

**What it does:** Gets values from the URL.

**Your code:**
```javascript
import { useParams } from "react-router-dom";

function MathQuiz() {
  const { operation, level, sublevel } = useParams();
  // If URL is /math/addition/quiz/beginner/1
  // operation = "addition"
  // level = "beginner"
  // sublevel = "1"
}
```

**Where you use it:**
- `MathQuiz.js` - line 19: `const { operation, level, sublevel } = useParams();`
- `AdminQuestionForm.js` - line 10: `const { id } = useParams();`
- `EnglishQuiz.js` - line 9: `const { topic, level, sublevel } = useParams();`

---

### **5. useLocation** - Get Current URL Info

**What it does:** Gets information about the current URL.

**Your code:**
```javascript
import { useLocation } from "react-router-dom";

function AdminQuestionForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activityId = queryParams.get('activity_id');
  // If URL is /admin/questions/add?activity_id=7
  // activityId = "7"
}
```

**Where you use it:**
- `AdminQuestionForm.js` - line 9, 14
- `AdminDashboard.js` - line 14

---

### **6. useMemo** - Remember Calculated Values

**What it does:** Remembers a calculated value, only recalculates if dependencies change.

**Your code:**
```javascript
// EnglishQuiz.js line 2
import { useMemo } from "react";

// Not shown in your code, but you could use it like:
const filteredQuestions = useMemo(() => {
  return questions.filter(q => q.difficulty === 'easy');
}, [questions]);  // Only recalculate if 'questions' changes
```

**Where you might use it:**
- Filtering large arrays
- Expensive calculations
- Currently not much in your code, but good to know

---

## 🔄 Array Methods You Use

### **1. .map()** - Transform Each Item in Array

**What it does:** Creates a new array by transforming each item.

**Your code examples:**

```javascript
// MathQuiz.js line 150
const shuffledQuestions = questionsResponse.data.map(q => ({
  ...q,
  options: q.options ? shuffleArray([...q.options]) : q.options
}));
// Takes each question, adds shuffled options

// MathQuiz.js line 814
{questions[currentQuestion]?.options.map((option, index) => (
  <button key={index} onClick={() => handleAnswerSelect(option)}>
    {option}
  </button>
))}
// Creates a button for each option

// AdminQuestionForm.js line 419
{activities.map(activity => (
  <option key={activity.activity_id} value={activity.activity_id}>
    {activity.name}
  </option>
))}
// Creates dropdown option for each activity
```

**Pattern:**
```javascript
array.map(item => {
  // Return something for each item
  return <Component data={item} />;
});
```

---

### **2. .filter()** - Keep Only Some Items

**What it does:** Creates new array with only items that pass a test.

**Your code:**

```javascript
// AdminQuestionForm.js line 269
const optionsArray = [
  mcqOptions.option1,
  mcqOptions.option2,
  mcqOptions.option3,
  mcqOptions.option4
].filter(opt => opt !== '');  // Remove empty options

// AdminQuestionForm.js line 170
const filtered = passages.filter(p => 
  p.level === level && p.sublevel === sublevel
);
// Keep only passages matching level and sublevel

// AdminQuestionForm.js line 759
const words = cleaned.split(/\s+/)
  .filter(w => w.length > 2 && !stopWords.includes(w));
// Keep only words longer than 2 characters and not in stopWords
```

**Pattern:**
```javascript
array.filter(item => {
  return condition;  // true = keep, false = remove
});
```

---

### **3. .find()** - Find One Item

**What it does:** Returns the first item that matches a condition.

**Your code:**

```javascript
// AdminQuestionForm.js line 140
const matchingPassage = passages.find(p => 
  p.level === level && p.sublevel === sublevel
);
// Finds first passage matching criteria

// AdminQuestionForm.js line 224
const activity = activities.find(a => a.activity_id === q.activity_id);
// Finds activity with matching ID

// MathQuiz.js line 531
const preferredVoice = voices.find(voice => 
  voice.name.toLowerCase().includes('female')
);
// Finds first voice with 'female' in name
```

**Pattern:**
```javascript
const item = array.find(item => {
  return condition;  // Returns first match, or undefined
});
```

---

### **4. .includes()** - Check if Array Contains Value

**What it does:** Returns true if array contains the value.

**Your code:**

```javascript
// AdminQuestionForm.js line 759
.filter(w => !stopWords.includes(w))
// Keep words that are NOT in stopWords array

// MathQuiz.js line 294
if (keyMap.hasOwnProperty(key) && currentOptions[keyMap[key]])
// Checks if key exists in keyMap object
```

---

## 📦 Spread Operator (...) - Copy Objects/Arrays

**What it does:** Copies all properties from an object/array.

**Your code examples:**

### **Copying Objects:**
```javascript
// AdminQuestionForm.js line 497
setFormData({ ...formData, correct_answer: mcqOptions.option1 });
// Copies all formData properties, then updates correct_answer

// MathQuiz.js line 74
setUser({ ...userData, child: currentChild });
// Copies userData, adds child property
```

### **Copying Arrays:**
```javascript
// MathQuiz.js line 9
const shuffled = [...array];
// Creates copy of array

// MathQuiz.js line 150
options: q.options ? shuffleArray([...q.options]) : q.options
// Copies options array before shuffling
```

### **Why use it:**
- React requires new objects/arrays to detect changes
- `{ ...obj, newProp: value }` creates new object
- `[...array, newItem]` creates new array

**Where you use it:**
- Updating state objects (lines 146, 240, 254, 301, 497, etc.)
- Copying arrays before modifying (line 9, 150)

---

## 🎨 Conditional Rendering

**What it does:** Show different content based on conditions.

**Your code examples:**

### **1. Ternary Operator (if/else):**
```javascript
// MathQuiz.js line 632
const passed = percentage >= 80;

{passed ? "🎉" : "💪"}  // Show 🎉 if passed, 💪 if not

// MathQuiz.js line 664
{passed 
  ? "Great job! You've mastered Level 1 Addition!" 
  : "You're getting better! Try again to unlock the next level."}
```

### **2. Logical AND (&&):**
```javascript
// MathQuiz.js line 679
{pointsEarned > 0 && (
  <div>🌟 +{pointsEarned} Points Earned!</div>
)}
// Only shows if pointsEarned > 0

// MathQuiz.js line 698
{newAchievements && newAchievements.length > 0 && (
  <div>🏆 New Achievement!</div>
)}
// Only shows if achievements exist
```

### **3. Optional Chaining (?.):**
```javascript
// MathQuiz.js line 800
{questions[currentQuestion]?.options || []}
// If questions[currentQuestion] exists, get options, else use []

// MathQuiz.js line 132
if (user?.child?.id) {
  // Only runs if user exists AND child exists AND id exists
}
```

**Where you use it:**
- Showing/hiding UI elements
- Different content based on state
- Error handling

---

## 🎯 Event Handlers

**What it does:** Functions that run when user interacts (click, type, etc.).

**Your code examples:**

### **1. onClick:**
```javascript
// AdminQuestionForm.js line 497
onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}
// Arrow function that runs when radio button clicked

// MathQuiz.js line 832
onClick={() => handleAnswerSelect(option)}
// Calls function when button clicked
```

### **2. onChange:**
```javascript
// AdminQuestionForm.js line 237
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

<input onChange={handleChange} name="question_text" />
// Runs when input value changes
```

### **3. onSubmit:**
```javascript
// AdminQuestionForm.js line 259
const handleSubmit = async (e) => {
  e.preventDefault();  // Prevents page refresh
  // ... submit logic
};

<form onSubmit={handleSubmit}>
```

**Where you use it:**
- All interactive elements (buttons, inputs, forms)

---

## 🔑 Key React Concepts

### **1. Controlled Components**
**What it does:** React controls the input value, not the browser.

**Your code:**
```javascript
<input
  value={mcqOptions.option1}  // React controls this
  onChange={handleMcqOptionChange}  // React updates this
/>
```

**Why:** React is "single source of truth" for the value.

---

### **2. Keys in Lists**
**What it does:** React needs unique keys when rendering lists.

**Your code:**
```javascript
{questions.map((q, index) => (
  <div key={q.id}>  // or key={index}
    {q.question}
  </div>
))}
```

**Why:** Helps React identify which items changed.

---

### **3. JSX (JavaScript XML)**
**What it does:** Write HTML-like syntax in JavaScript.

**Your code:**
```javascript
return (
  <div className="quiz-layout">
    <h1>SmartStep</h1>
    {loading && <div>Loading...</div>}
  </div>
);
```

**Rules:**
- Must return one parent element
- Use `className` not `class`
- Use `{}` for JavaScript expressions

---

### **4. Props (Properties)**
**What it does:** Pass data from parent to child component.

**Your code:**
```javascript
// Parent component
<ASLPlayer 
  question={questions[currentQuestion]}
  autoPlay={false}
  showControls={true}
/>

// Child component (ASLPlayer.js)
const ASLPlayer = ({ question, autoPlay, showControls }) => {
  // Use question, autoPlay, showControls here
};
```

---

### **5. State Lifting**
**What it does:** Moving state up to parent component so siblings can share it.

**Your code:**
- `formData` in `AdminQuestionForm` - parent manages all form state
- Child inputs update parent state via callbacks

---

## 🎓 Questions They Might Ask

### **"Show me where you use useState"**
- Navigate to any component file
- Point to `const [something, setSomething] = useState(...)`
- Explain: "This stores data that can change"

### **"Show me where useEffect runs code on component load"**
- Navigate to component with `useEffect(() => { ... }, [])`
- Explain: "This runs once when component first appears"

### **"Show me where you use .map() to render a list"**
- Navigate to any `.map()` usage
- Explain: "This creates a component for each item in the array"

### **"Show me the spread operator"**
- Navigate to `{ ...formData, ... }`
- Explain: "This copies all properties, then updates one"

### **"Show me conditional rendering"**
- Navigate to `{condition && <Component />}` or `{condition ? A : B}`
- Explain: "This shows different content based on condition"

### **"Show me an event handler"**
- Navigate to `onClick={...}` or `onChange={...}`
- Explain: "This runs when user interacts"

### **"Why do you have so many useState hooks?"**
- Answer: "Each piece of data that can change needs its own state. This keeps the code organized and makes it clear what can change."

### **"What happens if you call setState twice in a row?"**
- Answer: "React batches updates, so it only re-renders once. Both updates happen, but React optimizes the rendering."

### **"Why use useEffect instead of putting code directly in component?"**
- Answer: "Code in component runs every render. useEffect runs only when dependencies change, which is more efficient."

---

## 📚 Quick Reference

| Concept | What It Does | Your Code Location |
|---------|-------------|-------------------|
| `useState` | Store changing data | Every component |
| `useEffect` | Run code after render | MathQuiz.js:70, AdminQuestionForm.js:51 |
| `useNavigate` | Go to different pages | MathQuiz.js:18 |
| `useParams` | Get URL parameters | MathQuiz.js:19 |
| `.map()` | Transform array items | MathQuiz.js:814, AdminQuestionForm.js:419 |
| `.filter()` | Keep some items | AdminQuestionForm.js:269 |
| `.find()` | Find one item | AdminQuestionForm.js:140 |
| `...` (spread) | Copy object/array | AdminQuestionForm.js:497 |
| `&&` | Conditional render | MathQuiz.js:679 |
| `? :` | If/else render | MathQuiz.js:632 |
| `?.` | Optional chaining | MathQuiz.js:800 |

---

## 💡 Practice Answers

**"What is useState?"**
- "It's a React Hook that lets me store data that can change. When I call the setter function, React automatically re-renders the component with the new value."

**"What is useEffect?"**
- "It's a React Hook that runs code after the component renders. I use it to fetch data, check authentication, or set up timers."

**"Why use .map() instead of a for loop?"**
- ".map() is more functional and React-friendly. It returns a new array of JSX elements that React can render directly."

**"What does the spread operator do?"**
- "It copies all properties from an object or items from an array. I use it when updating state to create a new object/array, which React needs to detect changes."

**"What's the difference between && and ? : for conditional rendering?"**
- "&& is for 'show or nothing' - if condition is true, show it. ? : is for 'show this or that' - if condition is true, show first, else show second."

You're ready! These are the main React concepts in your code. 🚀



