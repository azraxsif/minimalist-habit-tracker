from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import habits, completions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Minimalist Habit Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(habits.router)
app.include_router(completions.router)

@app.get("/")
def root():
    return {"message": "Habit Tracker API is running"}
