import { defineEventHandler, createError, getMethod } from 'h3';
import { pool } from '../../../utils/db';

// CTE (WITH) + subquery con EXISTS
// Ranking de clientes por monto total comprado, solo clientes activos (con al menos 1 venta)
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'GET') {
    throw createError({ statusCode: 405, message: 'Método no permitido' });
  }

  const result = await pool.query(
    `WITH resumen_clientes AS (
       SELECT
         c.id_cliente,
         c.nombre_completo,
         c.correo,
         COUNT(v.id_venta)  AS cantidad_compras,
         SUM(v.total)        AS monto_total,
         MAX(v.fecha_hora)   AS ultima_compra
       FROM cliente c
       JOIN venta v ON c.id_cliente = v.id_cliente
       GROUP BY c.id_cliente, c.nombre_completo, c.correo
     )
     SELECT
       nombre_completo,
       correo,
       cantidad_compras,
       monto_total,
       ultima_compra,
       RANK() OVER (ORDER BY monto_total DESC) AS posicion
     FROM resumen_clientes
     WHERE EXISTS (
       SELECT 1 FROM venta v WHERE v.id_cliente = resumen_clientes.id_cliente
     )
     ORDER BY monto_total DESC
     LIMIT 10`
  );

  return result.rows;
});
