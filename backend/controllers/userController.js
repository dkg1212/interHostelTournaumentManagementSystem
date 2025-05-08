const db = require('../config/db');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

// Create a new user
const createUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    email = email.trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return res.status(400).send({ success: false, message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({ success: false, message: 'Invalid email format' });
    }

    const allowedRoles = ['student', 'hostel_admin', 'dsw', 'tusc'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).send({ success: false, message: 'Invalid role' });
    }

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).send({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
    console.error(error);
    res.status(500).send({ success: false, message: 'Error creating user', error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ success: false, message: 'Incorrect password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      success: true,
      message: 'Login successful',
      token, // return token for testing
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Login failed', error: error.message });
  }
};

// Logout
const logoutUser = (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });

    res.status(200).send({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Logout failed', error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const [data] = await db.query('SELECT id, name, email, role, created_at FROM users');
    res.status(200).send({ success: true, totalUsers: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Fetch error', error: error.message });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const [data] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);

    if (data.length === 0) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    res.status(200).send({ success: true, user: data[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let { name, email, role } = req.body;
    email = email.trim().toLowerCase();

    if (!name || !email || !role) {
      return res.status(400).send({ success: false, message: 'Name, email, and role are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({ success: false, message: 'Invalid email format' });
    }

    const allowedRoles = ['student', 'hostel_admin', 'dsw', 'tusc'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).send({ success: false, message: 'Invalid role' });
    }

    await db.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [
      name, email, role, userId,
    ]);

    res.status(200).send({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Update error', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    res.status(200).send({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Delete error', error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
