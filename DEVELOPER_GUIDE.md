# SmartStep Developer Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [ASL System](#asl-system)
3. [Level Structure](#level-structure)
4. [Achievement System](#achievement-system)

---

## Quick Start

### Running the Application
```bash
# Backend
cd backend
npm install
npm start  # Runs on port 5000

# Frontend
cd frontend
npm install
npm start  # Runs on port 3000
```

### Database
- MySQL database: `Smart Step Learning1`
- Configure in `backend/.env`

---

## ASL System

### Video Organization
```
frontend/public/asl/
├── words/        # Word videos (tom.mp4, had.mp4, stickers.mp4, etc.)
├── numbers/      # Number videos (0.mp4 - 100.mp4)
└── operations/   # Operation videos (plus.mp4, minus.mp4, etc.)
```

### Adding ASL to Questions

**Method: Auto-Mapper Script (Recommended)**

1. Open `backend/auto-add-asl.js`
2. Change `QUESTION_ID` to your question ID
3. Run: `node auto-add-asl.js`
4. Review mapping and type "yes" to save

**Example:**
```javascript
const QUESTION_ID = 64; // Your question ID
```

The script automatically:
- Reads question from database
- Scans available ASL videos
- Maps words/numbers to videos
- Shows preview with missing videos
- Saves to database

### Adding New ASL Videos
```bash
# Copy word videos
cp ~/Downloads/"asl words"/*.mp4 "frontend/public/asl/words/"

# Copy number videos  
cp ~/Downloads/"asl numbers"/*.mp4 "frontend/public/asl/numbers/"
```

**Naming Convention:**
- Words: lowercase, hyphens for compounds (e.g., `how-many.mp4`)
- Numbers: just the number (e.g., `22.mp4`, `100.mp4`)
- Operations: operation name (e.g., `plus.mp4`)

---

## Level Structure

### Operations & Activities
Each operation (Addition, Subtraction, Multiplication, Division) has 6 levels:

**Addition (Activities 7-14):**
- Beginner L1 (7): Simple addition 1-10
- Beginner L2 (8): Word problems 10-50
- Intermediate L1 (10): Numbers 11-28
- Intermediate L2 (11): 3-step word problems
- Advanced L1 (13): Large numbers, 3-4 addends
- Advanced L2 (14): Complex word problems, totals 100+

**Subtraction (16-23), Multiplication (25-32), Division (34-41):** Same structure

### Unlocking System
- Start: Beginner L1 always unlocked
- Requirement: 80%+ score to unlock next level
- Progress tracked in `child_progress` table

### Timer Durations
- **Beginner**: 30 seconds
- **Intermediate**: 60 seconds (1 minute)
- **Advanced**: 90 seconds (1.5 minutes)

### Creating Questions

**Option 1: Database Script**
```javascript
// Create script like: create-intermediate-l2-questions.js
const questions = [
  {
    text: "Tom had 10 stickers...",
    options: ["33", "25", "43", "23"],
    correct: 1  // Index of correct answer
  }
];
// Insert into Question table
```

**Option 2: Admin Panel**
- Login as admin
- Navigate to "Add Question"
- Select activity
- Enter question details
- Submit

---

## Achievement System

### Points System
- **Correct Answer**: 10 points (default)
- Stored in `child_account.total_points`

### Achievements
Automatically awarded based on points:

| Points | Badge | Name |
|--------|-------|------|
| 10 | 🌟 | First Steps |
| 50 | ⭐ | Rising Star |
| 100 | 🏆 | Champion |
| 200 | 👑 | Master |

### How It Works
1. Student answers question correctly (+10 points)
2. Backend checks if new milestone reached
3. Auto-awards achievement badge
4. Displays on profile page

---

## Common Tasks

### Add Questions to a New Level
1. Find activity ID (e.g., Activity 11 = Addition Intermediate L2)
2. Create questions script or use admin panel
3. Add ASL using `auto-add-asl.js` for each question

### Fix Missing ASL Videos
1. Check error in browser console (missing video path)
2. Download/create the video file
3. Copy to correct folder (words/numbers/operations)
4. Refresh browser

### Troubleshooting
- **ASL not playing**: Check video path in database `asl_signs` field
- **Level locked**: Check `child_progress` table for 80%+ completion
- **Timer wrong**: Check `level` parameter in URL and `getTimerDuration()`

---

## File Structure
```
backend/
├── auto-add-asl.js         # ASL auto-mapper
├── controllers/
│   ├── progressController.js
│   ├── achievementController.js
│   └── adminController.js
├── routes/
└── database/
    └── schema.sql

frontend/
├── src/
│   ├── components/
│   │   └── ASLPlayer.js    # Video player component
│   ├── pages/
│   │   ├── MathQuiz.js     # Quiz with timer
│   │   └── MathLevels.js   # Level selection
│   └── utils/
│       └── aslTranslator.js
└── public/
    └── asl/                # Video files
```

---

## Quick Reference

**Get Question IDs:**
```sql
SELECT question_id, question_text FROM Question WHERE activity_id = 11;
```

**Check Student Progress:**
```sql
SELECT * FROM child_progress WHERE child_id = 1;
```

**Add ASL to Question:**
```bash
# Edit QUESTION_ID in auto-add-asl.js, then:
node auto-add-asl.js
```
