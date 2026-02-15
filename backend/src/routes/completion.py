# Отметки выполнения
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from ..database import get_db
from ..utils import verify_token
from .. import db_crud as crud, schemas, models

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

@router.get("/{habit_id}", response_model=list[schemas.HabitCompletion])
def read_completions(habit_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = crud.get_habit(db, habit_id)
    if habit is None or habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")
    return crud.get_completions_by_habit(db, habit_id)


@router.post("/", response_model=schemas.HabitCompletion)
def create_completion(completion: schemas.HabitCompletionCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    habit = crud.get_habit(db, completion.habit_id)
    if habit is None or habit.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Habit not found")
    return crud.create_completion(db, completion)

@router.delete("/{completion_id}")
def delete_completion(completion_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    completion = db.query(models.HabitCompletion).filter(models.HabitCompletion.id == completion_id).first()
    if completion is None:
        raise HTTPException(status_code=404, detail="Completion not found")
    habit = crud.get_habit(db, completion.habit_id)
    if habit.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    crud.delete_completion(db, completion_id)
    return {"message": "Completion deleted"}
    
