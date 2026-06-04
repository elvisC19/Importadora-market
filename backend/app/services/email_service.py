"""Servicio de notificaciones por correo electrónico usando SMTP — Hito 3."""

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Diccionario para traducir estados a etiquetas amigables
STATUS_LABELS = {
    "pending": "Pendiente",
    "confirmed": "Confirmado",
    "processing": "En Proceso",
    "shipped": "Enviado 🚚",
    "delivered": "Entregado ✅",
    "cancelled": "Cancelado ❌",
}

STATUS_COLORS = {
    "pending": "#f59e0b",      # amber
    "confirmed": "#3b82f6",    # blue
    "processing": "#6366f1",   # indigo
    "shipped": "#a855f7",      # purple
    "delivered": "#10b981",    # green
    "cancelled": "#ef4444",    # red
}


class EmailService:
    def __init__(self) -> None:
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.sender = settings.SMTP_USER or "noreply@importadoramarket.com"

    def _send_email_html(self, to_email: str, subject: str, html_content: str) -> bool:
        """
        Envía un correo con contenido HTML de forma segura.
        Si la configuración SMTP está incompleta o falla la conexión, registra una advertencia en logs.
        """
        if not self.host or not self.user:
            logger.warning(
                f"[EMAIL SERVICE] Envío simulado (SMTP no configurado en .env).\n"
                f"Destinatario: {to_email}\n"
                f"Asunto: {subject}\n"
                f"Contenido: (HTML de {len(html_content)} caracteres)"
            )
            return False

        try:
            # Crear mensaje
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.sender
            msg["To"] = to_email

            # Adjuntar contenido HTML
            part = MIMEText(html_content, "html", "utf-8")
            msg.attach(part)

            # Conexión con el servidor SMTP
            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.sender, to_email, msg.as_string())

            logger.info(f"[EMAIL SERVICE] Correo enviado exitosamente a {to_email}")
            return True

        except Exception as e:
            logger.error(
                f"[EMAIL SERVICE] Falló el envío de correo a {to_email}. "
                f"Detalle del error: {str(e)}"
            )
            return False

    def send_order_confirmation(self, order: Any) -> bool:
        """
        Envía un correo premium de confirmación de pedido al cliente.
        """
        if not order or not order.user:
            return False

        to_email = order.user.email
        subject = f"¡Hemos recibido tu pedido #{order.id}! 🎉 - Importadora Market"

        # Generar las filas de los productos comprados
        items_html = ""
        for item in order.items:
            product_name = item.product.nombre if item.product else f"Producto #{item.product_id}"
            subtotal = item.subtotal
            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;">
                    <strong>{product_name}</strong>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; text-align: center;">
                    {item.quantity}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; text-align: right;">
                    Bs. {item.unit_price:.2f}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: bold; text-align: right;">
                    Bs. {subtotal:.2f}
                </td>
            </tr>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de Pedido</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9ff; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; border-bottom: 4px solid #f97316;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">IMPORTADORA MARKET</h1>
                    <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">¡Gracias por tu compra, {order.user.nombre}!</p>
                </div>

                <!-- Body -->
                <div style="padding: 32px 24px;">
                    <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-top: 0;">
                        Hola <strong>{order.user.nombre}</strong>, tu pedido ha sido registrado con éxito. Actualmente se encuentra en estado <span style="background-color: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase;">Pendiente</span> mientras procesamos la confirmación.
                    </p>

                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7; margin: 24px 0;">
                        <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Resumen del Pedido</h3>
                        <table style="width: 100%; font-size: 13px; color: #475569;">
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">ID del Pedido:</td>
                                <td style="padding: 4px 0; text-align: right;">#{order.id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">Fecha:</td>
                                <td style="padding: 4px 0; text-align: right;">{order.order_date.strftime('%d/%m/%Y %H:%M')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">Dirección de Envío:</td>
                                <td style="padding: 4px 0; text-align: right; max-width: 250px; word-wrap: break-word;">{order.shipping_address}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; font-weight: bold; color: #0f172a;">Teléfono de Contacto:</td>
                                <td style="padding: 4px 0; text-align: right;">{order.phone}</td>
                            </tr>
                            {f'<tr><td style="padding: 4px 0; font-weight: bold; color: #0f172a;">Notas del Pedido:</td><td style="padding: 4px 0; text-align: right; color: #64748b; font-style: italic;">{order.notes}</td></tr>' if order.notes else ''}
                        </table>
                    </div>

                    <!-- Items Table -->
                    <h3 style="color: #0f172a; margin-top: 32px; margin-bottom: 12px; font-size: 16px;">Productos Comprados</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                        <thead>
                            <tr style="background-color: #f1f5f9;">
                                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Producto</th>
                                <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Cant.</th>
                                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Unit.</th>
                                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                            <tr>
                                <td colspan="3" style="padding: 16px 12px 12px 12px; text-align: right; font-size: 16px; font-weight: bold; color: #0f172a;">
                                    Total General:
                                </td>
                                <td style="padding: 16px 12px 12px 12px; text-align: right; font-size: 18px; font-weight: 800; color: #f97316;">
                                    Bs. {order.total_amount:.2f}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="text-align: center; margin-top: 36px; margin-bottom: 12px;">
                        <a href="{settings.FRONTEND_URL}/pedidos" style="background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">
                            Ver mis pedidos en la Tienda
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-t: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                    <p style="margin: 0 0 8px 0;">Este es un correo automático, por favor no respondas directamente.</p>
                    <p style="margin: 0; font-weight: bold;">© 2026 Importadora Market. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self._send_email_html(to_email, subject, html_content)

    def send_order_status_change(self, order: Any, old_status: str, new_status: str) -> bool:
        """
        Envía una notificación al cliente indicando el cambio de estado en su pedido.
        """
        if not order or not order.user:
            return False

        to_email = order.user.email
        label = STATUS_LABELS.get(new_status, new_status.capitalize())
        color = STATUS_COLORS.get(new_status, "#0f172a")

        subject = f"Tu pedido #{order.id} ha cambiado de estado a: {label} 🎉"

        # Mensaje descriptivo del cambio
        status_messages = {
            "confirmed": "¡Tu pedido ha sido confirmado! Estamos preparando tus productos para el procesamiento.",
            "processing": "Estamos empacando tus productos. ¡Muy pronto estarán en camino!",
            "shipped": "🚗 ¡Tu pedido ha sido enviado! Nuestro equipo de despacho ya va en camino a tu dirección registrada.",
            "delivered": "✨ ¡Tu pedido ha sido entregado con éxito! Esperamos que disfrutes tus productos premium.",
            "cancelled": "Tu pedido ha sido cancelado. Si crees que se trata de un error, por favor ponte en contacto con nosotros.",
        }
        description = status_messages.get(
            new_status, f"El estado de tu pedido ahora es: {label}."
        )

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Actualización de Pedido</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9ff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; border-bottom: 4px solid {color};">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">ACTUALIZACIÓN DE PEDIDO</h1>
                    <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Pedido #{order.id}</p>
                </div>

                <!-- Body -->
                <div style="padding: 32px 24px;">
                    <p style="font-size: 16px; color: #0f172a; margin-top: 0;">
                        Hola <strong>{order.user.nombre}</strong>,
                    </p>
                    <p style="font-size: 15px; color: #334155; line-height: 1.6;">
                        Te notificamos que tu pedido <strong>#{order.id}</strong> ha cambiado de estado de 
                        <span style="text-decoration: line-through; color: #64748b;">{STATUS_LABELS.get(old_status, old_status)}</span> a:
                    </p>

                    <div style="text-align: center; margin: 24px 0;">
                        <span style="background-color: {color}20; color: {color}; border: 1.5px solid {color}; padding: 10px 24px; border-radius: 12px; font-size: 16px; font-weight: 800; text-transform: uppercase; display: inline-block; letter-spacing: 0.05em;">
                            {label}
                        </span>
                    </div>

                    <p style="font-size: 15px; color: #334155; line-height: 1.6; background-color: #f8fafc; border-left: 4px solid {color}; padding: 16px; border-radius: 0 8px 8px 0; font-style: italic; margin-bottom: 32px;">
                        {description}
                    </p>

                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7; margin-bottom: 32px;">
                        <h4 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 14px;">Dirección de entrega registrada:</h4>
                        <p style="color: #475569; font-size: 13px; margin: 0;">{order.shipping_address}</p>
                        <p style="color: #475569; font-size: 13px; margin: 4px 0 0 0;">Teléfono: {order.phone}</p>
                    </div>

                    <div style="text-align: center; margin-top: 24px;">
                        <a href="{settings.FRONTEND_URL}/pedidos" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">
                            Ver Estado de Entrega
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                    <p style="margin: 0 0 8px 0;">Este es un correo automático de actualización, por favor no respondas.</p>
                    <p style="margin: 0; font-weight: bold;">© 2026 Importadora Market. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self._send_email_html(to_email, subject, html_content)

    def send_contact_notification(self, contact_message: Any) -> bool:
        """
        Notifica al administrador que ha llegado un nuevo mensaje de contacto.
        """
        to_email = settings.ADMIN_EMAIL or "importadora@market.com"
        subject = f"📬 Nuevo mensaje de contacto de {contact_message.name} - Importadora Market"
        
        sent_at_str = contact_message.sent_at.strftime('%d/%m/%Y %H:%M') if contact_message.sent_at else ""
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nuevo Mensaje de Contacto</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9ff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; border-bottom: 4px solid #f97316;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">NUEVO MENSAJE DE CONTACTO</h1>
                    <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Buzón de Atención al Cliente</p>
                </div>

                <!-- Body -->
                <div style="padding: 32px 24px;">
                    <p style="font-size: 16px; color: #0f172a; margin-top: 0; font-weight: bold;">
                        Estimado Administrador,
                    </p>
                    <p style="font-size: 15px; color: #334155; line-height: 1.6;">
                        Se ha recibido una nueva consulta a través del formulario de contacto del sitio web. A continuación se presentan los detalles del mensaje:
                    </p>

                    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #edf2f7; margin: 24px 0;">
                        <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a; width: 120px;">Nombre:</td>
                                <td style="padding: 6px 0; color: #334155;">{contact_message.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Correo:</td>
                                <td style="padding: 6px 0; color: #334155;"><a href="mailto:{contact_message.email}" style="color: #f97316; text-decoration: none;">{contact_message.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">Fecha:</td>
                                <td style="padding: 6px 0; color: #334155;">{sent_at_str}</td>
                            </tr>
                        </table>
                    </div>

                    <h4 style="color: #0f172a; margin-top: 24px; margin-bottom: 8px; font-size: 15px; border-bottom: 1.5px solid #edf2f7; padding-bottom: 6px;">Mensaje Recibido:</h4>
                    <p style="font-size: 14px; color: #334155; line-height: 1.6; background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 0; white-space: pre-wrap; font-style: italic;">
                        "{contact_message.message}"
                    </p>

                    <div style="text-align: center; margin-top: 36px;">
                        <a href="{settings.FRONTEND_URL}/admin/contactos" style="background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">
                            Gestionar en Panel de Control
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                    <p style="margin: 0; font-weight: bold;">© 2026 Importadora Market. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self._send_email_html(to_email, subject, html_content)

    def send_password_reset_email(self, email: str, token: str, nombre: str) -> bool:
        """
        Envía un correo con el enlace de restablecimiento de contraseña.
        """
        subject = "Restablece tu contraseña - Importadora Market"
        reset_url = f"{settings.FRONTEND_URL}/restablecer-password?token={token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer Contraseña</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9ff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <div style="background-color: #0f172a; padding: 32px 24px; text-align: center; border-bottom: 4px solid #f97316;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">IMPORTADORA MARKET</h1>
                    <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Recuperación de Contraseña</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 32px 24px; text-align: left;">
                    <p style="font-size: 16px; color: #0f172a; margin-top: 0;">
                        Hola <strong>{nombre}</strong>,
                    </p>
                    <p style="font-size: 15px; color: #334155; line-height: 1.6;">
                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar, por favor haz clic en el siguiente botón:
                    </p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{reset_url}" style="background-color: #f97316; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.2);">
                            Restablecer mi Contraseña
                        </a>
                    </div>
                    
                    <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
                        Este enlace de recuperación es válido por <strong>30 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    
                    <p style="font-size: 11px; color: #94a3b8; word-break: break-all;">
                        Si el botón no funciona, copia y pega la siguiente URL en tu navegador:<br />
                        <a href="{reset_url}" style="color: #f97316; text-decoration: none;">{reset_url}</a>
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                    <p style="margin: 0; font-weight: bold;">© 2026 Importadora Market. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self._send_email_html(email, subject, html_content)


email_service = EmailService()
