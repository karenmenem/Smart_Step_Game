# SmartStep Learning Platform

An educational web application for children with ASL (American Sign Language) video integration, gamified learning through math operations, and an achievement system.

## 🚀 Quick Start

### Installation
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Access the app at `http://localhost:3000`

## 📋 Features

- ✅ **6-Level Math System**: Beginner → Intermediate → Advanced (2 sublevels each)
- ✅ **ASL Video Integration**: Automatic word/number sign language videos
- ✅ **Smart Timer**: 30s (Beginner), 60s (Intermediate), 90s (Advanced)
- ✅ **Progressive Unlocking**: 80% required to advance
- ✅ **Achievement Badges**: Points-based rewards system
- ✅ **4 Operations**: Addition, Subtraction, Multiplication, Division

## 📚 Documentation

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for:
- ASL system architecture
- How to add questions
- Level structure
- Achievement system
- Troubleshooting

## 🛠 Tech Stack

- **Frontend**: React, React Router
- **Backend**: Node.js, Express
- **Database**: MySQL (`Smart Step Learning1`)
- **ASL**: MP4 video files

## 📂 Project Structure

```
SmartStep web 2/
├── frontend/          # React application
├── backend/           # Node.js API server
└── DEVELOPER_GUIDE.md # Complete documentation
```

## 🎯 Current Status

**Addition**: ✅ Complete (60 questions, 6 levels)
- Beginner L1 & L2: ✅ 20 questions
- Intermediate L1 & L2: ✅ 20 questions  
- Advanced L1 & L2: ✅ 20 questions

**Other Operations**: 🚧 In progress

## 👥 User Roles

- **Students**: Take quizzes, earn points, unlock levels
- **Parents**: Register children, view progress
- **Admin**: Manage questions, activities

## 🔧 Configuration

Edit `backend/.env`:
```
DB_NAME=Smart Step Learning1
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
```

---

For detailed instructions, see [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)

