import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// En entorno de desarrollo (fuera de Docker), cargamos el .env desde la raíz
if (process.env.NODE_ENV !== 'production' && !process.env.DB_USER) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'proy2',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DB_NAME || 'tienda_db',
});

// Mensaje de éxito o error al conectar
pool.on('connect', () => {
  console.log('Conexión a PostgreSQL establecida');
});

pool.on('error', (err) => {
  console.error('Error inesperado en PostgreSQL', err);
});
