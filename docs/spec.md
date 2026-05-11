# **FASE I (MVP) – Sistema Web para Importadora Market**

## **1\. Contexto General del Proyecto**

La Fase I del proyecto consiste en el desarrollo de una plataforma web responsive (adaptable a dispositivos móviles y de escritorio) para una importadora boliviana. El objetivo principal es centralizar su presencia digital, generar confianza en los clientes y gestionar pedidos de manera manual, sin integrar pagos en línea durante esta primera etapa.

El sistema estará orientado principalmente a dos tipos de usuarios:

* **Clientes:** podrán explorar el catálogo de productos, visualizar ofertas, gestionar un carrito de compras y enviar pedidos proporcionando sus datos de contacto.  
* **Administrador:** será responsable de gestionar productos, ofertas, pedidos, mensajes de contacto y visualizar estadísticas básicas del negocio.

Las historias de usuario fueron refinadas incluyendo:

* Criterios de aceptación verificables.  
* Estimaciones usando puntos Fibonacci.  
* Priorización mediante metodología MoSCoW.  
* Requisitos adicionales relacionados con:  
  * manejo de stock,  
  * seguridad,  
  * notificaciones,  
  * SEO básico,  
  * cumplimiento legal,  
  * accesibilidad,  
  * rendimiento y analítica.

El alcance fue definido para obtener un MVP funcional en aproximadamente 3 meses.

---

# **2\. Historias de Usuario**

---

# **MÓDULO 1: AUTENTICACIÓN Y GESTIÓN DE USUARIOS**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-01 | Como cliente quiero registrarme con correo electrónico, contraseña y teléfono (WhatsApp) para crear mi cuenta y realizar pedidos. | El sistema debe validar correos únicos, almacenar contraseñas con bcrypt y aceptar teléfonos bolivianos válidos. Se enviará un correo de bienvenida tras el registro exitoso. | 3 |
| HU-02 | Como cliente quiero iniciar sesión con correo y contraseña para acceder a mi carrito persistente y ver mis pedidos. | La sesión expirará tras 2 horas de inactividad y existirá bloqueo temporal tras múltiples intentos fallidos. | 2 |
| HU-03 | Como administrador quiero iniciar sesión en el panel administrativo para gestionar productos, ofertas y pedidos. | Solo usuarios con rol administrador podrán acceder al panel `/admin`. | 2 |
| HU-04 | Como cliente quiero recuperar mi contraseña olvidada para no perder acceso a mi cuenta. | El sistema enviará un enlace temporal válido por 30 minutos para restablecer la contraseña. | 3 |

---

# **MÓDULO 2: CATÁLOGO DE PRODUCTOS**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-05 | Como cliente quiero visualizar productos con imagen, nombre, precio y descripción para explorar el catálogo. | Las imágenes estarán optimizadas en formato WebP y los productos mostrarán disponibilidad según stock. | 5 |
| HU-06 | Como cliente quiero buscar productos por nombre o palabras clave para encontrar artículos específicos. | La búsqueda será parcial y mostrará mensajes cuando no existan coincidencias. | 3 |
| HU-07 | Como cliente quiero filtrar productos por categoría, precio y disponibilidad para refinar mi búsqueda. | Los filtros funcionarán mediante AJAX sin recargar la página. | 5 |
| HU-08 | Como administrador quiero agregar nuevos productos para mantener actualizado el catálogo. | El sistema validará datos obligatorios, precio mayor a cero y redimensionará imágenes automáticamente. | 3 |
| HU-09 | Como administrador quiero editar productos existentes para actualizar información o precios. | El sistema mantendrá historial de cambios de precio y actualizará stock en tiempo real. | 3 |
| HU-10 | Como administrador quiero desactivar productos sin eliminarlos físicamente para conservar el historial. | Los productos desactivados no aparecerán en el catálogo público. | 2 |
| HU-11 | Como administrador quiero marcar productos como destacados o novedades para promocionarlos. | Existirá un límite de 10 productos destacados simultáneamente. | 2 |

---

# **MÓDULO 3: OFERTAS Y NOVEDADES**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-12 | Como cliente quiero ver productos en oferta para aprovechar promociones. | Se mostrará el precio original tachado y el porcentaje de descuento calculado automáticamente. | 3 |
| HU-13 | Como cliente quiero visualizar novedades para conocer los productos recientes. | El sistema mostrará los últimos productos agregados con etiqueta “Nuevo”. | 2 |
| HU-14 | Como administrador quiero crear ofertas programadas para gestionar promociones. | Las ofertas tendrán fechas de inicio y fin automáticas. | 5 |
| HU-15 | Como administrador quiero editar o eliminar ofertas activas para ajustar promociones. | El sistema restaurará automáticamente el precio normal al eliminar la oferta. | 3 |

---

