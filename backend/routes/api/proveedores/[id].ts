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
      'SELECT id_proveedor, nombre_empresa, contacto_principal, telefono FROM proveedor WHERE id_proveedor = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Proveedor no encontrado' });
    }
    return result.rows[0];
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    if (!body?.nombre_empresa?.trim() || !body?.contacto_principal?.trim()) {
      throw createError({ statusCode: 400, message: 'nombre_empresa y contacto_principal son requeridos' });
    }
    const result = await pool.query(
      'UPDATE proveedor SET nombre_empresa = $1, contacto_principal = $2, telefono = $3 WHERE id_proveedor = $4 RETURNING *',
      [body.nombre_empresa.trim(), body.contacto_principal.trim(), body.telefono?.trim() ?? null, id]
    );
    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Proveedor no encontrado' });
    }
    return result.rows[0];
  }

  if (method === 'DELETE') {
    try {
      const result = await pool.query(
        'DELETE FROM proveedor WHERE id_proveedor = $1 RETURNING id_proveedor',
        [id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Proveedor no encontrado' });
      }
      return { message: 'Proveedor eliminado correctamente' };
    } catch (err: any) {
      if (err.code === '23503') {
        throw createError({ statusCode: 409, message: 'No se puede eliminar: hay productos asociados a este proveedor' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
