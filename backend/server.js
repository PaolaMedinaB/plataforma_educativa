// server.js

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { poolPromise, getClasses, getTeacherSubjects } from './config/db.js'; // Import getTeacherSubjects
import sql from 'mssql';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., React frontend build)
app.use(express.static('build'));

// Routes
// Assuming usersRouter and profileRoutes are correctly set up for ESM
import usersRouter from './routes/users.js';
import profileRoutes from './routes/profile.js';

app.use('/users', usersRouter);
app.use('/profile', profileRoutes);

// Test database connection route
app.get('/test-db', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().query('SELECT 1 as test');
    res.json({ message: 'Database connection successful' });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// Signup route
app.post('/signup', async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  // Basic validation example
  if (!nombre || !correo || !contrasena || !rol) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Process your signup logic here
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('correo', sql.VarChar, correo)
      .input('contrasena', sql.VarChar, hashedPassword)
      .input('rol', sql.VarChar, rol)
      .query(`
        INSERT INTO Users (name, email, password, role)
        VALUES (@nombre, @correo, @contrasena, @rol);
      `);

    const result = await pool.request()
      .input('correo', sql.VarChar, correo)
      .query(`
        SELECT user_id FROM Users WHERE email = @correo;
      `);

    const userId = result.recordset[0].user_id;

    if (rol === 'profesor') {
      await pool.request()
        .input('user_id', sql.Int, userId)
        .input('price_per_hour', sql.Decimal(10, 2), 0)
        .query(`
          INSERT INTO Teachers (user_id, price_per_hour)
          VALUES (@user_id, @price_per_hour);
        `);
    } else if (rol === 'estudiante') {
      await pool.request()
        .input('user_id', sql.Int, userId)
        .query(`
          INSERT INTO Students (user_id)
          VALUES (@user_id);
        `);
    }
    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, correo)
      .query(`SELECT * FROM Users WHERE email = @email`);
    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    let validPassword;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      validPassword = await bcrypt.compare(contrasena, user.password);
    } else {
      validPassword = (contrasena === user.password);

      if (validPassword) {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        await pool.request()
          .input('userId', sql.Int, user.user_id)
          .input('hashedPassword', sql.VarChar, hashedPassword)
          .query(`UPDATE Users SET password = @hashedPassword WHERE user_id = @userId`);
      }
    }

    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET || 'un_secreto_por_defecto_seguro',
      { expiresIn: '1h' }
    );
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      userId: user.user_id,
      role: user.role,
      name: user.name
    });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
});

// StudentHome route - Fetch student class data
app.get('/StudentHome', async (req, res) => {
  try {
    const classes = await getClasses();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ message: 'Error fetching student classes', error: error.message });
  }
});

// Route to fetch classes (Ensure this is placed before any wildcard routes)
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await getClasses();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

// Route to fetch teacher subjects
app.post('/teacherSubjects', async (req, res) => {
  const { userId } = req.body;
  const user_id = parseInt(userId, 10);

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const subjects = await getTeacherSubjects(user_id);
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({ message: 'Error fetching teacher subjects', error: error.message });
  }
});

// Route to create a new subject
app.post('/api/createsubject', async (req, res) => {
  const { userId, materia, precio, location } = req.body;

  if (!userId || !materia  || !precio || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const pool = await poolPromise;

    // Retrieve the teacher_id based on the userId
    const teacherResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT teacher_id FROM Teachers WHERE user_id = @userId;
      `);

    const teacherId = teacherResult.recordset[0]?.teacher_id;

    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher not found for the given userId' });
    }

    // Fetch subject_id from Subjects table based on materia
    const subjectResult = await pool.request()
      .input('materia', sql.VarChar, materia)
      .query(`
        SELECT subject_id FROM Subjects WHERE name = @materia;
      `);

    const subjectId = subjectResult.recordset[0]?.subject_id;

    if (!subjectId) {
      return res.status(400).json({ message: 'Subject not found for the given materia' });
    }

    // Insert into Classes table
    await pool.request()
      .input('teacher_id', sql.Int, teacherId)
      .input('subject_id', sql.Int, subjectId)
      .input('location', sql.VarChar, location)
      .input('class_type', sql.VarChar, 'individual') // Assuming a static class_type for demo purposes
      .input('max_students', sql.Int, 1) // Assuming a static max_students for demo purposes
      .input('status', sql.VarChar, 'disponible') // Assuming a static status for demo purposes
      .input('precio_clase', sql.Decimal(10, 2), precio)
      .query(`
        INSERT INTO Classes (teacher_id, subject_id, location, class_type, max_students, status,precio_clase)
        VALUES (@teacher_id, @subject_id, @location, @class_type, @max_students, @status, @precio_clase);
      `);

    res.status(201).json({ message: 'Subject created successfully' });

  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add this route before any wildcard routes in server.js
app.get('/api/subjects', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT subject_id, name FROM Subjects');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
