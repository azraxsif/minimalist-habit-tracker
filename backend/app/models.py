from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    color = Column(String, default="#6366f1")
    completions = relationship("Completion", back_populates="habit", cascade="all, delete")

class Completion(Base):
    __tablename__ = "completions"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    habit = relationship("Habit", back_populates="completions")