# React Hooks Explanation - useState and useEffect

## 🎯 What is `useState`?

`useState` is a React Hook that lets you add **state** (data that can change) to your component.

### **Basic Syntax:**
```javascript
const [variableName, setVariableName] = useState(initialValue);
```

**Breaking it down:**
- `variableName` - The current value of your state
- `setVariableName` - A function to update that value
- `useState(initialValue)` - Sets the starting value

---

## 📝 Your Code Explained

### **1. MCQ Options State**
```javascript
const [mcqOptions, setMcqOptions] = useState({
  option1: '',
  option2: '',
  option3: '',
  option4: ''
});
```

**What this means:**
- `mcqOptions` = Current value (an object with 4 empty strings)
- `setMcqOptions` = Function to update it
- Initial value = `{ option1: '', option2: '', option3: '', option4: '' }`

**How to use it:**
```javascript
// Read the value
console.log(mcqOptions.option1);  // '' (empty string)

// Update the value
setMcqOptions({
  ...mcqOptions,        // Keep existing values
  option1: '5'          // Update option1 to '5'
});

// Now mcqOptions = { option1: '5', option2: '', option3: '', option4: '' }
```

**Why use it?**
- When you type in the "Option 1" input field, it updates `mcqOptions.option1`
- React automatically re-renders the component with the new value
- The input field shows the updated text

---

### **2. Activities State**
```javascript
const [activities, setActivities] = useState([]);
```

**What this means:**
- `activities` = Current value (starts as empty array `[]`)
- `setActivities` = Function to update it
- Initial value = `[]` (empty array)

**How to use it:**
```javascript
// Read the value
console.log(activities);  // [] (empty array initially)

// Update the value (after fetching from API)
setActivities([
  { activity_id: 7, name: 'Addition Beginner Level 1' },
  { activity_id: 8, name: 'Addition Beginner Level 2' }
]);

// Now activities = array with 2 activity objects
```

**Why use it?**
- When the component loads, `loadActivities()` fetches data from the API
- It calls `setActivities(data)` to store the activities
- The dropdown menu can then display all available activities

---

### **3. Loading State**
```javascript
const [loading, setLoading] = useState(false);
```

**What this means:**
- `loading` = Current value (starts as `false`)
- `setLoading` = Function to update it
- Initial value = `false` (not loading)

**How to use it:**
```javascript
// Start loading
setLoading(true);   // Shows "Loading..." spinner

// Fetch data from API
const data = await fetch('/api/activities');

// Stop loading
setLoading(false);  // Hides spinner, shows data
```

**Why use it?**
- Shows a loading spinner while data is being fetched
- Prevents user from clicking buttons while request is in progress
- Better user experience

---

### **4. Error State**
```javascript
const [error, setError] = useState('');
```

**What this means:**
- `error` = Current value (starts as empty string `''`)
- `setError` = Function to update it
- Initial value = `''` (no error)

**How to use it:**
```javascript
// Set an error
setError('Please fill in all required fields');

// Display it in UI
{error && <div className="error-message">{error}</div>}

// Clear error
setError('');
```

**Why use it?**
- Stores error messages to display to the user
- When form validation fails, set error message
- User sees what went wrong

---

### **5. Selected Activity State**
```javascript
const [selectedActivity, setSelectedActivity] = useState(null);
```

**What this means:**
- `selectedActivity` = Current value (starts as `null`)
- `setSelectedActivity` = Function to update it
- Initial value = `null` (nothing selected)

**How to use it:**
```javascript
// When user selects an activity from dropdown
const handleChange = (e) => {
  const activityId = e.target.value;
  const activity = activities.find(a => a.activity_id === activityId);
  setSelectedActivity(activity);  // Store the selected activity object
};

// Now selectedActivity = { activity_id: 7, name: 'Addition Beginner Level 1', ... }
```

**Why use it?**
- Remembers which activity the admin selected
- Used to auto-select passages, determine ASL type, etc.

---

## 🔄 What is `useEffect`?

`useEffect` is a React Hook that lets you run code **after** the component renders (displays on screen).

### **Basic Syntax:**
```javascript
useEffect(() => {
  // Code to run
}, [dependencies]);
```

**Breaking it down:**
- First parameter: Function with code to run
- Second parameter: Array of dependencies (when to re-run)

---

## 📝 Your useEffect Explained

```javascript
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
```

### **Step-by-Step Explanation:**

**1. When does it run?**
- **First time:** When component first appears on screen
- **After that:** Whenever `id`, `navigate`, or `isTeacher` changes

**2. What does it do?**

