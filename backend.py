# FastAPI backend for LLM voting
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from llms import EloRanker
from datetime import datetime
import sqlite3
import os

DB_PATH = os.environ.get('VOTE_DB_PATH', 'votes.db')

# Ensure DB exists
if not os.path.exists(DB_PATH):
    from init_db import init_db
    init_db(DB_PATH)

def get_llms_from_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT name, provider, open, context, params, reasoning, input_cost, output_cost FROM llms')
    rows = c.fetchall()
    conn.close()
    llms = []
    for row in rows:
        llms.append({
            'name': row[0],
            'provider': row[1],
            'open': bool(row[2]),
            'context': row[3],
            'params': row[4],
            'reasoning': bool(row[5]),
            'input_cost': row[6],
            'output_cost': row[7],
        })
    return llms

def save_vote(winner, loser, time):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO votes (winner, loser, time) VALUES (?, ?, ?)', (winner, loser, time))
    conn.commit()
    conn.close()

def get_recent_votes(limit=5):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT winner, loser, time FROM votes ORDER BY id DESC LIMIT ?', (limit,))
    rows = c.fetchall()
    conn.close()
    return [{'winner': r[0], 'loser': r[1], 'time': r[2]} for r in rows[::-1]]  # reverse to chronological order

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llms = get_llms_from_db()
elo = EloRanker(llms)
# Replay all votes from DB to update Elo on startup
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('SELECT winner, loser FROM votes ORDER BY id ASC')
for winner, loser in c.fetchall():
    elo.vote(winner, loser)
conn.close()

@app.get("/llms")
def list_llms():
    # Always fetch fresh from DB in case of updates
    return get_llms_from_db()

@app.get("/rankings")
def get_rankings():
    scores = elo.rankings()
    changes = elo.get_changes()
    return [{
        'name': name,
        'score': int(round(score)),
        'change': changes[name]
    } for name, score in scores]

@app.get("/matchup")
def get_matchup():
    a, b = elo.random_pair()
    return {'a': a, 'b': b}

@app.post("/vote")
async def cast_vote(request: Request):
    data = await request.json()
    winner = data['winner']
    loser = data['loser']
    elo.vote(winner, loser)
    now = datetime.now().isoformat()
    # Set time for last vote in memory
    if elo.history:
        elo.history[-1]['time'] = now
    # Save to SQLite
    save_vote(winner, loser, now)
    return {'success': True}

@app.get("/history")
def get_history():
    # Return recent votes from SQLite
    return get_recent_votes(5)

@app.get("/analytics")
def get_analytics():
    # Rebuild ranking history from all votes
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT winner, loser, time FROM votes ORDER BY id ASC')
    vote_rows = c.fetchall()
    conn.close()
    # Init EloRanker
    llms_list = get_llms_from_db()
    elo = EloRanker(llms_list)
    timeline = []  # Each entry: {'time': ..., 'scores': {model: score, ...}}
    for row in vote_rows:
        winner, loser, time = row
        elo.vote(winner, loser)
        # After each vote, record the scores
        timeline.append({'time': time, 'scores': dict(elo.scores)})
    # Also add initial scores (before any vote)
    initial_scores = {m['name']: 1500 for m in llms_list}
    timeline = [{'time': None, 'scores': initial_scores}] + timeline
    # Restructure for frontend: for each model, an array of {time, score}
    model_timelines = {}
    for m in initial_scores:
        model_timelines[m] = [{'time': t['time'], 'score': t['scores'][m]} for t in timeline]
    return model_timelines
