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
      'SELECT id_empleado, nombre_completo, puesto, correo, dpi FROM empleado WHERE id_empleado = $1',
      [id]
    );
    if (result.rows.length === 0) {
      throw createError({ statusCode: 404, message: 'Empleado no encontrado' });
    }
    return result.rows[0];
  }

  if (method === 'PUT') {
    const body = await readBody(event);
    if (!body?.nombre_completo?.trim() || !body?.puesto?.trim() || !body?.correo?.trim() || !body?.dpi?.trim()) {
      throw createError({ statusCode: 400, message: 'nombre_completo, puesto, correo y dpi son requeridos' });
    }
    try {
      const result = await pool.query(
        'UPDATE empleado SET nombre_completo = $1, puesto = $2, correo = $3, dpi = $4 WHERE id_empleado = $5 RETURNING *',
        [body.nombre_completo.trim(), body.puesto.trim(), body.correo.trim(), body.dpi.trim(), id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Empleado no encontrado' });
      }
      return result.rows[0];
    } catch (err: any) {
      if (err.code === '23505') {
        throw createError({ statusCode: 409, message: 'Ya existe un empleado con ese correo o DPI' });
      }
      throw err;
    }
  }

  if (method === 'DELETE') {
    try {
      const result = await pool.query(
        'DELETE FROM empleado WHERE id_empleado = $1 RETURNING id_empleado',
        [id]
      );
      if (result.rows.length === 0) {
        throw createError({ statusCode: 404, message: 'Empleado no encontrado' });
      }
      return { message: 'Empleado eliminado correctamente' };
    } catch (err: any) {
      if (err.code === '23503') {
        throw createError({ statusCode: 409, message: 'No se puede eliminar: el empleado tiene ventas o usuario asociado' });
      }
      throw err;
    }
  }

  throw createError({ statusCode: 405, message: 'Método no permitido' });
});
