# 🏪 Importadora Market — Sistema Web MVP

<div align="center">

![Version](https://img.shields.io/badge/versión-1.0.0-orange?style=for-the-badge)
![Status](https://img.shields.io/badge/estado-completado-green?style=for-the-badge)
![License](https://img.shields.io/badge/licencia-MIT-green?style=for-the-badge)

**Plataforma web responsive para una importadora boliviana.**  
Centraliza la presencia digital, potencia la captación de socios comerciales  
y descentraliza la gestión de pedidos de forma eficiente.

[Ver Demo en Render](https://importadora-market-frontend.onrender.com) · [Reportar Bug](https://github.com/elvisC19/Importadora-market/issues) · [Documentación API](https://importadora-market-backend.onrender.com/docs)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Estructura de Roles](#-estructura-de-roles)
- [Equipo](#-equipo)

---

## 🚀 Sobre el Proyecto

**Importadora Market** es una plataforma web desarrollada como MVP (Producto Mínimo Viable) para el comercio y gestión de importaciones en el contexto boliviano[cite: 1]. El sistema evoluciona el modelo tradicional al integrar tres perfiles de interacción independientes[cite: 1]:

- 🛍️ **Clientes:** Exploran el catálogo público, gestionan su carrito de compras y realizan solicitudes de pedidos[cite: 1].
- 🏢 **Importadoras:** Publican inventario de forma directa y gestionan el ciclo de vida de sus pedidos asignados[cite: 1].
- 🔧 **Administradores:** Supervisan la seguridad del sistema, aprueban de forma selectiva los productos entrantes y analizan las estadísticas globales del negocio[cite: 1].

### Características principales

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| Autenticación | Registro multi-rol, inicio de sesión seguro con JWT y recuperación de acceso[cite: 1] | ✅ Completo |
| Catálogo | Productos con filtros interactivos de precios y captación de socios comerciales[cite: 1] | ✅ Completo |
| Carrito | Persistencia local, cálculo automático de subtotales y control de stock[cite: 1] | ✅ Completo |
| Pedidos | Gestión directa por la Importadora con integración nativa a WhatsApp para pagos[cite: 1] | ✅ Completo |
| Panel Admin | Dashboard de control de usuarios, auditoría de productos y exportación de reportes[cite: 1] | ✅ Completo |
| Despliegue SPA | Rutas blindadas contra recargas forzadas (404/Pantallas en negro) en CDN de Render | ✅ Completo |

---

## 🛠 Tecnologías

### Backend
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white)
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

## 📦 Módulos del Sistema

### Hito 1 — Gestión de Usuarios y Roles ✅
- Registro unificado de usuarios y validación de prefijos telefónicos bolivianos[cite: 1].
- Flujo directo de activación para cuentas comerciales de tipo **Importadora**.
- Login persistente basado en tokens JWT con tiempos de inactividad controlados[cite: 1].
- Panel administrativo para la supervisión y asignación selectiva de roles en el sistema[cite: 1].

### Hito 2 — Catálogo e Interfaz Intuitiva ✅
- Exploración de productos interactiva con paginación optimizada del lado del servidor[cite: 1].
- Filtros limpios de rango de precios en bolivianos (Bs.) y visualización dinámica de novedades[cite: 1].
- **Sección de prospección integrada:** Formulario de captación en la página principal para que nuevas importadoras soliciten sus credenciales oficiales de acceso.

### Hito 3 — Descentralización de Carrito y Pedidos ✅
- Carrito persistente (`localStorage`) sincronizado con el estado global de la aplicación[cite: 1].
- Formulario de checkout adaptado a formatos de telefonía celular nacional (`^[67]\d{7}$`)[cite: 1].
- **Módulo de la Importadora:** Panel dedicado en `/importadora/pedidos` donde el vendedor aprueba, cancela o actualiza el estado de las compras en tiempo real.
- **Canal de Cierre Manual:** Inclusión de botones inteligentes vinculados a la API de WhatsApp (`+591 73409757`) dentro del detalle del pedido, permitiendo a la importadora coordinar directamente con el cliente las transferencias bancarias, comprobantes de pago y emisión de facturas.

### Hito 4 — Panel de Control y Auditoría ✅
- Dashboard analítico con gráficos interactivos basados en Chart.js para tendencias de venta[cite: 1].
- **Seguridad en la publicación:** Herramientas para que el Admin valide, apruebe o rechace de forma individual los productos de las importadoras antes de su salida al catálogo público.
- Exportación de métricas de órdenes y usuarios en formato CSV estructurado bajo UTF-8[cite: 1].

### Hito 5 — Notificaciones y Soporte de Marca ✅
- Automatización del envío de correos electrónicos transaccionales mediante SMTP para confirmaciones de compra[cite: 1].
- Formulario de contacto con persistencia directa en la base de datos PostgreSQL[cite: 1].
- Botón de asistencia flotante global configurado con canales locales de soporte rápido.

### Hito 6 — Calidad de Software y Despliegue Cloud ✅
- Cobertura de pruebas automatizadas sobre repositorios y servicios principales con métricas $\ge 70\%$.
- Despliegue continuo en **Render** mediante configuraciones de reescritura de rutas (*Rewrites*) nativas, mitigando por completo las pantallas en blanco y errores 404 ante recargas del navegador.

---

## 👥 Equipo

Desarrollado como proyecto académico de ingeniería de software para la materia **SIS-324**  
en la *Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca*.

| Nombre | GitHub | Rol / Responsabilidad |
|--------|--------|-----------------------|
| **Elvis Córdova H.** | [@elvisC19](https://github.com/elvisC19) | Líder de Arquitectura Fullstack & DevOps (SDD) |
| **Marvin Gustavo** | [@Marvin](https://github.com/Marvin-Gustavo) | Scrum Master & Tech Lead  |
| **Job Ismael** | [@JOB](https://github.com/mamanicondorijobismael) |  |

---

## 📄 Licencia

Este proyecto es de propiedad y uso estrictamente académico. Todos los derechos reservados © 2026.

---

<div align="center">
  Construído con dedicación por C19 | Sucre - Bolivia 🇧🇴
</div>
