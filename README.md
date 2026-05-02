# Gestión Tienda – Proyecto 2

**Curso:** Bases de Datos 1 - Universidad del Valle de Guatemala  
**Autor:** Pedro Caso – 241286  

---

## Descripción

Aplicación web fullstack para gestionar el **inventario y las ventas** de una tienda. Permite administrar productos, clientes, empleados y proveedores, registrar ventas con detalle de artículos, y consultar reportes avanzados con SQL complejo.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 16 |
| Backend | Node.js + Nitro (H3) |
| Frontend | Vue 3 + Vite|
| Autenticación | JWT (jsonwebtoken + bcrypt) |
| Contenerización | Docker + Docker Compose |

---

## Estructura del proyecto

```
Proy2-PedroCaso/
├── database/
│   ├── 01_init.sql       # DDL: creación de tablas
│   ├── 02_seed.sql       # Datos de prueba (25 registros por tabla)
│   └── 03_views.sql      # Vistas SQL utilizadas por el backend
├── backend/
│   ├── routes/api/       # Endpoints REST (productos, clientes, ventas, reportes, auth)
│   ├── utils/db.ts       # Pool de conexión a PostgreSQL
│   └── nitro.config.ts
├── frontend/
│   ├── src/
│   │   ├── views/        # Vistas: Login, Dashboard, Productos, Clientes, Ventas, Reportes
│   │   ├── components/   # Navbar, layouts
│   │   └── stores/       # Pinia store para autenticación
│   └── vite.config.js
├── docker-compose.yml
├── .env                  # Variables de entorno (no incluido en el repo)
└── .env.example          # Plantilla de variables de entorno
```

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- Git

---

## Levantar el proyecto desde cero

### 1. Clonar el repositorio

```bash
git clone https://github.com/Pxdro-410/Proy2-PedroCaso
cd Proy2-PedroCaso
```

### 2. Crear el archivo `.env`

Copiar la plantilla y completar los valores. Para calificación, usar exactamente estos:

```bash
cp .env.example .env
```

Contenido del `.env`:

```env
DB_USER=proy2
DB_PASSWORD=secret
DB_NAME=tienda_db
JWT_SECRET=supersecretkey123
```

### 3. Levantar con Docker Compose

```bash
docker compose up --build
```

### 4. Acceder a la aplicación

Abrir en el navegador el siguiente puerto:
nota: el puerto es mi carnet sin el 2 al inicio del 241286 -> 41286 

```
http://localhost:41286
```

### Credenciales de acceso
tener en cuenta no agregar espacios de mas al escribir las credenciales de acceso 

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |

---

## Detener el proyecto

```bash
# Detener sin borrar datos
docker compose down

# Detener y eliminar volúmenes (reinicia la BD desde cero)
docker compose down -v
```

---

## Funcionalidades implementadas

### Módulos CRUD
- **Productos** – Crear, leer, editar y eliminar productos con categoría y proveedor
- **Clientes** – Gestión completa de clientes

### Registro de Ventas
- Selección de cliente y vendedor (empleado)
- Carrito de compras con múltiples productos
- Validación de stock en tiempo real
- Transacción explícita con `BEGIN / COMMIT / ROLLBACK` y manejo de errores

### Reportes avanzados (visibles en UI)
| Reporte | Técnica SQL |
|---|---|
| Ventas por categoría | `JOIN` triple + `GROUP BY` + `HAVING` + `SUM/COUNT/AVG` |
| Productos con stock bajo | Subquery escalar en `WHERE` (`< SELECT AVG(...)`) |
| Ranking de mejores clientes | CTE (`WITH`) + `RANK() OVER` + subquery con `EXISTS` |
| Clientes sin compras | Subquery con `NOT IN` |

### Vistas SQL (`03_views.sql`)
- `vista_productos_detallados` – JOIN de producto + categoría + proveedor
- `vista_ventas_resumen` – JOIN de venta + cliente + empleado
- `vista_detalle_ventas` – JOIN de detalle_venta + producto

### Autenticación
- Login con JWT
- Sesión manejada con Pinia (persiste en `localStorage`)
- Rutas protegidas — redirige al login si no hay sesión activa
- Logout

---

## Diseño de base de datos

### Tablas principales

| Tabla | Descripción |
|---|---|
| `categoria` | Categorías de productos |
| `proveedor` | Proveedores de la tienda |
| `producto` | Inventario con precio y stock |
| `cliente` | Clientes registrados |
| `empleado` | Personal de la tienda |
| `usuario` | Cuentas de acceso (vinculadas a empleados) |
| `venta` | Cabecera de cada venta |
| `detalle_venta` | Líneas de producto por venta |

### Restricciones de integridad
- `PRIMARY KEY` en todas las tablas
- `FOREIGN KEY` con `ON DELETE RESTRICT` / `CASCADE` según la relación
- `NOT NULL` en campos obligatorios
- `CHECK` en `precio_actual >= 0`, `stock >= 0`, `cantidad > 0`
- `UNIQUE` en correos, DPI, usernames y combinación `(id_venta, id_producto)`

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DB_USER` | Usuario de PostgreSQL (debe ser `proy2`) |
| `DB_PASSWORD` | Contraseña de PostgreSQL (debe ser `secret`) |
| `DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
