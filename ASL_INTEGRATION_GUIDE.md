# ASL Integration Guide

## 🤟 Overview
This system allows you to add ASL translations to ANY content in your app:
- Simple numbers (1, 2, 3...)
- Multi-digit numbers (23, 47, 123...)
- Math expressions (23 + 15 = 38)
- English words and sentences
- Full paragraphs for comprehension questions

## 📊 How It Works

### 1. **For Math Questions (Numbers)**

#### Simple Addition (1-digit):
```javascript
{
  question_text: "What is 2 + 3?",
  asl_signs: JSON.stringify([2, "plus", 3]),  // Auto-converts to ASL videos
  asl_type: "numbers",
  correct_answer: "5"
}
```

#### 2-Digit Addition:
```javascript
{
  question_text: "What is 23 + 15?",
  asl_signs: JSON.stringify([2, 3, "plus", 1, 5]),  // Each digit separately
  asl_type: "numbers",
  correct_answer: "38"
}
```

#### Using Custom Videos:
```javascript
{
  question_text: "What is 47 + 15?",
  asl_video_url: JSON.stringify([
    "https://your-asl-videos.com/4.mp4",
    "https://your-asl-videos.com/7.mp4",
    "https://your-asl-videos.com/plus.mp4",
    "https://your-asl-videos.com/1.mp4",
    "https://your-asl-videos.com/5.mp4"
  ]),
  asl_type: "video",
  correct_answer: "62"
}
```

#### Using Images:
```javascript
{
  question_text: "What is 23 + 15?",
  asl_image_url: JSON.stringify([
    "/asl-images/2.png",
    "/asl-images/3.png",
    "/asl-images/plus.png",
    "/asl-images/1.png",
    "/asl-images/5.png"
  ]),
  asl_type: "images",
  correct_answer: "38"
}
```

### 2. **For English Comprehension (Sentences)**

#### Short Sentence:
```javascript
{
  question_text: "What is the cat doing?",
  asl_video_url: JSON.stringify([
    "/asl/words/what.mp4",
    "/asl/words/is.mp4",
    "/asl/words/the.mp4",
    "/asl/words/cat.mp4",
    "/asl/words/doing.mp4",
    "/asl/special/question.mp4"
  ]),
  asl_type: "video",
  correct_answer: "Playing"
}
```

#### Paragraph (Story):
```javascript
{
  question_text: "The dog ran to the park. He played with his ball. Then he went home.",
  asl_video_url: JSON.stringify([
    // Sentence 1
    "/asl/words/the.mp4",
    "/asl/words/dog.mp4",
    "/asl/words/ran.mp4",
    "/asl/words/to.mp4",
    "/asl/words/the.mp4",
    "/asl/words/park.mp4",
    "/asl/special/period.mp4",
    // Sentence 2
    "/asl/words/he.mp4",
    "/asl/words/played.mp4",
    "/asl/words/with.mp4",
    "/asl/words/his.mp4",
    "/asl/words/ball.mp4",
    "/asl/special/period.mp4",
    // Sentence 3
    "/asl/words/then.mp4",
    "/asl/words/he.mp4",
    "/asl/words/went.mp4",
    "/asl/words/home.mp4",
    "/asl/special/period.mp4"
  ]),
  asl_type: "video",
  options: JSON.stringify(["At the park", "At home", "At school", "At the store"]),
  correct_answer: "At the park"
}
```

## 🎯 Using the ASL Player Component

### In Your Quiz Page:
```javascript
import ASLPlayer from '../components/ASLPlayer';

// In your component:
<ASLPlayer 
  question={currentQuestion}  // Pass the full question object
  autoPlay={true}             // Start playing automatically
  showControls={true}         // Show play/pause/speed controls
/>
```

### Features:
- **Auto-detect**: Automatically determines if it's math, sentence, or paragraph
- **Sequence Display**: Shows all signs in order with progress tracking
- **Manual Control**: Click any sign to jump to it
- **Speed Control**: Fast (1s), Normal (1.5s), Slow (2.5s)
- **Play/Pause**: Full video-like controls
- **Missing Words**: Shows which words need ASL videos (for fingerspelling)

## 🗂️ File Organization

### Store ASL Resources:
```
frontend/public/asl/
├── numbers/
│   ├── 0.mp4
│   ├── 1.mp4
│   ├── 2.mp4
│   └── ...9.mp4
├── operations/
│   ├── plus.mp4
│   ├── minus.mp4
│   ├── times.mp4
│   └── divide.mp4
├── words/
│   ├── what.mp4
│   ├── who.mp4
│   ├── cat.mp4
│   ├── dog.mp4
│   └── ...
└── special/
    ├── question.mp4
    ├── period.mp4
    └── exclamation.mp4
```

