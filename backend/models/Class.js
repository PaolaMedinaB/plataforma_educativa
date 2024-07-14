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
      const result = await sql.query`SELECT Classes.teacher_id, Users.name as teacher, Teachers.price_per_hour, Subjects.name as subject_name, Classes.location
  FROM Classes
  JOIN Teachers ON Teachers.teacher_id = Classes.teacher_id
  JOIN Users ON Users.user_id = Teachers.user_id
  JOIN Subjects ON Subjects.subject_id = Classes.subject_id
  where Classes.teacher_id= ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error fetching class:', error);
      throw error;
    }
  }

  // Add more methods as needed
}

module.exports = Class;