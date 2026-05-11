# Inventario de Interfaces - Importadora Market

Este documento detalla las pantallas y módulos diseñados para el ecosistema de **Importadora Market**, cubriendo tanto la experiencia del cliente como el panel administrativo.

---

## 1. Experiencia del Cliente (Storefront)

### [SCR-12] Carrito de Compras
- **Propósito:** Resumen de productos antes del pago.
- **Características:** Gestión de cantidades, eliminación de productos, sección de "Frecuentemente comprados juntos" y resumen de costos (subtotal, envío gratuito, impuestos).

### [SCR-13] Pasarela de Pago (Checkout)
- **Propósito:** Finalización de la transacción.
- **Características:** Formulario de información de contacto, dirección de envío y selector visual de métodos de pago (Pago por QR y Transferencia Bancaria) según requerimientos técnicos.

### [SCR-15] Detalle de Producto - Chrono Elite Series 5
- **Propósito:** Visualización de alta fidelidad de un producto individual.
- **Características:** Galería de imágenes, showcase de video integrado, especificaciones técnicas detalladas y disparadores de urgencia ("Solo 12 unidades en stock").

### [SCR-4] Historial de Pedidos (Mis Compras)
- **Propósito:** Gestión post-venta para el usuario.
- **Características:** Filtros por estado (En tránsito, Entregado, Procesando), descarga de recibos en PDF y seguimiento de envíos en tiempo real.

### [SCR-5] Acceso y Registro (Login)
- **Propósito:** Portal de entrada al sistema.
- **Características:** Autenticación limpia con soporte para correo electrónico y "Continuar con Google".

---

## 2. Panel Administrativo (Admin Dashboard)

### [SCR-10] Configuración de la Tienda
- **Propósito:** Gestión de metadatos globales.
- **Características:** Edición de contactos, ubicación física con mapa, configuración de redes sociales (objeto JSON) y control del temporizador del carrusel de la página de inicio.

### [SCR-9] Gestión de Inventario
- **Propósito:** Control total del catálogo de productos.
- **Características:** Indicadores de stock bajo, valor total del inventario, control de visibilidad de productos y edición rápida de SKUs.

### [SCR-8] Gestión de Usuarios
- **Propósito:** Administración de cuentas del sistema.
- **Características:** Monitorización de usuarios en línea (42 activos), asignación de roles (Admin/Customer) y acciones de seguridad (reset de password).

### [SCR-7] Bandeja de Chat en Vivo
- **Propósito:** Soporte al cliente en tiempo real.
- **Características:** Interfaz multi-panel con lista de chats activos, historial de compras del cliente seleccionado para contexto inmediato y notas internas.

---

## Especificaciones Técnicas Generales
- **Tipografía:** Inter (Sistema de fuentes limpio y corporativo).
- **Paleta de Colores:** Basada en azul marino profundo (#0f172a) con acentos en naranja vibrante para llamadas a la acción (CTAs).
- **Diseño:** Totalmente responsivo, optimizado para visualización en escritorio con jerarquía visual clara y espaciado consistente.