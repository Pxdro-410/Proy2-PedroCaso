import { defineEventHandler, getMethod, readBody, createError } from 'h3';
import { pool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    // se usa el join que esta en la vista que combina venta + cliente + empleado
    const result = await pool.query(
      `SELECT id_venta, fecha_hora, total, nombre_cliente, nombre_empleado
       FROM vista_ventas_resumen
       ORDER BY fecha_hora DESC`
    );
    return result.rows;
  }

  if (method === 'POST') {
    const body = await readBody(event);

    if (!body?.id_cliente || !body?.id_empleado || !Array.isArray(body?.items) || body.items.length === 0) {
      throw createError({ statusCode: 400, message: 'id_cliente, id_empleado e items son requeridos' });
    }

    for (const item of body.items) {
      if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
        throw createError({ statusCode: 400, message: 'Cada item debe tener id_producto y cantidad > 0' });
      }
    }

    // Transacción explícita con ROLLBACK en caso de error
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let total = 0;
      const itemsConPrecio: { id_producto: number; cantidad: number; precio_unitario: number }[] = [];

      // Verificar stock y obtener precios actuales
      for (const item of body.items) {
        const prodResult = await client.query(
          'SELECT id_producto, precio_actual, stock FROM producto WHERE id_producto = $1 FOR UPDATE',
          [item.id_producto]
        );
        if (prodResult.rows.length === 0) {
          throw createError({ statusCode: 404, message: `Producto ${item.id_producto} no encontrado` });
        }
        const prod = prodResult.rows[0];
        if (prod.stock < item.cantidad) {
          throw createError({
            statusCode: 409,
            message: `Stock insuficiente para el producto ${item.id_producto}. Disponible: ${prod.stock}`
          });
        }
        const subtotal = Number(prod.precio_actual) * item.cantidad;
        total += subtotal;
        itemsConPrecio.push({ id_producto: item.id_producto, cantidad: item.cantidad, precio_unitario: Number(prod.precio_actual) });
      }

      // Insertar la venta
      const ventaResult = await client.query(
        'INSERT INTO venta (id_cliente, id_empleado, total) VALUES ($1, $2, $3) RETURNING *',
        [body.id_cliente, body.id_empleado, total]
      );
      const venta = ventaResult.rows[0];

      // Insertar cada línea de detalle y descontar stock
      for (const item of itemsConPrecio) {
        await client.query(
          'INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario_venta) VALUES ($1, $2, $3, $4)',
          [venta.id_venta, item.id_producto, item.cantidad, item.precio_unitario]
        );
        await client.query(
          'UPDATE producto SET stock = stock - $1 WHERE id_producto = $2',
          [item.cantidad, item.id_producto]
        );
      }

      await client.query('COMMIT');
      return { ...venta, items: itemsConPrecio };
    } catch (err: any) {
      await client.query('ROLLBACK');
      // Re-lanzar errores de negocio (statusCode ya definido)
      if (err.statusCode) throw err;
      if (err.code === '23503') {
        throw createError({ statusCode: 400, message: 'El cliente o empleado indicado no existe' });
      }
      throw createError({ statusCode: 500, message: 'Error al registrar la venta: ' + err.message });
    } finally {
      client.release();
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
