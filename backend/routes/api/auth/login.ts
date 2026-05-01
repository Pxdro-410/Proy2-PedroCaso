import { defineEventHandler, getMethod, readBody, createError } from 'h3';
import { pool } from '../../../utils/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405, message: 'Método no permitido' });
  }

  const body = await readBody(event);
  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, message: 'Usuario y contraseña son requeridos' });
  }

  const { username, password } = body;

  try {
    // Buscar usuario en DB
    const result = await pool.query(
      `SELECT u.id_usuario, u.username, u.password_hash, e.nombre_completo, e.puesto 
       FROM usuario u
       JOIN empleado e ON u.id_empleado = e.id_empleado
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      throw createError({ statusCode: 401, message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verificar contraseña con bcrypt
    // Solo funcionará con hashes válidos como admin, ya que los otros son genericos en la base de datos
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password_hash);
    } catch (err) {
      // Por si bcrypt falla procesando el hash de dummy
      isValid = false;
    }

    if (!isValid) {
      throw createError({ statusCode: 401, message: 'Credenciales inválidas' });
    }

    // Firmar JWT
    const secret = process.env.JWT_SECRET || 'fallbacksecret';
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        username: user.username,
        nombre: user.nombre_completo,
        puesto: user.puesto
      },
      secret,
      { expiresIn: '8h' }
    );

    return {
      message: 'Autenticación exitosa',
      token,
      user: {
        username: user.username,
        nombre: user.nombre_completo,
        puesto: user.puesto
      }
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Error interno del servidor' });
  }
});
