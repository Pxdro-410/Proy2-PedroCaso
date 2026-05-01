import { defineEventHandler, getMethod, readBody, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    const result = await pool.query(
      'SELECT id_proveedor, nombre_empresa, contacto_principal, telefono FROM proveedor ORDER BY nombre_empresa'
    );
    return result.rows;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.nombre_empresa?.trim() || !body?.contacto_principal?.trim()) {
      throw createError({ statusCode: 400, message: 'nombre_empresa y contacto_principal son requeridos' });
    }
    const result = await pool.query(
      'INSERT INTO proveedor (nombre_empresa, contacto_principal, telefono) VALUES ($1, $2, $3) RETURNING *',
      [body.nombre_empresa.trim(), body.contacto_principal.trim(), body.telefono?.trim() ?? null]
    );
    return result.rows[0];
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
