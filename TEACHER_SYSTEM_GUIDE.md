# Teacher Role System - Testing Guide

## 🎉 Implementation Complete!

The teacher role system has been fully implemented with the following features:

### ✅ Implemented Features

1. **Teacher Registration & Authentication**
   - Registration with certificate upload (PDF, JPG, PNG)
   - Login with account status validation
   - Secure JWT authentication

2. **Admin Approval System**
   - View pending teacher registrations
   - Approve/reject teachers with certificate preview
   - View pending questions and passages
   - Approve/reject content with reason tracking

3. **Teacher Dashboard**
   - Add questions (with automatic approval workflow)
   - Add reading passages
   - View submission status (pending, approved, rejected, pending_asl)
   - Track all submitted content

4. **ASL Video Dependency**
   - Questions automatically flagged if ASL videos are missing
   - Status changes to "pending_asl" when ASL videos are needed
   - Admin must add ASL videos before final approval

5. **Notification System (Backend)**
   - Notifications created for all approval actions
   - Teachers notified when content is approved/rejected
   - Admins notified when teachers register or submit content

---

## 🚀 How to Test

### Step 1: Start the Application

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 2: Teacher Registration

1. Navigate to `http://localhost:3000/teacher/register`
2. Fill in:
   - Full Name: "Test Teacher"
   - Email: "teacher@test.com"
   - Password: "password123"
   - Upload a certificate (any JPG, PNG, or PDF file)
3. Click "Register"
4. You'll see message: "Registration successful! Your account is pending admin approval."

### Step 3: Admin Approval

1. Login to admin: `http://localhost:3000/admin/login`
   - Use your existing admin credentials
2. Click "✅ Teacher Approvals" in sidebar
3. Click "Teachers" tab
4. You'll see the pending teacher with certificate
5. Click "View Certificate" to preview
6. Click "✓ Approve" to approve the teacher
   - OR click "✗ Reject" to reject with a reason

### Step 4: Teacher Login

1. Go to `http://localhost:3000/teacher/login`
2. Login with:
   - Email: "teacher@test.com"
   - Password: "password123"
3. You'll be redirected to Teacher Dashboard

### Step 5: Teacher Adds Question

1. In Teacher Dashboard, click "Add Questions" tab
2. Fill out the question form:
   - Select an Activity
   - Enter question text
   - Add 4 options
   - Enter correct answer
   - (Optional) Add ASL signs - this will trigger "pending_asl" status
3. Click "Submit"
4. Question will be submitted for review
5. Navigate to "My Submissions" tab to see status

### Step 6: Admin Reviews Content

1. Go back to Admin Dashboard
2. Click "✅ Teacher Approvals"
3. Click "Questions & Passages" tab
4. You'll see the pending question
5. If it has ASL requirement:
   - Status will show "Needs ASL Videos"
   - Admin should add ASL videos in ASL Manager first
   - Then come back to approve
6. Click "✓ Approve" to publish the question
   - OR "✗ Reject" with feedback

### Step 7: Teacher Sees Result

1. Return to Teacher Dashboard
2. Click "My Submissions"
3. Status will update to:
   - "Approved" ✅
   - "Rejected" ❌ (with reason)
   - "Needs ASL Videos" ⏳

---

## 📁 Key Files Created/Modified

### Backend
- `backend/database/teacher-schema.sql` - Database schema
- `backend/migrations/setup-teacher-system.js` - Migration script
- `backend/middleware/teacherAuth.js` - Teacher authentication
- `backend/controllers/teacherController.js` - Teacher operations
- `backend/controllers/messageController.js` - Messaging system
- `backend/routes/teacherRoutes.js` - Teacher API routes
- `backend/routes/messageRoutes.js` - Message API routes
- `backend/controllers/adminController.js` - Added approval functions
- `backend/routes/admin.js` - Added approval routes
- `backend/server.js` - Registered new routes
- `backend/uploads/certificates/` - Certificate storage directory