## 🎬 Where to Get ASL Videos

### Free Resources:
1. **Signing Savvy** (signingsavvy.com) - Download individual sign videos
2. **Handspeak** (handspeak.com) - ASL dictionary with videos
3. **Lifeprint** (lifeprint.com) - Free ASL lessons and signs
4. **ASL Pro** (aslpro.com) - Simple sign videos

### Recording Your Own:
- Use smartphone camera
- Plain background
- Good lighting
- Short clips (2-3 seconds per sign)
- Save as MP4 format

## 📝 Adding Questions Through Admin Panel

### Step 1: Add Question Text
```
Question: What is 23 + 15?
```

### Step 2: Choose ASL Type
- **numbers**: For simple math (auto-generates from text)
- **video**: Custom video URLs (you provide)
- **images**: Image URLs (you provide)
- **both**: Shows both video and images
- **none**: No ASL support

### Step 3A: Auto ASL (numbers)
```
ASL Signs: [2, 3, "plus", 1, 5]
```
System will look for:
- /asl/numbers/2.mp4
- /asl/numbers/3.mp4
- /asl/operations/plus.mp4
- /asl/numbers/1.mp4
- /asl/numbers/5.mp4

### Step 3B: Custom Videos
```
ASL Video URLs:
[
  "https://cdn.example.com/asl/2.mp4",
  "https://cdn.example.com/asl/3.mp4",
  "https://cdn.example.com/asl/plus.mp4",
  "https://cdn.example.com/asl/1.mp4",
  "https://cdn.example.com/asl/5.mp4"
]
```

### Step 3C: Custom Images
```
ASL Image URLs:
[
  "/asl-images/2.png",
  "/asl-images/3.png",
  "/asl-images/plus.png",
  "/asl-images/1.png",
  "/asl-images/5.png"
]
```

## 🚀 Quick Start Examples

### Example 1: Simple Math with Auto ASL
```sql
INSERT INTO Question (
  activity_id, question_text, question_type, 
  correct_answer, options, asl_signs, asl_type
) VALUES (
  7, 
  'What is 2 + 3?', 
  'multiple_choice',
  '5',
  '["4", "5", "6", "7"]',
  '[2, "plus", 3]',
  'numbers'
);
```

### Example 2: 2-Digit Math with Images
```sql
INSERT INTO Question (
  activity_id, question_text, question_type, 
  correct_answer, options, asl_image_url, asl_type
) VALUES (
  8, 
  'What is 47 + 15?', 
  'multiple_choice',
  '62',
  '["60", "61", "62", "63"]',
  '["/asl/4.png", "/asl/7.png", "/asl/plus.png", "/asl/1.png", "/asl/5.png"]',
  'images'
);
```

### Example 3: English Sentence with Videos
```sql
INSERT INTO Question (
  activity_id, question_text, question_type, 
  correct_answer, options, asl_video_url, asl_type
) VALUES (
  43, 
  'What is the cat doing?', 
  'multiple_choice',
  'Playing',
  '["Sleeping", "Playing", "Eating", "Running"]',
  '["/asl/what.mp4", "/asl/is.mp4", "/asl/cat.mp4", "/asl/doing.mp4", "/asl/question.mp4"]',
  'video'
);
```

## 💡 Pro Tips

1. **Start Small**: Add ASL to Level 1 questions first (numbers 0-10)
2. **Build Library**: Create a reusable library of common ASL signs
3. **Test Sequences**: Use the ASL Player to verify sequences play correctly
4. **Missing Words**: The system will tell you which words need ASL videos
5. **Speed Matters**: Let users control playback speed for learning
6. **Repetition**: Allow replaying signs as many times as needed

## 🔧 Troubleshooting

### Videos Not Playing?
- Check file path is correct
- Ensure videos are in MP4 format
- Check console for loading errors

### Missing Signs?
- Check `aslTranslator.js` ASL_RESOURCES dictionary
- Add custom videos to asl_video_url instead
- System will show "needs fingerspelling" for missing words

### Wrong Sequence?
- Verify JSON array format: `["word1", "word2"]`
- Check for proper escaping in database
- Use ASL Player controls to test

## 📞 Next Steps

1. **Download ASL sign videos** for numbers 0-10 and basic operations
2. **Add them to** `/frontend/public/asl/` folder
3. **Update questions** with asl_signs or asl_video_url
4. **Test in quiz** to see ASL Player in action
5. **Expand library** with more words for English comprehension

Need help? The ASL Player component will show you exactly which resources are missing!
