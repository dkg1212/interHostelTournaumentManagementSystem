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

// CREATE a new user
router.post('/signup', createUser);

router.post('/login', loginUser);

router.post('/logout',logoutUser );
  
// READ all users
router.get('/users', getUsers);

// READ a user by ID
router.get('/users/:id', getUserById);

// UPDATE a user
router.put('/users/:id', updateUser);

// DELETE a user
router.delete('/users/:id', deleteUser);

module.exports = router;
