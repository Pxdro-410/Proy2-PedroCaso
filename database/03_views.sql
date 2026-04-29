-- Vistas para la base de datos
-- Pedro Caso - 241286

-- Vista de productos con detalles de su categoría y proveedor
CREATE OR REPLACE VIEW vista_productos_detallados AS
SELECT p.id_producto, p.nombre AS nombre_producto, p.precio_actual, p.stock, c.nombre AS nombre_categoria,pr.nombre_empresa AS nombre_proveedor
FROM producto p
JOIN categoria c ON p.id_categoria = c.id_categoria
JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor;

-- Vista de resumen de ventas con detalles de cliente y empleado
CREATE OR REPLACE VIEW vista_ventas_resumen AS
SELECT v.id_venta, v.fecha_hora, v.total, c.nombre_completo AS nombre_cliente, e.nombre_completo AS nombre_empleado
FROM venta v
JOIN cliente c ON v.id_cliente = c.id_cliente
JOIN empleado e ON v.id_empleado = e.id_empleado;

-- Vista de detalle de ventas
CREATE OR REPLACE VIEW vista_detalle_ventas AS
SELECT dv.id_detalle, dv.id_venta, p.nombre AS nombre_producto, dv.cantidad, dv.precio_unitario_venta,(dv.cantidad * dv.precio_unitario_venta) AS subtotal
FROM detalle_venta dv
JOIN producto p ON dv.id_producto = p.id_producto;
