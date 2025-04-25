# LLM Voting & Ranking App

## Overview
This application allows users to vote between pairs of Large Language Models (LLMs) and ranks them using the Elo rating system. It features a modern React frontend and a FastAPI backend with persistent storage in SQLite.

---

## Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
    - [Frontend](#frontend)
    - [Backend](#backend)
3. [Persistent Storage](#persistent-storage)
    - [Database Schema](#database-schema)
    - [Storage Functions](#storage-functions)
4. [How Voting Works](#how-voting-works)
5. [Analytics & Leaderboard](#analytics--leaderboard)
6. [Setup & Usage](#setup--usage)
7. [Development](#development)
8. [Dependencies](#dependencies)
9. [Project Structure](#project-structure)

---

## Features
- Vote between pairs of LLMs (e.g., GPT-4, Claude, Llama, Gemini)
- Elo-based ranking system
- Persistent storage of votes and LLM metadata
- Analytics and leaderboard
- Modern, responsive UI

---

## Architecture

### Frontend
- **Framework:** React (with Vite)
- **Location:** `vote/frontend/`
- **Key Components:**
    - `App.jsx`: Main logic, tab navigation, API calls
    - `AnalyticsChart.jsx`: Vote analytics visualization
    - `main.jsx`: Entry point
- **API Communication:** Uses `fetch` to call backend endpoints (e.g., `/llms`, `/vote`, `/rankings`, `/history`, `/analytics`).

### Backend
- **Framework:** FastAPI
- **Location:** `vote/backend.py`
- **Key Modules:**
    - `backend.py`: API endpoints, database access
    - `llms.py`: LLM metadata and Elo logic
    - `init_db.py`: Database schema and migration
- **Endpoints:**
    - `/llms` – List all LLMs
    - `/rankings` – Get current Elo rankings
    - `/matchup` – Get a random pair for voting
    - `/vote` – Submit a vote (winner/loser)
    - `/history` – Recent votes
    - `/analytics` – Analytics data for charts

---

## Persistent Storage

### Database
- **Type:** SQLite
- **File:** `votes.db` (default; path can be overridden via `VOTE_DB_PATH` env var)
- **Created by:** `init_db.py` (auto-run on first backend start)

### Database Schema
- **Table: `votes`**
    | Column | Type    | Description                |
    |--------|---------|----------------------------|
    | id     | INTEGER | Primary key, auto-incr     |
    | winner | TEXT    | Name of winning LLM        |
    | loser  | TEXT    | Name of losing LLM         |
    | time   | TEXT    | Timestamp (ISO format)     |

- **Table: `llms`**
    | Column      | Type    | Description                |
    |-------------|---------|----------------------------|
    | id          | INTEGER | Primary key, auto-incr     |
    | name        | TEXT    | Unique LLM name            |
    | provider    | TEXT    | Provider (e.g., OpenAI)    |
    | open        | BOOLEAN | Is it open-source?         |
    | context     | TEXT    | Context window             |
    | params      | TEXT    | Size/parameter info        |
    | reasoning   | BOOLEAN | Reasoning capability       |
    | input_cost  | REAL    | Input cost (USD/1M tokens) |
    | output_cost | REAL    | Output cost (USD/1M tokens)|

### Storage Functions
- **`get_llms_from_db()`**: Loads all LLMs from the database.
- **`save_vote(winner, loser, time)`**: Inserts a new vote into the `votes` table.
- **`get_recent_votes(limit)`**: Fetches recent votes for display/history.
- **`migrate_llms()`**: Imports/updates LLMs into the database from `llms.py`.

### Accessing and Reading the Database

The persistent storage uses a standard SQLite database (`votes.db`). You can inspect or query the database directly using any SQLite client or command-line tool. For example:

```powershell
# Open the database in the SQLite shell
sqlite3 votes.db

# View all votes
SELECT * FROM votes;

# View all LLMs
SELECT * FROM llms;

# Or, use a Python one-liner with uv to pretty-print the llms table:
uv run python -c "import sqlite3; import pprint; conn = sqlite3.connect('votes.db'); c = conn.cursor(); c.execute('SELECT * FROM llms'); rows = c.fetchall(); pprint.pprint(rows); conn.close()"
```

You can also use graphical tools like DB Browser for SQLite for a more user-friendly interface.

#### Programmatic Access
- Use Python's `sqlite3` module to access the database in scripts or notebooks.
- The backend code (`backend.py`) provides sample functions for reading and writing data.

### Persistent Rankings Guarantee

Every vote and LLM is stored in the database. This ensures:
- **No data loss:** All votes and LLM info persist even if the server restarts or crashes.
- **Rankings recovery:** The backend can always reconstruct the full Elo ranking state by replaying the vote history from the database.
- **Consistency:** Rankings and analytics are always based on the complete, up-to-date persistent record.

#### What Happens If the App Is Restarted?
If the app is shut down and then restarted, **no ranking data is lost**. When the backend starts, it loads all LLMs and votes from the persistent SQLite database (`votes.db`). It then replays every vote in order, using the Elo logic from `llms.py`, to recalculate the latest rankings for each LLM. This means the rankings will always reflect the true, up-to-date state, regardless of any interruptions or restarts.

If you ever need to restore or analyze the rankings, simply read the votes from the database and run the Elo logic as in `llms.py`.

---

## How Voting Works
1. **Frontend** fetches a random pair of LLMs from `/matchup`.
2. User chooses the better LLM; a POST request is sent to `/vote` with `{ winner, loser }`.
3. **Backend** records the vote in SQLite and updates Elo rankings in memory.
4. Rankings and analytics endpoints reflect the new state.

---

## Analytics & Leaderboard
- **Leaderboard:** Shows current Elo scores and recent changes for each LLM.
- **Analytics:** Charts display score trajectories over time for selected LLMs, using data from `/analytics`.

---

## Setup & Usage

### Backend (API Server)
1. Install dependencies (Python, FastAPI, Uvicorn):
   ```powershell
   uv pip install -r requirements.txt
   ```
2. Run the backend:
   ```powershell
   uvicorn backend:app --reload
   ```

### Frontend (React UI)
1. Install dependencies:
   ```powershell
   cd vote/frontend
   npm install
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```

### Database
- The database (`votes.db`) is created automatically.
- To (re)import LLMs:
   ```powershell
   python init_db.py migrate_llms
   ```

---

## Development
- **Backend:** Edit `backend.py`, `llms.py`, `init_db.py` for API, logic, and DB.
- **Frontend:** Edit React components in `frontend/src/`.
- **Hot-reloading:** Both frontend and backend support live reload during development.

---

## Dependencies
- **Backend:** FastAPI, Uvicorn, SQLite (standard lib)
- **Frontend:** React, Vite, Chart.js, React-Chartjs-2, React-Icons

---

## Project Structure
```
windsurf-project/
├── vote/
│   ├── backend.py         # FastAPI backend
│   ├── llms.py            # LLM metadata & Elo logic
│   ├── init_db.py         # DB schema & migration
│   ├── votes.db           # SQLite database
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── AnalyticsChart.jsx
│   │   │   └── main.jsx
│   │   ├── package.json
│   │   └── ...
│   └── ...
└── ...
```

---

## Notes
- All data is persisted in `votes.db`.
- LLM list can be updated via `llms.py` and imported with `migrate_llms()`.
- The app is cross-platform and works out-of-the-box with Python and Node.js.

---

For any questions, check the code comments or open an issue!
