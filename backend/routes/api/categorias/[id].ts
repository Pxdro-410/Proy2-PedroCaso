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
      'SELECT id_categoria, nombre, descripcion FROM categoria WHERE id_categoria = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Categoría no encontrada' });
    }
    return result.rows[0];
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    if (!body?.nombre?.trim()) {
      throw createError({ statusCode: 400, message: 'El nombre es requerido' });
    }
    const result = await pool.query(
      'UPDATE categoria SET nombre = $1, descripcion = $2 WHERE id_categoria = $3 RETURNING *',
      [body.nombre.trim(), body.descripcion?.trim() ?? null, id]
    );
    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Categoría no encontrada' });
    }
    return result.rows[0];
  }

  if (method === 'DELETE') {
    try {
      const result = await pool.query(
        'DELETE FROM categoria WHERE id_categoria = $1 RETURNING id_categoria',
        [id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Categoría no encontrada' });
      }
      return { message: 'Categoría eliminada correctamente' };
    } catch (err: any) {
      if (err.code === '23503') {
        throw createError({ statusCode: 409, message: 'No se puede eliminar: hay productos asociados a esta categoría' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
