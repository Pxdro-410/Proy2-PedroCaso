import { defineEventHandler, getMethod, readBody, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    const result = await pool.query(
      'SELECT id_categoria, nombre, descripcion FROM categoria ORDER BY nombre'
    );
    return result.rows;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.nombre?.trim()) {
      throw createError({ statusCode: 400, message: 'El nombre es requerido' });
    }
    const result = await pool.query(
      'INSERT INTO categoria (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [body.nombre.trim(), body.descripcion?.trim() ?? null]
    );
    return result.rows[0];
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
