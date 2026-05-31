import sys
import os

# Add parent directory to path so app can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models.category import Category
from app.models.product import Product
from app.models.user import User
from app.core.security import hash_password

def seed():
    print("Starting database seeding...")
    db = SessionLocal()
    
    # Verificar si ya existen datos
    existing = db.query(User).filter(User.email == "admin@market.com").first()
    if existing:
        print("Datos ya inicializados, omitiendo seed.")
        db.close()
        exit(0)

    try:
        # Clear existing data to ensure exact counts
        db.query(Product).delete()
        db.query(Category).delete()
        db.query(User).delete()
        db.commit()
        print("Cleared existing users, products, and categories.")

        # Create 3 test users
        admin_user = User(
            nombre="Administrador",
            email="admin@market.com",
            password_hash=hash_password("ImportadoraMarket@2026#Adm"),
            role="admin"
        )
        importadora_user = User(
            nombre="Importadora Ramos",
            email="importadora@market.com",
            password_hash=hash_password("ImportadoraMarket@2026#Imp"),
            role="importadora"
        )
        cliente_user = User(
            nombre="Juan Perez",
            email="cliente@market.com",
            password_hash=hash_password("ImportadoraMarket@2026#Cli"),
            role="cliente"
        )

        db.add_all([admin_user, importadora_user, cliente_user])
        db.commit()

        # Refresh users to get IDs
        db.refresh(admin_user)
        db.refresh(importadora_user)
        db.refresh(cliente_user)
        print(f"Seeded 3 users: admin, importadora (ID: {importadora_user.id}), cliente.")

        # Create 3 categories
        cat1 = Category(nombre="Tecnología y Audio", descripcion="Dispositivos electrónicos, auriculares y parlantes de alta calidad.")
        cat2 = Category(nombre="Accesorios Celulares", descripcion="Fundas, soportes, micas y protectores para smartphones.")
        cat3 = Category(nombre="Cargadores y Cables", descripcion="Cargadores rápidos, cables USB y bases de carga inalámbrica.")

        db.add_all([cat1, cat2, cat3])
        db.commit()

        # Refresh categories to get their generated IDs
        db.refresh(cat1)
        db.refresh(cat2)
        db.refresh(cat3)

        print(f"Created 3 categories: {cat1.nombre}, {cat2.nombre}, {cat3.nombre}")

        # Create 12 products (8 visible/approved, 4 pending/unapproved)
        products = [
            # Category 1: Tecnología y Audio (4 approved, 1 pending)
            Product(
                categoria_id=cat1.id,
                nombre="Auriculares Inalámbricos Pro Max",
                descripcion="Auriculares bluetooth con cancelación activa de ruido y 30 horas de batería.",
                precio=89.99,
                stock=25,
                imagen_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                video_enlace="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                is_approved=True,
                is_featured=True,
                is_offer=True,
                offer_price=74.99,
                is_new=True
            ),
            Product(
                categoria_id=cat1.id,
                nombre="Parlante Bluetooth Waterproof",
                descripcion="Parlante portátil resistente al agua IPX7 con sonido estéreo 360 y luces RGB.",
                precio=45.50,
                stock=40,
                imagen_url="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
                is_approved=True,
                is_featured=True,
                is_offer=False
            ),
            Product(
                categoria_id=cat1.id,
                nombre="Reloj Inteligente Smartwatch GT3",
                descripcion="Monitoreo de ritmo cardíaco, GPS integrado, pantalla AMOLED y múltiples modos deportivos.",
                precio=120.00,
                stock=15,
                imagen_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
                is_approved=True,
                is_featured=False,
                is_offer=True,
                offer_price=99.99,
                is_new=True
            ),
            Product(
                categoria_id=cat1.id,
                nombre="Teclado Mecánico RGB Gamer",
                descripcion="Teclas mecánicas switch azul con respuesta ultrarrápida e iluminación personalizable.",
                precio=65.00,
                stock=18,
                imagen_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
                is_approved=True,
                is_featured=False,
                is_offer=False
            ),
            Product(
                categoria_id=cat1.id,
                nombre="Cámara de Seguridad WiFi 360 (Pendiente)",
                descripcion="Cámara de vigilancia inteligente con visión nocturna y detección de movimiento. Pendiente de aprobación.",
                precio=55.00,
                stock=10,
                imagen_url="https://images.unsplash.com/photo-1558002038-1055907df827?w=500",
                is_approved=False,
                is_featured=False,
                is_offer=False
            ),

            # Category 2: Accesorios Celulares (2 approved, 2 pending)
            Product(
                categoria_id=cat2.id,
                nombre="Funda de Cuero Premium iPhone 15",
                descripcion="Funda protectora de cuero legítimo con soporte MagSafe integrado.",
                precio=29.99,
                stock=50,
                imagen_url="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
                is_approved=True,
                is_featured=True,
                is_offer=True,
                offer_price=24.99
            ),
            Product(
                categoria_id=cat2.id,
                nombre="Soporte Magnético de Auto para Celular",
                descripcion="Soporte metálico de alta resistencia para rejilla de ventilación, imanes ultra fuertes.",
                precio=15.00,
                stock=100,
                imagen_url="https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500",
                is_approved=True,
                is_featured=False,
                is_offer=False
            ),
            Product(
                categoria_id=cat2.id,
                nombre="Estabilizador Gimbal Portátil (Pendiente)",
                descripcion="Gimbal de 3 ejes para grabaciones estables con seguimiento de rostros. Pendiente de aprobación.",
                precio=79.00,
                stock=5,
                imagen_url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
                is_approved=False,
                is_featured=False,
                is_offer=False
            ),
            Product(
                categoria_id=cat2.id,
                nombre="Lente Macro para Smartphone (Pendiente)",
                descripcion="Kit de lentes universales para fotografía profesional en dispositivos móviles. Pendiente.",
                precio=22.50,
                stock=15,
                imagen_url="https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=500",
                is_approved=False,
                is_featured=False,
                is_offer=False
            ),

            # Category 3: Cargadores y Cables (2 approved, 1 pending)
            Product(
                categoria_id=cat3.id,
                nombre="Cargador Rápido GaN 65W Pro",
                descripcion="Cargador de pared con tecnología GaN, 3 puertos USB (2x Type-C, 1x USB-A) para laptops y celulares.",
                precio=39.99,
                stock=30,
                imagen_url="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500",
                is_approved=True,
                is_featured=True,
                is_offer=True,
                offer_price=32.99,
                is_new=True
            ),
            Product(
                categoria_id=cat3.id,
                nombre="Cable USB-C a USB-C de Nylon Trenzado 2m",
                descripcion="Cable de alta durabilidad con soporte para carga rápida PD de hasta 100W y transferencia de datos rápida.",
                precio=12.50,
                stock=80,
                imagen_url="https://images.unsplash.com/photo-1541667590925-44053eaeede9?w=500",
                is_approved=True,
                is_featured=False,
                is_offer=False
            ),
            Product(
                categoria_id=cat3.id,
                nombre="Power Bank de Carga Inalámbrica 10000mAh (Pendiente)",
                descripcion="Batería externa portátil con carga magnética e inalámbrica de 15W. Pendiente de aprobación.",
                precio=49.99,
                stock=12,
                imagen_url="https://images.unsplash.com/photo-1609592424085-f5df4698cb9b?w=500",
                is_approved=False,
                is_featured=False,
                is_offer=False
            )
        ]

        # Set submitted_by_id and approved_by_id
        for p in products:
            p.submitted_by_id = importadora_user.id
            if p.is_approved:
                p.approved_by_id = admin_user.id

        db.add_all(products)
        db.commit()
        print("Successfully seeded 12 products.")

        # Print statistics to verify
        total_count = db.query(Product).count()
        visible_count = db.query(Product).filter(Product.is_approved == True).count()
        pending_count = db.query(Product).filter(Product.is_approved == False).count()
        category_count = db.query(Category).count()

        print("\n--- Seeding Summary ---")
        print(f"Categories Created: {category_count}")
        print(f"Total Products:     {total_count}")
        print(f"Visible (Approved): {visible_count}")
        print(f"Pending Approval:   {pending_count}")
        print("-----------------------")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
