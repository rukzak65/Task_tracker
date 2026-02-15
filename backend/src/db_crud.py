from . import models, schemas, utils
from sqlalchemy.orm import Session


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = utils.get_password_hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not utils.verify_password(password, user.password_hash):
        return False
    return user

# CRUD для Habit
def get_habits_by_user(db: Session, user_id: int):
    return db.query(models.Habit).filter(models.Habit.user_id == user_id).all()

def create_habit(db: Session, habit: schemas.HabitCreate, user_id: int):
    db_habit = models.Habit(**habit.dict(), user_id=user_id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

def get_habit(db: Session, habit_id: int):
    return db.query(models.Habit).filter(models.Habit.id == habit_id).first()

def update_habit(db: Session, habit_id: int, habit_update: schemas.HabitCreate):
    db_habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if db_habit:
        for key, value in habit_update.dict().items():
            setattr(db_habit, key, value)
        db.commit()
        db.refresh(db_habit)
    return db_habit

def delete_habit(db: Session, habit_id: int):
    db_habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if db_habit:
        db.delete(db_habit)
        db.commit()
    return db_habit

# CRUD для HabitCompletion
def get_completions_by_habit(db: Session, habit_id: int):
    return db.query(models.HabitCompletion).filter(models.HabitCompletion.habit_id == habit_id).all()

def create_completion(db: Session, completion: schemas.HabitCompletionCreate):
    db_completion = models.HabitCompletion(**completion.dict())
    db.add(db_completion)
    db.commit()
    db.refresh(db_completion)
    return db_completion

def delete_completion(db: Session, completion_id: int):
    db_completion = db.query(models.HabitCompletion).filter(models.HabitCompletion.id == completion_id).first()
    if db_completion:
        db.delete(db_completion)
        db.commit()
    return db_completion