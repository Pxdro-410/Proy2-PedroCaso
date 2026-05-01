import { defineEventHandler, getMethod, readBody, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    const result = await pool.query(
      'SELECT id_empleado, nombre_completo, puesto, correo, dpi FROM empleado ORDER BY nombre_completo'
    );
    return result.rows;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.nombre_completo?.trim() || !body?.puesto?.trim() || !body?.correo?.trim() || !body?.dpi?.trim()) {
      throw createError({ statusCode: 400, message: 'nombre_completo, puesto, correo y dpi son requeridos' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO empleado (nombre_completo, puesto, correo, dpi) VALUES ($1, $2, $3, $4) RETURNING *',
        [body.nombre_completo.trim(), body.puesto.trim(), body.correo.trim(), body.dpi.trim()]
      );
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23505') {
        throw createError({ statusCode: 409, message: 'Ya existe un empleado con ese correo o DPI' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
