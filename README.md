# Gestión Tienda tecnológica – Proyecto 2

**Curso:** Bases de Datos 1 — Universidad del Valle de Guatemala  
**Autor:** Pedro Caso – 241286  
**Rama:** `proy2/web`

---

## Descripción

Aplicación web fullstack para gestionar el inventario y las ventas de una tienda. Permite a los empleados autenticados administrar productos, clientes y proveedores, registrar ventas con detalle de artículos, y consultar reportes avanzados con gráficas interactivas.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 16 |
| Backend | Node.js + Nitro (H3) |
| Frontend | **React 18 + Vite** |
| Autenticación | JWT (jsonwebtoken + bcrypt) |
| Gráficas | Recharts |
| Tests | Vitest + Testing Library |
| Linting | ESLint v9 (flat config) |
| Contenerización | Docker + Docker Compose |

---

## Estructura del proyecto

```
Proy2-PedroCaso/
├── database/
│   ├── 01_init.sql          # DDL: creación de tablas + restricciones
│   ├── 02_seed.sql          # Datos de prueba
│   └── 03_views.sql         # Vistas SQL utilizadas por el backend
├── backend/
│   ├── routes/api/
│   │   ├── auth/            # POST /api/auth/login
│   │   ├── productos/       # CRUD completo
│   │   ├── clientes/        # CRUD completo
│   │   ├── ventas/          # CRUD + transacciones
│   │   ├── categorias/      # CRUD
│   │   ├── proveedores/     # CRUD
│   │   ├── empleados/       # GET, POST
│   │   └── reportes/        # 4 endpoints de análisis
│   ├── utils/db.ts           # Pool de conexión a PostgreSQL
│   └── nitro.config.ts
├── frontend/
│   ├── src/
│   │   ├── context/         # AuthContext (Context API + useReducer)
│   │   ├── components/      # Navbar, MainLayout
│   │   ├── views/           # Login, Home, Productos, Clientes, Ventas, Reportes
│   │   └── test/            # Vitest: cartReducer, AuthContext, LoginView
│   ├── eslint.config.js      # ESLint v9 flat config
│   └── vite.config.js
├── docker-compose.yml
├── .env.example              # Plantilla de variables de entorno
└── README.md
```

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- Git

---

## Levantar el proyecto desde cero

### 1. Clonar el repositorio

```bash
git clone https://github.com/Pxdro-410/Proy2-PedroCaso.git
cd Proy2-PedroCaso
git checkout proy2/web
```

### 2. Crear el archivo `.env`

```bash
cp .env.example .env
```

Completar con los valores indicados en los comentarios de la entrega.

### 3. Levantar con Docker Compose

```bash
docker compose up --build
```

La base de datos se inicializa automáticamente con `01_init.sql`, `02_seed.sql` y `03_views.sql`.

### 4. Acceder a la aplicación

```
http://localhost:41286
```

> El puerto corresponde al carnet `241286` (sin el `2` inicial).

### Credenciales de acceso de prueba

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

## API Reference

### Autenticación

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| `POST` | `/api/auth/login` | `{ username, password }` | `{ token, user }` |

> Todas las rutas siguientes requieren el header `Authorization: Bearer <token>`.

---

### Productos `/api/productos`

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/productos` | — | Listar todos (usa `vista_productos_detallados`) |
| `POST` | `/api/productos` | `{ nombre, precio_actual, stock, id_categoria, id_proveedor }` | Crear producto |
| `PUT` | `/api/productos/:id` | `{ nombre, precio_actual, stock, id_categoria, id_proveedor }` | Actualizar producto |
| `DELETE` | `/api/productos/:id` | — | Eliminar producto |

---

### Clientes `/api/clientes`

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/clientes` | — | Listar todos |
| `POST` | `/api/clientes` | `{ nombre_completo, correo, telefono? }` | Crear cliente |
| `PUT` | `/api/clientes/:id` | `{ nombre_completo, correo, telefono? }` | Actualizar cliente |
| `DELETE` | `/api/clientes/:id` | — | Eliminar (falla con 409 si tiene ventas) |

