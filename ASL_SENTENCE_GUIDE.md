# How to Add ASL Translation to Sentence Questions

## 🎯 Quick Answer: It's Automatic!

When you add a question like **"Tom ate an apple"** from the admin panel, the system **automatically translates it to ASL** - you don't need to do anything special!

## 📝 Step-by-Step Example

### 1. Add a Question from Admin Panel

```
Question Text: Tom ate an apple
Activity: English Comprehension
ASL Type: sentence (or leave it, system auto-detects)
```

### 2. What Happens Automatically

The system:
1. ✅ Detects it's a sentence (not math)
2. ✅ Breaks it into words: ["tom", "ate", "an", "apple"]
3. ✅ Looks for ASL videos in `/public/asl/words/` folder:
   - `tom.mp4` → plays if exists, shows "Tom" text if not
   - `ate.mp4` → plays if exists, shows "ate" text if not
   - `an.mp4` → plays if exists, shows "an" text if not
   - `apple.mp4` → plays if exists, shows "apple" text if not
4. ✅ Displays ASL Player above the question
5. ✅ Students can play through each word's ASL sign

### 3. Adding ASL Videos for Words

To make the translation show actual sign language videos:

```
frontend/public/asl/words/
  ├── tom.mp4         (ASL sign for name "Tom")
  ├── ate.mp4         (ASL sign for "eat/ate")
  ├── an.mp4          (ASL sign for "a/an")
  ├── apple.mp4       (ASL sign for "apple")
  ├── the.mp4
  ├── cat.mp4
  ├── dog.mp4
  └── ... (add more as needed)
```

**Download free ASL videos from:**
- https://www.lifeprint.com/ (ASL University)
- https://www.signingsavvy.com/ (has download option)
- https://www.handspeak.com/
- YouTube: Search "ASL word [word]" and download

### 4. How It Works in the App

**For Students:**
```
Question appears: "Tom ate an apple"

ASL Player shows:
┌─────────────────────────────────┐
│  🎬 ASL Translation              │
│  ┌──────────────────────┐       │
│  │   [Video playing]     │       │
│  │   "Tom"               │       │
│  └──────────────────────┘       │
│  [Tom] [ate] [an] [apple]       │  ← Click each word
│    ↑                             │
│  ▶️ ⏸️ ⏮️ ⏭️                      │  ← Controls
└─────────────────────────────────┘
```

## 🚀 Run the Setup Script (Optional)

To mark existing English questions for ASL translation:

```bash
cd backend
node auto-add-sentence-asl.js
```

This sets all English questions to use automatic sentence translation.

## ✨ Current Status

✅ **Already Working:**
- Automatic sentence detection
- Word-by-word ASL playback
- Fallback to text when videos missing
- Interactive controls (play, pause, skip)

⏳ **You Need to Add:**
- ASL video files for common words in `/public/asl/words/`

📊 **Currently Have:**
- Numbers: 0-4.mp4 ✅
- Operations: plus.mp4 ✅
- Words: Need to add (apple.mp4, ate.mp4, tom.mp4, etc.)

## 💡 Pro Tips

1. **Start with common words**: the, a, an, is, was, I, you, he, she
2. **Add topic words**: For English lessons, add words related to the lesson
3. **Proper names**: Add common names (Tom, Mary, John) as needed
4. **File naming**: Always lowercase, no spaces (e.g., `ice_cream.mp4`)

## 🎨 Example Questions That Work

```
✅ "Tom ate an apple"        → Translates word-by-word
✅ "The cat is happy"         → Translates word-by-word  
✅ "I love reading books"     → Translates word-by-word
✅ "What is 5 + 3?"           → Already works with numbers!
```

## 🔧 No Code Changes Needed!

The system is **already built and working**. You just need to:
1. Add questions from admin panel (normal process)
2. Optionally add ASL word videos to `/public/asl/words/`
3. The system does everything else automatically!

---

**Questions? The ASL translator is in:**
- `/frontend/src/utils/aslTranslator.js` - Translation logic
- `/frontend/src/components/ASLPlayer.js` - Display component
