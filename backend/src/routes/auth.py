# Регистрация и логин
from schemas import UserCreate, UserLogin
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from .. import db_crud as crud, schemas, utils

router = APIRouter()

@router.post("/register",response_model=schemas.User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    crud.create_user(db, email = user.email )
    return crud.create_user(db, user)

@router.post("/login")
def login(user: UserCreate ,db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.email, user.password)
    access_token = utils.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}