# **MÓDULO 4: CARRITO DE COMPRAS PERSISTENTE**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-16 | Como cliente quiero agregar productos al carrito para preparar mi pedido. | El sistema validará disponibilidad de stock antes de agregar productos. | 2 |
| HU-17 | Como cliente quiero visualizar el resumen de mi carrito para revisar mi pedido. | El carrito mostrará subtotales, descuentos y total general en bolivianos. | 2 |
| HU-18 | Como cliente quiero modificar cantidades en el carrito para ajustar mi compra. | Los cálculos se actualizarán dinámicamente mediante AJAX. | 2 |
| HU-19 | Como cliente quiero eliminar productos del carrito para descartar artículos no deseados. | El total se actualizará inmediatamente tras la eliminación. | 1 |
| HU-20 | Como cliente quiero conservar mi carrito incluso después de cerrar sesión para continuar luego. | El carrito se almacenará en cookies o base de datos según el estado de autenticación. | 5 |

---

# **MÓDULO 5: GENERACIÓN Y GESTIÓN DE PEDIDOS**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-21 | Como cliente quiero confirmar mi pedido proporcionando datos de contacto y dirección para enviar mi solicitud. | El sistema validará teléfonos bolivianos y reservará stock temporalmente. | 5 |
| HU-22 | Como cliente quiero recibir un correo de confirmación para tener constancia de mi pedido. | El correo incluirá detalle completo del pedido y número de referencia. | 3 |
| HU-23 | Como administrador quiero visualizar pedidos ordenados por fecha para gestionarlos eficientemente. | Los pedidos podrán filtrarse por estado y rango de fechas. | 5 |
| HU-24 | Como administrador quiero cambiar estados de pedidos y agregar notas internas para llevar trazabilidad. | Los cambios de estado podrán generar notificaciones automáticas al cliente. | 3 |
| HU-25 | Como cliente quiero visualizar el estado de mis pedidos desde mi perfil para conocer el avance de la entrega. | El sistema actualizará el estado automáticamente desde el servidor. | 2 |

---

# **MÓDULO 6: INFORMACIÓN CORPORATIVA Y CONTACTO**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-27 | Como cliente quiero conocer la historia y misión de la empresa para generar confianza. | La página incluirá imágenes, logo y mapa integrado de ubicación. | 2 |
| HU-28 | Como cliente quiero visualizar información de contacto para comunicarme fácilmente. | Existirá integración directa con WhatsApp mediante enlaces clicables. | 1 |
| HU-29 | Como cliente quiero enviar mensajes mediante un formulario de contacto para resolver dudas. | El sistema implementará validaciones y reCAPTCHA para evitar spam. | 3 |
| HU-30 | Como administrador quiero recibir y gestionar mensajes de contacto desde el panel administrativo. | Los mensajes quedarán almacenados en la base de datos. | 3 |

---

# **MÓDULO 7: PANEL ADMINISTRATIVO Y ESTADÍSTICAS**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-31 | Como administrador quiero visualizar un dashboard con métricas generales del negocio. | El dashboard mostrará productos activos, pedidos, ingresos y visitas. | 3 |
| HU-32 | Como administrador quiero visualizar gráficos de pedidos por día para identificar tendencias. | El gráfico se implementará utilizando Chart.js. | 5 |
| HU-33 | Como administrador quiero visualizar los productos más vendidos para identificar popularidad. | El sistema permitirá filtrar por rango de fechas. | 3 |
| HU-34 | Como administrador quiero exportar pedidos en formato CSV para fines contables. | El archivo será descargable y compatible con UTF-8. | 3 |

---

# **MÓDULO 8: COMUNICACIÓN DIRECTA**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-36 | Como cliente quiero acceder rápidamente a WhatsApp para consultar disponibilidad. | El sistema mostrará un botón flotante de WhatsApp en todas las páginas. | 2 |
| HU-37 | Como administrador quiero recibir notificaciones por correo sobre mensajes enviados desde el formulario de contacto. | El correo incluirá acceso directo al panel administrativo. | 1 |

---

# **MÓDULO 9: CUMPLIMIENTO LEGAL Y CONFIANZA**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-38 | Como cliente quiero leer las políticas de privacidad y términos de uso para conocer el manejo de mis datos. | El sitio incluirá páginas legales accesibles desde el footer. | 2 |
| HU-39 | Como cliente quiero aceptar cookies para utilizar correctamente el sitio web. | El sistema mostrará un banner de consentimiento de cookies. | 1 |
| HU-40 | Como administrador quiero transmitir confianza mediante SSL y redes sociales oficiales. | El sistema forzará HTTPS y mostrará enlaces a redes sociales oficiales. | 1 |

---

# **MÓDULO 10: RENDIMIENTO, SEO Y REQUISITOS NO FUNCIONALES**

