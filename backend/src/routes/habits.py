# CRUD привычек


from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
import crud, schemas, models
from database import get_db
from utils import verify_token


router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    email = verify_token(token)
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/", response_model=list[schemas.Habit])
def read_habits(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_habits_by_user(db, current_user.id)

@router.post("/", response_model=schemas.Habit)
def create_habit(habit: schemas.HabitCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_habit(db, habit, current_user.id)
