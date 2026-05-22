import os
import sys

# Ensure backend directory is in the sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def seed_admin():
    print("Initializing database session...")
    db = SessionLocal()
    try:
        email = "importadora@market.com"
        nombre = "Administrador Market"
        plain_password = "ImportadoraMarket@2026#Imp"
        telefono = "70000000"
        
        print(f"Checking if user with email {email} already exists...")
        existing_user = db.query(User).filter(User.email == email).first()
        
        hashed = hash_password(plain_password)
        
        if existing_user:
            print(f"User {email} already exists. Updating credentials and setting role to admin...")
            existing_user.nombre = nombre
            existing_user.password_hash = hashed
            existing_user.role = "admin"
            existing_user.telefono = telefono
            db.commit()
            print("Successfully updated existing admin user.")
        else:
            print(f"Creating new admin user with email {email}...")
            admin_user = User(
                email=email,
                nombre=nombre,
                password_hash=hashed,
                role="admin",
                telefono=telefono
            )
            db.add(admin_user)
            db.commit()
            print("Successfully created new admin user.")
            
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
