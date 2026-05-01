import { defineEventHandler, getMethod, getRouterParam, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const id = getRouterParam(event, 'id');

  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'ID inválido' });
  }

  if (method === 'GET') {
    // Cabecera de la venta con JOIN a cliente y empleado
    const ventaResult = await pool.query(
      `SELECT v.id_venta, v.fecha_hora, v.total, c.id_cliente, c.nombre_completo AS nombre_cliente, c.correo AS correo_cliente, e.id_empleado, e.nombre_completo AS nombre_empleado, e.puesto
       FROM venta v
       JOIN cliente c ON v.id_cliente = c.id_cliente
       JOIN empleado e ON v.id_empleado = e.id_empleado
       WHERE v.id_venta = $1`,
      [id]
    );
    if (ventaResult.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Venta no encontrada' });
    }

    // JOIN 3, detalle con productos
    const detalleResult = await pool.query(
      `SELECT dv.id_detalle, dv.cantidad, dv.precio_unitario_venta, (dv.cantidad * dv.precio_unitario_venta) AS subtotal, p.id_producto, p.nombre AS nombre_producto
       FROM detalle_venta dv
       JOIN producto p ON dv.id_producto = p.id_producto
       WHERE dv.id_venta = $1
       ORDER BY dv.id_detalle`,
      [id]
    );

    return { ...ventaResult.rows[0], detalle: detalleResult.rows };
  }

  if (method === 'DELETE') {
    // Anular venta: transacción que devuelve el stock y elimina la venta
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const detalleResult = await client.query(
        'SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = $1',
        [id]
      );
      if (detalleResult.rows.length === 0) {
        const check = await client.query('SELECT id_venta FROM venta WHERE id_venta = $1', [id]);
        if (check.rows.length === 0) {
          throw createError({ statusCode: 404, message: 'Venta no encontrada' });
        }
      }

      // Devolver stock de cada producto
      for (const row of detalleResult.rows) {
        await client.query(
          'UPDATE producto SET stock = stock + $1 WHERE id_producto = $2',
          [row.cantidad, row.id_producto]
        );
      }

      await client.query('DELETE FROM venta WHERE id_venta = $1', [id]);
      await client.query('COMMIT');
      return { message: 'Venta anulada y stock restaurado correctamente' };
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.statusCode) throw err;
      throw createError({ statusCode: 500, message: 'Error al anular la venta: ' + err.message });
    } finally {
      client.release();
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
