# CRUD привычек


from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from .. import db_crud as crud, schemas, models
from ..database import get_db
from ..utils import verify_token


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

@router.put("/{habit_id}", response_model=schemas.Habit)
def update_habit(habit_id: int, habit: schemas.HabitCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_habit = crud.get_habit(db, habit_id)
    if db_habit is None or db_habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")
    return crud.update_habit(db, habit_id, habit)

@router.delete("/{habit_id}")
def delete_habit(habit_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_habit = crud.get_habit(db, habit_id)
    if db_habit is None or db_habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")
    crud.delete_habit(db, habit_id)
    return {"message": "Habit deleted"}