| ID | Historia de Usuario | Criterios de Aceptación | Puntos |
| ----- | ----- | ----- | ----- |
| HU-41 | Como cliente quiero que el sitio cargue rápidamente incluso con conexión lenta. | El sitio deberá alcanzar un Lighthouse Score ≥ 70 en móvil. | 8 |
| HU-42 | Como cliente con discapacidad visual leve quiero navegar cómodamente por el sitio. | La interfaz cumplirá estándares WCAG 2.1 AA. | 5 |
| HU-43 | Como cliente quiero utilizar la plataforma desde mi celular sin problemas de visualización. | El diseño será responsive con enfoque mobile-first. | 5 |
| HU-44 | Como administrador quiero mejorar el posicionamiento en Google mediante SEO básico. | El sistema generará metaetiquetas dinámicas y sitemap.xml. | 3 |
| HU-45 | Como administrador quiero controlar automáticamente el stock para evitar ventas sin inventario. | El sistema mostrará alertas cuando el stock sea bajo o llegue a cero. | 5 |
| HU-46 | Como cliente quiero recibir notificaciones cuando cambie el estado de mi pedido. | El sistema enviará correos automáticos al cambiar el estado del pedido. | 2 |
| HU-47 | Como administrador quiero integrar Google Analytics para monitorear tráfico y visitas. | El dashboard mostrará métricas básicas obtenidas desde Google Analytics. | 3 |
| HU-48 | Como administrador quiero proteger el sistema contra ataques y accesos indebidos. | El sistema implementará rate limiting, validación de entradas y protección CSRF. | 5 |

## **Estructura del Proyecto – Fase II**

importadora-market-web/  
│  
├── backend/                         \# API REST (Python)  
│   ├── app/  
│   │   ├── api/                     \# Capa de controladores (endpoints)  
│   │   │   ├── \_\_init\_\_.py  
│   │   │   ├── v1/  
│   │   │   │   ├── \_\_init\_\_.py  
│   │   │   │   ├── endpoints/  
│   │   │   │   │   ├── auth.py          \# Registro, login, recuperación  
│   │   │   │   │   ├── products.py      \# CRUD productos, listado, filtros  
│   │   │   │   │   ├── offers.py        \# Ofertas y novedades  
│   │   │   │   │   ├── cart.py          \# Carrito (backend opcional)  
│   │   │   │   │   ├── orders.py        \# Creación y estado de pedidos  
│   │   │   │   │   ├── contact.py       \# Formulario de contacto  
│   │   │   │   │   ├── admin\_stats.py   \# Estadísticas simples  
│   │   │   │   │   └── users.py         \# Perfil y datos de usuario  
│   │   │   │   └── deps.py              \# Dependencias (DB, usuario actual)  
│   │   │   └── \_\_init\_\_.py  
│   │   │  
│   │   ├── core/                    \# Configuración y utilidades transversales  
│   │   │   ├── \_\_init\_\_.py  
│   │   │   ├── config.py            \# Variables de entorno (SMTP, JWT, DB)  
│   │   │   ├── security.py          \# Hashing, JWT, verificación  
│   │   │   ├── database.py          \# Conexión a SQLite, sesión SQLAlchemy  
│   │   │   └── exceptions.py        \# Excepciones personalizadas HTTP  
│   │   │  
│   │   ├── models/                  \# Modelos ORM (SQLAlchemy)  
│   │   │   ├── \_\_init\_\_.py  
│   │   │   ├── user.py              \# Tabla usuarios (cliente/importadora)  
│   │   │   ├── product.py           \# Tabla productos  
│   │   │   ├── order.py             \# Tabla pedidos  
│   │   │   ├── order\_item.py        \# Tabla items del pedido  
│   │   │   └── contact\_message.py   \# Tabla mensajes de contacto  
│   │   │  
│   │   ├── schemas/                 \# Esquemas Pydantic (validación)  
│   │   │   ├── \_\_init\_\_.py  
│   │   │   ├── user.py              \# UserCreate, UserResponse, UserLogin  
│   │   │   ├── product.py           \# ProductCreate, ProductUpdate, ProductOut  
│   │   │   ├── order.py             \# OrderCreate, OrderStatusUpdate, OrderOut  
│   │   │   ├── cart.py              \# CartItem, CartResponse  
│   │   │   └── common.py            \# Mensajes de error, paginación  
│   │   │  
│   │   ├── repositories/            \# Acceso a datos (DAO)  
│   │   │   ├── \_\_init\_\_.py  
│   │   │   ├── base.py              \# CRUD genérico (create, read, update, delete)  
│   │   │   ├── user\_repository.py  
│   │   │   ├── product\_repository.py  
│   │   │   ├── order\_repository.py  
│   │   │   └── contact\_repository.py  
│   │   │  
│   │   ├── services/                \# Lógica de negocio  
│   │   │   ├── \_\_init\_\_.py  
│   │   │   ├── auth\_service.py      \# Registro, login, recuperación  
│   │   │   ├── product\_service.py   \# Filtros, ofertas, novedades  
│   │   │   ├── cart\_service.py      \# Cálculos, persistencia (si aplica)  
│   │   │   ├── order\_service.py     \# Creación, cambio de estado  
│   │   │   ├── stats\_service.py     \# Pedidos por día, productos populares  
│   │   │   └── email\_service.py     \# Envío de correos (confirmación, contacto)  
│   │   │  
│   │   ├── utils/                   \# Utilidades menores  
│   │   │   ├── \_\_init\_\_.py  
│   │   │   ├── validators.py        \# Validaciones personalizadas  
│   │   │   └── formatters.py        \# Formato de fechas, precios, etc.  
│   │   │  
│   │   └── main.py                  \# Punto de entrada (FastAPI app)  
│   │  
│   ├── tests/                       \# Pruebas automatizadas  
│   │   ├── test\_api/                \# Tests de endpoints (con TestClient)  
│   │   ├── test\_services/           \# Tests de lógica de negocio  
│   │   ├── test\_repositories/       \# Tests de acceso a datos  
│   │   └── conftest.py              \# Fixtures de pytest (DB, client)  
│   │  
│   ├── migrations/                  \# Migraciones Alembic  
│   │   ├── versions/  
│   │   ├── env.py  
│   │   └── alembic.ini  
│   │  
│   ├── requirements.txt             \# Dependencias Python  
│   ├── .env                         \# Variables de entorno (no versionado)  
│   └── README.md                    \# Instrucciones de ejecución  
│  
├── frontend/                        \# Aplicación cliente (tecnología libre)  
│   │  
│   │   Opción recomendada: React \+ Vite \+ TailwindCSS  
│   │  
│   ├── public/  
│   │   └── favicon.ico  
│   │  
│   ├── src/  
│   │   ├── components/              \# Componentes reutilizables  
│   │   │   ├── common/              \# Botones, inputs, modales  
│   │   │   ├── layout/              \# Header, Footer, Sidebar  
│   │   │   ├── products/            \# ProductCard, ProductGrid, Filters  
│   │   │   ├── cart/                \# CartIcon, CartDrawer, CartItem  
│   │   │   └── admin/               \# AdminProductForm, StatsChart  
│   │   │  
│   │   ├── pages/                   \# Vistas principales  
│   │   │   ├── HomePage.jsx  
│   │   │   ├── ProductsPage.jsx  
│   │   │   ├── ProductDetailPage.jsx  
│   │   │   ├── CartPage.jsx  
│   │   │   ├── CheckoutPage.jsx  
│   │   │   ├── OrdersPage.jsx  
│   │   │   ├── ContactPage.jsx  
│   │   │   ├── LoginPage.jsx  
│   │   │   ├── RegisterPage.jsx  
│   │   │   └── AdminPanelPage.jsx    \# Solo para rol importadora  
│   │   │  
│   │   ├── hooks/                   \# Custom hooks  
│   │   │   ├── useAuth.js           \# Login, logout, token  
│   │   │   ├── useCart.js           \# Manejo del carrito (localStorage o API)  
│   │   │   └── useProducts.js       \# Filtros, paginación  
│   │   │  
│   │   ├── services/                \# Comunicación con API  
│   │   │   ├── api.js               \# Instancia de Axios (baseURL, interceptors)  
│   │   │   ├── authService.js  
│   │   │   ├── productService.js  
│   │   │   ├── orderService.js  
│   │   │   └── adminService.js  
│   │   │  
│   │   ├── contexts/                \# Contextos de React  
│   │   │   ├── AuthContext.jsx  
│   │   │   └── CartContext.jsx  
│   │   │  
│   │   ├── utils/                   \# Utilidades frontend  
│   │   │   ├── formatters.js        \# Formatear moneda, fechas  
│   │   │   └── validators.js        \# Validar formularios  
│   │   │  
│   │   ├── styles/                  \# CSS global (Tailwind u otros)  
│   │   │   └── globals.css  
│   │   │  
│   │   ├── App.jsx                  \# Componente raíz y rutas  
│   │   └── main.jsx                 \# Punto de entrada React  
│   │  
│   ├── index.html  
│   ├── package.json  
│   ├── vite.config.js  
│   ├── tailwind.config.js           (si se usa Tailwind)  
│   ├── .env                         (VITE\_API\_URL)  
│   └── README.md  
│  
└── docker-compose.yml               (opcional, para orquestar backend/frontend)

