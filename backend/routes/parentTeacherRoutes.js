const express = require('express');
const router = express.Router();
const {
  linkChildToTeacher,
  getChildTeacherLinks,
  updateTeacherPermissions,
  removeTeacherLink
} = require('../controllers/teacherStudentController');

// Parent routes (no middleware needed - uses child_id from authenticated parent)
router.post('/link', linkChildToTeacher);
router.get('/child/:childId', getChildTeacherLinks);
router.put('/permissions/:linkId', updateTeacherPermissions);
router.delete('/link/:linkId', removeTeacherLink);

module.exports = router;
