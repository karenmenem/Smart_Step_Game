# ASL Video Integration - Complete Setup Guide

## ✅ What's Been Implemented

### Database Schema
- ✅ Added `asl_video_url` column (VARCHAR 500) to store video URLs
- ✅ Added `asl_type` column (ENUM: 'numbers', 'video', 'both', 'none')
- ✅ Created admin table with default user
- ✅ Added example questions with ASL videos

### Backend API
- ✅ Quiz controller returns `aslVideoUrl` and `aslType` with questions
- ✅ Admin controller supports creating/editing questions with video URLs
- ✅ All CRUD operations include ASL video fields

### Frontend
- ✅ MathQuiz displays videos based on `aslType`:
  - `'numbers'` - Shows animated hand signs
  - `'video'` - Shows embedded video iframe
  - `'both'` - Shows hand signs + video
  - `'none'` - No ASL support
- ✅ QuestionForm includes:
  - ASL Type dropdown selector
  - ASL Signs input (for numbers)
  - ASL Video URL input with preview
  - Conditional rendering based on selection
- ✅ AdminDashboard shows ASL type badges

---

## 🎯 How to Use

### For Simple Math (1-10)
Use `asl_type = 'numbers'` with `asl_signs` array:
```javascript
{
  question_text: "What is 2 + 3?",
  asl_signs: [2, 3],
  asl_type: "numbers",
  asl_video_url: null
}
```
**Result**: Animated hand signs for 2 and 3

---

### For Complex Numbers (100+)
Use `asl_type = 'video'` with `asl_video_url`:
```javascript
{
  question_text: "What is 100 + 167?",
  asl_signs: null,
  asl_type: "video",
  asl_video_url: "https://www.youtube.com/embed/VIDEO_ID"
}
```
**Result**: Embedded YouTube video showing ASL for "100 + 167"

---

### For Paragraphs / Complex Text
Use `asl_type = 'video'` with video demonstration:
```javascript
{
  question_text: "Read this paragraph: [long text]. What is the main idea?",
  asl_signs: null,
  asl_type: "video",
  asl_video_url: "https://www.youtube.com/embed/PARAGRAPH_VIDEO"
}
```
**Result**: Video showing ASL interpreter signing the entire paragraph

---

### For Both (Hybrid)
Use `asl_type = 'both'` with both fields:
```javascript
{
  question_text: "What is 5 + 7?",
  asl_signs: [5, 7],
  asl_type: "both",
  asl_video_url: "https://www.youtube.com/embed/DEMO_VIDEO"
}
```
**Result**: Hand signs for 5 and 7 + demonstration video below

---

## 🔗 Where to Get ASL Videos

### Top Resources (See ASL_VIDEO_RESOURCES.md for full list)

1. **Bill Vicars (YouTube)** - Best for education
   - https://www.youtube.com/@billvicars
   - Search for: "ASL numbers 100-200", "ASL addition", etc.
   - Click Share → Embed → Copy URL

2. **ASL Signing Savvy** - High quality dictionary
   - https://www.signingsavvy.com/
   - Search any word/number
   - Copy video link

3. **Sign ASL** - Free numbers dictionary
   - https://www.signasl.org/
   - Numbers 0-1,000,000 available

---

## 📝 Adding Questions via Admin Panel

### Step-by-Step:

1. **Login to Admin**
   ```
   URL: http://localhost:3000/admin/login
   Username: admin
   Password: admin123
   ```

2. **Navigate to Questions Tab**

3. **Click "Add Question"**

4. **Fill the Form**:
   - **Question Text**: "What is 100 + 167?"
   - **Activity**: Select from dropdown
   - **Options**: 267, 257, 277, 367
   - **Correct Answer**: 267
   - **ASL Type**: Select "Video Only"
   - **ASL Video URL**: Paste embed URL
     ```
     https://www.youtube.com/embed/YOUR_VIDEO_ID
     ```

5. **Preview** the video in the form

6. **Save** - Question is now in database!

---

## 🎥 Getting YouTube Embed URLs

### Method 1: From YouTube Video
1. Open the ASL video on YouTube
2. Click **"Share"** button below video
3. Click **"Embed"**
4. Copy the URL from the `src` attribute:
   ```html
   <iframe src="https://www.youtube.com/embed/AbC123XyZ"></iframe>
   ```
5. Use: `https://www.youtube.com/embed/AbC123XyZ`

### Method 2: Manual Format
If you have regular URL: `https://www.youtube.com/watch?v=AbC123XyZ`
Convert to embed: `https://www.youtube.com/embed/AbC123XyZ`

---

## 🧪 Testing Your Setup

### 1. Check Database Migration
```bash
cd backend
node migrate-asl-video.js
```
Should show:
- ✅ asl_video_url column exists
- ✅ asl_type column exists
- ✅ 2 video-type questions added

