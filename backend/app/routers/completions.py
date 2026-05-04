from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/habits", tags=["completions"])

@router.post("/{habit_id}/complete", response_model=schemas.CompletionResponse)
def complete_habit(habit_id: int, completion: schemas.CompletionCreate, db: Session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    existing = db.query(models.Completion).filter(
        models.Completion.habit_id == habit_id,
        models.Completion.date == completion.date
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already completed for this date")
    db_completion = models.Completion(habit_id=habit_id, date=completion.date)
    db.add(db_completion)
    db.commit()
    db.refresh(db_completion)
    return db_completion

@router.delete("/{habit_id}/completions/{date}")
def undo_completion(habit_id: int, date: date, db: Session = Depends(get_db)):
    completion = db.query(models.Completion).filter(
        models.Completion.habit_id == habit_id,
        models.Completion.date == date
    ).first()
    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")
    db.delete(completion)
    db.commit()
    return {"message": "Completion removed"}

@router.get("/{habit_id}/completions", response_model=list[schemas.CompletionResponse])
def get_completions(habit_id: int, db: Session = Depends(get_db)):
    return db.query(models.Completion).filter(models.Completion.habit_id == habit_id).all()