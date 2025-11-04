# ASL Video Integration Resources

## Overview
For complex content like paragraphs, large numbers (100+), or mathematical expressions that can't be represented with simple ASL number hand signs, you can integrate video URLs from ASL educational resources.

## How It Works in SmartStep

### Database Fields
- **`asl_video_url`**: Store the embedded video URL (YouTube, Vimeo, etc.)
- **`asl_type`**: Specify the display mode
  - `'numbers'` - Show animated hand signs (for simple 1-10)
  - `'video'` - Show embedded video only
  - `'both'` - Show both hand signs and video
  - `'none'` - No ASL support

### Example Question
```sql
INSERT INTO question 
(activity_id, question_text, correct_answer, options, asl_video_url, asl_type) 
VALUES 
(3, 'What is 100 + 167?', '267', '["267", "257", "277", "367"]', 
'https://www.youtube.com/embed/VIDEO_ID_HERE', 'video');
```

---

## Recommended ASL Video Resources

### 1. **ASL Signing Savvy** 🌟 BEST FOR EDUCATION
- **Website**: https://www.signingsavvy.com/
- **Features**: 
  - Search any word/number
  - High-quality videos
  - Shows multiple angles
  - Free basic access
- **Usage**: Search for numbers/words, copy video URL
- **Embed**: Direct video links available

### 2. **Bill Vicars - ASL University (YouTube)** 🎓
- **Channel**: https://www.youtube.com/@billvicars
- **Website**: https://www.lifeprint.com/
- **Features**:
  - Comprehensive ASL lessons
  - Numbers, math concepts
  - Educational playlists
  - Free and well-organized
- **Usage**: Find relevant video, click "Share" → "Embed" → Copy embed URL
- **Format**: `https://www.youtube.com/embed/VIDEO_ID`

### 3. **Sign ASL**
- **Website**: https://www.signasl.org/
- **Features**:
  - Dictionary with videos
  - Numbers 0-1,000,000
  - Mathematical signs
  - Free to use
- **Usage**: Search word/number, get video link

### 4. **Handspeak**
- **Website**: https://www.handspeak.com/
- **Features**:
  - ASL dictionary with GIFs and videos
  - Numbers and mathematical concepts
  - Educational resources
- **Usage**: Search and embed video URLs

### 5. **ASL That**
- **Website**: https://www.aslthat.com/
- **Features**:
  - Quick ASL lookups
  - Simple interface
  - Numbers and common words
- **Usage**: Search and get video demonstrations

### 6. **StartASL**
- **Website**: https://www.startasl.com/
- **Features**:
  - Numbers 1-100 videos
  - Math vocabulary
  - Premium and free content
- **Usage**: Copy video embed codes

---

## How to Get Video URLs

### From YouTube (Most Common)
1. Find the ASL video you want
2. Click **"Share"** button below video
3. Click **"Embed"**
4. Copy the URL from the iframe src: `https://www.youtube.com/embed/VIDEO_ID`
5. Paste into `asl_video_url` field

**Example**:
```html
<!-- YouTube gives you this -->
<iframe src="https://www.youtube.com/embed/AbCdEfG1234" ...></iframe>

<!-- Use this URL in your database -->
https://www.youtube.com/embed/AbCdEfG1234
```

### From Other Sites
- Look for "Share" or "Embed" options
- Copy the direct video URL or embed URL
- Test it in an iframe to ensure it works

---

## Admin Panel Usage

### Adding a Question with ASL Video

1. **Login to Admin Dashboard**: `http://localhost:3000/admin/login`
   - Username: `admin`
   - Password: `admin123`

2. **Navigate to Questions Tab**

3. **Fill Out the Form**:
   - **Question Text**: "What is 100 + 167?"
   - **Correct Answer**: "267"
   - **Options**: 267, 257, 277, 367
   - **ASL Type**: Select "Video Only" or "Both (Numbers + Video)"
   - **ASL Video URL**: Paste `https://www.youtube.com/embed/VIDEO_ID`

4. **Preview**: The iframe will show a preview of the video

5. **Save**: Question is now available in quiz!

---

## Example Questions for Complex Content

### Large Number Addition
```javascript
{
  question_text: "What is 100 + 167?",
  asl_video_url: "https://www.youtube.com/embed/NUMBER_SIGNS_VIDEO",
  asl_type: "video"
}
```

### Paragraph Reading Comprehension (English)
```javascript
{
  question_text: "Read this paragraph: [long text]. What is the main idea?",
  asl_video_url: "https://www.youtube.com/embed/PARAGRAPH_SIGNS_VIDEO",
  asl_type: "video"
}
```

### Mathematical Word Problems
```javascript
{
  question_text: "Sarah has 234 apples. She gives 89 to her friend. How many does she have left?",
  asl_video_url: "https://www.youtube.com/embed/WORD_PROBLEM_VIDEO",
  asl_type: "video"
}
```

---

## Best Practices

### ✅ DO
- Use high-quality, clear ASL videos
- Test video URLs before adding to database
- Use `'numbers'` for simple 1-10 addition
- Use `'video'` for complex numbers (100+)
- Use `'both'` when you want to show simple numbers + demonstration
- Keep videos short (under 1 minute)
- Use educational, child-friendly ASL signers

### ❌ DON'T
- Use copyrighted videos without permission
- Link to videos with inappropriate content
- Use extremely long videos (boring for kids)
- Use videos with poor lighting/quality
- Use autoplay videos with sound

---

## Testing Your Videos

### Check if URL Works
```javascript
// Test in browser console or create test HTML
const testUrl = "https://www.youtube.com/embed/YOUR_VIDEO_ID";

// Paste this in HTML file
<iframe 
  src="${testUrl}" 
  width="400" 
  height="225" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

### Run the Migration
```bash
cd backend
node migrate-asl-video.js
```

This will:
- Add `asl_video_url` column
- Add `asl_type` column
- Create admin table
- Add example questions with videos

---

## Custom ASL Video Creation

If you can't find videos for specific content:

1. **Record Your Own**
   - Use smartphone/webcam
   - Good lighting
   - Clear background
   - Upload to YouTube (unlisted)

2. **Commission ASL Interpreters**
   - Hire professional ASL signers
   - Record custom content
   - Higher quality but costs money

3. **Use ASL Animation Tools**
   - Some software can generate ASL animations
   - Less authentic but automated

---

## Need Help?

- Questions about ASL resources? Check the websites above
- Technical issues? Check the admin dashboard
- Video not displaying? Verify the URL format and test in browser

---

## Summary Table

| Resource | Best For | Free? | Quality |
|----------|----------|-------|---------|
| Signing Savvy | Dictionary lookups | Yes (limited) | ⭐⭐⭐⭐⭐ |
| Bill Vicars (YouTube) | Educational lessons | Yes | ⭐⭐⭐⭐⭐ |
| Sign ASL | Numbers & basics | Yes | ⭐⭐⭐⭐ |
| Handspeak | Quick references | Yes | ⭐⭐⭐⭐ |
| ASL That | Simple lookups | Yes | ⭐⭐⭐ |
| StartASL | Numbers 1-100 | Partial | ⭐⭐⭐⭐ |

---

**Last Updated**: November 2025