### 2. Test Backend API
```bash
curl http://localhost:5000/api/quiz/questions/3
```
Should return questions with `aslVideoUrl` and `aslType` fields

### 3. Test Frontend Display
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Login as child
4. Navigate to Advanced Addition (Level 3)
5. Should see embedded video for complex problems

---

## 💡 Use Cases & Examples

### Use Case 1: Large Number Addition
**Problem**: Can't show ASL hand signs for 100, 167, 267
**Solution**: Use video with ASL interpreter

```sql
INSERT INTO question (
  activity_id, 
  question_text, 
  question_type, 
  correct_answer, 
  options, 
  asl_video_url, 
  asl_type
) VALUES (
  3, 
  'What is 100 + 167?', 
  'multiple_choice', 
  '267', 
  '["267", "257", "277", "367"]',
  'https://www.youtube.com/embed/ASL_100_167',
  'video'
);
```

---

### Use Case 2: Word Problems
**Problem**: "Sarah has 234 apples. She gives 89 away. How many left?"
**Solution**: Video interpreter signs entire problem

```sql
INSERT INTO question (
  activity_id, 
  question_text, 
  question_type, 
  correct_answer, 
  options, 
  asl_video_url, 
  asl_type
) VALUES (
  3, 
  'Sarah has 234 apples. She gives 89 to her friend. How many does she have left?', 
  'multiple_choice', 
  '145', 
  '["145", "155", "135", "165"]',
  'https://www.youtube.com/embed/WORD_PROBLEM_VIDEO',
  'video'
);
```

---

### Use Case 3: Reading Comprehension
**Problem**: Full paragraph needs ASL interpretation
**Solution**: Video with paragraph signed in ASL

```sql
INSERT INTO question (
  activity_id, 
  question_text, 
  question_type, 
  correct_answer, 
  options, 
  asl_video_url, 
  asl_type
) VALUES (
  4, 
  'Read this paragraph: [Once upon a time, there lived a wise old owl in a tall oak tree. Every night, the animals would gather to hear his stories. What is the main idea?]', 
  'multiple_choice', 
  'The owl tells stories to animals', 
  '["The owl tells stories to animals", "Trees are tall", "Night is dark", "Owls are wise"]',
  'https://www.youtube.com/embed/PARAGRAPH_ASL',
  'video'
);
```

---

## 🔧 Troubleshooting

### Video Not Displaying?
**Check:**
1. URL is in embed format: `https://www.youtube.com/embed/VIDEO_ID`
2. Video allows embedding (not all videos do)
3. URL is saved in database (check with SQL query)
4. Browser console for iframe errors

**Test URL manually:**
```html
<iframe src="YOUR_URL" width="400" height="225"></iframe>
```

---

### Database Column Missing?
Run migration again:
```bash
cd backend
node migrate-asl-video.js
```

---

### Admin Can't Add Questions?
1. Check admin is logged in
2. Verify token in localStorage
3. Check backend console for errors
4. Verify admin routes are protected correctly

---

## 📊 Current Database Stats

After migration:
- **Total Questions**: 12
  - 10 with `asl_type = 'numbers'` (simple 1-10)
  - 2 with `asl_type = 'video'` (complex 100+)
  - 0 with `asl_type = 'both'`

---

## 🎨 UI Features

### Question Display
- Simple numbers: Animated hand signs with CSS
- Videos: YouTube iframe embedded
- Both: Hand signs above, video below
- None: Text only

### Admin Form
- Dropdown to select ASL type
- Conditional fields based on selection
- Live video preview in form
- Validation for required fields

---

## 🚀 Next Steps

### Immediate:
1. ✅ Database schema updated
2. ✅ Backend API supports video URLs
3. ✅ Frontend displays videos
4. ✅ Admin form includes video fields
5. ⏳ Find real ASL videos for questions
6. ⏳ Test complete workflow end-to-end

### Future Enhancements:
- Video library management
- Upload custom ASL videos
- ASL video search within admin panel
- Video thumbnails in question list
- Video playback speed controls
- Captions/subtitles support

---

## 📚 Resources

- **Full Resource List**: See `ASL_VIDEO_RESOURCES.md`
- **Database Schema**: See `backend/database/schema.sql`
- **API Docs**: See backend controllers
- **Frontend Components**: See `frontend/src/components/Admin/`

---

## ✨ Summary

You now have a complete ASL video integration system that supports:
- ✅ Simple number hand signs (1-10)
- ✅ Complex number videos (100+)
- ✅ Paragraph/text interpretation videos
- ✅ Admin panel to manage all of it
- ✅ Dynamic database-driven content

**No more limitations!** You can now create questions for ANY complexity level with proper ASL support through video URLs.

---

**Last Updated**: November 4, 2025
