import { defineEventHandler, getMethod, createError } from 'h3';

// Lista los endpoints de reportes disponibles
export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'GET') {
    throw createError({ statusCode: 405, message: 'Método no permitido' });
  }

  return {
    reportes: [
      { ruta: '/api/reportes/ventas-por-categoria', descripcion: 'Ingresos y ventas agrupados por categoría (GROUP BY + HAVING)' },
      { ruta: '/api/reportes/stock-bajo',           descripcion: 'Productos con stock menor al promedio (subquery)' },
      { ruta: '/api/reportes/top-clientes',         descripcion: 'Ranking de clientes por monto total (CTE + EXISTS)' },
      { ruta: '/api/reportes/clientes-sin-compra',  descripcion: 'Clientes sin ninguna compra registrada (NOT IN)' },
    ]
  };
});
