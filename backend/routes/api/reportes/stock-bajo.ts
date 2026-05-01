import { defineEventHandler, createError, getMethod } from 'h3';
import { pool } from '../../../utils/db';

// Subquery: productos con stock por debajo del promedio general
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'GET') {
    throw createError({ statusCode: 405, message: 'Método no permitido' });
  }

  const result = await pool.query(
    `SELECT p.id_producto, p.nombre, p.stock, p.precio_actual,
            c.nombre AS categoria
     FROM producto p
     JOIN categoria c ON p.id_categoria = c.id_categoria
     WHERE p.stock < (SELECT AVG(stock) FROM producto)
     ORDER BY p.stock ASC`
  );

  const avgResult = await pool.query('SELECT ROUND(AVG(stock), 2) AS promedio FROM producto');

  return {
    promedio_stock: avgResult.rows[0].promedio,
    productos: result.rows
  };
});
