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
    const result = await pool.request().query('SELECT * FROM Teachers'); // Adjust query based on your schema
    return result.recordset;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
