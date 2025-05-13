const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByUserId
} = require('../controllers/studentController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Routes
router.post('/',requireAuth, createStudent);
router.get('/', requireAuth,getStudents);
router.get('/:id',requireAuth,getStudentById);
router.put('/:id', requireAuth,updateStudent);
router.delete('/:id',requireAuth,deleteStudent);
router.get('/user/:userId',requireAuth, getStudentByUserId);

module.exports = router;
