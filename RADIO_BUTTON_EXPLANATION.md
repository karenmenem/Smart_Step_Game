# Radio Button & Text Input - React Hooks Explanation

## 🎯 The Code We're Explaining

```javascript
<div className="form-group">
  <label>Option 1 *</label>
  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
    {/* RADIO BUTTON */}
    <input
      type="radio"
      name="correctAnswer"
      checked={formData.correct_answer === mcqOptions.option1}
      onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}
    />
    {/* TEXT INPUT */}
    <input
      type="text"
      name="option1"
      value={mcqOptions.option1}
      onChange={handleMcqOptionChange}
      required
      placeholder="First option"
    />
  </div>
</div>
```

---

## 📊 Two Separate State Variables

### **State 1: `mcqOptions`** (Stores the answer text)
```javascript
const [mcqOptions, setMcqOptions] = useState({
  option1: '',
  option2: '',
  option3: '',
  option4: ''
});
```

**Purpose:** Stores what text is in each option input field
- `mcqOptions.option1` = "5" (what admin typed)
- `mcqOptions.option2` = "6"
- `mcqOptions.option3` = "7"
- `mcqOptions.option4` = "8"

### **State 2: `formData`** (Stores which option is correct)
```javascript
const [formData, setFormData] = useState({
  correct_answer: '',
  // ... other fields
});
```

**Purpose:** Stores which option text is the correct answer
- `formData.correct_answer` = "5" (the text value of the correct option)

---

## 🔄 How They Work Together

### **Step 1: Admin Types in Text Input**

**The Text Input:**
```javascript
<input
  type="text"
  name="option1"
  value={mcqOptions.option1}           // Shows current value
  onChange={handleMcqOptionChange}     // Runs when typing
/>
```

**What happens:**
1. Admin types "5" in the text box
2. `onChange` event fires
3. Calls `handleMcqOptionChange` function

**The Handler Function:**
```javascript
const handleMcqOptionChange = (e) => {
  const { name, value } = e.target;
  // name = "option1"
  // value = "5"
  
  setMcqOptions(prev => ({
    ...prev,        // Keep existing values: { option2: '', option3: '', option4: '' }
    [name]: value   // Update option1: "5"
  }));
  
  // Result: { option1: '5', option2: '', option3: '', option4: '' }
};
```

**After this:**
- `mcqOptions.option1` = "5"
- Component re-renders
- Text input now displays "5"

---

### **Step 2: Admin Clicks Radio Button**

**The Radio Button:**
```javascript
<input
  type="radio"
  name="correctAnswer"
  checked={formData.correct_answer === mcqOptions.option1}
  onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}
/>
```

**Breaking it down:**

#### **A. The `checked` Prop**
```javascript
checked={formData.correct_answer === mcqOptions.option1}
```

**What this does:**
- Compares: Is `formData.correct_answer` equal to `mcqOptions.option1`?
- If `formData.correct_answer = "5"` and `mcqOptions.option1 = "5"` → `true` ✅
- If `formData.correct_answer = "6"` and `mcqOptions.option1 = "5"` → `false` ❌
- Radio button shows as **checked** (filled circle) if `true`, **unchecked** (empty circle) if `false`

**Why this works:**
- We store the **text value** ("5") as the correct answer, not the index
- So we compare: "Is the correct answer text the same as option1's text?"

#### **B. The `onChange` Handler**
```javascript
onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}
```

**What this does:**
- When radio button is clicked, it runs this function
- `setFormData({ ...formData, correct_answer: mcqOptions.option1 })`

**The Spread Operator `...formData`:**
```javascript
{ ...formData, correct_answer: mcqOptions.option1 }
```

**Breaking it down:**
- `...formData` = Copy all existing properties from `formData`
  - `activity_id: ''`
  - `question_text: ''`
  - `correct_answer: ''` (old value)
  - `asl_signs: ''`
  - etc.
- `correct_answer: mcqOptions.option1` = Override just the `correct_answer` property
  - Sets it to "5" (the value of `mcqOptions.option1`)

**Result:**
```javascript
// Before:
formData = {
  activity_id: '7',
  question_text: 'What is 2 + 3?',
  correct_answer: '',  // Empty
  // ... other fields
}

// After clicking radio button:
formData = {
  activity_id: '7',           // Kept (from ...formData)
  question_text: 'What is 2 + 3?',  // Kept (from ...formData)
  correct_answer: '5',        // Updated (from mcqOptions.option1)
  // ... other fields kept
}
```

**After this:**
- `formData.correct_answer` = "5"
- Component re-renders
- Radio button now shows as checked (because `"5" === "5"` is `true`)

---

## 🎬 Complete Flow Example

### **Scenario: Admin Creates a Question**

**Initial State:**
```javascript
mcqOptions = { option1: '', option2: '', option3: '', option4: '' }
formData = { correct_answer: '', ... }
```

**Step 1: Admin Types "5" in Option 1**
```
User types: "5"
  ↓
onChange fires
  ↓
handleMcqOptionChange({ target: { name: 'option1', value: '5' } })
  ↓
setMcqOptions({ ...mcqOptions, option1: '5' })
  ↓
mcqOptions = { option1: '5', option2: '', option3: '', option4: '' }
  ↓
Component re-renders
  ↓
Text input now shows "5"
```