## **FASE III – Tareas de Implementación (Spec-Driven Development)**

Este documento desglosa el plan arquitectónico de la Fase II en **tareas concretas, pequeñas e incrementales**, organizadas por **entregables (hitos)**. El primer entregable es **Gestión de Usuarios** (prioridad máxima). Los hitos siguientes completan el sistema: catálogo de productos, carrito y pedidos, panel de administración, estadísticas, notificaciones, frontend integral, pruebas y despliegue.

---

## **Formato de las tareas**

Cada tarea incluye:

* **ID**: Identificador único (Hito.Tarea)  
* **Hito**: Entregable al que pertenece  
* **Tarea**: Nombre breve  
* **Descripción**: Qué se debe implementar  
* **Criterios de aceptación**: Condiciones que validan la tarea  
* **Dependencias**: Tareas previas necesarias

---

# **HITO 1 – GESTIÓN DE USUARIOS (Entregable prioritario)**

| ID | Tarea | Descripción | Criterios de aceptación | Dependencias |
| ----- | ----- | ----- | ----- | ----- |
| **1.1** | Inicializar backend y configuración | Crear entorno virtual, instalar FastAPI, Uvicorn, SQLAlchemy, Alembic, python-dotenv. Configurar `core/config.py` y `core/database.py` para SQLite. | Servidor `uvicorn app.main:app --reload` corre sin errores. Existe archivo `.env` de ejemplo. | Ninguna |
| **1.2** | Definir modelo de usuario | Crear `models/user.py`: id, email, nombre, password\_hash, is\_admin (bool), created\_at, reset\_token (opcional). | Migración Alembic genera tabla `users`. | 1.1 |
| **1.3** | Configurar seguridad (hashing \+ JWT) | En `core/security.py`: funciones `hash_password`, `verify_password`, `create_access_token`, `decode_token`. bcrypt y python-jose. | Prueba unitaria: hash y verificación funcionan. Token JWT válido por 7 días. | 1.1 |
| **1.4** | Esquemas Pydantic para usuario | `schemas/user.py`: `UserCreate`, `UserLogin`, `UserResponse`, `UserUpdate`, `PasswordResetRequest`, `PasswordResetConfirm`. | Validaciones: email correcto, nombre no vacío, contraseña \>=6 caracteres. | 1.2 |
| **1.5** | Repositorio de usuario | `repositories/user_repository.py`: métodos `create`, `get_by_email`, `get_by_id`, `update`, `delete`, `get_all` (admin). | Pruebas unitarias con SQLite en memoria. | 1.2 |
| **1.6** | Servicio de autenticación | `services/auth_service.py`: `register_user`, `authenticate_user`, `create_user_token`, `change_password`, `request_reset_token`, `reset_password`. | No registrar emails duplicados. Contraseña siempre hasheada. | 1.3, 1.5 |
| **1.7** | Endpoint de registro | `POST /auth/register` (público) recibe `UserCreate`, guarda usuario normal (is\_admin=False), retorna `UserResponse`. | Código 201\. Error 400 si email ya existe. | 1.4, 1.6 |
| **1.8** | Endpoint de login | `POST /auth/login` recibe `UserLogin`, verifica, retorna `{"access_token": "...", "token_type": "bearer"}`. | 401 si credenciales inválidas. | 1.4, 1.6 |
| **1.9** | Dependencia `get_current_user` | En `api/v1/deps.py`, función que extrae token del header Authorization, lo valida y retorna usuario (o 401). | Endpoint de prueba `GET /users/me` protegido retorna el usuario autenticado. | 1.3, 1.5 |
| **1.10** | Endpoint de perfil propio | `GET /users/me` (autenticado) devuelve `UserResponse`. `PUT /users/me` actualiza nombre, email (verificar unicidad). | 401 sin token. 200 con datos actualizados. | 1.9, 1.4 |
| **1.11** | Control de roles: administrador | Agregar `is_admin` en modelo. Dependencia `get_current_admin_user` que verifique `is_admin` o lance 403\. `GET /admin/users` (solo admin) lista todos los usuarios. | Usuario admin puede ver listado. Usuario normal recibe 403\. | 1.2, 1.9 |
| **1.12** | Recuperación de contraseña (opcional para este hito) | Endpoints: `POST /auth/forgot-password` (envía correo con enlace) y `POST /auth/reset-password` (cambia contraseña con token). Requiere servicio de email (ver Hito 5). | Si no hay email, se puede posponer o simular. | 1.6, (5.1) |
| **1.13** | Inicializar frontend (básico) | Crear proyecto frontend (React \+ Vite), instalar Axios, React Router. Configurar `VITE_API_URL`. | `npm run dev` levanta la app sin errores. | Ninguna |
| **1.14** | Servicios de autenticación en frontend | `services/authService.js`: `register`, `login`, `logout`, `getCurrentUser`. Usar Axios. Almacenar token en localStorage. | Interceptor de Axios añade token a las peticiones. | 1.7, 1.8, 1.13 |
| **1.15** | Contexto de autenticación | `contexts/AuthContext.jsx`: estado de usuario, funciones login/register/logout. Protege rutas (públicas vs privadas). | Tras login, usuario disponible en toda la app. Al cerrar sesión, redirige a login. | 1.14 |
| **1.16** | Páginas de registro y login | `RegisterPage.jsx` (nombre, email, password) y `LoginPage.jsx` (email, password). Manejo de errores. | Usuario puede registrarse e iniciar sesión. Redirige a home tras login. | 1.15 |
| **1.17** | Página de perfil | `ProfilePage.jsx` (solo autenticado) muestra datos y formulario para actualizar nombre y email. | Los cambios se reflejan en el perfil y en el contexto. | 1.10, 1.15 |
| **1.18** | Panel simple de administración de usuarios (opcional) | Si el usuario es admin, enlace a `/admin/users` con listado de todos los usuarios y opción de marcar/desmarcar `is_admin`. | Solo admin accede. | 1.11, 1.15 |

