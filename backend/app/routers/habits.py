from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/habits", tags=["habits"])

def calculate_streak(completions):
    if not completions:
        return 0
    dates = sorted(set(c.date for c in completions), reverse=True)
    streak = 0
    current = date.today()
    for d in dates:
        if d == current or d == current - timedelta(days=1):
            streak += 1
            current = d - timedelta(days=1)
        else:
            break
    return streak

def calculate_rate(completions):
    if not completions:
        return 0.0
    dates = [c.date for c in completions]
    if not dates:
        return 0.0
    start = min(dates)
    total_days = (date.today() - start).days + 1
    return round(len(set(dates)) / total_days * 100, 1)

@router.get("/", response_model=list[schemas.HabitResponse])
def get_habits(db: Session = Depends(get_db)):
    habits = db.query(models.Habit).all()
    result = []
    for habit in habits:
        today = date.today()
        completed_today = any(c.date == today for c in habit.completions)
        h = schemas.HabitResponse(
            id=habit.id,
            name=habit.name,
            description=habit.description,
            color=habit.color,
            streak=calculate_streak(habit.completions),
            completion_rate=calculate_rate(habit.completions),
            completed_today=completed_today
        )
        result.append(h)
    return result

@router.post("/", response_model=schemas.HabitResponse)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db)):
    db_habit = models.Habit(**habit.model_dump())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return schemas.HabitResponse(
        id=db_habit.id,
        name=db_habit.name,
        description=db_habit.description,
        color=db_habit.color,
        streak=0,
        completion_rate=0.0,
        completed_today=False
    )

@router.delete("/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted"}