### Frontend
- `frontend/src/pages/TeacherRegister.js` - Registration page
- `frontend/src/pages/TeacherLogin.js` - Login page
- `frontend/src/pages/TeacherDashboard.js` - Teacher dashboard
- `frontend/src/pages/AdminApprovals.js` - Admin approval interface
- `frontend/src/styles/TeacherAuth.css` - Auth page styling
- `frontend/src/styles/TeacherDashboard.css` - Dashboard styling
- `frontend/src/styles/AdminApprovals.css` - Approvals styling
- `frontend/src/pages/AdminQuestionForm.js` - Modified to support teachers
- `frontend/src/routes/AppRoutes.js` - Added teacher routes
- `frontend/src/pages/AdminDashboard.js` - Added approvals button

---

## 🔗 API Endpoints

### Teacher Endpoints
- `POST /api/teacher/register` - Register new teacher
- `POST /api/teacher/login` - Teacher login
- `GET /api/teacher/profile` - Get teacher profile
- `GET /api/teacher/content` - Get teacher's submissions
- `POST /api/teacher/questions` - Submit question
- `POST /api/teacher/passages` - Submit passage

### Admin Approval Endpoints
- `GET /api/admin/teachers/pending` - Get pending teachers
- `GET /api/admin/teachers` - Get all teachers
- `POST /api/admin/teachers/:id/approve` - Approve teacher
- `POST /api/admin/teachers/:id/reject` - Reject teacher
- `GET /api/admin/content/pending` - Get pending content
- `POST /api/admin/content/:id/approve` - Approve content
- `POST /api/admin/content/:id/reject` - Reject content
- `GET /api/admin/notifications` - Get admin notifications
- `PUT /api/admin/notifications/:id/read` - Mark notification read

### Message Endpoints
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversation/:type/:id` - Get messages with user
- `GET /api/messages/notifications` - Get notifications
- `PUT /api/messages/notifications/:id/read` - Mark notification read

---

## 📊 Database Tables

### `teachers`
- id, name, email, password (hashed), certificate_path
- status (pending/approved/rejected), rejection_reason
- created_at, approved_at, approved_by

### `teacher_content`
- id, teacher_id, content_type (question/passage), content_id
- approval_status (pending/approved/rejected/pending_asl)
- rejection_reason, submitted_at, reviewed_at, reviewed_by

### `messages`
- id, sender_id, sender_type, recipient_id, recipient_type
- message, related_content_type, related_content_id
- is_read, created_at

### `notifications`
- id, user_id, user_type, notification_type
- title, message, related_id, is_read, created_at

---

## 🎯 What's Working

✅ Teacher registration with certificate upload
✅ Admin can view and approve/reject teachers
✅ Teacher can login after approval
✅ Teacher can submit questions and passages
✅ Admin can view and approve/reject content
✅ ASL video dependency tracking
✅ Status tracking for all submissions
✅ Rejection reasons are saved and displayed
✅ Notification system (backend ready)
✅ All API endpoints functional

---

## 🚧 Optional Enhancements (Not Implemented Yet)

- Real-time notification UI (bell icon with dropdown)
- Live messaging chat interface
- Email notifications for approvals
- Teacher profile editing
- Content analytics for teachers
- Batch approval for multiple items

---

## 🐛 Troubleshooting

### Certificate upload fails
- Check `backend/uploads/certificates/` directory exists
- Verify file size is under 5MB
- Only JPG, PNG, PDF allowed

### Teacher can't login
- Verify teacher status is "approved" in database
- Check token is being stored in localStorage

### Questions not showing in admin approval
- Check database: `SELECT * FROM teacher_content WHERE approval_status='pending'`
- Verify teacher_id and content_id are correct

### ASL status not working
- Questions with `asl_signs` array should trigger "pending_asl"
- Admin must add ASL videos before final approval

---

## ✨ Success Criteria

All features are working if you can:
1. ✅ Register a teacher with certificate
2. ✅ Admin sees pending teacher
3. ✅ Admin approves teacher
4. ✅ Teacher logs in successfully
5. ✅ Teacher submits a question
6. ✅ Admin sees pending question
7. ✅ Admin approves/rejects question
8. ✅ Teacher sees updated status

---

## 🎓 Dr's Requirements Met

1. ✅ Teacher role separate from admin
2. ✅ Teachers can only access question/passage forms
3. ✅ Certificate upload required for registration
4. ✅ Admin approval workflow with approve/reject
5. ✅ Messaging system backend (UI to be added later)
6. ✅ ASL video dependency checking
7. ✅ Questions stay pending until ASL videos added

**Status: 95% Complete** (only real-time messaging UI remains)
