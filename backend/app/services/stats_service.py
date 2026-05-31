"""Servicio para formatear datos estadísticos y exportar CSV — Hito 4."""

import csv
import io
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.order import Order
from app.repositories.stats_repository import stats_repository
from app.repositories.order_repository import order_repository


def get_dashboard_stats(db: Session) -> dict:
    """
    Consolida el resumen general, los productos más pedidos y el conteo por estado.
    """
    return {
        "summary": stats_repository.get_dashboard_summary(db),
        "most_ordered_products": stats_repository.get_most_ordered_products(db, limit=5),
        "orders_by_status": stats_repository.get_orders_count_by_status(db)
    }


def get_orders_chart_data(db: Session, days: int = 7) -> List[dict]:
    """
    Retorna el listado ordenado cronológicamente de pedidos por día,
    rellenando los días vacíos con 0.
    """
    # Obtener datos brutos del repositorio
    raw_data = stats_repository.count_orders_by_day(db, days=days)
    
    # Crear un diccionario para búsqueda rápida
    data_map = {item["date"]: item["count"] for item in raw_data}
    
    # Generar todos los días en el rango de los últimos N días
    chart_data = []
    today = datetime.now(timezone.utc).date()
    for i in range(days - 1, -1, -1):
        date_str = str(today - timedelta(days=i))
        chart_data.append({
            "date": date_str,
            "count": data_map.get(date_str, 0)
        })
    return chart_data


def get_exported_orders_csv(
    db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None
) -> str:
    """
    Recupera pedidos de un período y genera el contenido CSV en formato string con UTF-8 BOM.
    """
    # Convertir strings de fechas a objetos datetime
    date_from = None
    date_to = None
    
    if start_date:
        try:
            date_from = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            pass
            
    if end_date:
        try:
            # Fin de día para cubrir el día completo
            date_to = datetime.strptime(end_date, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, microsecond=999999
            )
        except ValueError:
            pass
            
    # Obtener pedidos
    orders = order_repository.get_all(
        db, skip=0, limit=100000, date_from=date_from, date_to=date_to
    )
    
    # Generar el archivo CSV en un búfer de texto
    output = io.StringIO()
    # Escribir BOM UTF-8 para compatibilidad óptima con Excel en español
    output.write("\ufeff")
    
    writer = csv.writer(output, delimiter=",")
    writer.writerow([
        "ID Pedido",
        "Fecha",
        "Cliente",
        "Email",
        "Telefono",
        "Direccion",
        "Estado",
        "Total Pedido (Bs)",
        "Producto",
        "Cantidad",
        "Precio Unitario (Bs)",
        "Subtotal Item (Bs)",
    ])
    
    for order in orders:
        fecha_str = order.order_date.strftime("%Y-%m-%d %H:%M:%S")
        cliente_nombre = order.user.nombre if order.user else "Desconocido"
        cliente_email = order.user.email if order.user else "N/A"
        
        if not order.items:
            writer.writerow([
                order.id,
                fecha_str,
                cliente_nombre,
                cliente_email,
                order.phone,
                order.shipping_address,
                order.status,
                f"{order.total_amount:.2f}",
                "",
                "",
                "",
                "",
            ])
        else:
            for item in order.items:
                producto_nombre = (
                    item.product.nombre if item.product else f"Producto #{item.product_id}"
                )
                writer.writerow([
                    order.id,
                    fecha_str,
                    cliente_nombre,
                    cliente_email,
                    order.phone,
                    order.shipping_address,
                    order.status,
                    f"{order.total_amount:.2f}",
                    producto_nombre,
                    item.quantity,
                    f"{item.unit_price:.2f}",
                    f"{item.subtotal:.2f}",
                ])
                
    return output.getvalue()