---

### Ventas `/api/ventas`

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/ventas` | — | Listar todas las ventas |
| `GET` | `/api/ventas/:id` | — | Detalle completo con líneas |
| `POST` | `/api/ventas` | `{ id_cliente, id_empleado, items: [{id_producto, cantidad}] }` | Registrar venta (transacción SQL) |
| `DELETE` | `/api/ventas/:id` | — | Anular venta (restaura stock) |

---

### Categorías y Proveedores

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/categorias` | Listar categorías |
| `POST` | `/api/categorias` | Crear categoría |
| `GET` | `/api/proveedores` | Listar proveedores |
| `POST` | `/api/proveedores` | Crear proveedor |

---

### Empleados

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/empleados` | Listar empleados |
| `POST` | `/api/empleados` | Crear empleado |

---

### Reportes

| Método | Ruta | Técnica SQL | Descripción |
|--------|------|-------------|-------------|
| `GET` | `/api/reportes/ventas-por-categoria` | `JOIN` triple + `GROUP BY` + `HAVING` + `SUM/COUNT/AVG` | Ingresos y ventas por categoría |
| `GET` | `/api/reportes/stock-bajo` | Subquery escalar `WHERE stock < (SELECT AVG...)` | Productos bajo el promedio de stock |
| `GET` | `/api/reportes/top-clientes` | CTE `WITH` + `RANK() OVER` + `EXISTS` | Top 10 clientes por monto |
| `GET` | `/api/reportes/clientes-sin-compra` | Subquery `NOT IN` | Clientes sin ninguna compra |

---

### Códigos de error HTTP

| Código | Significado |
|--------|-------------|
| `400` | Datos requeridos faltantes o inválidos |
| `401` | Token JWT ausente o inválido |
| `404` | Recurso no encontrado |
| `405` | Método HTTP no permitido |
| `409` | Conflicto de integridad (correo duplicado, FK activa) |
| `500` | Error interno del servidor |

Todos los errores devuelven JSON

---

## Frontend — Requisitos técnicos implementados

| Requisito | Implementación |
|---|---|
| **React 18** | Migración completa desde Vue 3 |
| **React Router v6** | 6 rutas con `PrivateRoute` y redirect automático |
| **Context API** | `AuthContext` con `login()`, `logout()`, `isAuthenticated` |
| **useReducer** | `cartReducer` en `VentasView` (ADD/REMOVE/UPDATE/CLEAR) |
| **useState** | Múltiples estados por vista (lista, modal, alert, loading, search) |
| **useEffect** | Fetch inicial con `Promise.all` en cada vista |
| **useCallback** | Handlers de fetch y CRUD con referencias estables |
| **useMemo** | Filtrado en tiempo real de listas (Productos, Clientes) |
| **ESLint v9** | Flat config, 0 errores, 0 warnings |
| **Vitest** | 20 tests — cartReducer (10), AuthContext (5), LoginView (5) |
| **Diseño responsivo** | `@media` 768px y 480px, grids fluidos |
| **Gráficas** | Recharts — BarChart vertical, BarChart horizontal, PieChart |

---

## Diseño de base de datos

### Tablas

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
- `FOREIGN KEY` con `ON DELETE RESTRICT` / `CASCADE`
- `NOT NULL` en campos obligatorios
- `CHECK`: `precio_actual >= 0`, `stock >= 0`, `cantidad > 0`
- `UNIQUE`: correos, DPI, usernames, `(id_venta, id_producto)`

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |

> Los valores exactos se incluyen en los comentarios de la entrega (no se versionan por seguridad).

---

## Informe del proyecto

[Proyecto2Datos - Pedro Caso.docx](https://github.com/user-attachments/files/27294999/Proyecto2Datos.-.Pedro.Caso.docx)
