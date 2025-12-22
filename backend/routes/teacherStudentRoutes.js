const express = require('express');
const router = express.Router();
const teacherAuth = require('../middleware/teacherAuth');
const {
  getTeacherClasses,
  createTeacherClass,
  getTeacherStudents,
  getStudentProgress
} = require('../controllers/teacherStudentController');

// Teacher routes (require authentication)
router.get('/classes/:teacherId', teacherAuth, getTeacherClasses);
router.post('/classes', teacherAuth, createTeacherClass);
router.get('/students/:teacherId', teacherAuth, getTeacherStudents);
router.get('/student-progress/:teacherId/:childId', teacherAuth, getStudentProgress);

module.exports = router;
