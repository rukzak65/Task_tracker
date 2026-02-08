from . import models

def get_user_by_email(db, email: str):
    return db.query(models.User).filter(models.User.email == email).first()