**Step 2: Admin Types Other Options**
```
Admin types "6" in Option 2
  ↓
mcqOptions = { option1: '5', option2: '6', option3: '', option4: '' }

Admin types "7" in Option 3
  ↓
mcqOptions = { option1: '5', option2: '6', option3: '7', option4: '' }

Admin types "8" in Option 4
  ↓
mcqOptions = { option1: '5', option2: '6', option3: '7', option4: '8' }
```

**Step 3: Admin Clicks Radio Button Next to Option 1**
```
User clicks radio button
  ↓
onChange fires
  ↓
setFormData({ ...formData, correct_answer: mcqOptions.option1 })
  ↓
formData.correct_answer = '5'
  ↓
Component re-renders
  ↓
Radio button shows as checked (because "5" === "5" is true)
```

**Final State:**
```javascript
mcqOptions = { option1: '5', option2: '6', option3: '7', option4: '8' }
formData = { correct_answer: '5', ... }
```

**When Form is Submitted:**
```javascript
// Line 264-269: Combine options into array
const optionsArray = [
  mcqOptions.option1,  // "5"
  mcqOptions.option2,  // "6"
  mcqOptions.option3,  // "7"
  mcqOptions.option4   // "8"
];
// Result: ["5", "6", "7", "8"]

// Line 302: Convert to JSON string
options: JSON.stringify(optionsArray)
// Result: '["5","6","7","8"]'

// formData.correct_answer = "5" (already set)
```

**What Gets Saved to Database:**
- `options`: `'["5","6","7","8"]'` (all options as JSON)
- `correct_answer`: `"5"` (the text value of the correct option)

---

## 🔑 Key React Concepts Used

### **1. Controlled Components**
```javascript
value={mcqOptions.option1}
onChange={handleMcqOptionChange}
```

- Input's value is **controlled** by React state
- Not controlled by the DOM
- React is the "single source of truth"

**Why?**
- React controls what's displayed
- Easy to validate, format, or manipulate the value
- Can reset form easily by setting state

### **2. Conditional Rendering**
```javascript
checked={formData.correct_answer === mcqOptions.option1}
```

- Radio button's checked state depends on comparison
- If comparison is `true` → checked
- If comparison is `false` → unchecked

### **3. Spread Operator**
```javascript
{ ...formData, correct_answer: mcqOptions.option1 }
```

- `...formData` = Copy all properties
- `correct_answer: ...` = Override one property
- Keeps other fields unchanged

**Why not just:**
```javascript
setFormData({ correct_answer: mcqOptions.option1 })  // ❌ WRONG
```

**This would:**
- Delete all other fields
- Only keep `correct_answer`
- Lose `activity_id`, `question_text`, etc.

### **4. Event Handlers**
```javascript
onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}
```

- Arrow function that runs when event occurs
- Can be inline (like here) or separate function (like `handleMcqOptionChange`)

---

## 💡 Why This Design?

### **Why Two Separate States?**

**Option 1: Store everything in one state** ❌
```javascript
const [formData, setFormData] = useState({
  correct_answer: '',
  option1: '',
  option2: '',
  option3: '',
  option4: ''
});
```

**Problems:**
- Harder to manage
- When updating one option, need to spread entire object
- More complex code

**Option 2: Separate states** ✅ (What you have)
```javascript
const [mcqOptions, setMcqOptions] = useState({ option1: '', ... });
const [formData, setFormData] = useState({ correct_answer: '', ... });
```

**Benefits:**
- Clear separation of concerns
- Easier to update individual options
- `mcqOptions` is temporary (for input)
- `formData.correct_answer` is final (for submission)

### **Why Store Text Value, Not Index?**

**Option 1: Store index** ❌
```javascript
formData.correct_answer = 0  // First option is correct
```

**Problems:**
- If options are shuffled, index becomes wrong
- Harder to validate
- Less flexible

**Option 2: Store text value** ✅ (What you have)
```javascript
formData.correct_answer = "5"  // The text "5" is correct
```

**Benefits:**
- Works even if options are reordered
- Easy to compare: `selectedAnswer === question.correct`
- More robust

---

## 🎓 Summary

**Two States:**
1. `mcqOptions` - Stores what admin types in each input field
2. `formData.correct_answer` - Stores which option text is correct

**Text Input:**
- `value={mcqOptions.option1}` - Shows current value
- `onChange={handleMcqOptionChange}` - Updates state when typing
- Updates `mcqOptions.option1`

**Radio Button:**
- `checked={formData.correct_answer === mcqOptions.option1}` - Shows if this option is selected
- `onChange={() => setFormData({ ...formData, correct_answer: mcqOptions.option1 })}` - Sets this option as correct
- Updates `formData.correct_answer` to the text value

**The Flow:**
1. Type in text input → Updates `mcqOptions`
2. Click radio button → Updates `formData.correct_answer`
3. Submit form → Combines both into final data

This is a common React pattern for forms with multiple inputs and selection! 🚀

