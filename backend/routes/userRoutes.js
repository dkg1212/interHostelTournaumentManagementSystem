const express = require('express');
const router = express.Router();
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
} = require('../controllers/userController');

const { requireAuth, requireRole } = require('../middleware/auth');

// Public routes
router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Protected routes
router.get('/users', requireAuth, requireRole('dsw', 'tusc'), getUsers);
router.get('/users/:id', requireAuth, getUserById);
router.put('/users/:id', requireAuth, updateUser);
router.delete('/users/:id', requireAuth, requireRole('dsw', 'tusc'), deleteUser);

module.exports=router