**Step 1: Check Authentication**
```javascript
const token = isTeacher ? localStorage.getItem('teacherToken') : localStorage.getItem('adminToken');
```
- Gets the authentication token from browser storage
- If teacher, gets teacher token; if admin, gets admin token

**Step 2: Redirect if No Token**
```javascript
if (!token) {
  navigate(isTeacher ? '/teacher/login' : '/admin/login');
  return;  // Stop here, don't continue
}
```
- If no token found, user is not logged in
- Redirects to login page
- `return` stops the function (doesn't run code below)

**Step 3: Load Data**
```javascript
loadActivities();  // Fetch all activities from API
loadPassages();    // Fetch all reading passages from API
```
- Calls functions that fetch data from backend
- These functions will call `setActivities()` and `setPassages()` when data arrives

**Step 4: Load Question (if editing)**
```javascript
if (isEditMode) {
  loadQuestion();  // Fetch the question being edited
}
```
- Only runs if editing an existing question (not creating new one)
- `isEditMode` is `true` when URL has an ID (like `/admin/questions/edit/123`)

**3. Dependencies Array: `[id, navigate, isTeacher]`**
- If `id` changes → re-run effect (different question to edit)
- If `navigate` changes → re-run effect (rare, but included for safety)
- If `isTeacher` changes → re-run effect (switched between teacher/admin mode)

---

## 🎯 Real-World Example Flow

### **Scenario: Admin Opens "Add Question" Page**

**1. Component Renders (First Time)**
```javascript
// All useState hooks initialize:
mcqOptions = { option1: '', option2: '', option3: '', option4: '' }
activities = []
loading = false
error = ''
```

**2. useEffect Runs**
```javascript
// Check token
token = localStorage.getItem('adminToken')  // "abc123xyz"

// Token exists, continue...

// Load activities
loadActivities()  // Makes API call: GET /api/admin/activities
// ... API responds with data ...
setActivities([...])  // Updates activities state

// Load passages
loadPassages()  // Makes API call: GET /api/admin/reading-passages
// ... API responds with data ...
setPassages([...])  // Updates passages state
```

**3. Component Re-renders (Because State Changed)**
```javascript
// Now activities and passages have data
// Dropdown menus can now show options
```

**4. User Types in Form**
```javascript
// User types "5" in Option 1 input
handleMcqOptionChange({ target: { name: 'option1', value: '5' } })

// This calls:
setMcqOptions({
  ...mcqOptions,
  option1: '5'
})

// Component re-renders
// Input field now shows "5"
```

**5. User Clicks Radio Button**
```javascript
// User clicks radio button next to Option 1
onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}

// This sets:
formData.correct_answer = '5'

// Component re-renders
// Radio button is now checked
```

---

## 🔑 Key Concepts

### **1. State is Isolated**
Each component has its own state. Changing state in one component doesn't affect others.

### **2. State Updates Trigger Re-render**
When you call `setSomething(newValue)`, React:
1. Updates the state
2. Re-renders the component
3. Updates the UI to show new values

### **3. useEffect Runs After Render**
- Component renders first (shows on screen)
- Then `useEffect` runs
- If state changes in `useEffect`, component re-renders

### **4. Dependencies Control When Effect Runs**
```javascript
useEffect(() => {
  // Runs every time component renders
}, []);  // Empty array = run once on mount

useEffect(() => {
  // Runs when 'id' changes
}, [id]);

useEffect(() => {
  // Runs every render (no array = runs every time)
});
```

---

## 💡 Why This Pattern?

**Without useState:**
- Can't store changing data
- Can't update UI when data changes
- Component is "static" (never changes)

**With useState:**
- Can store data that changes
- UI automatically updates when data changes
- Component is "dynamic" (interactive)

**Without useEffect:**
- Can't run code after component loads
- Can't fetch data from API
- Can't check authentication

**With useEffect:**
- Can fetch data when component loads
- Can check authentication
- Can set up subscriptions, timers, etc.

---

## 🎓 Summary

**useState:**
- Stores data that can change
- `[value, setValue] = useState(initial)`
- Call `setValue(newValue)` to update
- Component re-renders automatically

**useEffect:**
- Runs code after component renders
- `useEffect(() => { code }, [deps])`
- Use for: API calls, authentication checks, setup code
- Dependencies control when it re-runs

**Your Code:**
- 7 different state variables for different data
- 1 useEffect that runs on mount to:
  - Check authentication
  - Load activities and passages
  - Load question if editing

This is the foundation of React! Everything else builds on these concepts. 🚀