## **✅ Criterio de éxito del Hito 1**

* Registro, login, perfil, logout funcionan desde el frontend.  
* El backend tiene endpoints documentados en `/docs`.  
* Pruebas unitarias con cobertura ≥70% en módulos de usuario.

---

# **HITO 2 – CATÁLOGO DE PRODUCTOS (ofertas y novedades)**

| ID | Tarea | Descripción | Criterios de aceptación | Dependencias |
| ----- | ----- | ----- | ----- | ----- |
| **2.1** | Modelo de producto | `models/product.py`: id, nombre, descripción, precio, stock (opcional), imagen\_url, is\_offer, offer\_price, is\_new, category, created\_at. | Migración crea tabla `products`. | 1.2 (base previa) |
| **2.2** | Esquemas Pydantic de producto | `schemas/product.py`: `ProductCreate`, `ProductUpdate`, `ProductResponse`, `ProductFilter`. | Validación: precio ≥0, oferta\_price \< precio si se especifica. | 2.1 |
| **2.3** | Repositorio de productos | `repositories/product_repository.py`: métodos CRUD \+ `get_all_filtered` (por nombre, categoría, oferta, novedad, rango precio), `get_offers`, `get_new_arrivals`. | Pruebas unitarias con datos de ejemplo. | 2.1 |
| **2.4** | Servicio de productos | `services/product_service.py`: llama al repositorio, aplica lógica (por ejemplo, si `is_offer` true, retorna `offer_price` en lugar de precio normal). | Las funciones de servicio retornan schemas validados. | 2.2, 2.3 |
| **2.5** | Endpoints públicos de catálogo | `GET /products` (paginación, filtros), `GET /products/{id}` (detalle). Sin autenticación. | Los filtros funcionan vía query parameters. Tiempo de carga \<3s con 1000 productos. | 2.4 |
| **2.6** | Endpoints de administración | `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}`. Protegidos por `get_current_admin_user`. | Sólo admin puede crear, editar, eliminar. Eliminación lógica o física definida. | 1.11, 2.4 |
| **2.7** | Gestión de ofertas y novedades | Extender endpoints de admin: permitir marcar/desmarcar `is_offer`, `is_new`, establecer `offer_price`. | El cliente puede filtrar por `?is_offer=true` o `?is_new=true`. | 2.6 |
| **2.8** | Frontend: listado de productos | `ProductsPage.jsx` con componentes `ProductGrid`, `ProductCard`. Llamada a `GET /products`. Paginación básica. | Se muestran imágenes, precios, descuentos si aplica. | 1.13, 2.5 |
| **2.9** | Frontend: filtros y búsqueda | Agregar campos de filtro en `ProductsPage`: búsqueda por nombre, categoría, solo ofertas, solo novedades. | Los filtros actualizan la lista sin recargar página. | 2.8 |
| **2.10** | Frontend: detalle de producto | `ProductDetailPage.jsx` muestra toda la info, imagen, opción de agregar al carrito. | Muestra precio normal y oferta si corresponde. | 2.5, 2.8 |

