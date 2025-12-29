# 🧭 SmartStep Codebase Navigation Quiz

Test your knowledge of navigating the SmartStep codebase! This quiz covers finding components, functions, API calls, routes, and controllers.

---

## 📝 Quiz Questions

### **Question 1: Finding the Component File**
**Where is the "Reject Teacher" button rendered?**

<details>
<summary>Show Hint</summary>

Look in the pages folder for admin-related functionality dealing with approvals.
</details>

<details>
<summary>Show Answer</summary>

**File:** `frontend/src/pages/AdminApprovals.js`

**How to find it:**
1. Think about the feature: "Rejecting teachers" → Admin feature → Approvals
2. Search: `grep_search` for "reject" in `frontend/src/**/*.js`
3. Or navigate: `frontend/src/pages/` → Look for `AdminApprovals.js`
</details>

---

### **Question 2: Finding the Function**
**What function is called when the admin clicks the "Reject" button for a teacher?**

<details>
<summary>Show Hint</summary>

Look for event handlers in the AdminApprovals component that handle rejection actions.
</details>

<details>
<summary>Show Answer</summary>

**Function:** `handleRejectTeacher(teacher)`

**Location:** `frontend/src/pages/AdminApprovals.js` (around line 83)

**How to find it:**
1. Open the component file: `AdminApprovals.js`
2. Search for "onClick" or "reject" within the file
3. Look for functions starting with "handle" that contain "reject"
</details>

---

### **Question 3: Finding the API Call**
**What API endpoint is called when submitting a teacher rejection with a reason?**

<details>
<summary>Show Hint</summary>

Check the `submitRejection` function in AdminApprovals - it makes a fetch call to the backend.
</details>

<details>
<summary>Show Answer</summary>

**API Endpoint:** `POST http://localhost:5001/api/admin/teachers/${teacherId}/reject`

**Location:** `frontend/src/pages/AdminApprovals.js` (around line 123)

**How to find it:**
1. In `AdminApprovals.js`, find the `submitRejection` function (line ~115)
2. Look for `fetch()` calls
3. Or search: `grep_search` for "teachers.*reject" in the file
</details>

---

### **Question 4: Finding the Route**
**What backend route file handles the teacher rejection endpoint?**

<details>
<summary>Show Hint</summary>

Look at the URL pattern - it starts with `/api/admin/`. Check the backend routes folder.
</details>

<details>
<summary>Show Answer</summary>

**Route File:** `backend/routes/admin.js`

**How to find it:**
1. The API path is `/api/admin/teachers/:id/reject`
2. Navigate to `backend/routes/`
3. Look for `admin.js` (handles all `/api/admin/*` routes)
4. Or check `backend/server.js` to see route mappings
</details>

---

### **Question 5: Finding the Controller**
**What controller function processes the teacher rejection logic?**

<details>
<summary>Show Hint</summary>

Controllers are imported at the top of route files. Check the admin.js route file for imported functions.
</details>

<details>
<summary>Show Answer</summary>

**Controller Function:** `rejectTeacher`

**Location:** `backend/controllers/adminController.js`

