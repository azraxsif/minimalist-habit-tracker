# Minimalist Habit Tracker

A clean, distraction-free habit tracking web application for building and maintaining daily habits. Track streaks, visualise completion history, and stay consistent — no account required.

**Live App:** https://just-encouragement-production-0a8c.up.railway.app  
**API Docs:** https://minimalist-habit-tracker-production.up.railway.app/docs

---

## Features

- **Daily Habit Tracking** — Create habits and mark them complete with one click
- **Streak Tracking** — See your current streak per habit updated automatically
- **Completion Rate** — Percentage of days completed since the habit was created
- **Calendar View** — Monthly grid showing your full completion history with colour-coded days
- **Colour Customisation** — Choose from 6 colours when creating a habit
- **Local & Private** — All data stored in SQLite, no account or login needed
- **Fully Deployed** — Live on Railway with a public URL, accessible from any device

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 18, Vite, TanStack Query, Tailwind CSS |
| Date Handling | date-fns |
| Testing | pytest, pytest-cov, httpx |
| CI/CD | GitHub Actions |
| Hosting | Railway |

---

## Project Structure

<img width="1536" height="1024" alt="ChatGPT Image May 6, 2026, 04_33_44 PM" src="https://github.com/user-attachments/assets/af3495f1-6b38-4c4a-a7e2-06a84fe903c5" />


## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/habits/ | List all habits with streak and completion rate |
| POST | /api/habits/ | Create a new habit |
| DELETE | /api/habits/{id} | Delete a habit and all its completions |
| POST | /api/habits/{id}/complete | Mark a habit complete for a given date |
| DELETE | /api/habits/{id}/completions/{date} | Undo a completion |
| GET | /api/habits/{id}/completions | Get full completion history for a habit |
| GET | / | Health check |

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 22+
- uv package manager

### Backend
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```
Backend runs at http://localhost:8000  
API docs at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173

---

## Running Tests

```bash
cd backend
uv run pytest tests/ -v --cov=app
```

15 test cases covering:
- Habit creation, retrieval, and deletion
- Marking habits complete and undoing completions
- Duplicate completion prevention
- Streak and completion rate calculation
- Edge cases (missing records, invalid IDs)

---

## CI/CD Pipeline

Every push and pull request to the `main` branch automatically triggers a GitHub Actions pipeline that:

1. Sets up Python 3.11 and installs all backend dependencies
2. Runs flake8 linter — fails on any style violations
3. Runs the full pytest test suite with coverage reporting
4. Sets up Node.js 22 and installs frontend dependencies
5. Builds the React production bundle — fails if compilation errors exist

A pull request cannot be merged unless all pipeline checks pass.

---

## Deployment

The app is deployed on Railway as two separate services:

- **Backend service** — root directory `/backend`, starts with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Frontend service** — root directory `/frontend`, builds with `npm run build`, serves with `npx serve dist`

To deploy your own instance, fork this repo, create a Railway account, and connect each service to the corresponding folder.

---

## Future Enhancements

- User authentication so multiple users can have their own habits
- Planned absences — skip days without breaking streaks
- Dark mode toggle
- Weekly stats bar chart
- Drag and drop habit reordering
- Browser push notifications
- Habit categories
- CSV data export

---

## Author

**Azra Asif**  
GitHub: [@azraxsif](https://github.com/azraxsif)