## **✅ Criterio de éxito del Hito 2**

* Administrador puede crear, editar y eliminar productos.  
* Cliente puede ver catálogo, aplicar filtros y ver detalles.  
* Las ofertas y novedades se destacan visualmente.

---

# **HITO 3 – CARRITO DE COMPRAS Y PEDIDOS (sin pagos digitales)**

| ID | Tarea | Descripción | Criterios de aceptación | Dependencias |
| ----- | ----- | ----- | ----- | ----- |
| **3.1** | Modelos de pedido | `models/order.py`: id, user\_id (FK), order\_date, status (pendiente, confirmado, entregado, cancelado), total, shipping\_address, phone, notes. `models/order_item.py`: id, order\_id, product\_id, quantity, unit\_price, subtotal. | Migración crea tablas `orders`, `order_items`. | 2.1, 1.2 |
| **3.2** | Repositorio de pedidos | `repositories/order_repository.py`: `create_order`, `get_by_user`, `get_by_id`, `update_status`, `get_all` (admin), `get_orders_by_date_range`. | Pruebas unitarias. | 3.1 |
| **3.3** | Servicio de pedidos | `services/order_service.py`: `create_order_from_cart` (recibe lista de items y datos usuario), calcula total, verifica existencia de productos (si hay stock), guarda pedido y items, retorna pedido. | Si algún producto no existe, aborta la operación. | 3.2, 2.3 |
| **3.4** | Endpoint para crear pedido | `POST /orders` (requiere autenticación). Recibe `{items: [{product_id, quantity}], shipping_address, phone}`. Llama al servicio y retorna el pedido. | Estado inicial "pendiente". 400 si items vacíos o producto no existe. | 1.9, 3.3 |
| **3.5** | Endpoints de pedidos para cliente | `GET /orders/me` (lista pedidos del usuario autenticado), `GET /orders/{id}/me` (detalle de un pedido propio). | Solo muestra pedidos del usuario. 404 si no pertenece. | 1.9, 3.4 |
| **3.6** | Endpoints de administración de pedidos | `GET /orders` (todos), `GET /orders/{id}`, `PUT /orders/{id}/status` (cambiar estado). Protegido por admin. | Admin puede ver y modificar cualquier pedido. | 1.11, 3.2 |
| **3.7** | Carrito en frontend (localStorage) | `CartContext.jsx` con estado: items, funciones addItem, removeItem, updateQuantity, clearCart. Persistencia en localStorage. | El carrito se mantiene al recargar página o cerrar navegador. | 1.13 |
| **3.8** | Página del carrito | `CartPage.jsx` muestra lista de productos con cantidades, subtotal y total. Botones para actualizar/eliminar. | Permite modificar cantidades antes de proceder al checkout. | 3.7 |
| **3.9** | Proceso de checkout | `CheckoutPage.jsx` (requiere autenticación). Formulario con dirección, teléfono. Al enviar, llama a `POST /orders` con los items del carrito. | Tras éxito, limpia carrito y muestra confirmación. Redirige a lista de pedidos. | 1.9, 3.4, 3.7 |
| **3.10** | Lista de pedidos del usuario | `OrdersPage.jsx` muestra los pedidos del cliente con sus estados. Enlace a detalle. | Cada pedido se puede ver en detalle. | 3.5, 1.15 |
| **3.11** | Gestión de pedidos en panel admin | `AdminOrdersPage.jsx` lista todos los pedidos, permite cambiar estado a "confirmado", "entregado", "cancelado". | Solo admin accede. | 3.6, 1.11 |

