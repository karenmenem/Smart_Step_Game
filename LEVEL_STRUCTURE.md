# Math Level Structure - 6 Levels Per Operation

## Structure Overview
Each operation (Addition, Subtraction, Multiplication, Division) has 6 levels:
- **Beginner**: Level 1 & 2
- **Intermediate**: Level 1 & 2  
- **Advanced**: Level 1 & 2

## Unlock Progression
1. **Beginner Level 1**: Always unlocked (starting point)
2. **Beginner Level 2**: Unlocks after completing Beginner L1 with 80%+
3. **Intermediate Level 1**: Unlocks after completing Beginner L2 with 80%+
4. **Intermediate Level 2**: Unlocks after completing Intermediate L1 with 80%+
5. **Advanced Level 1**: Unlocks after completing Intermediate L2 with 80%+
6. **Advanced Level 2**: Unlocks after completing Advanced L1 with 80%+

## Activity IDs in Database

### Addition
- Beginner L1: Activity 7
- Beginner L2: Activity 8 
- Intermediate L1: Activity 10
- Intermediate L2: Activity 11
- Advanced L1: Activity 13
- Advanced L2: Activity 14

### Subtraction
- Beginner L1: Activity 16
- Beginner L2: Activity 17
- Intermediate L1: Activity 19
- Intermediate L2: Activity 20
- Advanced L1: Activity 22
- Advanced L2: Activity 23

### Multiplication
- Beginner L1: Activity 25
- Beginner L2: Activity 26
- Intermediate L1: Activity 28
- Intermediate L2: Activity 29
- Advanced L1: Activity 31
- Advanced L2: Activity 32

### Division
- Beginner L1: Activity 34
- Beginner L2: Activity 35
- Intermediate L1: Activity 37
- Intermediate L2: Activity 38
- Advanced L1: Activity 40
- Advanced L2: Activity 41

## What You Have Now
✅ Addition Beginner L1 (Activity 7): 10 questions with ASL
✅ Addition Beginner L2 (Activity 8): 10 questions with word problems (1 has ASL - Emma question)

## What You Need to Create
📋 Addition Intermediate L1 & L2
📋 Addition Advanced L1 & L2
📋 Subtraction: All 6 levels
📋 Multiplication: All 6 levels
📋 Division: All 6 levels

Total: 22 more activities to create (each with ~10 questions)

## Files Updated
1. **Backend**:
   - `/backend/controllers/progressController.js` - Updated level unlocking logic
   - Database: Deleted all Level 3 activities, kept 6 levels per operation

2. **Frontend**:
   - `/frontend/src/pages/MathLevels.js` - Shows all 3 difficulty cards with 2 sublevels each
   - Intermediate & Advanced unlock when previous level completed with 80%+

3. **Components**:
   - `/frontend/src/components/ASLPlayer.js` - Updated to show operation videos (plus.mp4)
