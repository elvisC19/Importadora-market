# 🏪 Importadora Market — Sistema Web MVP

<div align="center">

![Version](https://img.shields.io/badge/versión-1.0.0--beta-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/estado-en%20desarrollo-blue?style=for-the-badge)
![License](https://img.shields.io/badge/licencia-MIT-green?style=for-the-badge)

**Plataforma web responsive para una importadora boliviana.**
Centraliza la presencia digital, genera confianza en los clientes
y gestiona pedidos de forma eficiente.

[Ver Demo](#) · [Reportar Bug](https://github.com/elvisC19/Importadora-market/issues) · [Documentación API](http://localhost:8000/docs)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Uso](#-uso)
- [Módulos del Sistema](#-módulos-del-sistema)
- [API Endpoints](#-api-endpoints)
- [Equipo](#-equipo)

---

## 🚀 Sobre el Proyecto

**Importadora Market** es una plataforma web desarrollada como MVP (Producto Mínimo Viable) para una importadora boliviana. El sistema permite:

- 🛍️ **Clientes** — explorar catálogo, gestionar carrito y realizar pedidos
- 🔧 **Administradores** — gestionar productos, ofertas, pedidos y estadísticas

### Características principales

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| Autenticación | Registro, login, JWT, recuperación de contraseña | ✅ Completo |
| Catálogo | Productos, filtros, búsqueda, ofertas | ✅ Completo |
| Carrito | Persistente, gestión de cantidades | ✅ Completo |
| Pedidos | Creación, seguimiento, historial | ✅ Completo |
| Panel Admin | Dashboard, estadísticas, exportación CSV | 🔄 En desarrollo |
| Notificaciones | Correos de confirmación y contacto | 🔄 En desarrollo |

---

## 🛠 Tecnologías

### Backend
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-dev-003B57?style=flat-square&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-auth-black?style=flat-square&logo=jsonwebtokens)

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=flat-square)

---

## 🏗 Arquitectura

```
importadora-market/
├── backend/                  # API REST (FastAPI)
│   ├── app/
│   │   ├── api/v1/endpoints/ # Controladores REST
│   │   ├── core/             # Config, seguridad, base de datos
│   │   ├── models/           # Modelos ORM (SQLAlchemy)
│   │   ├── schemas/          # Validación Pydantic
│   │   ├── repositories/     # Acceso a datos
│   │   └── services/         # Lógica de negocio
│   ├── migrations/           # Migraciones Alembic
│   └── tests/                # Pruebas automatizadas
│
├── frontend/                 # React + Vite
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/            # Vistas principales
│       ├── contexts/         # Estado global (Auth, Cart)
│       ├── services/         # Comunicación con API
│       └── hooks/            # Custom hooks
│
└── docs/                     # Especificación y diseños
    ├── spec.md
    ├── ui-inventory.md
    └── designs/
```

---

## 🖥 Uso

### Rutas del Frontend

| URL | Descripción | Acceso |
|-----|-------------|--------|
| `http://localhost:5173` | Página principal | Público |
| `http://localhost:5173/productos` | Catálogo de productos | Público |
| `http://localhost:5173/productos/:id` | Detalle de producto | Público |
| `http://localhost:5173/login` | Iniciar sesión | Público |
| `http://localhost:5173/registro` | Registrarse | Público |
| `http://localhost:5173/recuperar-contrasena` | Recuperar contraseña | Público |
| `http://localhost:5173/carrito` | Carrito de compras reactivo | Público |
| `http://localhost:5173/perfil` | Mi perfil | Autenticado |
| `http://localhost:5173/checkout` | Formulario de pago y contacto | Autenticado |
| `http://localhost:5173/pedidos` | Historial de pedidos | Autenticado |
| `http://localhost:5173/importadora/productos` | Mis productos cargados | Importadora |
| `http://localhost:5173/importadora/subir` | Subir nuevo producto | Importadora |
| `http://localhost:5173/admin/usuarios` | Gestión usuarios | Admin |
| `http://localhost:5173/admin/inventario` | Gestión de inventario | Admin |
| `http://localhost:8000/docs` | Documentación API | Desarrollo |

---

## 📦 Módulos del Sistema

### Hito 1 — Gestión de Usuarios ✅
- Registro con validación de teléfono boliviano
- Login con JWT (expiración configurable)
- Recuperación de contraseña con token temporal
- Panel admin: crear, editar, eliminar, cambiar roles

### Hito 2 — Catálogo de Productos ✅
- Listado con paginación y filtros
- Búsqueda por nombre/categoría
- Ofertas y novedades
- CRUD completo para admin

### Hito 3 — Carrito y Pedidos ✅
- Carrito de compras interactivo y persistente (`localStorage` + sincronización con el estado global)
- Sincronización de ofertas, cálculo automático de totales y control de stock en tiempo real
- Formulario de checkout con validación estricta de celular en formato boliviano (`^[67]\d{7}$`)
- Historial de pedidos personal en formato acordeón dinámico ordenado cronológicamente
- Gestión y actualización de estados del pedido (`pendiente` → `confirmado` → `entregado` → `cancelado`)

### Hito 4 — Panel Admin y Estadísticas ✅
- Dashboard con métricas
- Gráficos con Chart.js
- Exportación CSV

### Hito 5 — Notificaciones y Contacto ✅
- Correos automáticos (confirmación, cambio estado)
- Formulario de contacto
- Página "Sobre nosotros"

### Hito 6 — Pruebas, Documentación y Despliegue ✅
- Cobertura de tests ≥ 70%
- Documentación completa
- Despliegue en Render con PostgreSQL y HTTPS

---

## 🚀 Despliegue en Render

### Variables de entorno requeridas en producción

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URI de conexión PostgreSQL (proporcionada por Render) | `postgresql://user:pass@host/db` |
| `SECRET_KEY` | Clave secreta para firmar tokens JWT | *(generada automáticamente por Render)* |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tiempo de vida del token en minutos | `120` |
| `FRONTEND_URL` | URL del frontend desplegado (para CORS) | `https://importadora-market-frontend.onrender.com` |
| `ADMIN_EMAIL` | Correo del administrador del sistema | `elvishcordova@gmail.com` |
| `SMTP_HOST` | Servidor SMTP para envío de correos | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto del servidor SMTP | `587` |
| `SMTP_USER` | Usuario SMTP | `tu-correo@gmail.com` |
| `SMTP_PASSWORD` | Contraseña de aplicación SMTP | `xxxx xxxx xxxx xxxx` |
| `VITE_API_URL` | *(Frontend)* URL base de la API | `https://importadora-market-backend.onrender.com/api/v1` |

### Pasos para crear la base de datos PostgreSQL en Render

1. **Crear la base de datos**: En el Dashboard de Render → **New** → **PostgreSQL** → seleccionar plan **Free** → nombre: `importadora-market-db` → **Create Database**.
2. **Crear el servicio backend**: **New** → **Web Service** → conectar el repositorio de GitHub → seleccionar `backend/` como **Root Directory** → runtime **Python**.
3. **Configurar Build Command**:
   ```bash
   pip install -r requirements.txt && python -m alembic upgrade head
   ```
4. **Configurar Start Command**:
   ```bash
   bash start.sh
   ```
5. **Vincular la base de datos**: En el servicio backend → **Environment** → agregar `DATABASE_URL` → seleccionar **From Database** → elegir `importadora-market-db` → propiedad `connectionURI`.
6. **Configurar las demás variables de entorno** listadas en la tabla anterior.
7. **Crear el servicio frontend**: **New** → **Static Site** → conectar el repositorio → seleccionar `frontend/` como **Root Directory** → Build Command: `npm install && npm run build` → Publish Directory: `dist`.
8. **Configurar `VITE_API_URL`** en el frontend con la URL del backend desplegado.

### Comando para ejecutar el seed inicial después del primer despliegue

Conectarse al **Shell** del servicio backend en Render y ejecutar:

```bash
# Sembrar usuario administrador
python seed_admin.py

# Sembrar categorías y productos de demostración
python seeds/seed_products.py
```

> **Nota:** El script `start.sh` ya ejecuta ambos seeds automáticamente en cada despliegue, por lo que normalmente no es necesario ejecutarlos manualmente.

### 📖 Documentación de la API

La documentación interactiva de la API está disponible en:

- **Swagger UI**: `https://TU-BACKEND.onrender.com/docs`
- **ReDoc**: `https://TU-BACKEND.onrender.com/redoc`

En desarrollo local: `http://localhost:8000/docs`

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/v1/auth/register          Registrar usuario
POST   /api/v1/auth/login             Iniciar sesión
POST   /api/v1/auth/forgot-password   Solicitar reset
POST   /api/v1/auth/reset-password    Confirmar reset
```

### Usuarios
```
GET    /api/v1/users/me               Ver perfil
PUT    /api/v1/users/me               Editar perfil
```

### Admin
```
GET    /api/v1/admin/users            Listar usuarios
POST   /api/v1/admin/users            Crear usuario
PUT    /api/v1/admin/users/{id}       Editar usuario
DELETE /api/v1/admin/users/{id}       Eliminar usuario
PATCH  /api/v1/admin/users/{id}/role  Cambiar rol
```

### Productos
```
GET    /api/v1/products                     Listar productos
GET    /api/v1/products/featured            Listar productos destacados
GET    /api/v1/products/offers              Listar productos en oferta
GET    /api/v1/products/new-arrivals        Listar novedades
GET    /api/v1/products/{id}                Ver detalle de producto
GET    /api/v1/categories                   Listar categorías
POST   /api/v1/products                     Enviar producto para aprobación
GET    /api/v1/admin/products/pending       Listar productos pendientes (Admin)
POST   /api/v1/admin/products               Crear producto directamente (Admin)
PUT    /api/v1/admin/products/{id}          Editar producto (Admin)
PATCH  /api/v1/admin/products/{id}/approve  Aprobar/Desaprobar producto (Admin)
PATCH  /api/v1/admin/products/{id}/visibility Alternar destacado (Admin)
DELETE /api/v1/admin/products/{id}          Eliminar producto (Admin)
POST   /api/v1/admin/categories             Crear categoría (Admin)
DELETE /api/v1/admin/categories/{id}        Eliminar categoría (Admin)
```

### Pedidos (Hito 3)
```
POST   /api/v1/orders/                      Crear nuevo pedido a partir de carrito
GET    /api/v1/orders/me                    Obtener historial de pedidos del cliente
GET    /api/v1/orders/                      Obtener todos los pedidos (Admin)
PUT    /api/v1/orders/{order_id}/status     Actualizar estado de un pedido (Admin)
```

> Documentación completa e interactiva: `http://localhost:8000/docs`

---

## 👥 Equipo

Desarrollado como proyecto académico para la materia **SIS-324**
en la *Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca*.

| Nombre | GitHub | Rol |
|--------|--------|-----|
| Elvis | [@elvisC19](https://github.com/elvisC19) | ------ |
| Marvin | [@Señor_Gus](https://github.com/Marvin-Gustavo) | ------ |
| Job | [@JOB](https://github.com/mamanicondorijobismael) | --------- |

---

## 📄 Licencia

Este proyecto es de uso académico. Todos los derechos reservados © 2026.

---

<div align="center">
  Hecho por 🦖
</div>

