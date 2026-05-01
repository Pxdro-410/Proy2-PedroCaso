import { defineEventHandler, getMethod, readBody, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    const result = await pool.query(
      'SELECT id_cliente, nombre_completo, correo, telefono FROM cliente ORDER BY nombre_completo'
    );
    return result.rows;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.nombre_completo?.trim() || !body?.correo?.trim()) {
      throw createError({ statusCode: 400, message: 'nombre_completo y correo son requeridos' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO cliente (nombre_completo, correo, telefono) VALUES ($1, $2, $3) RETURNING *',
        [body.nombre_completo.trim(), body.correo.trim(), body.telefono?.trim() ?? null]
      );
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23505') {
        throw createError({ statusCode: 409, message: 'Ya existe un cliente con ese correo' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
