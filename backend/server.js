// Import necessary modules
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { poolPromise, getClasses } from './config/db.js'; // Correctly imports poolPromise and getClasses from the same file
import sql from 'mssql';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import axios from 'axios'; // Import axios for making HTTP requests

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
    // Assuming you are using a database, create a user or perform necessary operations
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
    // Example using poolPromise with mssql
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
    // Retrieve the user_id for the inserted user
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
      // La contraseña está hasheada
      validPassword = await bcrypt.compare(contrasena, user.password);
    } else {
      // La contraseña no está hasheada
      validPassword = (contrasena === user.password);

      // Opcional: Hashear y actualizar la contraseña para futuros logins
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
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
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
    const classes = await getClasses(); // Fetch classes data from the database
    res.json(classes); // Send classes data as JSON response
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ message: 'Error fetching student classes', error: error.message });
  }
});

// Route to fetch classes (Ensure this is placed before any wildcard routes)
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await getClasses(); // Fetch classes data from the database
    res.json(classes); // Send classes data as JSON response
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