**How to find it:**
1. Open `backend/routes/admin.js`
2. Look at the imports at the top - you'll see controller functions being imported
3. Find where `rejectTeacher` is imported from (it's from `adminController`)
4. Navigate to `backend/controllers/adminController.js`
5. Or search: `grep_search` for "rejectTeacher" in backend folder
</details>

---

### **Question 6: Finding a Feature Flow**
**A student wants to see their achievements. Trace the complete flow from component to database.**

<details>
<summary>Show Hint</summary>

Think: Component → API Call → Route → Controller → Database Query
</details>

<details>
<summary>Show Answer</summary>

**Complete Flow:**

1. **Component:** `frontend/src/pages/Achievements.js`
   - Displays the achievement badges and progress

2. **API Call:** Fetch to `http://localhost:5001/api/achievements/:userId`
   - Made using `fetch()` with user ID from context/localStorage

3. **Route:** `backend/routes/achievements.js`
   - Defines the GET endpoint `/api/achievements/:userId`

4. **Controller:** `backend/controllers/achievementController.js`
   - Contains the business logic for fetching user achievements

5. **Database:** Queries the `achievement` and `user_achievement` tables
   - Joins tables to get achievement details and user progress

**How to trace it:**
- Start at the component → Find the fetch call
- Copy the endpoint → Search for it in `backend/routes/`
- Find the route → Check which controller function is called
- Open the controller → See the database queries
</details>

---

### **Question 7: Finding the Middleware**
**What middleware protects the teacher profile endpoint from unauthorized access?**

<details>
<summary>Show Hint</summary>

Look at the teacher routes file and see what's applied before the route handler.
</details>

<details>
<summary>Show Answer</summary>

**Middleware:** `teacherAuth`

**Location:** `backend/middleware/teacherAuth.js`

**How to find it:**
1. Open `backend/routes/teacherRoutes.js`
2. Look for the profile route: `router.get('/profile', ...)` (line ~48)
3. Notice `teacherAuth` is passed before the controller
4. Check the import at the top to find: `backend/middleware/teacherAuth.js`

**What it does:** Verifies the teacher's JWT token and attaches teacher info to the request
</details>

---

### **Question 8: Finding Configuration**
**Where is the database connection configured?**

<details>
<summary>Show Hint</summary>

Look for a config folder in the backend directory.
</details>

<details>
<summary>Show Answer</summary>

**File:** `backend/config/database.js`

**How to find it:**
1. Navigate to `backend/config/`
2. Look for `database.js`
3. Or search for "mysql" or "createPool" in the backend folder
4. Or check imports in `server.js` or controller files

**Contains:** Database connection settings, pool configuration, and query helper functions
</details>

---

### **Question 9: Finding File Upload Configuration**
**Where is the multer configuration for teacher certificate uploads?**

<details>
<summary>Show Hint</summary>

File upload handling is typically configured in route files near where uploads are accepted.
</details>

<details>
<summary>Show Answer</summary>

**Location:** `backend/routes/teacherRoutes.js` (lines ~17-41)

**How to find it:**
1. Think about the feature: Teachers upload certificates during registration
2. Open `backend/routes/teacherRoutes.js`
3. Look for `multer.diskStorage` configuration
4. Or search: `grep_search` for "multer" or "certificate" in backend routes

**Details:**
- Storage destination: `uploads/certificates/`
- File size limit: 5MB
- Allowed types: jpeg, jpg, png, pdf
</details>

---

### **Question 10: Cross-Feature Challenge**
**The admin approves a teacher. What happens next? Trace the complete flow including all files involved.**

<details>
<summary>Show Hint</summary>

Start at the UI button, follow to the API, then backend route, controller, and database update.
</details>

<details>
<summary>Show Answer</summary>

**Complete Flow:**

1. **User Action:** Admin clicks "Approve" button
   - **File:** `frontend/src/pages/AdminApprovals.js`
   - **Function:** `handleApproveTeacher(teacher)` (line ~68)

2. **API Call:** 
   - **Endpoint:** `PUT http://localhost:5001/api/admin/teachers/${teacherId}/approve`
   - **Headers:** Authorization Bearer token
   - **File:** Same component, inside the handleApproveTeacher function

3. **Backend Route:**
   - **File:** `backend/routes/admin.js`
   - **Route Definition:** `router.put('/teachers/:id/approve', adminAuth, approveTeacher)`
   - **Middleware:** `adminAuth` verifies admin token first

4. **Controller:**
   - **File:** `backend/controllers/adminController.js`
   - **Function:** `approveTeacher(req, res)`
   - **Action:** Updates teacher status to 'approved' in database

5. **Database:**
   - **Table:** `teacher`
   - **Update:** Sets `is_approved = 1` for the specified teacher_id
   - **Additional:** May send a notification or message to the teacher

6. **Response:**
   - Returns success/failure to frontend
   - Frontend refreshes the pending teachers list
   - Approved teacher disappears from the approvals page

**How to trace yourself:**
1. Start at `AdminApprovals.js` → Find button's onClick
2. Follow the fetch call → Note the endpoint
3. Open `backend/routes/admin.js` → Search for the route
4. Check imports → Find `approveTeacher` controller
5. Open `adminController.js` → Read the implementation
</details>

---

## 🎯 Bonus Challenge

**Challenge:** Add a new "Ban Teacher" feature. List all the files you would need to modify or create.

<details>
<summary>Show Answer</summary>

**Files to Modify/Create:**

1. **Frontend Component:**
   - `frontend/src/pages/AdminApprovals.js` (or create `AdminTeacherManagement.js`)
   - Add "Ban" button, modal, and handler function

2. **API Call:**
   - Optionally create `frontend/src/api/admin.js` helper function
   - Or make direct fetch call in component

3. **Backend Route:**
   - `backend/routes/admin.js`
   - Add: `router.put('/teachers/:id/ban', adminAuth, banTeacher)`

4. **Backend Controller:**
   - `backend/controllers/adminController.js`
   - Create: `banTeacher` function
   - Update database: Set teacher status to 'banned'

5. **Database:**
   - May need to run migration to add 'banned' status if not exists
   - Or use existing status field

6. **Optional Enhancements:**
   - `backend/controllers/messageController.js` - Send ban notification
   - `backend/middleware/teacherAuth.js` - Block banned teachers from logging in
   - CSS styling for ban status indicators

</details>

---

## 📊 Scoring Guide

- **8-10 correct:** 🌟 Navigation Master! You can find your way around the codebase with ease!
- **5-7 correct:** 📍 Getting there! You understand the basic structure and flow.
- **3-4 correct:** 🗺️ Keep practicing! Review the folder structure and naming conventions.
- **0-2 correct:** 🧭 Start exploring! Begin with README.md and trace one complete feature flow.

---

## 💡 Pro Navigation Tips

1. **Start with the UI:** When tracking a feature, start at the component where the user interacts
2. **Follow the data:** API calls in components → Routes in backend → Controllers → Database
3. **Use file names:** React components match their function (AdminApprovals handles approvals)
4. **Check imports:** Top of files show dependencies and related files
5. **Search strategically:** Use `grep_search` for function names, `file_search` for file patterns
6. **Naming patterns matter:** 
   - Routes: plural (teachers, achievements)
   - Controllers: singular + Controller (teacherController)
   - Components: PascalCase descriptive names

---

Good luck! 🚀
