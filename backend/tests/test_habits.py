import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Use a separate test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)


# ── Habit CRUD tests ──────────────────────────────────────

def test_create_habit():
    response = client.post("/api/habits/", json={
        "name": "Exercise",
        "description": "30 mins daily",
        "color": "#6366f1"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Exercise"
    assert data["description"] == "30 mins daily"
    assert data["color"] == "#6366f1"
    assert data["streak"] == 0
    assert data["completion_rate"] == 0.0


def test_create_habit_minimal():
    response = client.post("/api/habits/", json={"name": "Read"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Read"
    assert data["color"] == "#6366f1"


def test_get_habits_empty():
    response = client.get("/api/habits/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_habits_returns_list():
    client.post("/api/habits/", json={"name": "Exercise"})
    client.post("/api/habits/", json={"name": "Read"})
    response = client.get("/api/habits/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_delete_habit():
    create = client.post("/api/habits/", json={"name": "Exercise"})
    habit_id = create.json()["id"]
    response = client.delete(f"/api/habits/{habit_id}")
    assert response.status_code == 200
    habits = client.get("/api/habits/").json()
    assert len(habits) == 0


def test_delete_nonexistent_habit():
    response = client.delete("/api/habits/999")
    assert response.status_code == 404


# ── Completion tests ──────────────────────────────────────

def test_complete_habit():
    create = client.post("/api/habits/", json={"name": "Exercise"})
    habit_id = create.json()["id"]
    response = client.post(f"/api/habits/{habit_id}/complete", json={
        "date": "2026-05-01"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["habit_id"] == habit_id
    assert data["date"] == "2026-05-01"


def test_cannot_complete_habit_twice_same_day():
    create = client.post("/api/habits/", json={"name": "Exercise"})
    habit_id = create.json()["id"]
    client.post(f"/api/habits/{habit_id}/complete", json={"date": "2026-05-01"})
    response = client.post(f"/api/habits/{habit_id}/complete", json={"date": "2026-05-01"})
    assert response.status_code == 400


def test_complete_nonexistent_habit():
    response = client.post("/api/habits/999/complete", json={"date": "2026-05-01"})
    assert response.status_code == 404


def test_undo_completion():
    create = client.post("/api/habits/", json={"name": "Exercise"})
    habit_id = create.json()["id"]
    client.post(f"/api/habits/{habit_id}/complete", json={"date": "2026-05-01"})
    response = client.delete(f"/api/habits/{habit_id}/completions/2026-05-01")
    assert response.status_code == 200
    completions = client.get(f"/api/habits/{habit_id}/completions").json()
    assert len(completions) == 0


def test_undo_nonexistent_completion():
    create = client.post("/api/habits/", json={"name": "Exercise"})
    habit_id = create.json()["id"]
    response = client.delete(f"/api/habits/{habit_id}/completions/2026-05-01")
    assert response.status_code == 404


def test_get_completions():
    create = client.post("/api/habits/", json={"name": "Exercise"})
    habit_id = create.json()["id"]
    client.post(f"/api/habits/{habit_id}/complete", json={"date": "2026-05-01"})
    client.post(f"/api/habits/{habit_id}/complete", json={"date": "2026-05-02"})
    response = client.get(f"/api/habits/{habit_id}/completions")
    assert response.status_code == 200
    assert len(response.json()) == 2


# ── Streak and stats tests ────────────────────────────────

def test_completed_today_flag():
    from datetime import date
    today = date.today().isoformat()
    create = client.post("/api/habits/", json={"name": "Exercise"})
    habit_id = create.json()["id"]
    client.post(f"/api/habits/{habit_id}/complete", json={"date": today})
    habits = client.get("/api/habits/").json()
    assert habits[0]["completed_today"] is True


def test_not_completed_today_by_default():
    client.post("/api/habits/", json={"name": "Exercise"})
    habits = client.get("/api/habits/").json()
    assert habits[0]["completed_today"] is False


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Habit Tracker API is running"}