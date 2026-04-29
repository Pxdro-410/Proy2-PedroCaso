import { defineEventHandler } from 'h3';
import { pool } from '../utils/db';

export default defineEventHandler(async () => {
  try {
    // Prueba de conexión sencilla
    const result = await pool.query('SELECT NOW() as current_time');
    return {
      message: 'Backend conectado a PostgreSQL correctamente',
      db_time: result.rows[0].current_time
    };
  } catch (error: any) {
    return {
      message: 'Error conectando a la base de datos',
      error: error.message
    };
  }
});