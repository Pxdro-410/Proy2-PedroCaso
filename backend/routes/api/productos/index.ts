import { defineEventHandler, getMethod, readBody, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    // Join 1, usa la vista que ya combina producto + categoria + proveedor
    const result = await pool.query(
      'SELECT id_producto, nombre_producto, precio_actual, stock, nombre_categoria, nombre_proveedor FROM vista_productos_detallados ORDER BY nombre_producto'
    );
    return result.rows;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body?.nombre?.trim() || body?.precio_actual == null || body?.stock == null || !body?.id_categoria || !body?.id_proveedor) {
      throw createError({ statusCode: 400, message: 'nombre, precio_actual, stock, id_categoria e id_proveedor son requeridos' });
    }
    if (Number(body.precio_actual) < 0 || Number(body.stock) < 0) {
      throw createError({ statusCode: 400, message: 'precio_actual y stock deben ser valores no negativos' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO producto (nombre, precio_actual, stock, id_categoria, id_proveedor) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [body.nombre.trim(), body.precio_actual, body.stock, body.id_categoria, body.id_proveedor]
      );
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23503') {
        throw createError({ statusCode: 400, message: 'La categoría o el proveedor indicado no existe' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
