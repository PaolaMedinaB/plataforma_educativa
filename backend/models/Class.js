const sql = require('mssql');

class Class {
  static async getAll() {
    try {
      const result = await sql.query`SELECT * FROM Classes`;
      return result.recordset;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await sql.query`SELECT * FROM Classes WHERE class_id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  }

  // Add more methods as needed
}

module.exports = Class;