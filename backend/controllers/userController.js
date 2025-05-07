const db = require('../config/db');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

// Create a new user
const createUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Normalize email
    email = email.trim().toLowerCase();

    // Validate inputs
    if (!name || !email || !password || !role) {
      return res.status(400).send({
        success: false,
        message: 'All fields (name, email, password, role) are required',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid email format',
      });
    }

    const allowedRoles = ['student', 'hostel_admin', 'dsw', 'tusc'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid user role',
      });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).send({
        success: false,
        message: 'Email already in use',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // Insert user into DB
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).send({
      success: true,
      message: 'User created successfully',
      userId: result.insertId,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while creating user',
      error: error.message,
    });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const [data] = await db.query('SELECT id, name, email, role, created_at FROM users');
    res.status(200).send({
      success: true,
      message: 'All users fetched successfully',
      totalUsers: data.length,
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while fetching users',
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const [data] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);

    if (data.length === 0) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).send({
      success: true,
      user: data[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while fetching user by ID',
      error: error.message,
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let { name, email, role } = req.body;

    email = email.trim().toLowerCase();

    if (!name || !email || !role) {
      return res.status(400).send({
        success: false,
        message: 'Name, email and role are required for update',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid email format',
      });
    }

    const allowedRoles = ['student', 'hostel_admin', 'dsw', 'tusc'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).send({
        success: false,
        message: 'Invalid user role',
      });
    }

    const [result] = await db.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, userId]
    );

    res.status(200).send({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while updating user',
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error while deleting user',
      error: error.message,
    });
  }
};

// LOGIN
const loginUser = async (req, res) => {
    try {
      let { email, password } = req.body;
  
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(404).send({ success: false, message: 'User not found' });
      }
  
      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send({ success: false, message: 'Incorrect password' });
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
  
      res.status(200).send({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ success: false, message: 'Login failed', error });
    }
  };

  const logoutUser = (req, res) => {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'Lax', // Or 'Strict' if you want tighter control
      });
  
      res.status(200).send({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: 'Error during logout',
        error,
      });
    }
  };
  

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
};
