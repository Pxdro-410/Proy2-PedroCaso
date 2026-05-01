import { defineEventHandler, createError, getMethod } from 'h3';
import { pool } from '../../../utils/db';

// utlizando GROUP BY, HAVING y funciones de agregación
// Muestra categorías con al menos 1 venta, su total vendido y cantidad de ventas
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'GET') {
    throw createError({ statusCode: 405, message: 'Método no permitido' });
  }

  const result = await pool.query(
    `SELECT
       c.nombre AS categoria,
       COUNT(DISTINCT dv.id_venta)          AS total_ventas,
       SUM(dv.cantidad)                      AS unidades_vendidas,
       SUM(dv.cantidad * dv.precio_unitario_venta) AS ingresos_totales,
       AVG(dv.precio_unitario_venta)         AS precio_promedio
     FROM detalle_venta dv
     JOIN producto p      ON dv.id_producto  = p.id_producto
     JOIN categoria c     ON p.id_categoria  = c.id_categoria
     GROUP BY c.id_categoria, c.nombre
     HAVING SUM(dv.cantidad * dv.precio_unitario_venta) > 0
     ORDER BY ingresos_totales DESC`
  );

  return result.rows;
});
