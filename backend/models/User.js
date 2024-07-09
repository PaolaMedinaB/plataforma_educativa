const sql = require('mssql');

class User {
  static async getAll() {
    try {
      const result = await sql.query`SELECT * FROM Users`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await sql.query`SELECT * FROM Users WHERE user_id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Add more methods as needed
}

module.exports = User;
