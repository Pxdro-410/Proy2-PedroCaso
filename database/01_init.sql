-- DDL para la creación de tablas en la base de datos 
-- Pedro Caso - 241286

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre_empresa VARCHAR(150) NOT NULL,
    contacto_principal VARCHAR(150) NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20)
);

CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    dpi VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_empleado INTEGER NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT fk_usuario_empleado FOREIGN KEY (id_empleado)
        REFERENCES empleado(id_empleado) ON DELETE CASCADE
);

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio_actual NUMERIC(10,2) NOT NULL CHECK (precio_actual >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    id_categoria INTEGER NOT NULL,
    id_proveedor INTEGER NOT NULL,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria) ON DELETE RESTRICT,
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES proveedor(id_proveedor) ON DELETE RESTRICT
);

CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    id_cliente INTEGER NOT NULL,
    id_empleado INTEGER NOT NULL,
    CONSTRAINT fk_venta_cliente FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente) ON DELETE RESTRICT,
    CONSTRAINT fk_venta_empleado FOREIGN KEY (id_empleado)
        REFERENCES empleado(id_empleado) ON DELETE RESTRICT
);

CREATE TABLE detalle_venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_venta NUMERIC(10,2) NOT NULL CHECK (precio_unitario_venta >= 0),
    CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta)
        REFERENCES venta(id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto) ON DELETE RESTRICT,
    CONSTRAINT uq_detalle UNIQUE (id_venta, id_producto)
);