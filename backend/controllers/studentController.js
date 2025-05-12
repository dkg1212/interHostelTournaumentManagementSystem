const db = require('../config/db');

// Create a student
const createStudent = async (req, res) => {
  try {
    const { user_id, hostel_id, roll_number, gender } = req.body;

    if (!user_id || !roll_number || !gender) {
      return res.status(400).send({ success: false, message: 'user_id, roll_number, and gender are required' });
    }

    const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
    if (existingUser.length === 0) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    if (hostel_id) {
      const [hostelExists] = await db.query('SELECT * FROM hostels WHERE id = ?', [hostel_id]);
      if (hostelExists.length === 0) {
        return res.status(400).send({ success: false, message: 'Invalid hostel ID' });
      }
    }

    const [result] = await db.query(
      'INSERT INTO students (user_id, hostel_id, roll_number, gender) VALUES (?, ?, ?, ?)',
      [user_id, hostel_id || null, roll_number, gender]
    );

    res.status(201).send({ success: true, message: 'Student created', studentId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error creating student', error: error.message });
  }
};

// Get all students
const getStudents = async (req, res) => {
  try {
    const [data] = await db.query(`
      SELECT students.*, users.name, users.email, hostels.name AS hostel_name
      FROM students
      JOIN users ON students.user_id = users.id
      LEFT JOIN hostels ON students.hostel_id = hostels.id
    `);

    res.status(200).send({ success: true, total: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching students', error: error.message });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const [data] = await db.query(`
      SELECT students.*, users.name, users.email, hostels.name AS hostel_name
      FROM students
      JOIN users ON students.user_id = users.id
      LEFT JOIN hostels ON students.hostel_id = hostels.id
      WHERE students.id = ?
    `, [studentId]);

    if (data.length === 0) {
      return res.status(404).send({ success: false, message: 'Student not found' });
    }

    res.status(200).send({ success: true, student: data[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error fetching student', error: error.message });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { hostel_id, roll_number, gender } = req.body;

    if (hostel_id) {
      const [hostelExists] = await db.query('SELECT * FROM hostels WHERE id = ?', [hostel_id]);
      if (hostelExists.length === 0) {
        return res.status(400).send({ success: false, message: 'Invalid hostel ID' });
      }
    }

    await db.query(
      'UPDATE students SET hostel_id = ?, roll_number = ?, gender = ? WHERE id = ?',
      [hostel_id || null, roll_number, gender, studentId]
    );

    res.status(200).send({ success: true, message: 'Student updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error updating student', error: error.message });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const [result] = await db.query('DELETE FROM students WHERE id = ?', [studentId]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'Student not found' });
    }

    res.status(200).send({ success: true, message: 'Student deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error deleting student', error: error.message });
  }
};

const getStudentByUserId = async (req, res) => {
  const { userId } = req.params;
  
  // Early check for missing userId
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Join students, users, and hostels to fetch full student details
    const [student] = await db.query(`
      SELECT students.*, users.name, users.email, hostels.name AS hostel_name
      FROM students
      JOIN users ON students.user_id = users.id
      LEFT JOIN hostels ON students.hostel_id = hostels.id
      WHERE students.user_id = ?
    `, [userId]);

    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Send the student data as a response
    res.status(200).json({ student: student[0] });
  } catch (error) {
    console.error('Error fetching student by user ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentByUserId
};
