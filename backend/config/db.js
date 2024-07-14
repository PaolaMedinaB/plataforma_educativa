// db.js

import sql from 'mssql';

// Database configuration
const config = {
  server: 'PAOLA', // Replace with your SQL Server instance name
  database: 'plataforma_educativa', // Replace with your database name
  user: 'prueba',
  password: 'password1',
  options: {
    trustedConnection: true, // Use Windows Authentication
    encrypt: false, // Set to true if your SQL Server is configured to use SSL
    enableArithAbort: true,
  },
};

// Establish connection pool to SQL Server
export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to the database successfully');
    return pool;
  })
  .catch(err => {
    console.error('Database connection error: ', err);
    throw err;
  });

// Function to fetch classes data from the Teachers table
export const getClasses = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Classes.teacher_id, Users.name as teacher, Teachers.price_per_hour, Subjects.name as subject_name, Classes.location
      FROM Classes
      JOIN Teachers ON Teachers.teacher_id = Classes.teacher_id
      JOIN Users ON Users.user_id = Teachers.user_id
      JOIN Subjects ON Subjects.subject_id = Classes.subject_id
    `); // Adjust query based on your schema
    return result.recordset;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Function to fetch teacher subjects based on user_id
export const getTeacherSubjects = async (user_id) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .query(`
        SELECT Classes.teacher_id, Users.name as teacher, Classes.precio_clase, Subjects.name as subject_name, Classes.location
        FROM Classes
        JOIN Teachers ON Teachers.teacher_id = Classes.teacher_id
        JOIN Users ON Users.user_id = Teachers.user_id
        JOIN Subjects ON Subjects.subject_id = Classes.subject_id
        WHERE Users.user_id = @user_id
      `);

    return result.recordset;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
