from pydantic import BaseModel
from datetime import date
from typing import Optional

class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = "#6366f1"

class HabitResponse(BaseModel):
    id: int
    name: str
    description: str
    color: str
    streak: int = 0
    completion_rate: float = 0.0
    completed_today: bool = False

    class Config:
        from_attributes = True

class CompletionCreate(BaseModel):
    date: date

class CompletionResponse(BaseModel):
    id: int
    habit_id: int
    date: date

    class Config:
        from_attributes = True