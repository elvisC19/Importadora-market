from typing import Optional, List
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_reset_token(self, db: Session, *, token: str) -> Optional[User]:
        return db.query(User).filter(User.reset_token == token).first()

    def get_all(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    def set_online(self, db: Session, *, user_id: int, status: bool) -> Optional[User]:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_online = status
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

user_repository = CRUDUser(User)