## **✅ Criterio de éxito del Hito 3**

* Cliente puede agregar productos al carrito (sin login previo, pero al checkout debe estar autenticado).  
* Se puede crear un pedido y verlo en "Mis pedidos".  
* Admin puede actualizar el estado del pedido.

---

# **HITO 4 – PANEL DE ADMINISTRACIÓN Y ESTADÍSTICAS**

| ID | Tarea | Descripción | Criterios de aceptación | Dependencias |
| ----- | ----- | ----- | ----- | ----- |
| **4.1** | Repositorio de estadísticas | `repositories/stats_repository.py`: `count_orders_by_day(days)`, `count_products_total`, `get_most_ordered_products(limit)`, `get_orders_count_by_status`, `get_revenue_by_period`. | Consultas agregadas con SQLAlchemy. | 3.1, 2.1 |
| **4.2** | Servicio de estadísticas | `services/stats_service.py`: formatea los datos para dashboard (total pedidos hoy/semana, productos más vendidos, ingresos). | Pruebas unitarias con datos de ejemplo. | 4.1 |
| **4.3** | Endpoints de estadísticas | `GET /admin/stats/dashboard` (protegido por admin) retorna JSON con resumen. `GET /admin/stats/orders-chart?days=7` para gráfico lineal. | Respuesta en menos de 500ms. | 1.11, 4.2 |
| **4.4** | Exportación de pedidos a CSV | `GET /admin/orders/export?start_date=...&end_date=...` (admin). Genera archivo CSV con todos los pedidos del período, incluyendo items. | El archivo se descarga con nombre `pedidos_YYYY-MM-DD.csv`. | 3.6, 1.11 |
| **4.5** | Frontend: Dashboard básico | `AdminDashboardPage.jsx` (solo admin) muestra tarjetas con total productos, pedidos hoy, pedidos pendientes. | Datos obtenidos desde `GET /admin/stats/dashboard`. | 4.3, 1.11 |
| **4.6** | Frontend: Gráficos simples | Usar Chart.js o Recharts para mostrar pedidos por día (últimos 7 días) y productos más vendidos. | Gráficos interactivos. | 4.3, 4.5 |
| **4.7** | Frontend: Exportar pedidos | Botón en `AdminOrdersPage.jsx` que llama al endpoint de exportación y descarga el CSV con filtros de fecha. | Permite exportar rango personalizado. | 4.4, 3.11 |

## **✅ Criterio de éxito del Hito 4**

* Admin tiene acceso a un dashboard con estadísticas relevantes.  
* Puede exportar pedidos fácilmente.  
* Los gráficos reflejan datos reales.

---

# **HITO 5 – NOTIFICACIONES, CONTACTO, INFORMACIÓN CORPORATIVA**

| ID | Tarea | Descripción | Criterios de aceptación | Dependencias |
| ----- | ----- | ----- | ----- | ----- |
| **5.1** | Servicio de envío de correos | `services/email_service.py`: `send_email(to, subject, body_html)`. Configurable por SMTP desde `.env`. | En entorno dev se puede usar servidor falso. | 1.1 |
| **5.2** | Modelo de mensaje de contacto | `models/contact_message.py`: id, name, email, message, sent\_at, is\_read (bool). | Migración crea tabla `contact_messages`. | 1.2 |
| **5.3** | Endpoint de contacto | `POST /contact` (público) recibe nombre, email, mensaje. Guarda en BD y envía notificación a correo del admin (configurado). | El admin recibe el mensaje; el usuario no requiere autenticación. | 5.1, 5.2 |
| **5.4** | Integración de correo en pedidos | Modificar `order_service.create_order` para que envíe un correo de confirmación al cliente usando el servicio de email. | Cliente recibe correo con detalle del pedido al crearlo. | 5.1, 3.3 |
| **5.5** | Endpoints de gestión de mensajes (admin) | `GET /admin/contacts` lista mensajes, `PUT /admin/contacts/{id}/read` marca como leído. Protegido por admin. | Admin puede ver los mensajes recibidos y archivarlos. | 1.11, 5.2 |
| **5.6** | Página "Sobre nosotros" | `AboutPage.jsx` con información estática de la importadora: historia, misión, visión. | Contenido editable por archivo de configuración o desde admin (opcional). | 1.13 |
| **5.7** | Página de contacto | `ContactPage.jsx` con formulario (nombre, email, mensaje). Llama a `POST /contact`. Al enviar, muestra mensaje de éxito. | El formulario valida campos. Se evita envío duplicado. | 5.3, 1.13 |
| **5.8** | Footer con datos corporativos | Muestra ubicación, teléfono, correo de contacto, enlaces a políticas (términos, privacidad – estáticos). | Visible en todas las páginas. | 1.13 |
| **5.9** | Panel admin: ver mensajes de contacto | `AdminContactsPage.jsx` (solo admin) lista mensajes, permite marcarlos como leídos. | Muestra fecha, nombre, email y contenido. | 5.5, 1.11 |

