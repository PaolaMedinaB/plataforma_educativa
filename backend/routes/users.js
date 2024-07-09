
import express from 'express';
import sql from 'mssql';
import { poolPromise } from '../config/db.js';// Adjusted path according to your project structure
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  
  try {
    // Validate input data
    if (!nombre || !correo || !contrasena || !rol ) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    // Validate email format (basic validation)
    if (!isValidEmail(correo)) {
      return res.status(400).send({ message: 'Invalid email format' });
    }
    console.log('sign up correo'+correo)
    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('correo', sql.VarChar, correo)
      .input('contrasena', sql.VarChar, contrasena)
      .input('rol', sql.VarChar, rol)
      .query(`
        INSERT INTO Users (name, email, password, role)
        VALUES (@nombre, @correo, @contrasena, @rol);
      `);

    // Check if the insert was successful
    if (result.rowsAffected && result.rowsAffected[0] === 1) {
      res.status(201).send({ message: 'User created successfully' });
    } else {
      console.error('Error creating user:', result);
      res.status(500).send({ message: 'Failed to create user' });
    }
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).send({ message: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Buscar el usuario en la base de datos
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.VarChar, correo)
      .query(`SELECT * FROM Users WHERE email = @email`);
    const user = result.recordset[0];

    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(contrasena, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Crear y enviar el token JWT
    const token = jwt.sign({ userId: user.user_id }, 'tu_secreto_jwt', { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      userId: user.user_id
    });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});
// Function to validate email format (basic)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default router; // Export the 'router' instance using default export
