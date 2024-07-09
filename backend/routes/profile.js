// routes/profile.js
import express from 'express';
const router = express.Router();
import sql from 'mssql';
import authenticateToken from '../middleware/authenticateToken.js';

// Obtener perfil del usuario
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await sql.query`
      SELECT u.name, u.email, s.preferences AS nivelEducativo, l.city AS ubicacion
      FROM Users u
      LEFT JOIN Students s ON u.user_id = s.user_id
      LEFT JOIN Locations l ON u.location_id = l.location_id
      WHERE u.user_id = ${userId}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Actualizar perfil del usuario
router.put('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { nombre, nivelEducativo, ubicacion } = req.body;

    // Actualizar usuario
    await sql.query`
      UPDATE Users
      SET name = ${nombre}
      WHERE user_id = ${userId}
    `;

    // Actualizar nivel educativo (asumiendo que está en la tabla Students)
    await sql.query`
      UPDATE Students
      SET preferences = ${nivelEducativo}
      WHERE user_id = ${userId}
    `;

    // Actualizar ubicación
    // Primero, obtener el location_id actual del usuario
    const userResult = await sql.query`SELECT location_id FROM Users WHERE user_id = ${userId}`;
    const locationId = userResult.recordset[0].location_id;

    if (locationId) {
      // Si el usuario ya tiene una ubicación, actualizarla
      await sql.query`
        UPDATE Locations
        SET city = ${ubicacion}
        WHERE location_id = ${locationId}
      `;
    } else {
      // Si el usuario no tiene una ubicación, crear una nueva
      const locationResult = await sql.query`
        INSERT INTO Locations (city)
        OUTPUT INSERTED.location_id
        VALUES (${ubicacion})
      `;
      const newLocationId = locationResult.recordset[0].location_id;
      
      // Actualizar el usuario con el nuevo location_id
      await sql.query`
        UPDATE Users
        SET location_id = ${newLocationId}
        WHERE user_id = ${userId}
      `;
    }

    res.json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


export default router; // Export the 'router' instance using default export