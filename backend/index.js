import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sequelize from './config/db.js';

import User from './models/User.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/signup', async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol, ubicacion, nivelEducativo } = req.body;
    const newUser = await User.create({
      name: nombre,
      email: correo,
      password: contrasena,
      role: rol,
      location_id: ubicacion,
      education_level_id: nivelEducativo,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

sequelize.sync()
  .then(() => {
    app.listen(3001, () => {
      console.log('Server is running on port 3001');
    });
  })
  .catch(err => console.log(err));
