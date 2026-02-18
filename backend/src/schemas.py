# Pydantic-схемы
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Токен
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# Схемы для User
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Схемы для Habit
class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    day_of_week: int  # День недели (0-6, где 0=Понедельник)

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Схемы для HabitCompletion
class HabitCompletionBase(BaseModel):
    habit_id: int
    day_of_week: int  # 0-6

class HabitCompletionCreate(HabitCompletionBase):
    pass

class HabitCompletion(HabitCompletionBase):
    id: int

    class Config:
        from_attributes = True