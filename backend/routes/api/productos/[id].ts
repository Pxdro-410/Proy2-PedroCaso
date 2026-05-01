import { defineEventHandler, getMethod, readBody, getRouterParam, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const id = getRouterParam(event, 'id');

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID inválido' });
  }

  if (method === 'GET') {
    // JOIN explícito para el detalle individual
    const result = await pool.query(
      `SELECT p.id_producto, p.nombre, p.precio_actual, p.stock, c.id_categoria, c.nombre AS nombre_categoria, pr.id_proveedor, pr.nombre_empresa AS nombre_proveedor
       FROM producto p
       JOIN categoria c ON p.id_categoria = c.id_categoria
       JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
       WHERE p.id_producto = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Producto no encontrado' });
    }
    return result.rows[0];
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    if (!body?.nombre?.trim() || body?.precio_actual == null || body?.stock == null || !body?.id_categoria || !body?.id_proveedor) {
      throw createError({ statusCode: 400, message: 'nombre, precio_actual, stock, id_categoria e id_proveedor son requeridos' });
    }
    if (Number(body.precio_actual) < 0 || Number(body.stock) < 0) {
      throw createError({ statusCode: 400, message: 'precio_actual y stock deben ser valores no negativos' });
    }
    try {
      const result = await pool.query(
        `UPDATE producto SET nombre = $1, precio_actual = $2, stock = $3, id_categoria = $4, id_proveedor = $5
         WHERE id_producto = $6
         RETURNING *`,
        [body.nombre.trim(), body.precio_actual, body.stock, body.id_categoria, body.id_proveedor, id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Producto no encontrado' });
      }
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23503') {
        throw createError({ statusCode: 400, message: 'La categoría o el proveedor indicado no existe' });
      }
      throw err;
    }
  }

  if (method === 'DELETE') {
    try {
      const result = await pool.query(
        'DELETE FROM producto WHERE id_producto = $1 RETURNING id_producto',
        [id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Producto no encontrado' });
      }
      return { message: 'Producto eliminado correctamente' };
    } catch (err: any) {
      if (err.code === '23503') {
        throw createError({ statusCode: 409, message: 'No se puede eliminar: el producto tiene ventas registradas' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
