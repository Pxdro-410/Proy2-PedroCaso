import { defineEventHandler, createError, getMethod } from 'h3';
import { pool } from '../../../utils/db';

// Subquery con NOT IN: clientes que nunca han realizado una compra
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'GET') {
    throw createError({ statusCode: 405, message: 'Método no permitido' });
  }

  const result = await pool.query(
    `SELECT id_cliente, nombre_completo, correo, telefono
     FROM cliente
     WHERE id_cliente NOT IN (
       SELECT DISTINCT id_cliente FROM venta
     )
     ORDER BY nombre_completo`
  );

  return result.rows;
});
