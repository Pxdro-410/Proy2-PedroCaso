import { defineEventHandler, getMethod, readBody, getRouterParam, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const id = getRouterParam(event, 'id');

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID inválido' });
  }

  if (method === 'GET') {
    const result = await pool.query(
      'SELECT id_cliente, nombre_completo, correo, telefono FROM cliente WHERE id_cliente = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Cliente no encontrado' });
    }
    return result.rows[0];
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    if (!body?.nombre_completo?.trim() || !body?.correo?.trim()) {
      throw createError({ statusCode: 400, message: 'nombre_completo y correo son requeridos' });
    }
    try {
      const result = await pool.query(
        'UPDATE cliente SET nombre_completo = $1, correo = $2, telefono = $3 WHERE id_cliente = $4 RETURNING *',
        [body.nombre_completo.trim(), body.correo.trim(), body.telefono?.trim() ?? null, id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Cliente no encontrado' });
      }
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23505') {
        throw createError({ statusCode: 409, message: 'Ya existe un cliente con ese correo' });
      }
      throw err;
    }
  }

  if (method === 'DELETE') {
    try {
      const result = await pool.query(
        'DELETE FROM cliente WHERE id_cliente = $1 RETURNING id_cliente',
        [id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Cliente no encontrado' });
      }
      return { message: 'Cliente eliminado correctamente' };
    } catch (err: any) {
      if (err.code === '23503') {
        throw createError({ statusCode: 409, message: 'No se puede eliminar: el cliente tiene ventas registradas' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