## **✅ Criterio de éxito del Hito 5**

* El cliente puede enviar un mensaje de contacto y recibe acuse (opcional, depende del admin).  
* El admin recibe notificaciones por correo y puede gestionar mensajes.  
* La página "Nosotros" y el footer están presentes.  
* El cliente recibe confirmación por correo al hacer un pedido.

---

# **HITO 6 – PRUEBAS, DOCUMENTACIÓN Y DESPLIEGUE FINAL**

| ID | Tarea | Descripción | Criterios de aceptación | Dependencias |
| ----- | ----- | ----- | ----- | ----- |
| **6.1** | Pruebas unitarias de repositorios | Tests con pytest y SQLite en memoria para todos los repositorios (user, product, order, contact, stats). | Cobertura ≥80% (meta superior a 70% exigida). | 1.5, 2.3, 3.2, 4.1, 5.2 |
| **6.2** | Pruebas de servicios | Testear `AuthService`, `ProductService`, `OrderService`, `StatsService` con mocks de repositorios. | Validar casos borde: crear pedido sin stock, roles, etc. | 1.6, 2.4, 3.3, 4.2 |
| **6.3** | Pruebas de integración de API | Usar `TestClient` de FastAPI para probar flujos completos: registro → login → crear producto (admin) → crear pedido → cambiar estado. | Los endpoints responden códigos HTTP correctos, base de datos se reinicia entre pruebas. | 1.7, 1.8, 2.5, 2.6, 3.4, 3.6, 5.3 |
| **6.4** | Pruebas de rendimiento (opcional) | Simular 100 usuarios concurrentes accediendo a `GET /products` con Locust. Verificar tiempo respuesta \<3s en conexión 3G simulada. | Informe sin errores de timeout. | 2.5 |
| **6.5** | Documentación de API | FastAPI genera Swagger `/docs` y ReDoc `/redoc`. Asegurar descripciones en cada endpoint. | Todas las operaciones tienen ejemplos de request/response. | Todos los endpoints |
| **6.6** | README.md completo | Incluir instrucciones de instalación, variables de entorno, comandos de migración, pruebas, ejecución de frontend y backend. | Un desarrollador nuevo levanta el proyecto en \<10 min. | Ninguna |
| **6.7** | Configurar HTTPS en producción | Obtener certificado Let's Encrypt (o usar servicio con SSL). Configurar Nginx como reverse proxy para backend y frontend. | El sitio es accesible solo vía `https://`. | Despliegue |
| **6.8** | Despliegue en entorno de producción | Elegir servicio (Railway, PythonAnywhere, VPS). Configurar variables de entorno, migrar base de datos, servir frontend estático. | La URL pública funciona, las peticiones se envían a la API. | 6.7 |
| **6.9** | Pruebas de aceptación (end-to-end) | Usar Cypress o Playwright para simular un flujo completo: registro de cliente, navegar catálogo, agregar al carrito, hacer pedido, login admin, cambiar estado. | El script pasa sin errores. | 6.8 |

## **✅ Criterio de éxito del Hito 6**

* Cobertura de pruebas ≥70% (repositorios, servicios, integración).  
* Documentación API completa y README funcional.  
* Sistema desplegado en producción con HTTPS, accesible y estable.

---

# **Resumen de Entregables y Cronograma Sugerido**

| Hito | Entregable | Tareas | Esfuerzo estimado (días/hombre) |
| ----- | ----- | ----- | ----- |
| **1** | Gestión de usuarios (prioritario) | 1.1 a 1.18 | 5 \- 7 |
| **2** | Catálogo de productos | 2.1 a 2.10 | 4 \- 5 |
| **3** | Carrito y pedidos sin pagos | 3.1 a 3.11 | 5 \- 6 |
| **4** | Panel admin y estadísticas | 4.1 a 4.7 | 3 \- 4 |
| **5** | Notificaciones, contacto, info corporativa | 5.1 a 5.9 | 3 \- 4 |
| **6** | Pruebas, documentación y despliegue | 6.1 a 6.9 | 4 \- 5 |

**Total estimado**: 24 \- 31 días/hombre (equipo de 2-4 personas \= 6-8 semanas). Coherente con el plazo de 3-6 meses para la versión beta indicado en el documento de visión.

---

# **Nota Final**

El presente documento (`tasks.md`) desglosa todas las tareas necesarias para completar el sistema **Importadora Market Web** desde la Fase I (funcionalidades ya definidas) hasta la Fase III (implementación con arquitectura REST API). El **Hito 1** es el primer entregable funcional; los hitos restantes pueden desarrollarse en paralelo o secuencialmente según disponibilidad del equipo. Este plan sirve como guía para que desarrolladores (humanos o IA) generen el código de manera incremental y revisable.

modelo de datos 

![][image1]

[image1]: <data:image/png;base64,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>